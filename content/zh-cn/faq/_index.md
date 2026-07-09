---
title: "常见问题"
description: "Gentoo 中文社区新手常见问题：从哪开始、Overlay 与官方源的关系、镜像加速、去哪提问、如何贡献。"
---

新手最常问的几个问题

{{% details closed="true" title="我是新手，该从哪开始？用官方 Gentoo 还是社区 Live ISO？" %}}

- **想从零装一套、彻底搞懂**：跟着 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn) 走最稳。
- **想快速上手、图省事**：用社区定制的 [KDE 桌面 Live ISO](/download/#live-iso)，开箱即用、自带中文环境。
- 装好系统后再 [添加 gentoo-zh Overlay](/overlay/)，就能装到官方源里没有的中文 / CJK 等软件包。

{{% /details %}}

{{% details closed="true" title="gentoo-zh Overlay 和官方 Portage 源是什么关系？" %}}

Overlay 是叠加在官方 Portage 树之上的额外软件来源，官方源没有的包（中文输入法、字体、词库，以及跟进新版、打了补丁的包）都放在这里。注意 gentoo-zh 的包都是 `~arch`（测试）关键字、不收 stable，稳定系统上不能直接装，怎么接受测试关键字再安装见 [Overlay 页](/overlay/)。

{{% /details %}}

{{% details closed="true" title="下载或同步太慢怎么办？" %}}

直连 GitHub / 官方 distfiles 慢时，把 Overlay 同步源和 distfiles 换成国内镜像（重庆大学、南京大学等，均已实测可用）。具体地址见 [Overlay 页](/overlay/) 与 [镜像列表](/mirrorlist/)。

{{% /details %}}

{{% details closed="true" title="遇到问题去哪问？" %}}

我们提供多种交流渠道（Telegram、Matrix、IRC 等），都列在 [关于页面](/about/) 里，可以按自己的喜好选择。Overlay 的 Bug 直接到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues) 提 issue。

{{% /details %}}

{{% details closed="true" title="如何为社区贡献？" %}}

给 Overlay 提包 / 修 Bug、给网站写文章补翻译，请参考 [贡献指南](/contributing/) 。

{{% /details %}}
