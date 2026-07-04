---
title: "网站主题从 Blowfish 迁移到 Hextra"
description: "本站主题从 Blowfish 换到 Hextra：更轻、更快，对文档和终端浏览器更友好。这篇说说为什么换、改了哪些地方。"
date: 2026-05-29
tags: ["website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

继上次将站点从 Jekyll 迁移到 Hugo 之后，本站再次更换主题：从 [Blowfish](https://blowfish.page/) 迁移到 [Hextra](https://imfing.github.io/hextra/)。

## 为什么换 Hextra

Blowfish 功能全面，但对一个以文档和教程为主的社区站来说偏重：首屏加载的脚本与样式较多，页面性能开销偏高；默认排版用于长文阅读时也不够清爽。

Hextra 基于 Tailwind CSS，为文档与博客而生：

- **更轻、更快**：零第三方请求（无外部字体 / CDN / 追踪），首屏文本资源约 50 KB（gzip）；贡献者头像按显示尺寸自动缩放，页面性能开销明显降低；
- **阅读更清晰**：规整的标题层级、行距与代码块排版，长文更好读；
- 自带**全文搜索**（FlexSearch）、暗色模式与响应式布局；
- 通过 Hugo Modules 引入，无需 Node 工具链。

## 主要变化

- 首页重做：hero + 快捷入口 + 最新文章 + 社区贡献者；
- 贡献者列表：自动抓取 [gentoo-zh Overlay](https://github.com/gentoo-zh/overlay) 中提交 5 次以上者，显示提交次数并按提交量排序，每月自动更新；
- 文章页署名显示作者头像；
- 文章改用 `tags` 分类，文章页与列表显示 `#标签`，可点进 `/tags/` 聚合页；
- 首页「最新文章」提供 RSS 订阅；分享到 Telegram / 社交平台时显示站点品牌预览卡片；
- 下载页突出「中文社区定制 KDE 桌面 Live ISO」，新手可开箱即用；
- 全站简繁双语（zh-CN / zh-TW）并存；
- 站内全文搜索、暗色模式。

## 对终端浏览器友好（TUI）

应 [@talk_something](https://t.me/talk_something) 群里 lzamora70（因为lzamora70菊苣过于抽象，多次销号，所以名字不一定更新的上）的提议，本站特意针对终端 / 文本浏览器做了一轮优化——毕竟是 Gentoo：

- 语义化的 HTML 结构与标题层级，在 [lynx](https://lynx.invisible-island.net/) / [w3m](https://w3m.sourceforge.net/) / links 等纯文本浏览器中排版清晰、链接可达；
- 每页顶部都有「跳到正文」链接，可一键跳过导航直接阅读；
- 图片均有恰当的替代文字（`alt`）；装饰性的重复图片（头像墙的循环副本、明暗两份 logo）使用空 `alt`，避免在文本浏览器与读屏软件中被重复朗读；
- 贡献者头像墙与文章作者署名在文本模式下每人只列一次；
- 配合 Hextra 的「以 Markdown 查看 / 复制为 Markdown」页面菜单，方便用脚本或 LLM 直接取用页面原文。

欢迎用 `lynx https://gentoozh.org/` 试试。

## 补充：公共页面加了英文

迁移之后，又给公共页面（关于、下载、镜像列表、贡献指南这些）补了英文国际化，方便用 gentoo-zh overlay 的海外用户——现在简 / 繁 / 英都能切。要说明的是：**技术文章不一定都有英文**，目前只做了公共页面；英文是借翻译软件协助生成、由至今能找到的最好最贵的模型 Claude Fable 5（ultracode）负责 review 和优化的，难免有错漏，欢迎在 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 指正。

## 反馈

- Telegram 频道：[@gentoocn](https://t.me/gentoocn) · 群组：[@gentoo_zh](https://t.me/gentoo_zh)
- 提交 Issue / PR：[GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io)

感谢 Blowfish 与 Hextra 主题的开发者。
