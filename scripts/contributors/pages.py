import re
import shutil

import yaml

from .config import CONTENT_DIRS
from .files import atomic_write_text
from .roles import DEFAULT_TAGS, SPECIAL_TAGS, canonical_tag

GENERATED_BODY = re.compile(r'\n\d+ (?:commits|次提交)\n')

def update_index_timestamp(now_utc, dry_run=False):
    timestamp = now_utc.strftime("%Y 年 %m 月 %d 日 %H:%M UTC")

    timestamp_en = now_utc.strftime("%Y-%m-%d %H:%M UTC")

    updated = False
    for lang in ('zh-cn', 'zh-tw', 'en'):
        file_path = CONTENT_DIRS[lang] / "_index.md"
        if not file_path.exists():
            print(f"  警告: {file_path} 不存在")
            continue

        content = file_path.read_text(encoding='utf-8')
        if lang == 'en':
            label = f'Last updated {timestamp_en} (updated automatically every month)'
            pattern = r'Last updated .*'
        elif lang == 'zh-tw':
            label = f'最後更新時間 {timestamp}（每月自動更新）'
            pattern = r'最[後后]更新[時时][間间].*'
        else:
            label = f'最后更新时间 {timestamp}（每月自动更新）'
            pattern = r'最[後后]更新[時时][間间].*'

        new_content, count = re.subn(pattern, label, content)
        if count == 0:
            new_content = content.rstrip() + '\n\n' + label + '\n'

        if new_content != content:
            if not dry_run:
                atomic_write_text(file_path, new_content)
                print(f"  已更新 {file_path.name} 的時間戳")
            else:
                print(f"  [DRY-RUN] 會更新 {file_path.name} 的時間戳為: {timestamp}")
            updated = True

    return updated


def contributions_of(repo_commits):
    """{倉庫: 提交數} -> front matter 的 contributions：總數與按提交數降序的倉庫列表"""
    repos = sorted(repo_commits.items(), key=lambda item: (-item[1], item[0]))
    return {
        'total': sum(repo_commits.values()),
        'repos': [{'repo': repo, 'commits': commits} for repo, commits in repos],
    }


def set_contributions(content, contributions):
    """把 front matter 的 contributions 換成新值並放在末尾，其餘行不動"""
    m = re.match(r'---\n(.*?\n)---\n', content, re.S)
    front = re.sub(r'^contributions:\n(?: .*\n)*', '', m.group(1), flags=re.M)
    block = yaml.safe_dump({'contributions': contributions},
                           allow_unicode=True, default_flow_style=False, sort_keys=False)
    return f'---\n{front}{block}---\n' + content[m.end():]


def split_page(content):
    """拆成 (front matter dict, 正文)；不是合法 front matter 時回傳 (None, None)"""
    m = re.match(r'---\n(.*?\n)---\n', content, re.S)
    if not m:
        return None, None
    try:
        front = yaml.safe_load(m.group(1))
    except yaml.YAMLError:
        return None, None
    return (front if isinstance(front, dict) else None), content[m.end():]


def is_hand_written(content):
    """無法解析的頁面也視為手寫頁，避免覆寫或剪枝。"""
    front, body = split_page(content)
    return front is None or not GENERATED_BODY.fullmatch(body)


def integer_weight(front):
    """front matter 的 weight 是整數（可為負：提交超過 10000 次）時回傳它，否則 None"""
    weight = (front or {}).get('weight')
    return weight if isinstance(weight, int) and not isinstance(weight, bool) else None


def profile_url(login):
    return f'https://github.com/{login}'


def set_profile_link(content, login, exists):
    """帳號已刪除（exists 為 False）時去掉指向 GitHub 個人頁的 externalUrl，帳號存在時補回；None 表示無法確定，不動"""
    m = re.match(r'---\n(.*?\n)---\n', content, re.S)
    front = m.group(1)
    line = re.search(r'^externalUrl:[ \t]*(.*?)[ \t]*\n', front, re.M)
    if exists is False and line:
        url = line.group(1).strip('\'"')
        if re.fullmatch(rf'https?://github\.com/{re.escape(login)}/?', url, re.I):
            front = front[:line.start()] + front[line.end():]
    elif exists and not line:
        # 與 generate_frontmatter 的欄位順序一致：externalUrl 在 weight 之前
        front = re.sub(r'^(?=weight:)', f'externalUrl: {profile_url(login)}\n', front, count=1, flags=re.M)
    return f'---\n{front}---\n' + content[m.end():]


