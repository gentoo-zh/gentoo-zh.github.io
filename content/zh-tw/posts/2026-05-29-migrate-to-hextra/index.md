---
title: "網站主題從 Blowfish 遷移到 Hextra"
description: "本站主題從 Blowfish 換到 Hextra：更輕、更快，對文件和終端瀏覽器更友好。這篇說說為什麼換、改了哪些地方。"
date: 2026-05-29
tags: ["website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

繼上次將網站從 Jekyll 遷移到 Hugo 之後，本站再次更換主題：從 [Blowfish](https://blowfish.page/) 遷移到 [Hextra](https://imfing.github.io/hextra/)。

## 為什麼換 Hextra

Blowfish 功能全面，但對一個以文件和教學為主的社群站來說偏重：首屏載入的指令碼與樣式較多，頁面效能開銷偏高；預設排版用於長文閱讀時也不夠清爽。

Hextra 基於 Tailwind CSS，為文件與部落格而生：

- **更輕、更快**：零第三方請求（無外部字型 / CDN / 追蹤），首屏文字資源約 50 KB（gzip）；貢獻者頭像按顯示尺寸自動縮放，頁面效能開銷明顯降低；
- **閱讀更清晰**：規整的標題層級、行距與程式碼塊排版，長文更好讀；
- 自帶**全文搜尋**（FlexSearch）、暗色模式與響應式佈局；
- 透過 Hugo Modules 引入，無需 Node 工具鏈。

## 主要變化

- 首頁重做：hero + 快捷入口 + 最新文章 + 社群貢獻者；
- 貢獻者列表：自動抓取 [gentoo-zh Overlay](https://github.com/gentoo-zh/overlay) 中提交 5 次以上者，顯示提交次數並按提交量排序，每月自動更新；
- 文章頁署名顯示作者頭像；
- 文章改用 `tags` 分類，文章頁與列表顯示 `#標籤`，可點進 `/tags/` 聚合頁；
- 首頁「最新文章」提供 RSS 訂閱；分享到 Telegram / 社交平臺時顯示網站品牌預覽卡片；
- 下載頁突出「中文社群客製 KDE 桌面 Live ISO」，新手可開箱即用；
- 全站簡繁雙語（zh-CN / zh-TW）並存；
- 站內全文搜尋、暗色模式。

## 對終端瀏覽器友好（TUI）

應 [@talk_something](https://t.me/talk_something) 群裡 lzamora70（因為lzamora70菊苣過於抽象，多次銷號，所以名字不一定更新的上）的提議，本站特意針對終端 / 文字瀏覽器做了一輪最佳化——畢竟是 Gentoo：

- 語義化的 HTML 結構與標題層級，在 [lynx](https://lynx.invisible-island.net/) / [w3m](https://w3m.sourceforge.net/) / links 等純文字瀏覽器中排版清晰、連結可達；
- 每頁頂部都有「跳到正文」連結，可一鍵跳過導覽直接閱讀；
- 圖片均有恰當的替代文字（`alt`）；裝飾性的重複圖片（頭像牆的迴圈副本、明暗兩份 logo）使用空 `alt`，避免在文字瀏覽器與讀屏軟體中被重複朗讀；
- 貢獻者頭像牆與文章作者署名在文字模式下每人只列一次；
- 配合 Hextra 的「以 Markdown 檢視 / 複製為 Markdown」頁面選單，方便用指令碼或 LLM 直接取用頁面原文。

歡迎用 `lynx https://gentoozh.org/` 試試。

## 補充：公共頁面加了英文

遷移之後，又給公共頁面（關於、下載、鏡像列表、貢獻指南這些）補了英文國際化，方便用 gentoo-zh overlay 的海外使用者——現在簡 / 繁 / 英都能切。要說明的是：**技術文章不一定都有英文**，目前只做了公共頁面；英文是借翻譯軟體協助生成、由至今能找到的最好最貴的模型 Claude Fable 5（ultracode）負責 review 和最佳化的，難免有錯漏，歡迎在 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 指正。

## 反饋

- Telegram 頻道：[@gentoocn](https://t.me/gentoocn) · 群組：[@gentoo_zh](https://t.me/gentoo_zh)
- 提交 Issue / PR：[GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io)

感謝 Blowfish 與 Hextra 主題的開發者。
