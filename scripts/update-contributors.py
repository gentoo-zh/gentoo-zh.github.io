#!/usr/bin/env python3
"""
更新貢獻者資訊腳本
- 從 GitHub API 抓取貢獻者列表和詳細資訊
- 下載並轉換頭像為 WebP 格式
- 更新每位貢獻者的提交次數、部落格、X (Twitter) 等資訊
- 自動計算權重用於排序

使用方法:
    python3 scripts/update-contributors.py [選項]

選項:
    --min-commits N    只處理提交次數 >= N 的貢獻者 (預設: 5)
    --skip-avatars     跳過頭像下載
    --skip-info        跳過個人資訊更新
    --commits-only     只更新提交次數和權重 (CI 排程用)
    --dry-run          只顯示會做什麼，不實際修改檔案
"""

import argparse
import json
import re
import subprocess
import tempfile
import time
import yaml
from datetime import datetime, timezone
from pathlib import Path

CONTENT_DIRS = {
    'zh-cn': Path("content/zh-cn/contributors"),
    'zh-tw': Path("content/zh-tw/contributors"),
    'en': Path("content/en/contributors"),
}

# 手動指定的特殊分組標籤（創始人 / 維護者等）的【單一事實來源】。重新生成頁面時必須保留，
# 不可被預設的 "Overlay 贡献者" 覆蓋；每種語言用該語言的標籤。
#
# 注意：這裡的標籤字串與主題 gentoozh-theme 的 layouts/contributors/list.html 分組判斷【必須一致】，
# 兩處改動要同步（list.html 用這些字串把貢獻者歸入創始人 / 維護者 / 貢獻者各組）。
#
# 結構：role -> { 語言: 規範標籤 }。ROLE_ALIASES 收錄同義異寫（同角色、同語言的別字），
# 保留時不會被改寫掉，但跨語言的標籤會被歸一到該頁語言的規範標籤（見 canonical_tag）。
ROLE_TAGS = {
    'founder':        {'zh-cn': '社群创始人',   'zh-tw': '社群創始人',   'en': 'Community founder'},
    'overlay_maint':  {'zh-cn': '现任主要维护者', 'zh-tw': '現任主要維護者', 'en': 'Current maintainer'},
    'site_maint':     {'zh-cn': '网站维护者',    'zh-tw': '網站維護者',    'en': 'Site maintainer'},
    'site_content':   {'zh-cn': '网站内容贡献者', 'zh-tw': '網站內容貢獻者', 'en': 'Site content contributor'},
    'liveos_dev':     {'zh-cn': 'LiveOS 开发者', 'zh-tw': 'LiveOS 開發者', 'en': 'LiveOS developer'},
}
# 同角色、同語言的別字（保留為當前頁面的合法寫法，不被歸一改寫）。值為 (role, lang)。
ROLE_ALIASES = {
    '社区创始人': ('founder', 'zh-cn'),
    '社區創始人': ('founder', 'zh-tw'),
}

# tag 字串 -> (role, lang)。涵蓋規範標籤 + 別字。
TAG_TO_ROLE_LANG = {}
for _role, _m in ROLE_TAGS.items():
    for _lang, _tag in _m.items():
        TAG_TO_ROLE_LANG[_tag] = (_role, _lang)
TAG_TO_ROLE_LANG.update(ROLE_ALIASES)

# 所有被識別為「特殊分組標籤」的字串集合（由上面派生，避免重複維護）。
SPECIAL_TAGS = set(TAG_TO_ROLE_LANG)


def canonical_tag(existing_tag, lang):
    """把既有的特殊標籤歸一到【目標語言】的規範標籤。

    - 既有標籤本就屬於目標語言（含同語言別字，如 zh-cn 的「社区创始人」）→ 原樣保留。
    - 既有標籤屬於別的語言（如 en 頁誤帶了「现任主要维护者」）→ 換成目標語言的規範標籤。
    自愈：任何「標籤串了語言」的頁面，下次跑腳本即被修正為該頁語言的正確標籤。
    """
    role, tag_lang = TAG_TO_ROLE_LANG[existing_tag]
    if tag_lang == lang:
        return existing_tag
    return ROLE_TAGS[role][lang]

CONFIG_FILE = Path(__file__).parent / "contributors-config.yaml"

