import json
import subprocess
import time

from .config import BLOCKLIST, BOTS, CONTENT_DIRS, EXCLUDE_REPOS, ORG
from .files import atomic_write_text

MAX_RETRIES = 4
BACKOFF_BASE = 2
FIXTURE = None
CACHE = None

def run_command(cmd, check=True, timeout=None):
    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=check,
        timeout=timeout,
    )


class NotFound(RuntimeError):
    """GitHub 回應 HTTP 404：資源不存在，重試也不會變。"""


def is_not_found(error):
    """gh api 收到 HTTP 404 時以非零狀態結束，stderr 為「gh: Not Found (HTTP 404)」；限流、5xx 與逾時不算。"""
    return isinstance(error, subprocess.CalledProcessError) and 'HTTP 404' in (error.stderr or '')


def run_with_retry(cmd, *, what, allow_empty=False, timeout=60):
    """以指數退避重試失敗或空白回應，保留 stdout 的原始空白；HTTP 404 不重試，拋出 NotFound。"""
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = run_command(cmd, check=True, timeout=timeout)
            out = result.stdout
            if not allow_empty and not out.strip():
                raise RuntimeError(f"{what}: 空白輸出")
            return out
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, RuntimeError) as e:
            if is_not_found(e):
                raise NotFound(f"{what}: HTTP 404") from e
            last_err = e
            if attempt < MAX_RETRIES:
                wait = BACKOFF_BASE ** attempt
                stderr = getattr(e, 'stderr', '') or ''
                msg = stderr.strip()[:200] if stderr else str(e)[:200]
                print(f"  {what} 第 {attempt} 次失敗（{msg}），{wait}s 後重試…")
                time.sleep(wait)
    raise RuntimeError(f"{what} 重試 {MAX_RETRIES} 次後仍失敗: {last_err}")


def parse_json(text, what):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        head = text[:300].replace('\n', ' ')
        raise RuntimeError(f"{what}: JSON 解析失敗 ({e})；前 300 字元: {head!r}")


def stored(name, fetch):
    """回傳 --fixture 或 --cache 目錄裡的 name；沒有時 fixture 回傳 None，否則呼叫 fetch 並寫入快取。"""
    store = FIXTURE or CACHE
    path = store / name if store else None
    if path is not None and path.exists():
        return parse_json(path.read_text(encoding='utf-8'), name)
    if FIXTURE:
        return None
    data = fetch()
    if CACHE:
        atomic_write_text(path, json.dumps(data, ensure_ascii=False))
    return data


def fetch_pages(endpoint, what):
    items = []
    sep = '&' if '?' in endpoint else '?'
    for page in range(1, 51):
        out = run_with_retry(
            ['gh', 'api', f'{endpoint}{sep}per_page=100&page={page}'],
            what=f"取得{what}第 {page} 頁",
            allow_empty=True,
        )
        # 空倉庫的 /contributors 回應 204，沒有內容
        data = parse_json(out, f"{what} page {page}") if out.strip() else []
        items.extend(data)
        if len(data) < 100:
            break
    return items


def fetch_repos():
    """組織內納入統計的倉庫：公開、非 fork、未封存，且不在 exclude_repos"""
    repos = stored('repos.json', lambda: fetch_pages(f'/orgs/{ORG}/repos?type=public', '倉庫列表')) or []
    names = sorted(
        r['name'] for r in repos
        if not (r['fork'] or r['archived'] or r['private'] or r['name'] in EXCLUDE_REPOS)
    )
    print(f"納入 {len(names)} 個倉庫: {', '.join(names)}\n")
    return names


def fetch_repo_contributors(repo):
    """倉庫的貢獻者，含未關聯 GitHub 帳號的作者（type 為 Anonymous）"""
    return stored(
        f'contributors/{repo}.json',
        lambda: fetch_pages(f'/repos/{ORG}/{repo}/contributors?anon=1', f' {repo} 貢獻者'),
    ) or []


def is_bot(contrib):
    login = contrib['login']
    return login.casefold().endswith('[bot]') or contrib.get('type') == 'Bot' or login.casefold() in BOTS


def fetch_user_info(login):
    """取得使用者詳細資訊（含 GitHub 自填的社交帳號）。
    帳號已刪除（HTTP 404）時回傳 {'login', 'gone': True}；其他錯誤回傳僅含 login 的 dict。"""
    return stored(f'users/{login}.json', lambda: fetch_user_info_online(login)) or {'login': login}


def fetch_user_info_online(login):
    try:
        out = run_with_retry(
            ['gh', 'api', f'/users/{login}'],
            what=f"取得 {login} 個人資訊",
        )
        data = parse_json(out, f"user {login}")
    except NotFound:
        print(f"  {login} 的 GitHub 帳號已不存在（HTTP 404）")
        return {'login': login, 'gone': True}
    except RuntimeError as e:
        print(f"  警告: 無法取得 {login} 詳細資訊（{e}），僅以 login 為名稱")
        return {'login': login}
    try:
        sout = run_with_retry(
            ['gh', 'api', f'/users/{login}/social_accounts'],
            what=f"取得 {login} 社交帳號",
        )
        data['social_accounts'] = parse_json(sout, f"social {login}") or []
    except RuntimeError:
        data['social_accounts'] = []
    return data


def account_exists(login):
    """帳號存在回傳 True，HTTP 404 回傳 False，無法確定（網路錯誤、限流、5xx、fixture 沒有資料）回傳 None。
    不讀 --cache：快取裡的舊資料會掩蓋已刪除的帳號。"""
    if FIXTURE:
        data = stored(f'users/{login}.json', lambda: None)
        return None if data is None else not data.get('gone')
    try:
        run_with_retry(['gh', 'api', f'/users/{login}'], what=f"確認 {login} 的 GitHub 帳號")
    except NotFound:
        return False
    except RuntimeError as e:
        print(f"  警告: 無法確認 {login} 的 GitHub 帳號（{e}），頁面的 GitHub 連結不變")
        return None
    return True


def collect_contributors():
    """彙總各倉庫的提交，回傳 ({login: {倉庫: 提交數}}, {login: 頭像地址})"""
    commits, avatars, excluded, anonymous = {}, {}, set(), {}
    # GitHub 帳號不分大小寫；沿用既有目錄的寫法以保留網址。
    dirs = {d.name.casefold(): d.name for d in CONTENT_DIRS['zh-cn'].iterdir() if d.is_dir()}
    for repo in fetch_repos():
        people = 0
        for c in fetch_repo_contributors(repo):
            if c.get('type') == 'Anonymous':
                key = c.get('email') or c.get('name')
                anonymous[key] = anonymous.get(key, 0) + c['contributions']
            elif is_bot(c) or c['login'].casefold() in BLOCKLIST:
                excluded.add(c['login'])
            else:
                login = dirs.setdefault(c['login'].casefold(), c['login'])
                per_repo = commits.setdefault(login, {})
                per_repo[repo] = per_repo.get(repo, 0) + c['contributions']
                avatars[login] = c['avatar_url']
                people += 1
        print(f"  {repo}: {people} 位")
    if excluded:
        print(f"已排除 bot 與屏蔽使用者: {', '.join(sorted(excluded))}")
    print(f"未關聯 GitHub 帳號的提交作者: {len(anonymous)} 位，共 {sum(anonymous.values())} 次提交，不建立頁面")
    print(f"共 {len(commits)} 位貢獻者\n")
    return commits, avatars
