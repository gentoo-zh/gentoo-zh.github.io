---
title: "常見問題"
description: "Gentoo 中文社群新手常見問題：從哪開始、Overlay 與官方源的關係、鏡像加速、去哪提問、如何貢獻。"
---

新手最常問的幾個問題

{{% details closed="true" title="我是新手，該從哪開始？用官方 Gentoo 還是社群 Live ISO？" %}}

- **想從零裝一套、徹底搞懂**：跟著 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn) 走最穩。
- **想快速上手、圖省事**：用社群客製的 [KDE 桌面 Live ISO](/download/#live-iso)，開箱即用、自帶中文環境。
- 裝好系統後再 [新增 gentoo-zh Overlay](/overlay/)，就能裝到官方源裡沒有的中文 / CJK 等軟體套件。

{{% /details %}}

{{% details closed="true" title="gentoo-zh Overlay 和官方 Portage 源是什麼關係？" %}}

Overlay 是疊加在官方 Portage 樹之上的額外軟體來源，官方源沒有的包（中文輸入法、字型、詞庫，以及跟進新版、打了修補的包）都放在這裡。注意 gentoo-zh 的包都是 `~arch`（測試）關鍵字、不收 stable，穩定系統上不能直接裝，怎麼接受測試關鍵字再安裝見 [Overlay 頁](/overlay/)。

{{% /details %}}

{{% details closed="true" title="下載或同步太慢怎麼辦？" %}}

直連 GitHub / 官方 distfiles 慢時，把 Overlay 同步源和 distfiles 換成中國內陸鏡像（重慶大學、南京大學等，均已實測可用）。具體地址見 [Overlay 頁](/overlay/) 與 [鏡像列表](/mirrorlist/)。

{{% /details %}}

{{% details closed="true" title="遇到問題去哪問？" %}}

我們提供多種交流渠道（Telegram、Matrix、IRC 等），都列在 [關於頁面](/about/) 裡，可以按自己的喜好選擇。Overlay 的 Bug 直接到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues) 提 issue。

{{% /details %}}

{{% details closed="true" title="如何為社群貢獻？" %}}

給 Overlay 提包 / 修 Bug、給網站寫文章補翻譯，請參考 [貢獻指南](/contributing/) 。

{{% /details %}}
