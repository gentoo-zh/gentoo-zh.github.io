---
title: "更新記錄"
date: 2026-05-31
description: "Gentoo 中文社群網站更新記錄"
slug: "changelog"
---

本頁面記錄網站內容的主要更新，便於讀者追蹤變更。

---

## 2026 年 6 月

- 下載站上雲：Live ISO 下載遷到 **Cloudflare R2**（[r2.gentoozh.org](https://r2.gentoozh.org/)，零出口流量、全球邊緣），落地頁 [mirror.gentoozh.org](https://mirror.gentoozh.org/) 改成 **Cloudflare Worker**（邊緣即時讀 R2，列出最新鏡像 + 全部歷史版本）；測速改用 [Cloudflare 官方測速](https://speed.cloudflare.com/)；自建的美國下載 / 測速伺服器隨之下線
- 公共頁面新增英文（English）國際化：關於、下載、鏡像列表、貢獻指南等公共頁面現在可在簡體 / 繁體 / 英文之間切換，主要是方便用 gentoo-zh overlay 的海外使用者。需要說明：**技術文章不一定都有英文**，目前只做了公共頁面；英文部分借翻譯軟體協助生成、由至今能找到的最好最貴的模型 Claude Fable 5（ultracode）負責 review 和最佳化，難免有錯漏，歡迎在 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 指正

## 2026 年 5 月

- 專案結構調整：把表現層（主題）抽成獨立的 Hextra 補丁包 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)，本倉庫只留內容與配置，更清爽、也便於跟隨上游 Hextra 更新
- 首頁改版：重新梳理視覺主次（大標題做錨點、主操作更突出），主色統一為 Gentoo 品牌紫，「最新文章」改為優先展示技術內容
- 貢獻指南重寫「為 gentoo-zh Overlay 貢獻」一節：依官方 Gentoo ebuild 倉庫規範梳理完整提交流程（EAPI、`metadata.xml`、thin Manifest、`~arch` 測試、`pkgdev`/`pkgcheck`、PR 與 CI），並補 nvchecker 版本跟進；區分 Overlay 貢獻（計入貢獻者牆）與網站貢獻，頁面排版改用原生 callout / 摺疊塊，頂欄新增「貢獻指南」入口
- 下載站接入 mirror.gentoozh.org，替代已下線的 iso.gig-os.org；下載 / 鏡像列表 / Overlay 三頁重寫，Live ISO 登入憑據支援點選複製
- 鏡像同步源說明：Gentoo 官方自 2025-10-30 起停止為第三方倉庫（含 gentoo-zh）提供快取鏡像，overlay 已改為直連 GitHub 上游同步；之前新增過的使用者需更新同步源，詳見[公告](/posts/2025-10-07-thirdparty-repo-mirror-removal/)
- **網站主題從 Blowfish 遷移到 Hextra**（v0.12.3，基於 Hugo 0.162.1）：重做首頁 bento 佈局、整理頂欄導航、文章改用原生 `tags` 分類，新增首頁 RSS 訂閱按鈕與社交分享圖；詳見[遷移公告](/posts/2026-05-29-migrate-to-hextra/)
- 下載頁突出「中文社群定製 KDE 桌面 Live ISO」，方便新手快速上手
- 載入最佳化：貢獻者頭像按顯示尺寸自動縮放（首頁圖片體積大幅下降），動畫尊重「減少動態效果」偏好
- 貢獻者自動更新改為每月一次，並在更新時清理已下線貢獻者與舊頭像，控制倉庫體積
- 全站清理與貢獻者自動更新指令碼的穩定性強化

## 2026 年 1–4 月

- 安裝指南系列轉為草稿（錯漏較多，推薦參考 [Gentoo Wiki](https://wiki.gentoo.org/)）
- 新增 NVIDIA + Chromium 硬體加速配置，簡化相關配置

## 2025 年 12 月

- 新增貢獻者自動更新功能（定期從 GitHub 抓取提交資料，按提交量排序）
- 完善 btrfs 子卷 / LUKS / fstab 安裝演示，提升可讀性
- M 系列 Mac 安裝指南標明僅支援 M1 / M2

## 2025 年 11 月

- 站點從 Jekyll 遷移到 Hugo，上線新版
- 新增貢獻者列表與個人介紹頁
- 完善 SEO 元標籤、結構化資料與暗色模式
- 更新 Telegram 群規、下載頁憑證與社群頻道資訊（IRC 遷至 Libera Chat）

---

## 更新說明

- 本頁面記錄網站**內容**的主要更新，不包括純技術性修改
- 貢獻者資訊每月自動更新，不在此處記錄
- 如有問題或建議，請聯絡 [admin@zakk.au](mailto:admin@zakk.au) 或在 [Telegram 群組](https://t.me/gentoo_zh) 討論
