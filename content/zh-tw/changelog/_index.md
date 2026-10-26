---
title: "更新紀錄"
description: "網站與社群服務的重要變更。"
---

<!-- anchor:2026-年-10-月 -->

<!-- anchor:2026-年-9-月 -->

<!-- anchor:2026-年-8-月 -->

<!-- anchor:2026-年-7-月 -->

<!-- anchor:2026-年-6-月 -->

<!-- anchor:2026-年-5-月 -->

<!-- anchor:更新說明 -->

## 舊版更新連結

網站改版後不再保留 2026 年 5 至 10 月的舊版更新紀錄。指向這些月份的歷史連結會定位至此處；目前的更新紀錄列於下方。

## 2026-10 Apple Silicon Mac 安裝教學更新 {#apple-silicon-guide}

[在 Apple Silicon Mac 上安裝 Gentoo Linux](/zh-tw/posts/2025-10-02-gentoo-m-series-mac/) 依 MacBook Air M2 的實際安裝過程重寫：下載有日期的 Live ISO 並校驗，列出 Asahi 安裝程式與 Recovery 的完整畫面，Stage3 改為下載最新版本，`make.conf` 範例改用台灣鏡像。

移除轉載文章〈Gentoo Linux with ZFS〉，原網址轉向文章列表。

## 2026-10 網站改版 {#redesign}

網站從 Hugo 遷移至 Astro：頁面在建置時產生靜態 HTML，介面使用 Meta 開源的 Astryx 元件庫（React 與 StyleX），只有導覽、搜尋、篩選等少數元件在瀏覽器中執行。站內搜尋由 Pagefind 提供，網站部署在 Cloudflare Workers。下載站的說明頁面與服務狀態併入主站，依文件、下載、社群、支援、關於五類整理。日期於上線時確定。
