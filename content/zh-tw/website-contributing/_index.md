---
title: "網站貢獻指南"
description: "文章、翻譯、開發環境與提交流程"
---

## 社群網站（文章 / 翻譯 / 文件）貢獻指南

網站原始碼在 [gentoo-zh/gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io)，以 [Astro](https://astro.build/) 與 Astryx 元件建置。文章、翻譯與修正都透過 Pull Request 提交。

### 專案結構 {#專案結構}

`content/` 依語言存放內容，`src/pages/` 定義路由，`src/ui/` 存放頁面元件，`src/markdown/` 負責渲染正文。

### 內容組織 {#內容組織}

文章放在 `content/<locale>/posts/`，欄目頁面使用 `content/<locale>/<section>/_index.md`。文章圖片與正文放在同一個目錄。

### 設定檔案 {#配置檔案}

`astro.config.ts` 設定建置，`src/content.config.ts` 驗證 front matter，`src/i18n/` 定義介面文字與語言路由。

### 主題與資源 {#主題與資源}

元件由 Astryx 提供。主題原始檔是 `src/theme/gentoo.ts`，修改後執行 `pnpm theme` 重新產生 `src/theme/built/`。固定網址的資源放在 `public/`。

<!-- steps -->

### 準備環境 {#setup}

<!-- anchor:環境準備 -->

需要 Node.js 22.12 或更新版本與 pnpm 11：

```bash
$ git clone https://github.com/<你的使用者名稱>/gentoo-zh.github.io.git
$ cd gentoo-zh.github.io
$ pnpm install --frozen-lockfile
$ pnpm dev        # 本機預覽
```

### 撰寫文章 {#write}

<!-- anchor:1-提交新文章 -->

<!-- anchor:多語言支援 -->

- 新文章放在 `content/<語言>/posts/<日期>-<名稱>/index.md`，圖片放在同一目錄，內文以相對路徑引用。
- 簡體（`zh-cn`）、正體（`zh-tw`）、英文（`en`）三個版本各自撰寫，不做自動轉換；沒有譯文的語言可以先缺。
- front matter 只接受 `title`、`description`、`date`、`lastmod`、`tags`、`authors`（`name`、`image`、`link`）、`aliases`、`featured`、`image`、`cover`、`summary`、`paged`，欄位拼錯時建置失敗。
- 可用的短代碼：`callout`（`type` 為 `info`、`warning` 或 `error`）與 `details`。

長篇教學可以分頁：在 front matter 加 `paged`，每個 `## N.` 標題各成一頁，`## 1.` 之前的內容留在總覽頁。三個語言版本的節號必須一致。不分組時寫 `paged: true`；`groups` 把側欄目錄分組，`from` 是該組第一節的編號：

```yaml
paged:
  groups:
    - title: 安裝
      from: 1
    - title: 安裝後
      from: 8
```

首頁顯示最新的三篇文章。

### 檢查並提交 {#submit}

```bash
$ pnpm check      # 型別檢查、內容與介面檢查，含一次建置
```

全部通過後推送到你的 fork，再到 GitHub 建立 Pull Request。提交訊息用英文，格式為 `<範圍>: <祈使句>`，例如 `docs: Fix the binhost URL`。

<!-- /steps -->

<!-- anchor:3-文章署名與頭像 -->

### 署名與頭像

在 front matter 的 `authors` 寫明作者，署名處顯示頭像、姓名與連結；省略 `image` 時只顯示姓名：

```yaml
authors:
  - name: 你的名字
    image: /contributors/<你的識別名稱>/feature.webp
    link: https://github.com/yourname
```

<!-- anchor:4-改進現有內容--技術改進 -->

### 改進現有內容

錯字、過時資訊、使用技巧、缺少的正體中文與英文翻譯，看到了都歡迎提交修正；模板、樣式、效能與功能方面的改進也歡迎。

[貢獻者列表](/contributors/)由 `scripts/update-contributors.py` 每月更新，統計 gentoo-zh 組織下符合條件的儲存庫提交，排除 fork、已封存儲存庫、機器人及設定中的排除項，再依個人提交總數排序。請勿手動編輯 `content/*/contributors/`。

### 提交 Pull Request

```bash
$ git checkout -b your-feature-branch
$ git add .
$ git commit -m "描述你的變更"
$ git push origin your-feature-branch
# 然後到 GitHub 建立 Pull Request
```

<!-- anchor:markdown-格式 -->

<!-- anchor:中文排版 -->

### 寫作規範

- 中文與英文、數字之間加空格；使用全形中文標點；數字與英文用半形。
- 專有名詞保持原文，如 Gentoo、Portage。
- 圖片放在文章目錄內，以相對路徑引用。
- 指令、路徑、套件名稱用行內程式碼或程式碼區塊，區塊註明語言；`bash`、`ini`、`conf`、`diff`、`yaml`、`toml` 等會自動上色。
- 指令加上提示符：一般使用者執行的指令（包括 `sudo`）以 `$ ` 開頭，在 root shell 中執行的以 `# ` 開頭；輸出與檔案內容不加。複製按鈕會自動略去提示符。
- 標題層級從 `##` 開始，不跳級。

### 常見問題 {#常見問題}

維護網站時常遇到的問題。

### 更新主題 {#如何更新主題}

同時更新 `@astryxdesign/core` 與 `@astryxdesign/cli` 的版本，執行 `pnpm exec astryx upgrade --from <舊版本> --apply`，再執行 `pnpm theme` 與 `pnpm check`。完整步驟見儲存庫 `docs/workflow.md` 的「升級 Astryx」。

### 新增欄目頁面 {#如何新增新的欄目頁面}

在 `content/` 下新增各語言的 `_index.md`，並於 `src/pages/` 與 `src/ui/chrome/sections.ts` 註冊路由及導覽入口。完整步驟見 `docs/workflow.md` 的「新增頁面」，元件插槽的用法見 `docs/architecture.md`。

<!-- anchor:2-簡繁轉換 -->

### 維持語言版本一致 {#簡繁內容不一致怎麼辦}

三種語言分別撰寫，不使用自動簡繁轉換。修改一種語言時，同步檢查另外兩種的事實與連結。

## 網站求助

遇到問題或有建議？

- **Telegram 頻道**：[@gentoocn](https://t.me/gentoocn)
- **Telegram 群組**：[@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**：<https://github.com/gentoo-zh/gentoo-zh.github.io/issues>
- **網站事宜聯絡信箱**：<zakk@gentoozh.org>

更多頻道見[交流管道](/channels/)。

## 授權條款

本站內容採用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授權條款，除非另有說明。程式碼貢獻遵循專案的 MIT 授權。