# 重試設定
MAX_RETRIES = 4
BACKOFF_BASE = 2  # 秒；指數退避 2 / 4 / 8 / 16

# curl 超時
CURL_TIMEOUT = 30


def load_config():
    """從配置檔載入設定，提供預設值"""
    default_config = {
        'repository': 'gentoo-zh/overlay',
        'min_commits': 5,
        'blocklist': [],
        'avatar_sizes': {'card': 200, 'single': 240},
    }

    if not CONFIG_FILE.exists():
        print(f"警告: 配置檔 {CONFIG_FILE} 不存在，使用預設配置")
        return default_config

    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f) or {}
        for key, value in default_config.items():
            config.setdefault(key, value)
        return config
    except Exception as e:
        print(f"警告: 讀取配置檔失敗: {e}，使用預設配置")
        return default_config


config = load_config()
REPO = config['repository']
AVATAR_SIZES = config['avatar_sizes']
MIN_COMMITS_DEFAULT = config['min_commits']
BLOCKLIST = set(config['blocklist'])


def run_command(cmd, check=True, timeout=None):
    """執行命令並回傳結果"""
    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=check,
        timeout=timeout,
    )


def run_with_retry(cmd, *, what, allow_empty=False, timeout=60):
    """帶指數退避重試的命令執行。回傳 stdout（已 .strip()）

    用於 gh api 等可能 rate-limit 或 5xx 的呼叫。
    """
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = run_command(cmd, check=True, timeout=timeout)
            out = result.stdout
            if not allow_empty and not out.strip():
                raise RuntimeError(f"{what}: 空白輸出")
            return out
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, RuntimeError) as e:
            last_err = e
            if attempt < MAX_RETRIES:
                wait = BACKOFF_BASE ** attempt
                stderr = getattr(e, 'stderr', '') or ''
                msg = stderr.strip()[:200] if stderr else str(e)[:200]
                print(f"  {what} 第 {attempt} 次失敗（{msg}），{wait}s 後重試…")
                time.sleep(wait)
    raise RuntimeError(f"{what} 重試 {MAX_RETRIES} 次後仍失敗: {last_err}")


def parse_json(text, what):
    """解析 JSON，失敗時帶上下文重新拋出"""
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        head = text[:300].replace('\n', ' ')
        raise RuntimeError(f"{what}: JSON 解析失敗 ({e})；前 300 字元: {head!r}")


