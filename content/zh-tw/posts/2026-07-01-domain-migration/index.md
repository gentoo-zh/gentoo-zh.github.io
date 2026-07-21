---
title: "社群主域名遷往 gentoozh.org"
description: "社群主域名遷往 gentoozh.org"
date: 2026-07-01
featured: true
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover（審校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

Gentoo 中文社群官網今天正式遷往 **gentoozh.org**。論壇（forum.gentoozh.org）也已搭好，預計於 7 月 5 日前後上線。舊地址（gentoo.org.cn、gentoocn.org）全部 301 永久跳轉，書籤和已有連結不會失效，但建議儘快更新。

## 不僅僅換個域名

域名遷移是最近一系列整合的收尾。社群沉寂了十多年，積下來的東西不少：TG、QQ 群七八個、域名三四個、官網多年沒人動、gentoo-zh GitHub 組織的權限無法統一管理。群組分散導致社群割裂，交流變得十分困難。

最近把這些整理了一下：

- 官網重建
- gentoo-zh 組織擁有了權限
- IRC 和 Matrix 橋接好了
- 各個群統一了
- 域名的控制權集中了
- 組織 Gentoo Wiki 中文翻譯

其中域名是最重要的一塊。這兩週的推進速度較快，通知也多，還請大家見諒。

## 為什麼選擇 gentoozh.org

舊域名有合規方面的要求，架設論壇、Matrix、下載站這類服務需要走一套我們作為志願者專案難以完成的流程。gentoozh.org 是國際域名，沒有這層限制，一直在我們手裡。這次 [@zakkaus](https://github.com/zakkaus) 會把域名和相關服務的管理權限分配給對應的負責人，避免權限再次丟失。

域名裡的 zh 來自 ISO 639，是中文這門語言的代碼，認的是語言，而不是國家或某個特定地區。而 cn 是 ISO 3166 的國家代碼，範圍反而更窄。況且 gentoo-zh 就是當年的 gentoo-tw 和 gentoo-china [兩岸社群合併](https://code.google.com/archive/p/gentoo-taiwan/issues/2)來的。archlinuxcn 其實也自稱「Arch Linux 中文社群」，cn 只是歷史留下來的叫法，社群裡也有人提過換成 zh，只是體量太大改不動。我們沒有那樣的歷史包袱，既然要動就做到位。

## 官網託管遷到 Cloudflare

順帶一提，官網已從 GitHub Pages 遷到 Cloudflare Workers（靜態資源託管），用的是 Workers Paid 方案。

- Cloudflare 的靜態資源請求免費、不限量，對社群站來說省事。
- GitHub Pages 有一套[軟性限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)（倉庫和網站體積、每月頻寬、建置頻率等），網站再大一點就不太夠用了。
- 速度和 GitHub Pages 差不太多，但 Workers Paid 靈活性更高：自定義快取、響應頭都能自己控制，往後要接邊緣邏輯也方便，整體體驗更好，也更適合社群往後發展。

網站的維護、報錯相關事宜，可到 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 開 issue，或透過郵件聯絡 zakk@gentoozh.org。

## 感謝

gentoo.org.cn 由一位老師長期持有，在社群沉寂的這十多年裡一直續著。舊域名保留重新導向，不會斷鏈。

同時也感謝[清風老師](/contributors/zhcj/)和[藍老師](https://packages.gentoo.org/maintainer/dlan@gentoo.org)的指點。這次域名整合的決定很大程度上來自清風老師的建議，他在 2014 年[建立了這個社群](/posts/2014-08-24-gentoo-zh-community-under-construction/)，沒有他就沒有 gentoo-zh 的起點。

最後感謝 David K. Chau、[依雲](https://github.com/lilydjwg)、蝸牛、花火幾位菊苣對文章內容提出的意見，以及 Clover 的審校。

## 影響

幾乎沒有影響，舊地址將全部跳轉至新地址：

- `https://gentoo.org.cn` → `https://gentoozh.org`
- `https://www.gentoo.org.cn` → `https://gentoozh.org`
- `https://forum.gentoo.org.cn` → `https://forum.gentoozh.org`
- `https://distfiles.gentoocn.org` → `https://distfiles.gentoozh.org`
- `https://gentoocn.org` → `https://gentoozh.org`

如果發現哪裡還留著舊域名沒更新，歡迎到 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 開 issue 或直接 PR，也可以在 Telegram、Matrix 交流群中告訴我們。

---

## 希望從這裡開始，gentoo-zh 能放下歷史包袱重新出發，同時也希望大家一起努力

<small>01/07/2026</small>

## 擴展閱讀

- [社群域名與基礎設施討論](https://github.com/gentoo-zh/gentoo-zh.github.io/issues/9)
