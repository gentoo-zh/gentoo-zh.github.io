---
title: "更新記錄"
date: 2026-05-31
description: "Gentoo 中文社群網站更新記錄"
slug: "changelog"
---

本頁面記錄網站內容的主要更新，便於讀者追蹤變更。

---

## 2026 年 10 月

- 換用 gentoo-zh 新標誌：導覽列、favicon、分享圖與 404 頁一併更換，深色主題用白字版本；新增[標誌頁](/logo/)，提供橫版、直版、圖示與文字標各配色的下載，並說明授權與字形出處
- 新增[致謝頁](/thanks/)，列出 OSUOSL、各鏡像站與 1Password；首頁「社群貢獻者」下方加了致謝一欄
- [下載頁](/download/)撤下 Gig-OS 桌面鏡像：建置機器資源不足，暫停維護；現在只提供 CJK 最小安裝鏡像
- [基礎設施開銷頁](/costs/)：已停用項目單列一表；OSUOSL 贊助的建置、美國鏡像、論壇 SMTP 與 ARM 測試機分列；補記論壇預留 IP 與 Purelymail 信箱；頁首加累計支出與目前月費
- 頂欄選單按用途分為使用、文章、社群、關於四組，站外連結名字後加 ↗，並補上論壇入口
- 頂欄「服務狀態」改指 [Grafana 公開儀表板](https://grafana.gentoozh.org/public-dashboards/d5754b79824d4d8dbd8c70e13e54c11e)

## 2026 年 9 月

- 新增公告 **[gentoo-zh 下載站重做](/posts/2026-09-30-distfiles-site-redo/)**：overlay、distfiles、binhost 與 Live ISO 集中到 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/)，binhost 遷到 OSUOSL，現有配置不用改
- [Overlay 頁](/overlay/)改為跳轉到下載站，[下載頁](/download/)與頂欄基礎設施選單直接連結下載站對應頁面；舊的 iso.gentoozh.org 停用
- [基礎設施開銷頁](/costs/)：自有建置機 2026-09-29 停用，binhost 建置改由 OSUOSL 贊助；Vultr 高可用節點 2026-09-30 停用；期數改按日曆月計算

## 2026 年 8 月

- 新增文章 **[成果總結和最近狀況的更新和一些待辦](/posts/2026-08-26-community-update-and-todo/)**：最近幾個月網站、交流平台、overlay 與文件的進展，以及貢獻流程上還缺的指引
- 全站審查：修正死鏈、失效錨點、不合法的 HTML 與繁體用詞漂移
- 主題升到 v0.3.23：調整配色，統一首頁徽章與入口按鈕的樣式，改進文章排版，卡片圖示改用強調色
- [常見問題](/faq/)的鏡像清單改準，文案去口語化
- 貢獻者頭像全部重新下載，透明底統一合成到白底
- [鏡像列表頁](/mirrorlist/)：Gentoo 官方倉庫的 Git 同步源補上 CERNET
- [基礎設施開銷頁](/costs/)補記[梁永祥](/contributors/liangyongxiang/)此前提供的建置機

- [鏡像列表頁](/mirrorlist/)重寫：overlay 的 git 同步源、distfiles、二進位包，以及 Gentoo 官方的 rsync、distfiles 與 binhost，各自給出可直接複製的配置塊；塊內可切換鏡像與源站，選中的地址會同時寫進指令，另補上 Prefix 使用者的配置
- [Overlay 頁](/overlay/)的二進位包一節可在 stable 與 unstable 兩個頻道之間切換：兩者的 `binrepos.conf` 與接受關鍵字寫法分開列出，配置塊同樣支援換源，以及手動編輯配置檔案與一條指令快速配置兩種方式
- [下載頁](/download/)改成兩個鏡像的卡片入口：Gig-OS 桌面鏡像與 CJK 最小安裝鏡像，配置細節、校驗和與各鏡像目錄都引到 iso.gentoozh.org
- 新增[基礎設施開銷頁](/costs/)：列出各臺伺服器與服務的配置、單價、起算日與至今累計，幣種不同的統一折成美元合計。社群沒有商業贊助，費用目前由成員個人承擔，也不接受捐款
- 站內文案按中文寫作規範審校一輪：收緊口語表達，統一中英文之間的間距與標點全形

## 2026 年 7 月

