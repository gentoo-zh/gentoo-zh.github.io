---
title: "成果總結和最近狀況的更新和一些待辦"
description: "最近幾個月社群在網站、交流平臺、Overlay 與分發、文件與翻譯上做了哪些事，以及貢獻流程上仍然缺失的指引與下一步計劃。"
date: 2026-08-26
featured: true
tags: ["community", "overlay", "wiki"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

最近和清風老師、Clover 還有官方的開發者都聊了一下，大致主要問題是如何發現、解決問題的流程與交流上的困難。

畢竟不管是清風老師當年成立的 Gentoo-zh，還是 [Gentoo 臺灣站](https://paar.kh.edu.tw/gentoo/) 首頁的願景，都是做好社群並持續回饋眾人的成果給 Gentoo Linux 官方組織，但是兩個最終都沒堅持下來。

## 我們最近幾個月

### 網站與交流平臺

- 對十多年沒有更新的網站主題進行了調整和美化（[遷移公告](/posts/2026-05-29-migrate-to-hextra/)）
- 將 [gentoo.org.cn](https://gentoo.org.cn) 遷移到了 [gentoozh.org](https://gentoozh.org/)（[域名遷移公告](/posts/2026-07-01-domain-migration/)）
- 部署了 Matrix、IRC、Telegram 三個主要交流平臺互相通訊的 bridge（[交流平臺](/about/)）
- 重新部署了社群論壇（[論壇上線公告](/posts/2026-07-12-forum-launch/)）
- 部署了 Pastebin（線上的純文字儲存與分享），便於長文的糾錯和分享（[使用說明](/paste/)）

### Overlay 與分發

- 十多年沒有完成的：將 [gentoo-zh Overlay 倉庫](https://github.com/gentoo-zh/overlay)從個人遷移到了組織倉庫（[倉庫遷移公告](/posts/2026-07-02-gentoo-zh-repo-migration/)）
- 對 Overlay 的軟體套件進行了清理（[清理公告](/posts/2026-07-29-overlay-package-cleanup/)）
- 重新部署了 Distfiles 和新的 binhost 下載站 <https://distfiles.gentoozh.org/>（[上線公告](/posts/2026-07-29-binhost-launch/)）
- 重新部署了 Mame 開發的 GigOS（自帶中文配置和網路工具的 KDE Plasma 6 桌面 Live OS）桌面鏡像（[下載頁](/download/)）
- 跟隨官方的[最小安裝鏡像](/iso/#minimal)，核心換成帶 cjktty 修補的版本，因此控制台能顯示中日韓文字（[核心樹](https://github.com/gentoo-zh/linux-cjktty)）
- 重新維護了 6 年沒有更新的 [cjktty 修補](https://github.com/gentoo-zh/cjktty-patches)
- 新增了基於官方核心加 cjktty 修補的 `sys-kernel/gentoo-cjk-sources`、`gentoo-cjk-kernel` 與 `gentoo-cjk-kernel-bin` 三個包
- `-bin` 相關包由社群建置並分發（[distfiles.gentoozh.org](https://distfiles.gentoozh.org/)），同一臺機器也為 overlay 開發者提供個人的[公共檔案伺服器](https://distfiles.gentoozh.org/files/)
- 重新聯絡和修復了中國大陸高校鏡像站對 gentoo-zh overlay 的 git 和 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 下載站的 mirror。現在有[南京大學](https://mirror.nju.edu.cn/gentoo-zh)、[南陽理工學院](https://mirror.nyist.edu.cn/gentoo-zh)、[河南省教育科研網](https://mirrors.ha.edu.cn/gentoo-zh)三個鏡像，以及 [MirrorZ](https://mirrors.cernet.edu.cn/gentoo-zh) 的跳轉服務

### 文件與翻譯

- 組織社群使用者參與 [Gentoo 官方 Wiki](https://wiki.gentoo.org/) 的翻譯（[翻譯指南](/posts/2026-06-30-gentoo-wiki-translation/)）
- 完善了 [MirrorZ Help](https://help.mirrors.cernet.edu.cn/) 中 gentoo-zh 相關的教學：[gentoo-zh](https://help.mirrors.cernet.edu.cn/gentoo-zh/) 與 [gentoo-zh.git](https://help.mirrors.cernet.edu.cn/gentoo-zh.git)
- 更新重寫了 MirrorZ Help 中 gentoo 官方源相關的教學：[gentoo](https://help.mirrors.cernet.edu.cn/gentoo/) 和 [gentoo-portage.git](https://help.mirrors.cernet.edu.cn/gentoo-portage.git)，這可能會同步到如[清華大學](https://mirrors.tuna.tsinghua.edu.cn/help/gentoo/)、[南京大學](https://help.mirror.nju.edu.cn/gentoo/?mirror=NJU)在內的其他高校

現在幾乎是我們的基礎設施最完善的一次，當然在貢獻流程方面和貢獻的渠道還有很多阻礙。

因為這幾項推進得都比較快，後面我可能會稍微放緩速度，讓更多人可以參與進來；非必要也不會再開太多新服務。

例如十一年前關於中文本地化的[討論](https://wiki.gentoo.org/wiki/Help_talk:Translating#About_Chinese_Localization)，今天才得到[回覆和更新](https://wiki.gentoo.org/wiki/Help_talk:Translating#Chinese_Localization_Today)，並且伴隨不少小問題，之後我會補充到[翻譯指南](/posts/2026-06-30-gentoo-wiki-translation/)的文章裡。

## 流程的缺失

現在無論是語言交流上的、效率上的、工具使用的難度上的，還是流程的指引，都是很大的缺失。

例如：

**我發現 wiki 翻譯或者內容錯了**

中文討論 → 如果沒有權限就要找到對的人 → 對照英文 → 修改英文／翻譯

**我想翻譯**

閱讀翻譯流程 → 申請翻譯帳戶 → 討論翻譯內容 → 完成翻譯

**我想要做貢獻**

我有哪些地方可以貢獻 → 找到合適地方和人 → 審核和釋出

**我想貢獻包**

本地測試 → [overlay](https://github.com/gentoo-zh/overlay) 審核 → 釋出之後乾淨穩定 → 想要推到 main tree → 開 [Bugzilla](https://bugs.gentoo.org/) bug → [proxy-maint](https://wiki.gentoo.org/wiki/Project:Proxy_Maintainers)（交流上的困難，和是否能有人關注和討論）

補充：正在打算寫一個 overlay 的 [CONTRIBUTING.md](https://github.com/gentoo-zh/overlay/issues/12212)。

**我遇到問題**

去哪裡問 → 附上什麼資料 → 效率和流程是否易於使用

這些流程都沒有完善的指引。

## 下一步

1. 完善流程指引
2. 組織翻譯維護 wiki
3. 完善權限分配
4. 部署 gentoozh.org 的郵局（已完成，見[開發者信箱與論壇寄信服務](/posts/2026-10-17-gentoozh-mail/)）

## 最後

很高興看到現在的 [Telegram 群組](https://t.me/gentoo_zh)也真的好幾年沒達到的突破 900 人了。

能堅持下來，擁有新鮮血液，更多人參與進來，完善交流和減少交流的壁壘也同樣十分重要。也希望包括十年以來停滯不前的 [Gentoo Wiki](https://wiki.gentoo.org/)、[gentoozh.org](https://gentoozh.org/) 官網、和個人倉庫剛剛完成遷移的 [overlay](https://github.com/gentoo-zh/overlay)，都能重新啟動起來。

現在 [Gentoo Wiki](https://wiki.gentoo.org/) zh-cn 的內容也有很多需要大家更新和補充的，在 zh-tw 甚至幾乎為 0。

但是請不要直接使用 opencc 等工具進行轉換。所有在官方的貢獻請遵守相關政策。

## 反饋

錯誤與建議歡迎在交流平臺（Matrix / IRC / Telegram，見[關於頁](/about/)）或[論壇](https://forum.gentoozh.org/)提出，也可以發信到 <zakk@gentoozh.org>。
