---
title: "gentoo-zh 網站改版"
description: "主站從 Hugo 遷到 Astro 與 Astryx，下載站說明與服務狀態併入主站；GigOS 暫停提供；OSUOSL 提供 ARM 測試機。"
date: 2026-10-17
tags: ["announcement", "website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

gentoozh.org 原本以 Hugo 產生，現已改用 Astro 與 Astryx 重寫。原本在下載站（distfiles.gentoozh.org）的說明頁面，以及 status.gentoozh.org 的服務狀態，都併入了主站。

## 改版內容

- Overlay、二進位套件與 distfiles 的設定說明、鏡像列表、軟體套件清單和安裝映像下載，依文件、下載、社群、支援、關於五類整理。
- [服務狀態](/status/)取代 status.gentoozh.org，服務探測與歷史紀錄不變。
- 簡體中文、正體中文與英文三個版本分別撰寫。

網站架構見[更新記錄](/changelog/#redesign)。

## GigOS 暫停提供

因資源因素，GigOS（內建中文設定的 KDE Plasma 6 桌面 Live OS）映像暫時停止提供。[下載頁](/download/)繼續提供 CJK 最小安裝映像。

## OSUOSL 提供 ARM 測試機

[奧勒岡州立大學開放原始碼實驗室（OSUOSL）](https://osuosl.org/)為 gentoo-zh 提供了一台 ARM 測試機，目前先用於 overlay 套件的版本更新（bump）。紀錄見[開銷](/costs/)。

發現問題請在 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io/issues) 回報。