def update_commits_only(login, contributions, dry_run=False, exists=None):
    """只更新提交次數、權重、contributions 與 GitHub 連結（見 set_profile_link）；沒有 weight 的手寫頁不動"""
    commits = contributions['total']
    weight = 10000 - commits

    updated = False
    for lang in ('zh-cn', 'zh-tw', 'en'):
        file_path = CONTENT_DIRS[lang] / login / "index.md"
        if not file_path.exists():
            continue

        content = file_path.read_text(encoding='utf-8')
        front, _ = split_page(content)
        if integer_weight(front) is None:
            continue

        new_content = re.sub(
            r'^weight: -?\d+[ \t]*$',
            f'weight: {weight}',
            content,
            count=1,
            flags=re.MULTILINE,
        )
        new_content = set_contributions(new_content, contributions)
        new_content = set_profile_link(new_content, login, exists)
        if is_hand_written(content):
            pass  # 手寫正文不改
        elif lang == 'en':
            new_content = re.sub(r'\d+ commits', f'{commits} commits', new_content)
        else:
            new_content = re.sub(r'\d+ 次提交', f'{commits} 次提交', new_content)

        if new_content != content:
            if not dry_run:
                atomic_write_text(file_path, new_content)
            updated = True

    return updated


def generate_frontmatter(login, name, links, weight, tag, contributions, lang='zh-cn', exists=True):
    """用 YAML 序列化不受信任的 GitHub 欄位；描述不含會定期變動的提交數；帳號已刪除時不寫 externalUrl。"""
    if lang == 'en':
        site, role = 'Gentoo-zh Community', 'contributor'
    elif lang == 'zh-tw':
        site, role = 'Gentoo 中文社群', '貢獻者'
    else:
        site, role = 'Gentoo 中文社区', '贡献者'
    fm = {
        'title': name,
        'description': f'{name} — {site} gentoo-zh {role}',
        'tags': [tag],
        'externalUrl': profile_url(login),
        'weight': weight,
    }
    if not exists:
        del fm['externalUrl']
    if links:
        fm['links'] = [{'name': l['name'], 'url': l['url']} for l in links]
    fm['contributions'] = contributions
    front = yaml.safe_dump(
        fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
    commits = contributions['total']
    body = f'{commits} commits' if lang == 'en' else f'{commits} 次提交'
    return f'---\n{front}---\n\n{body}\n'


def create_contributor_page(login, user_data, contributions, dry_run=False, exists=None):
    """建立或更新貢獻者頁（首次建立用）；exists 見 github.account_exists，None 時沿用既有頁面或 user_data"""
    # login 用於 URL 與磁碟路徑，只接受 GitHub 合法字元。
    if not re.fullmatch(r'[A-Za-z0-9-]{1,39}', login or ''):
        print(f"  [跳過] 非法 login，已略過: {login!r}")
        return
    name = user_data.get('name') or login
    blog = (user_data.get('blog') or '').strip()
    twitter = (user_data.get('twitter_username') or '').strip()

    links = []
    if blog:
        if not blog.startswith(('http://', 'https://')):
            blog = 'https://' + blog
        links.append({'name': 'blog', 'url': blog})
    if twitter:
        links.append({'name': 'twitter', 'url': f'https://x.com/{twitter}'})

    for acct in (user_data.get('social_accounts') or []):
        url = (acct.get('url') or '').strip()
        if not url or not url.startswith(('http://', 'https://')):
            continue
        provider = (acct.get('provider') or '').strip().lower()
        is_twitter = provider == 'twitter' or 'twitter.com' in url or 'x.com' in url
        if is_twitter:
            if any(l['name'] == 'twitter' for l in links):
                continue
            link_name = 'twitter'
        else:
            link_name = provider or 'link'
        if any(l['url'].rstrip('/') == url.rstrip('/') for l in links):
            continue
        links.append({'name': link_name, 'url': url})

    commits = contributions['total']
    weight = 10000 - commits
    tag_cn = DEFAULT_TAGS['zh-cn']
    tag_tw = DEFAULT_TAGS['zh-tw']
    tag_en = DEFAULT_TAGS['en']

    if dry_run:
        print(f"  [DRY-RUN] 會建立/更新: {login} ({name})")
        print(f"    提交: {commits}, 權重: {weight}, 標籤: {tag_cn}")
        if links:
            print(f"    連結: {', '.join(l['name'] for l in links)}")
        if exists is False or (exists is None and user_data.get('gone')):
            print(f"    GitHub 帳號已不存在，不寫 externalUrl")
        return

    for lang, default_tag in (('zh-cn', tag_cn), ('zh-tw', tag_tw), ('en', tag_en)):
        contrib_dir = CONTENT_DIRS[lang] / login
        contrib_dir.mkdir(parents=True, exist_ok=True)
        file_path = contrib_dir / "index.md"
        # 保留手動指定的角色；接受 flow 與 block 格式的 tags。
        tag = default_tag
        linked = not user_data.get('gone') if exists is None else exists
        if file_path.exists() and is_hand_written(file_path.read_text(encoding='utf-8')):
            continue  # 手寫頁由下方 update_commits_only 只更新提交資料
        if file_path.exists():
            fm_match = re.match(r'^---\s*\n(.*?)\n---',
                                file_path.read_text(encoding='utf-8'), re.S)
            if fm_match:
                try:
                    existing = yaml.safe_load(fm_match.group(1)) or {}
                    existing_tags = existing.get('tags') or []
                    if existing_tags and existing_tags[0] in SPECIAL_TAGS:
                        tag = canonical_tag(existing_tags[0], lang)
                    if exists is None:
                        linked = 'externalUrl' in existing  # 無法確認帳號時沿用既有頁面
                except yaml.YAMLError:
                    pass
        atomic_write_text(file_path, generate_frontmatter(
            login, name, links, weight, tag, contributions, lang, linked))
    # 手寫頁只更新 weight、contributions 與 GitHub 連結。
    update_commits_only(login, contributions, exists=exists)


def prune_dropped_contributors(kept_logins, dry_run=False):
    """保留手寫頁及特殊角色；名單異常偏少時跳過剪枝。"""
    base = CONTENT_DIRS['zh-cn']
    existing = [d for d in base.iterdir() if d.is_dir()]
    if len(kept_logins) < 30 or len(kept_logins) < len(existing) * 0.5:
        print(f"  [跳過剪枝] 保留集 {len(kept_logins)} 偏少（現有 {len(existing)} 頁），疑似抓取異常，不刪除")
        return
    removed = 0
    for d in existing:
        login = d.name
        if login.casefold() in kept_logins:
            continue
        # 任一語言有手寫頁或特殊角色便整組保留；解析失敗也視為手寫頁。
        keep = False
        for lang_base in CONTENT_DIRS.values():
            idx = lang_base / login / "index.md"
            if not idx.exists():
                continue
            content = idx.read_text(encoding='utf-8')
            front, _ = split_page(content)
            tags = (front or {}).get('tags') or []
            if is_hand_written(content) or not isinstance(tags, list) \
                    or any(tag in SPECIAL_TAGS for tag in tags):
                keep = True
                break
        if keep:
            continue
        for lang_base in CONTENT_DIRS.values():
            target = lang_base / login
            if not target.exists():
                continue
            if dry_run:
                print(f"  [DRY-RUN] 會移除已下線貢獻者: {target}")
            else:
                shutil.rmtree(target)
        removed += 1
    print(f"  剪枝：移除 {removed} 位已下線（非特殊標籤）貢獻者")