def atomic_write_text(path: Path, content: str):
    """原子寫入：先寫入暫存檔，fsync 後 rename。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_fd, tmp_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=str(path.parent),
    )
    try:
        import os
        with open(tmp_fd, 'w', encoding='utf-8') as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_name, path)
    except Exception:
        try:
            Path(tmp_name).unlink()
        except FileNotFoundError:
            pass
        raise


def fetch_contributors():
    """從 GitHub 取得貢獻者列表（自動分頁，有重試）"""
    print("正在取得貢獻者列表...")

    contributors = []
    page = 1
    while True:
        out = run_with_retry(
            ['gh', 'api', f'/repos/{REPO}/contributors?per_page=100&page={page}'],
            what=f"取得第 {page} 頁貢獻者",
            allow_empty=True,
        )
        data = parse_json(out, f"contributors page {page}")
        if not data:
            break
        contributors.extend(data)
        print(f"  已取得第 {page} 頁: {len(data)} 位貢獻者")
        page += 1
        if page > 50:
            # 避免極端意外的無窮迴圈（GitHub 最多回傳 500 位的 default API）
            print("  警告: 已達分頁上限 50，提早結束")
            break

    print(f"總共找到 {len(contributors)} 位貢獻者\n")
    return contributors


def fetch_user_info(login):
    """取得使用者詳細資訊（含 GitHub 自填的社交帳號）。404 時回傳僅含 login 的 dict。"""
    try:
        out = run_with_retry(
            ['gh', 'api', f'/users/{login}'],
            what=f"取得 {login} 個人資訊",
        )
        data = parse_json(out, f"user {login}")
    except RuntimeError as e:
        # 帳號可能被刪除，退回到只用 login
        print(f"  警告: 無法取得 {login} 詳細資訊（{e}），僅以 login 為名稱")
        return {'login': login}
    # 額外抓 GitHub 個人頁「社交帳號」(mastodon / youtube / 自填連結如 t.me 等)，
    # 與 blog / twitter 欄位互補，盡量把能抓到的連結都收進來。
    try:
        sout = run_with_retry(
            ['gh', 'api', f'/users/{login}/social_accounts'],
            what=f"取得 {login} 社交帳號",
        )
        data['social_accounts'] = parse_json(sout, f"social {login}") or []
    except RuntimeError:
        data['social_accounts'] = []
    return data


def update_index_timestamp(dry_run=False):
    """更新索引頁的時間戳"""
    now_utc = datetime.now(timezone.utc)
    timestamp = now_utc.strftime("%Y年%m月%d日 %H:%M UTC")

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
            # 沒有時間戳行，附加到檔尾
            new_content = content.rstrip() + '\n\n' + label + '\n'

        if new_content != content:
            if not dry_run:
                atomic_write_text(file_path, new_content)
                print(f"  已更新 {file_path.name} 的時間戳")
            else:
                print(f"  [DRY-RUN] 會更新 {file_path.name} 的時間戳為: {timestamp}")
            updated = True

    return updated


def download_and_convert_avatar(login, avatar_url, dry_run=False):
    """下載並轉換頭像為 WebP（多尺寸），輸出到兩個語言子目錄。"""
    if dry_run:
        print(f"  [DRY-RUN] 會下載頭像: {avatar_url}")
        return

    import os
    # 用第一個語言目錄當暫存空間
    first_dir = CONTENT_DIRS['zh-cn'] / login
    first_dir.mkdir(parents=True, exist_ok=True)

    fd, temp_path = tempfile.mkstemp(
        prefix=f".avatar_{login}_",
        suffix=".png",
        dir=str(first_dir),
    )
    os.close(fd)
    temp_avatar = Path(temp_path)

    try:
        try:
            run_command(
                ['curl', '-sSLf', '--max-time', str(CURL_TIMEOUT),
                 '-o', str(temp_avatar), avatar_url],
                check=True,
                timeout=CURL_TIMEOUT + 5,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            print(f"  警告: 下載 {login} 頭像失敗（{e}），跳過頭像處理")
            return

        if not temp_avatar.exists() or temp_avatar.stat().st_size == 0:
            print(f"  警告: {login} 頭像檔為空，跳過")
            return

        for size_name, size in AVATAR_SIZES.items():
            # 一次轉一份，然後複製到每個語言目錄
            tmp_out = first_dir / f".avatar_{size_name}.{login}.tmp"
            try:
                run_command(
                    ['cwebp', '-quiet', '-q', '90',
                     '-resize', str(size), str(size),
                     str(temp_avatar), '-o', str(tmp_out)],
                    check=True,
                    timeout=30,
                )
                for lang, base_dir in CONTENT_DIRS.items():
                    target_dir = base_dir / login
                    target_dir.mkdir(parents=True, exist_ok=True)
                    target = target_dir / f"avatar_{size_name}.webp"
                    # 用 fileinput-safe shutil copy + rename 模式
                    import shutil
                    final_tmp = target.with_suffix('.webp.tmp')
                    shutil.copyfile(str(tmp_out), str(final_tmp))
                    os.replace(str(final_tmp), str(target))
                tmp_out.unlink()
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
                print(f"  警告: 轉換 {login} {size_name} 失敗（{e}）")
                try:
                    tmp_out.unlink()
                except FileNotFoundError:
                    pass
        # 新尺寸寫好後，清掉舊命名的單檔頭像（feature.webp），避免冗餘堆積
        for base_dir in CONTENT_DIRS.values():
            d = base_dir / login
            if (d / "avatar_card.webp").exists():
                (d / "feature.webp").unlink(missing_ok=True)
    finally:
        try:
            temp_avatar.unlink()
        except FileNotFoundError:
            pass


def update_commits_only(login, commits, dry_run=False):
    """只更新提交次數與權重"""
    weight = 10000 - commits

    updated = False
    for lang in ('zh-cn', 'zh-tw', 'en'):
        file_path = CONTENT_DIRS[lang] / login / "index.md"
        if not file_path.exists():
            continue

        content = file_path.read_text(encoding='utf-8')

        new_content = re.sub(
            r'^weight: \d+',
            f'weight: {weight}',
            content,
            flags=re.MULTILINE,
        )
        if lang == 'en':
            new_content = re.sub(r'\d+ commits', f'{commits} commits', new_content)
        else:
            new_content = re.sub(r'\d+ 次提交', f'{commits} 次提交', new_content)

        if new_content != content:
            if not dry_run:
                atomic_write_text(file_path, new_content)
            updated = True

    return updated


def generate_frontmatter(login, name, links, weight, tag, commits, lang='zh-cn'):
    """產生貢獻者頁的 frontmatter + 內容。

    用 yaml.safe_dump 序列化，確保不受信任的 GitHub 顯示名稱 / 連結
    （可能含 " : 換行 --- {{ }} 等）被正確轉義，無法注入額外 frontmatter
    參數、提前關閉 frontmatter 圍欄、或破壞站點建構。

    description 給每頁一句穩定的 meta 描述（避免 Hextra 退而用正文「N 次提交」
    當描述）；不含提交數，免得每月隨數字變動而抖。"""
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
        'externalUrl': f'https://github.com/{login}',
        'weight': weight,
    }
    if links:
        fm['links'] = [{'name': l['name'], 'url': l['url']} for l in links]
    front = yaml.safe_dump(
        fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
    body = f'{commits} commits' if lang == 'en' else f'{commits} 次提交'
    return f'---\n{front}---\n\n{body}\n'


def create_contributor_page(login, user_data, commits, dry_run=False):
    """建立或更新貢獻者頁（首次建立用）"""
    # 防禦性：login 同時用於 URL 與磁碟路徑，限制為 GitHub 合法字元集
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
        # Twitter 已 rebrand 為 X
        links.append({'name': 'twitter', 'url': f'https://x.com/{twitter}'})

    # 併入 GitHub 自填的社交帳號（mastodon / youtube / 自填連結，含可能的 t.me）。
    # 去重，且不與上面的 blog / twitter 重複。
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

    weight = 10000 - commits
    tag_cn = "Overlay 贡献者"
    tag_tw = "Overlay 貢獻者"
    tag_en = "Overlay contributor"

    if dry_run:
        print(f"  [DRY-RUN] 會建立/更新: {login} ({name})")
        print(f"    提交: {commits}, 權重: {weight}, 標籤: {tag_cn}")
        if links:
            print(f"    連結: {', '.join(l['name'] for l in links)}")
        return

    for lang, default_tag in (('zh-cn', tag_cn), ('zh-tw', tag_tw), ('en', tag_en)):
        contrib_dir = CONTENT_DIRS[lang] / login
        contrib_dir.mkdir(parents=True, exist_ok=True)
        file_path = contrib_dir / "index.md"
        # 保留既有的特殊分組標籤（手動指定的創始人 / 維護者等）。
        # 解析既有 frontmatter 取得 tag，相容舊的 flow（tags: ['x']）
        # 與新的 block（tags:\n- x）兩種格式。
        tag = default_tag
        if file_path.exists():
            fm_match = re.match(r'^---\s*\n(.*?)\n---',
                                file_path.read_text(encoding='utf-8'), re.S)
            if fm_match:
                try:
                    existing_tags = (yaml.safe_load(fm_match.group(1)) or {}).get('tags') or []
                    if existing_tags and existing_tags[0] in SPECIAL_TAGS:
                        # 保留特殊角色，但歸一到該頁語言的規範標籤（修正串語言的舊資料）
                        tag = canonical_tag(existing_tags[0], lang)
                except yaml.YAMLError:
                    pass
        atomic_write_text(file_path, generate_frontmatter(
            login, name, links, weight, tag, commits, lang))


def prune_dropped_contributors(kept_logins, dry_run=False):
    """移除已掉出名單的貢獻者頁（特殊標籤的創始人 / 維護者除外）。
    安全護欄：保留集異常偏少（疑似 API 抓取失敗）時跳過，避免誤刪。"""
    import shutil
    base = CONTENT_DIRS['zh-cn']
    existing = [d for d in base.iterdir() if d.is_dir()]
    if len(kept_logins) < 30 or len(kept_logins) < len(existing) * 0.5:
        print(f"  [跳過剪枝] 保留集 {len(kept_logins)} 偏少（現有 {len(existing)} 頁），疑似抓取異常，不刪除")
        return
    removed = 0
    for d in existing:
        login = d.name
        if login in kept_logins:
            continue
        # 特殊標籤（創始人 / 維護者等）即使掉出名單也保留
        idx = d / "index.md"
        keep_special = False
        if idx.exists():
            m = re.match(r'^---\s*\n(.*?)\n---', idx.read_text(encoding='utf-8'), re.S)
            if m:
                try:
                    tags = (yaml.safe_load(m.group(1)) or {}).get('tags') or []
                    keep_special = bool(tags) and tags[0] in SPECIAL_TAGS
                except yaml.YAMLError:
                    keep_special = True  # 解析失敗保守保留
        if keep_special:
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


def main():
    parser = argparse.ArgumentParser(
        description='更新 Gentoo 中文社群貢獻者資訊',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('--min-commits', type=int, default=MIN_COMMITS_DEFAULT,
                        help=f'只處理提交次數 >= N 的貢獻者 (預設: {MIN_COMMITS_DEFAULT})')
    parser.add_argument('--skip-avatars', action='store_true', help='跳過頭像下載')
    parser.add_argument('--skip-info', action='store_true', help='跳過個人資訊更新')
    parser.add_argument('--commits-only', action='store_true',
                        help='只更新提交次數和權重，不修改標籤、連結等')
    parser.add_argument('--dry-run', action='store_true',
                        help='只顯示會做什麼，不實際修改檔案')

    args = parser.parse_args()

    if args.dry_run:
        print("=== DRY RUN 模式 ===\n")

    contributors = fetch_contributors()

    filtered = [
        c for c in contributors
        if c['contributions'] >= args.min_commits and c['login'] not in BLOCKLIST
    ]
    excluded = [c['login'] for c in contributors if c['login'] in BLOCKLIST]
    if excluded:
        print(f"已屏蔽使用者: {', '.join(excluded)}")
    print(f"過濾後剩餘 {len(filtered)} 位貢獻者 (>= {args.min_commits} 次提交)\n")

    updated_count = 0
    skipped_count = 0
    failed_count = 0

    for contrib in filtered:
        login = contrib['login']
        commits = contrib['contributions']
        avatar_url = contrib['avatar_url']

        print(f"處理 {login} ({commits} 次提交)...")

        try:
            if args.commits_only:
                # 任何語言目錄存在就視為已建立過
                contrib_dir = CONTENT_DIRS['zh-cn'] / login
                if not contrib_dir.exists():
                    print(f"  [新貢獻者] 建立頁面...")
                    user_data = fetch_user_info(login)
                    download_and_convert_avatar(login, avatar_url, args.dry_run)
                    create_contributor_page(login, user_data, commits, args.dry_run)
                    updated_count += 1
                elif update_commits_only(login, commits, args.dry_run):
                    updated_count += 1
                    weight = 10000 - commits
                    print(f"  更新: 提交 {commits}, 權重 {weight}")
                else:
                    skipped_count += 1
                continue

            user_data = {'login': login} if args.skip_info else fetch_user_info(login)

            if not args.skip_avatars:
                download_and_convert_avatar(login, avatar_url, args.dry_run)

            if not args.skip_info:
                create_contributor_page(login, user_data, commits, args.dry_run)

            updated_count += 1
        except Exception as e:
            print(f"  錯誤: {e}")
            failed_count += 1
            continue

    print(f"\n正在更新索引頁時間戳...")
    update_index_timestamp(args.dry_run)

    print(f"\n正在清理已下線的貢獻者...")
    prune_dropped_contributors({c['login'] for c in filtered}, args.dry_run)

    print(f"\n{'=' * 50}")
    print(f"完成！")
    print(f"  已更新: {updated_count} 位")
    if skipped_count > 0:
        print(f"  無變化: {skipped_count} 位")
    if failed_count > 0:
        print(f"  失敗:   {failed_count} 位")

    if args.dry_run:
        print("\n(這是 DRY RUN，沒有實際修改任何檔案)")

    # 有失敗時以非零退出，讓 CI 顯示警示
    if failed_count > 0:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
