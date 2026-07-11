---
title: "社群論壇正式啟用"
description: "Gentoo 中文社群論壇 forum.gentoozh.org 正式上線：版塊劃分、簡繁自動切換、中文搜尋與訊息橋接，附伺服器安全配置和版主招募。"
date: 2026-07-12
featured: true
tags: ["announcement"]
authors:
  - name: Zakk（排版/上架/校驗/撰寫）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover（撰寫）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

Gentoo 中文社群論壇已正式啟用，地址：**[forum.gentoozh.org](https://forum.gentoozh.org)**
~~其實已經上線一週了，最近在出門，不過最近有動作也很多休閒一下好像也不錯？（~~

## 為何新設論壇？

為了方便那些不願使用社群即時交流方式，或者不想在群裡刷屏、想把問題說清楚的人；也方便一些因平臺之間無法互聯互通而難以一起交流的中文使用者。


## 論壇有什麼？

- 已按用途劃分版塊：新手入門、安裝與配置、Portage 與軟體套件、核心與硬體、桌面與應用、網路相關、裝機分享，遊戲和閒聊
- 介面語言支援簡體、正體，預設按瀏覽器語言自動匹配，可以手動切換；正體使用者看簡體帖子會自動使用 OpenCC 轉成正體顯示，讀/寫帖子不受影響
- 支援使用中文作為使用者名稱，同時也支援中文全文搜尋
- 「資訊」和「Bug 追蹤」兩個版塊自動收錄 Gentoo 官方新聞、GLSA 安全通告、Planet 部落格和 Bugzilla 新 bug，預設不進「最新」的列表，不會影響文章推送
- 無需註冊即可看帖、訂 RSS
- 新帖提醒推送：【Gentoo 技術交流】分割區將會推送到 [主群](https://t.me/gentoo_zh)，其他分割區會推送到[閒聊群](https://t.me/talk_something)，並且會同步橋接到 IRC 與 Matrix
> 如果還有其他想法或者有希望新增的分割區也可以 [告訴我們](#版主招募)。

## 伺服器安全

順帶曬一下論壇伺服器的配置：

```text
論壇伺服器 · AMD EPYC Milan · Debian 13 · 新加坡
├── 基本配置
│   ├── 4 vCPU（EPYC Milan）· 8 GiB 記憶體
│   ├── 40 GiB NVMe（XFS，日後再擴容）
│   └── Linux 6.12
├── 機密計算（AMD SEV）
│   ├── AMD SEV（記憶體加密）
│   ├── AMD SEV-ES（CPU 暫存器加密）
│   ├── AMD SEV-SNP（記憶體完整性保護）
│   └── SEV-SNP 遠端證明能力（可驗證運行於真實 AMD 硬體）
├── 磁碟加密
│   └── LUKS2（AES-256-XTS + Argon2id，SSH 遠端解密）
├── 高可用（雲平臺提供）
│   ├── 自愈故障轉移（宿主故障，自動在健康節點重啟，無需人工介入）
│   ├── NVMe 塊儲存 · CEPH 三副本
│   └── 單節點（規模小，未上對等伺服器，上規模再買！）
├── 網路防護
│   ├── 80 / 443 僅放行 Cloudflare（防火牆白名單）
│   ├── Authenticated Origin Pulls（mTLS 回源鑑權，非 Cloudflare 直連拿不到內容）
│   ├── Cloudflare（CDN / WAF / L7 DDoS）
│   └── 機房 L4 DDoS 緩解（新加坡嘛盡力而為）
├── 接入與帳戶
│   ├── IPv4 / IPv6 雙棧
│   ├── 靜態保留 IP（Reserved IP）
│   └── 雲控制檯 2FA
├── 監控與維護
│   ├── 資源告警（CPU / 磁碟 / 網路，5 分鐘粒度）
│   └── 每週日凌晨自動升級 Discourse（約 3 分鐘維護視窗）
└── 備份
    ├── 雲平臺自動備份 · VM 快照
    ├── Cloudflare R2 異地備份（周 / 月獨立金鑰加密 · IP 白名單）
    └── GFS 輪轉（每日 7 / 每週 4 / 每月 3）
```
> ~~只要 CF 不會被黑我們應該是安全的~~

順便答一個肯定會被問的問題：Gentoo 社群的論壇，自己怎麼不跑 Gentoo？——現在規模太小了，這臺 VPS 配置也比較普通，為了方便，我們先決定用 Debian，只能先取捨：先讓論壇穩穩跑起來，如果以後規模可以加大，我們也想遷移過去。~~還有一個原因是我不喜歡用 binpkg。~~

近期我們會繼續完善版塊劃分和訊息橋接，把使用體驗打磨順手；等規模上來，再逐步升級機器、加強高可用與備份。

## 論壇有什麼規則或限制？

- 使用本論壇時，請遵守社群域名註冊商（Porkbun）與網站 CDN（Cloudflare）所在地（美國）、論壇伺服器所在地（新加坡）、您所在地相關的法律法規。這是一個面向全球中文使用者的社群，不特定服務於某個地區，「當地法律」以您自己所在的地方為準
- 不允許釋出色情內容
- 不允許釋出任何涉及未成年人的不當內容，無論是文字、圖片還是連結，一經發現將封禁帳戶
- 不允許釋出違規內容，比如宣揚暴力、詐騙、販賣違禁品這些
- 不允許人身攻擊、騷擾或仇恨言論
- 不允許發廣告、垃圾內容、商業推廣
- 不允許冒充他人、盜用他人帳號，或者用自動化程式爬取、攻擊本論壇

完整版見論壇的[服務條款](https://forum.gentoozh.org/tos)和[隱私條款](https://forum.gentoozh.org/privacy)。


## 感謝

社群論壇初期的建設感謝依雲菊苣、蝸牛菊苣、睦菊苣等菊苣的指點，以及 Clover 撰寫的論壇規則。

## 版主招募

論壇版主招募中
（其中閒聊區、遊戲區、綜合區、硬體區不是 Gentoo Linux 使用者也可以）

申請論壇版主的方式：
- 前往論壇 [站務版](https://forum.gentoozh.org/c/15) 發帖申請
- 使用即時聊天軟體與我們聯絡（僅限 [IRC](ircs://irc.libera.chat:6697/#gentoo-zh)、[Telegram](https://t.me/gentoo_zh)、[Matrix](https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org) 主群/主頻道）（詳情請前往[關於頁](/about)檢視）
