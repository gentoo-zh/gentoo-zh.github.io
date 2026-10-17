#!/usr/bin/env python3
"""
更新貢獻者資訊腳本
- 從 GitHub API 列出組織內所有非 fork、未封存的公開倉庫，彙總每人在各倉庫的提交次數
- 抓取貢獻者詳細資訊
- 下載並轉換頭像為 WebP 格式
- 更新每位貢獻者的提交次數、部落格、X (Twitter) 等資訊
- GitHub 帳號已刪除（/users/<login> 回應 HTTP 404）時去掉頁面的 GitHub 連結，帳號恢復後補回
- 自動計算權重用於排序

使用方法:
    python3 scripts/update-contributors.py [選項]

選項:
    --skip-avatars     跳過頭像下載
    --skip-info        跳過個人資訊更新
    --commits-only     只更新提交次數和權重 (CI 排程用)
    --dry-run          只顯示會做什麼，不實際修改檔案
    --fixture DIR      從 DIR 讀取 GitHub 回應，不連網；目錄結構同 --cache
    --cache DIR        GitHub 回應快取：DIR/repos.json、DIR/contributors/<倉庫>.json、
                       DIR/users/<login>.json；已有的檔案不再重抓
    --now TIME         索引頁時間戳改用 TIME（ISO 8601，UTC），預設為現在
"""

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Isolated Python (-I) omits the script directory from its import path.
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.dont_write_bytecode = True

from contributors import github
from contributors.avatars import download_and_convert_avatar
from contributors.config import CONTENT_DIRS
from contributors.github import account_exists, collect_contributors, fetch_user_info
from contributors.pages import (
    contributions_of,
    create_contributor_page,
    prune_dropped_contributors,
    update_commits_only,
    update_index_timestamp,
)

def main():
    parser = argparse.ArgumentParser(
        description='更新 Gentoo 中文社群貢獻者資訊',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('--skip-avatars', action='store_true', help='跳過頭像下載')
    parser.add_argument('--skip-info', action='store_true', help='跳過個人資訊更新')
    parser.add_argument('--commits-only', action='store_true',
                        help='只更新提交次數和權重，不修改標籤、連結等')
    parser.add_argument('--dry-run', action='store_true',
                        help='只顯示會做什麼，不實際修改檔案')
    parser.add_argument('--fixture', type=Path,
                        help='從此目錄讀取 GitHub 回應，不連網；目錄結構同 --cache')
    parser.add_argument('--cache', type=Path,
                        help='GitHub 回應快取目錄，已有的回應不再重抓')
    parser.add_argument('--now', type=datetime.fromisoformat,
                        help='索引頁時間戳改用此時間（ISO 8601，UTC）')

    args = parser.parse_args()

    github.FIXTURE, github.CACHE = args.fixture, args.cache
    now_utc = args.now.replace(tzinfo=timezone.utc) if args.now else datetime.now(timezone.utc)

    if args.dry_run:
        print("=== DRY RUN 模式 ===\n")

    repo_commits, avatars = collect_contributors()
    contributions = {login: contributions_of(repos) for login, repos in repo_commits.items()}

    updated_count = 0
    skipped_count = 0
    failed_count = 0

    for login in sorted(contributions, key=lambda login: (-contributions[login]['total'], login)):
        contrib = contributions[login]
        commits = contrib['total']
        avatar_url = avatars[login]

        print(f"處理 {login} ({commits} 次提交)...")

        # 在下載或寫檔前驗證 login，避免非法路徑。
        if not re.fullmatch(r'[A-Za-z0-9-]{1,39}', login or ''):
            print(f"  [跳過] 非法 login，已略過: {login!r}")
            skipped_count += 1
            continue

        try:
            if args.commits_only:
                contrib_dir = CONTENT_DIRS['zh-cn'] / login
                if not contrib_dir.exists():
                    print(f"  [新貢獻者] 建立頁面...")
                    user_data = fetch_user_info(login)
                    download_and_convert_avatar(login, avatar_url, args.dry_run)
                    create_contributor_page(login, user_data, contrib, args.dry_run, account_exists(login))
                    updated_count += 1
                elif update_commits_only(login, contrib, args.dry_run, account_exists(login)):
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
                create_contributor_page(login, user_data, contrib, args.dry_run, account_exists(login))

            updated_count += 1
        except Exception as e:
            print(f"  錯誤: {e}")
            failed_count += 1
            continue

    print(f"\n正在更新索引頁時間戳...")
    update_index_timestamp(now_utc, args.dry_run)

    print(f"\n正在清理已下線的貢獻者...")
    prune_dropped_contributors({login.casefold() for login in contributions}, args.dry_run)

    print(f"\n{'=' * 50}")
    print(f"完成！")
    print(f"  已更新: {updated_count} 位")
    if skipped_count > 0:
        print(f"  無變化: {skipped_count} 位")
    if failed_count > 0:
        print(f"  失敗:   {failed_count} 位")

    if args.dry_run:
        print("\n(這是 DRY RUN，沒有實際修改任何檔案)")

    if failed_count > 0:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
