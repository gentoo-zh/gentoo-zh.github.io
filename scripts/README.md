# 貢獻者更新腳本

`scripts/update-contributors.py` 會從 GitHub 取得貢獻者資料、更新提交次數與權重，並在需要時自動建立新頁面（提交 >= 5 次）。

## 自動化更新

本腳本配置為 **每月 1 號 00:00 UTC 自動運行**（通過 GitHub Actions，cron `0 0 1 * *`）：
- 自動更新所有貢獻者的提交次數和權重
- 自動更新索引頁面時間戳
- 自動過濾屏蔽名單中的用戶
- 自動提交變更到倉庫

查看運行記錄：[GitHub Actions](https://github.com/Gentoo-zh/gentoo-zh.github.io/actions/workflows/update-contributors.yml)

> **首次部署 / workflow 大改後**：合併到 master 後建議在 Actions 頁手動 `workflow_dispatch` 跑一次，確認 CI 端 `gh` + `GITHUB_TOKEN` 的行為與本地 dry-run 一致。

## 配置文件

配置文件：`scripts/contributors-config.yaml`

```yaml
# 屏蔽名單 - 這些用戶不會出現在貢獻者列表中
blocklist:
  - Claude
  - charm

# 最小提交次數（默認值）
min_commits: 5

# 倉庫配置
repository: gentoo-zh/overlay

# 頭像尺寸配置
avatar_sizes:
  card: 200    # 列表頁卡片頭像
  single: 240  # 個人頁頭像
```

### 修改屏蔽名單

編輯 `contributors-config.yaml` 中的 `blocklist` 部分，添加或刪除用戶名即可。

## 常用指令

```bash
# 例行更新：只刷新提交次數與權重，保留現有標籤/連結
python3 scripts/update-contributors.py --commits-only

# 完整同步：下載頭像、抓取個人資料並重建頁面
python3 scripts/update-contributors.py

# 先看結果再決定是否執行
python3 scripts/update-contributors.py --dry-run
```

更多選項：
- `--min-commits N`  只處理提交 >= N 的貢獻者（預設從配置文件讀取）
- `--skip-avatars`   跳過頭像下載（已有圖時較快）
- `--skip-info`      跳過個人資料更新（只動頭像）

## 需求

- Python 3.7+
- PyYAML (`pip install pyyaml`)
- GitHub CLI (`gh`) 並已 `gh auth login`
- `curl`、`cwebp`

## 工作方式

- **例行模式** (`--commits-only`)
  - 更新所有已存在頁面的提交次數與權重（`weight = 10000 - commits`）
  - 更新索引頁面時間戳並添加"每月自動更新"說明
  - 若找到新達標的貢獻者會自動建立 `content/zh-{cn,tw}/contributors/<login>/index.md` 以及 WebP 頭像
  - 自動過濾屏蔽名單中的用戶
  
- **完整模式**
  - 重新產生頁面；若既有頁面使用社群創始人、網站維護者、主要維護者等特殊分類，腳本會保留該標籤
  - 下載並轉換頭像為 WebP 格式
  - 頁面內容只保留「XX 次提交」描述，不寫 email 或個人簡介

## 建議流程

1. **自動化**：每月 1 號自動運行 `--commits-only` 模式
2. **新成員**：發現 GitHub 有新達 5 次提交的成員時，跑一次完整模式並手動調整標籤
3. **局部更新**：若只需要更新頭像或連結，搭配 `--skip-avatars` / `--skip-info`

## 注意事項

- 特殊分類（社群創始人、網站維護者、主要維護者）需手動維護
- 屏蔽名單通過配置文件管理，修改後立即生效
- 亞太區 API 速率足夠，但仍建議 dry-run 先檢查輸出
- `__pycache__/` 等 Python 產物已在 `.gitignore` 中，不需要提交