- 新增公告 **[gentoo-zh 二進位包服務上線](/posts/2026-07-29-binhost-launch/)**：overlay 的 194 個包有了預編譯的二進位包，每晚建置、簽名後由 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 與南京大學鏡像分發；文中給出三步配置、驗簽為什麼要先執行 `getuto`，以及哪些包不收錄
- [Overlay 頁](/overlay/)新增**二進位包（binhost）**一節：說明目前只有 x86-64、並非每個包都有，配置的三步與可複製的指令、地址、簽名公鑰和即時的包數量統一引到 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/)；distfiles 一節的 `GENTOO_MIRRORS` 改成同時列出鏡像與源站，並修正 git 換源範例裡殘留的舊鏡像地址
- 新增公告 **[Overlay 軟體套件清理、改名與批次更新](/posts/2026-07-29-overlay-package-cleanup/)**：過去一個月升級 162 個包、新增 60 個、移除 38 個、改名或換分類 5 個，overlay 從 468 個包變成 490 個；文中列出改名清單、移除清單與各自的處理辦法
- **Live ISO 下載站改用 iso.gentoozh.org**：網站服務的是 Live ISO 下載，不是 Gentoo 的 portage / distfiles 鏡像（那些在[鏡像列表](/mirrorlist/)頁），原來的 mirror 名字容易誤解；舊地址 mirror.gentoozh.org 繼續可用，書籤和已有連結不失效
- **社群 Pastebin [paste.gentoozh.org](https://paste.gentoozh.org) 上線**（基於 [wastebin](https://github.com/matze/wastebin)）：貼程式碼 / 日誌用，支援網頁、指令列（curl）與 raw 連結；頂欄的基礎設施選單和 [Pastebin 使用說明](/paste/) 已加入口
- [關於頁](/about/)補上社群在 **Gentoo Wiki** 的頁面連結（[Gentoo-zh](https://wiki.gentoo.org/wiki/Gentoo-zh/zh-cn)），並加入結構化資料 `sameAs`
- 網站維護與 CI：加固 CI、升級依賴，GitHub Actions 升到最新大版本（checkout v7、setup-node/go/python v6，仍按 SHA 釘版），並做了一輪網站核對清理
- **社群主域名遷往 [gentoozh.org](https://gentoozh.org/)**：舊域名（gentoo.org.cn、gentoocn.org）全部 301 永久跳轉，書籤與已有連結不失效，建議儘快更新；詳見[遷移公告](/posts/2026-07-01-domain-migration/)
- **gentoo-zh overlay 倉庫遷到組織倉庫 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)**：舊的 `microcai/gentoo-zh` 會 301 到新倉庫，已新增的使用者請把同步源更新到新 URL，詳見[倉庫遷移公告與執行記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)
- **社群論壇 [forum.gentoozh.org](https://forum.gentoozh.org/) 上線**（Discourse，簡繁雙語）：適合發帖、提問和長期討論；首頁的加入社群一節與[關於頁](/about/)已加入口
- **官網託管遷到 Cloudflare Workers**：從 GitHub Pages 遷到 Workers 靜態資源託管（免費不限量、全球邊緣節點），見[遷移文的補充說明](/posts/2026-07-01-domain-migration/)
- [下載頁](/download/#live-iso)與 [Overlay 頁](/overlay/)文案更新：下載頁整理登入憑據、虛擬機器 AVX2 提示與鏡像站清單；Overlay 頁重排軟體套件分類、把兩種新增方式收進摺疊塊、補上中國內陸 git / distfiles 換源地址
- 英文介面站名統一為 **Gentoo-zh Community**
- 三篇 2013 至 2014 年的老公告正文改回[清風](/contributors/microcai/)當年的原文，此前的改寫已撤回，只在文末加編者注說明失效的連結與後續變化
- [Overlay 頁](/overlay/)的配置改用可複製的配置塊：可在 GitHub 上游與各高校鏡像之間換源，也可在手動編輯配置檔案與一條指令快速配置之間切換
- [下載頁](/download/#live-iso)的 ISO 問題反饋入口改指 Gig-OS，因為 Live ISO 的建置倉庫在那邊

## 2026 年 6 月

- 新增文章 **[如何參與 Gentoo Wiki 的翻譯工作](/posts/2026-06-30-gentoo-wiki-translation/)**：面向中文譯者的翻譯入門，涵蓋帳號與權限申請、翻譯介面用法、翻譯規範與中英文排版約定，以及 Gentoo 理事會 AI 政策對翻譯的具體影響（作者 YangMame）
- 新增公告 **[中文社群近期更新：Live ISO、官網、下載站與測速](/posts/2026-06-09-live-iso-improvements/)**：客製 KDE Live ISO、Calamares 安裝器、自動建置流水線、官網 Hextra 遷移與英文國際化、下載站與測速站的整體進展
- 新增公告 **[Python 3.14 成為預設版本](/posts/2026-06-01-python-314-default/)**（2026-06-01）：Gentoo 系統預設 Python 從 3.13 換成 3.14，手動控制升級節奏或遇到 USE / 依賴報錯的用法說明
- 新增轉載文章 **[Gentoo Linux with ZFS](/posts/2026-06-18-gentoo-linux-with-zfs/)**（原作者 [Locez](https://github.com/locez)，經授權按 CC BY-NC-SA 4.0 轉載）：在雙 NVMe 鏡像上安裝 ZFS 根 + ZFS 原生加密的實錄；本站補充了 SLOG 配置勘誤、分割區要點，以及各安裝步驟對應的官方中文手冊連結
- Live ISO 圖形安裝器支援 **ZFS 根檔案系統**：可把 ZFS 裝成根，勾選加密即 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引導（btrfs / ext4 / xfs / ZFS 均可在分割區頁選）。[下載頁](/download/#live-iso)與使用說明已補充說明
- 下載站上雲：Live ISO 下載遷到 **Cloudflare R2**（r2.gentoozh.org，零出口流量、全球邊緣），落地頁 mirror.gentoozh.org 改成 **Cloudflare Worker**（邊緣即時讀 R2，列出最新鏡像 + 全部歷史版本）；測速改用 [Cloudflare 官方測速](https://speed.cloudflare.com/)；自建的美國下載 / 測速伺服器隨之下線
- 公共頁面新增英文（English）國際化：關於、下載、鏡像列表、貢獻指南等公共頁面可在簡體 / 正體 / 英文之間切換，方便用 gentoo-zh overlay 的海外使用者。技術文章不一定都有英文，目前只做了公共頁面；英文借翻譯軟體初譯、再經 AI 校對，難免有錯漏，歡迎到 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 指正

## 2026 年 5 月

- 專案結構調整：把表現層（主題）抽成獨立的 Hextra 修補包 [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme)，本倉庫只留內容與配置，便於跟隨上游 Hextra 更新
- 首頁改版：重新梳理視覺主次（大標題做錨點、主操作更突出），主色統一為 Gentoo 品牌紫，最新文章一欄改為優先展示技術內容
- 貢獻指南重寫 gentoo-zh Overlay 貢獻一節：依官方 Gentoo ebuild 倉庫規範梳理完整提交流程（EAPI、`metadata.xml`、thin Manifest、`~arch` 測試、`pkgdev`/`pkgcheck`、PR 與 CI），並補 nvchecker 版本跟進；區分 Overlay 貢獻（計入貢獻者牆）與網站貢獻，頁面排版改用原生 callout / 摺疊塊，頂欄新增貢獻指南入口
- 下載站接入 mirror.gentoozh.org，替代已下線的 iso.gig-os.org；下載 / 鏡像列表 / Overlay 三頁重寫，Live ISO 登入憑據支援點選複製
- 鏡像同步源說明：Gentoo 官方自 2025-10-30 起停止為第三方倉庫（含 gentoo-zh）提供快取鏡像，overlay 已改為直連 GitHub 上游同步；之前新增過的使用者需更新同步源，詳見[公告](/posts/2025-10-07-thirdparty-repo-mirror-removal/)
- **網站主題從 Blowfish 遷移到 Hextra**（v0.12.3，基於 Hugo 0.162.1）：重做首頁 bento 佈局、整理頂欄導覽、文章改用原生 `tags` 分類，新增首頁 RSS 訂閱按鈕與社交分享圖；詳見[遷移公告](/posts/2026-05-29-migrate-to-hextra/)
- 下載頁突出中文社群客製的 KDE 桌面 Live ISO，方便新手快速上手
- 載入最佳化：貢獻者頭像按顯示尺寸自動縮放（首頁圖片體積大幅下降），動畫尊重減少動態效果的偏好設定
- 貢獻者自動更新改為每月一次，並在更新時清理已下線貢獻者與舊頭像，控制倉庫體積
- 全站清理與貢獻者自動更新指令碼的穩定性強化

---

## 更新說明

- 本頁面記錄網站**內容**的主要更新，不包括純技術性修改
- 貢獻者資訊每月自動更新，不在此處記錄
- 如有問題或建議，請聯絡 [zakk@gentoozh.org](mailto:zakk@gentoozh.org) 或在 [Telegram 群組](https://t.me/gentoo_zh) 討論
