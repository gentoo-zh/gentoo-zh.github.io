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

## 2026-10 致謝與開銷 {#sponsors}

[致謝](/zh-tw/thanks/)加入 Onidel：它透過 Launch Pack 計畫提供 120 USD 雲端額度，用於論壇與 Matrix 橋接。頁面另新增「個人」一節。[基礎設施開銷](/zh-tw/costs/)的支出表加入這筆額度，已抵扣的部分從累計支出中扣除。

## 2026-10 Apple Silicon Mac 安裝教學更新 {#apple-silicon-guide}

[在 Apple Silicon Mac 上安裝 Gentoo Linux](/zh-tw/posts/2025-10-02-gentoo-m-series-mac/) 依 MacBook Air M2 的實際安裝過程重寫：改用經實機驗證的 20260827 版 Live ISO（20261006 版無法啟動），列出 Asahi 安裝程式與 Recovery 的完整畫面，Stage3 改為下載最新版本，`make.conf` 範例改用台灣鏡像。

教學後半同樣依實機補齊：Live 環境用 `net-setup` 連 Wi-Fi，加密根分割區的 fstab、crypttab、dracut 與 GRUB 設定改用實際輸出，安裝後配置改以 KDE 為例，涵蓋 Rime 輸入法、音訊、睡眠、瀏海與自訂核心。教學改為分頁閱讀，每節一頁，舊連結自動轉到對應頁面。

安裝後配置重新分成「桌面」（桌面環境、字型與中文輸入、音訊、藍牙）與「系統」（睡眠、記憶體）兩章，並補上實機檢查發現的缺口：啟用時間同步與藍牙，加入 zram 與 systemd-oomd，關閉重複啟動的 fcitx5。新增「Mac 鍵位與觸控板」一章：啟用 gentoo-zh overlay，用 keyd 對應 Mac 鍵位，並讓觸控板的「打字時停用」設定在 keyd 下繼續生效。分頁閱讀的章節目錄改為和文件側欄相同的摺疊清單：列出各章小節，預設展開目前章節，並標出正在閱讀的一節。

移除轉載文章〈Gentoo Linux with ZFS〉，原網址轉向文章列表。

## 2026-10 Overlay 設定 {#overlay-arch}

[Overlay 設定](/zh-tw/overlay/)的設定列加入 amd64／arm64 切換，接受測試關鍵字的指令隨所選架構改為 `~amd64` 或 `~arm64`。

## 2026-10 網站改版 {#redesign}

網站從 Hugo 遷移至 Astro：頁面在建置時產生靜態 HTML，介面使用 Meta 開源的 Astryx 元件庫（React 與 StyleX），只有導覽、搜尋、篩選等少數元件在瀏覽器中執行。站內搜尋由 Pagefind 提供，網站部署在 Cloudflare Workers。下載站的說明頁面與服務狀態併入主站，依文件、下載、社群、支援、關於五類整理。日期於上線時確定。
