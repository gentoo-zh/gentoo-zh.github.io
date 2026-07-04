---
title: "常見問題"
description: "Gentoo 中文社群新手常見問題：從哪開始、Overlay 與官方源的關係、鏡像加速、去哪提問、如何貢獻。"
---

新手最常問的幾個。更細的安裝步驟看 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn)。

{{% details title="我是新手，該從哪開始？用官方 Gentoo 還是社群 Live ISO？" %}}

- **想從零裝一套、徹底搞懂**：跟著 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn) 走最穩。
- **想快速上手、圖省事**：用社群客製的 [KDE 桌面 Live ISO](/download/#live-iso)，開箱即用、自帶中文環境。
- 裝好系統後再 [新增 gentoo-zh Overlay](/overlay/)，就能裝到官方源裡沒有的中文 / CJK 等軟體套件。

{{% /details %}}

{{% details title="gentoo-zh Overlay 和官方 Portage 源是什麼關係？" %}}

Overlay 是疊加在官方 Portage 樹之上的額外軟體來源——官方源沒有的包（中文輸入法、字型、詞庫，以及跟進新版、打了修補的包）都放在這裡。注意 gentoo-zh 的包都是 `~arch`（測試）關鍵字、不收 stable，所以穩定系統上不能直接裝——具體怎麼接受測試關鍵字再安裝，見 [Overlay 頁](/overlay/)。

{{% /details %}}

{{% details title="下載或同步太慢怎麼辦？" %}}

直連 GitHub / 官方 distfiles 慢時，把 Overlay 同步源和 distfiles 換成中國內陸鏡像（重慶大學、南京大學等，均已實測可用）。具體地址見 [Overlay 頁](/overlay/) 與 [鏡像列表](/mirrorlist/)。

{{% /details %}}

{{% details title="遇到問題去哪問？" %}}

- **Telegram 交流群** [@gentoo_zh](https://t.me/gentoo_zh)——日常求助
- **Telegram 頻道** [@gentoocn](https://t.me/gentoocn)——公告
- **Overlay 的 bug**：到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues) 提 issue
- 更多頻道（IRC / Matrix 等）見 [關於頁面](/about/)

{{% /details %}}

{{% details title="我想出力，怎麼開始？" %}}

兩條線：給 **Overlay** 提包 / 修 bug（這也是 [貢獻者牆](/contributors/) 的來源），或給**網站**寫文章 / 補翻譯。完整流程見 [貢獻指南](/contributing/)。

{{% /details %}}
