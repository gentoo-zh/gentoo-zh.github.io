---
title: "常見問題"
description: "社群入門與求助問題，以及設定、疑難排解和鏡像問題索引。"
anchors:
  "overlay": "/overlay-troubleshooting/#overlay"
  "overlay-vs-gentoo": "/overlay-troubleshooting/#overlay-vs-gentoo"
  "overlay-sync": "/overlay-troubleshooting/#overlay-sync"
  "distfiles": "/distfiles-troubleshooting/#distfiles"
  "distfiles-faq": "/distfiles-troubleshooting/#distfiles-faq"
  "q15": "/distfiles-troubleshooting/#q15"
  "q16": "/distfiles-troubleshooting/#q16"
  "q14": "/overlay-contributing/#restrict-mirror"
  "binpkg-channel": "/binpkg-setup/#channel"
  "q13": "/binpkg-setup/#channel"
  "q2": "/binpkg-setup/#setup"
  "q6": "/binpkg-setup/#setup"
  "binpkg": "/binpkg-troubleshooting/#binpkg"
  "usage": "/binpkg-troubleshooting/#usage"
  "q3": "/binpkg-troubleshooting/#q3"
  "q1": "/binpkg-troubleshooting/#q1"
  "q4": "/binpkg-troubleshooting/#q4"
  "binpkg-keyring": "/binpkg-troubleshooting/#binpkg-keyring"
  "troubleshooting": "/binpkg-troubleshooting/#troubleshooting"
  "q5": "/binpkg-signing/#verification"
  "signing": "/binpkg-signing/#verification"
  "key-download": "/binpkg-signing/#key-download"
  "q11": "/binpkg-signing/#key-download"
  "q7": "/packages/#scope"
  "q10": "/packages/#scope"
  "package-status": "/packages/#status-help"
  "q12": "/packages/#status-help"
  "mirrors": "/mirrorlist/#list"
  "q8": "/mirrorlist/#list"
  "cernet-redirect": "/mirrorlist/#cernet-redirect"
  "mirror-sync": "/mirrorlist/#mirror-sync"
  "q9": "/mirrorlist/#own"
questions:
  - title: "首次使用 Gentoo 應從何處開始？"
    href: "#where-to-start"
  - title: "如何尋求技術支援？"
    href: "#where-to-ask"
  - title: "如何為社群貢獻？"
    href: "#how-to-contribute"
  - title: "gentoo-zh overlay 和官方 Portage 樹是什麼關係？"
    href: "/overlay-troubleshooting/#overlay-vs-gentoo"
  - title: "舊的 overlay 同步位址還可用嗎？"
    href: "/overlay-troubleshooting/#overlay-sync"
  - title: "如何避免自動鏡像某個套件的 distfile？"
    href: "/overlay-contributing/#restrict-mirror"
  - title: "下載 distfile 時遇到 404，改用本站鏡像能解決嗎？"
    href: "/distfiles-troubleshooting/#q15"
  - title: "下載檔案的大小或總和檢查碼與 Manifest 不符，怎麼辦？"
    href: "/distfiles-troubleshooting/#q16"
  - title: "我該選 stable 還是 unstable？"
    href: "/binpkg-setup/#channel"
  - title: "二進位套件應該在哪裡設定？"
    href: "/binpkg-setup/#setup"
  - title: "OpenRC 和 systemd 都能使用嗎？"
    href: "/binpkg-troubleshooting/#q3"
  - title: "本站提供哪些二進位套件？"
    href: "/packages/#scope"
  - title: "套件列表中的狀態表示什麼？"
    href: "/packages/#status-help"
  - title: "如何驗證下載的二進位套件來自本站且內容未被修改？"
    href: "/binpkg-signing/#verification"
  - title: "不安裝 sec-keys 套件時，如何取得簽章公鑰？"
    href: "/binpkg-signing/#key-download"
  - title: "匯入公鑰時出現 no writable keyring found，怎麼辦？"
    href: "/binpkg-troubleshooting/#binpkg-keyring"
  - title: "設定後，emerge 為何仍然從原始碼編譯？"
    href: "/binpkg-troubleshooting/#q1"
  - title: "二進位套件是否可能無法在我的 CPU 上執行？"
    href: "/binpkg-troubleshooting/#q4"
  - title: "有哪些鏡像，分別怎麼設定？"
    href: "/mirrorlist/#list"
  - title: "使用教育網聯合鏡像站時，為什麼 Git 提示重新導向？"
    href: "/mirrorlist/#cernet-redirect"
  - title: "為什麼各鏡像的版本不一致？"
    href: "/mirrorlist/#mirror-sync"
  - title: "如何自行建立鏡像？"
    href: "/mirrorlist/#own"
---

<!-- slot:topics -->

## 社群 {#community}

### 首次使用 Gentoo 應從何處開始？ {#where-to-start}

- 想完整安裝一遍、理解每個步驟：照 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn) 逐步安裝。
- 想在安裝時讓主控台顯示中文：使用社群的 [CJK 最小安裝映像](/iso/)，其餘步驟與 Handbook 相同。
- 裝好系統後[加入 gentoo-zh overlay](/overlay/)，安裝官方來源沒有的中文與 CJK 套件。

### 如何尋求技術支援？ {#where-to-ask}

交流管道（Telegram、Matrix、IRC 等）見[交流管道](/channels/)，也可以在[論壇](https://forum.gentoozh.org/)發文。overlay 的缺陷請到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues) 提交 issue。

### 如何為社群貢獻？ {#how-to-contribute}

為 overlay 提交套件或修正缺陷、為網站撰寫文章或補充翻譯，流程見[貢獻指南](/contributing/)。

<!-- slot:legacy -->
