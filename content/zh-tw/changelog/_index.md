---
title: "更新記錄"
date: 2026-05-31
description: "Gentoo 中文社群網站更新記錄"
slug: "changelog"
---

本頁面記錄網站內容的主要更新，便於讀者追蹤變更。

---

## 2026 年 7 月

- **文章與各文件頁開放評論**：接入 [giscus](https://giscus.app/)（基於本倉庫的 GitHub Discussions），用 GitHub 帳號登入即可留言；評論區亮暗跟隨站點、配色與頁面一致，首頁不顯示
- **社群主域名遷往 [gentoozh.org](https://gentoozh.org/)**：舊域名（gentoo.org.cn、gentoocn.org）全部 301 永久跳轉，書籤與已有連結不失效，建議儘快更新；詳見[遷移公告](/posts/2026-07-01-domain-migration/)
- **gentoo-zh overlay 倉庫遷到組織倉庫 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)**：舊的 `microcai/gentoo-zh` 會 301 到新倉庫，已新增的使用者請把同步源更新到新 URL，詳見[倉庫遷移公告與執行記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)
- **社群論壇 [forum.gentoozh.org](https://forum.gentoozh.org/) 上線**（Discourse，簡繁雙語）：適合發帖、提問和長期討論；首頁「加入社群」與[關於頁](/about/)已加入口
- **官網託管遷到 Cloudflare Workers**：從 GitHub Pages 遷到 Workers 靜態資源託管（免費不限量、全球邊緣節點），見[遷移文的補充說明](/posts/2026-07-01-domain-migration/)
- [下載頁](/download/#live-iso)與 [Overlay 頁](/overlay/)文案更新：下載頁整理登入憑據、虛擬機器 AVX2 提示與鏡像站清單；Overlay 頁重排軟體套件分類、把兩種新增方式收進摺疊塊、補上中國內陸 git / distfiles 換源地址
- 英文介面站名統一為 **Gentoo-zh Community**

## 2026 年 6 月

- 新增文章 **[如何參與 Gentoo Wiki 的翻譯工作](/posts/2026-06-30-gentoo-wiki-translation/)**：面向中文譯者的翻譯入門，涵蓋帳號與權限申請、翻譯介面用法、翻譯規範與中英文排版約定，以及 Gentoo 理事會 AI 政策對翻譯的具體影響（作者 YangMame）
- 新增安全文章 **[Linux 頁快取寫入型提權漏洞梳理](/posts/2026-06-27-linux-page-cache-lpe/)**：梳理 2026 年 Copy Fail、DirtyFrag、Fragnesia 與 DirtyClone 的共同利用模型、不同根因與修復關係
- 新增安全公告 **[Linux 核心 DirtyClone 本地提權漏洞：Gentoo 更新建議](/posts/2026-06-27-dirtyclone-kernel-lpe/)**（CVE-2026-43503，CVSS 8.8）：Gentoo 受支援核心已有修復，使用者應更新並重啟
- 新增公告 **[中文社群近期更新：Live ISO、官網、下載站與測速](/posts/2026-06-09-live-iso-improvements/)**：客製 KDE Live ISO、Calamares 安裝器、自動建置流水線、官網 Hextra 遷移與英文國際化、下載站與測速站的整體進展
- 新增公告 **[Python 3.14 成為預設版本](/posts/2026-06-01-python-314-default/)**（2026-06-01）：Gentoo 系統預設 Python 從 3.13 換成 3.14，手動控制升級節奏或遇到 USE / 依賴報錯的用法說明
- 新增轉載文章 **[Gentoo Linux with ZFS](/posts/2026-06-18-gentoo-linux-with-zfs/)**（原作者 [Locez](https://github.com/locez)，經授權按 CC BY-NC-SA 4.0 轉載）：在雙 NVMe 鏡像上安裝 ZFS 根 + ZFS 原生加密的實錄；本站補充了 SLOG 配置勘誤、分割區要點，以及各安裝步驟對應的官方中文手冊連結
- Live ISO 圖形安裝器支援 **ZFS 根檔案系統**：可把 ZFS 裝成根，勾選加密即 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引導（btrfs / ext4 / xfs / ZFS 均可在分割區頁選）。[下載頁](/download/#live-iso)與[使用說明](https://mirror.gentoozh.org/about.html)已補充說明
- 下載站上雲：Live ISO 下載遷到 **Cloudflare R2**（[r2.gentoozh.org](https://r2.gentoozh.org/)，零出口流量、全球邊緣），落地頁 [mirror.gentoozh.org](https://mirror.gentoozh.org/) 改成 **Cloudflare Worker**（邊緣即時讀 R2，列出最新鏡像 + 全部歷史版本）；測速改用 [Cloudflare 官方測速](https://speed.cloudflare.com/)；自建的美國下載 / 測速伺服器隨之下線
- 公共頁面新增英文（English）國際化：關於、下載、鏡像列表、貢獻指南等公共頁面可在簡體 / 正體 / 英文之間切換，方便用 gentoo-zh overlay 的海外使用者。技術文章不一定都有英文，目前只做了公共頁面；英文借翻譯軟體初譯、再經 AI 校對，難免有錯漏，歡迎到 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 指正

## 2026 年 5 月

- 專案結構調整：把表現層（主題）抽成獨立的 Hextra 修補包 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)，本倉庫只留內容與配置，更清爽、也便於跟隨上游 Hextra 更新
- 首頁改版：重新梳理視覺主次（大標題做錨點、主操作更突出），主色統一為 Gentoo 品牌紫，「最新文章」改為優先展示技術內容
- 貢獻指南重寫「為 gentoo-zh Overlay 貢獻」一節：依官方 Gentoo ebuild 倉庫規範梳理完整提交流程（EAPI、`metadata.xml`、thin Manifest、`~arch` 測試、`pkgdev`/`pkgcheck`、PR 與 CI），並補 nvchecker 版本跟進；區分 Overlay 貢獻（計入貢獻者牆）與網站貢獻，頁面排版改用原生 callout / 摺疊塊，頂欄新增「貢獻指南」入口
- 下載站接入 mirror.gentoozh.org，替代已下線的 iso.gig-os.org；下載 / 鏡像列表 / Overlay 三頁重寫，Live ISO 登入憑據支援點選複製
- 鏡像同步源說明：Gentoo 官方自 2025-10-30 起停止為第三方倉庫（含 gentoo-zh）提供快取鏡像，overlay 已改為直連 GitHub 上游同步；之前新增過的使用者需更新同步源，詳見[公告](/posts/2025-10-07-thirdparty-repo-mirror-removal/)
- **網站主題從 Blowfish 遷移到 Hextra**（v0.12.3，基於 Hugo 0.162.1）：重做首頁 bento 佈局、整理頂欄導覽、文章改用原生 `tags` 分類，新增首頁 RSS 訂閱按鈕與社交分享圖；詳見[遷移公告](/posts/2026-05-29-migrate-to-hextra/)
- 下載頁突出「中文社群客製 KDE 桌面 Live ISO」，方便新手快速上手
- 載入最佳化：貢獻者頭像按顯示尺寸自動縮放（首頁圖片體積大幅下降），動畫尊重「減少動態效果」偏好
- 貢獻者自動更新改為每月一次，並在更新時清理已下線貢獻者與舊頭像，控制倉庫體積
- 全站清理與貢獻者自動更新指令碼的穩定性強化

---

## 更新說明

- 本頁面記錄網站**內容**的主要更新，不包括純技術性修改
- 貢獻者資訊每月自動更新，不在此處記錄
- 如有問題或建議，請聯絡 [zakk@gentoozh.org](mailto:zakk@gentoozh.org) 或在 [Telegram 群組](https://t.me/gentoo_zh) 討論
