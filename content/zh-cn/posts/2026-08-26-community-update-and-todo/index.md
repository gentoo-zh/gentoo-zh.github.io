---
title: "成果总结和最近状况的更新和一些待办"
description: "最近几个月社区在网站、交流平台、Overlay 与分发、文档与翻译上做了哪些事，以及贡献流程上仍然缺失的指引与下一步计划。"
date: 2026-08-26
featured: true
tags: ["community", "overlay", "wiki"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

最近和清风老师、Clover 还有官方的开发者都聊了一下，大致主要问题是如何发现、解决问题的流程与交流上的困难。

毕竟不管是清风老师当年成立的 Gentoo-zh，还是 [Gentoo 台湾站](https://paar.kh.edu.tw/gentoo/) 首页的愿景，都是做好社区并持续回馈众人的成果给 Gentoo Linux 官方组织，但是两个最终都没坚持下来。

## 我们最近几个月

### 网站与交流平台

- 对十多年没有更新的网站主题进行了调整和美化（[迁移公告](/posts/2026-05-29-migrate-to-hextra/)）
- 将 [gentoo.org.cn](https://gentoo.org.cn) 迁移到了 [gentoozh.org](https://gentoozh.org/)（[域名迁移公告](/posts/2026-07-01-domain-migration/)）
- 部署了 Matrix、IRC、Telegram 三个主要交流平台互相通信的 bridge（[交流平台](/about/)）
- 重新部署了社区论坛（[论坛上线公告](/posts/2026-07-12-forum-launch/)）
- 部署了 Pastebin（在线的纯文本保存与分享），便于长文的纠错和分享（[使用说明](/paste/)）

### Overlay 与分发

- 十多年没有完成的：将 [gentoo-zh Overlay 仓库](https://github.com/gentoo-zh/overlay)从个人迁移到了组织仓库（[仓库迁移公告](/posts/2026-07-02-gentoo-zh-repo-migration/)）
- 对 Overlay 的软件包进行了清理（[清理公告](/posts/2026-07-29-overlay-package-cleanup/)）
- 重新部署了 Distfiles 和新的 binhost 下载站 <https://distfiles.gentoozh.org/>（[上线公告](/posts/2026-07-29-binhost-launch/)）
- 重新部署了 Mame 开发的 GigOS（自带中文配置和网络工具的 KDE Plasma 6 桌面 Live OS）桌面镜像（[下载页](/download/)）
- 跟随官方的[最小安装镜像](/iso/#minimal)，内核换成带 cjktty 补丁的版本，因此控制台能显示中日韩文字（[内核树](https://github.com/gentoo-zh/linux-cjktty)）
- 重新维护了 6 年没有更新的 [cjktty 补丁](https://github.com/gentoo-zh/cjktty-patches)
- 新增了基于官方内核加 cjktty 补丁的 `sys-kernel/gentoo-cjk-sources`、`gentoo-cjk-kernel` 与 `gentoo-cjk-kernel-bin` 三个包
- `-bin` 相关包由社区构建并分发（[distfiles.gentoozh.org](https://distfiles.gentoozh.org/)），同一台机器也为 overlay 开发者提供个人的[公共文件服务器](https://distfiles.gentoozh.org/files/)
- 重新联系和修复了中国大陆高校镜像站对 gentoo-zh overlay 的 git 和 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 下载站的 mirror。现在有[南京大学](https://mirror.nju.edu.cn/gentoo-zh)、[南阳理工学院](https://mirror.nyist.edu.cn/gentoo-zh)、[河南省教育科研网](https://mirrors.ha.edu.cn/gentoo-zh)三个镜像，以及 [MirrorZ](https://mirrors.cernet.edu.cn/gentoo-zh) 的跳转服务

### 文档与翻译

- 组织社区用户参与 [Gentoo 官方 Wiki](https://wiki.gentoo.org/) 的翻译（[翻译指南](/posts/2026-06-30-gentoo-wiki-translation/)）
- 完善了 [MirrorZ Help](https://help.mirrors.cernet.edu.cn/) 中 gentoo-zh 相关的教学：[gentoo-zh](https://help.mirrors.cernet.edu.cn/gentoo-zh/) 与 [gentoo-zh.git](https://help.mirrors.cernet.edu.cn/gentoo-zh.git)
- 更新重写了 MirrorZ Help 中 gentoo 官方源相关的教学：[gentoo](https://help.mirrors.cernet.edu.cn/gentoo/) 和 [gentoo-portage.git](https://help.mirrors.cernet.edu.cn/gentoo-portage.git)，这可能会同步到如[清华大学](https://mirrors.tuna.tsinghua.edu.cn/help/gentoo/)、[南京大学](https://help.mirror.nju.edu.cn/gentoo/?mirror=NJU)在内的其他高校

现在几乎是我们的基础设施最完善的一次，当然在贡献流程方面和贡献的渠道还有很多阻碍。

因为这几项推进得都比较快，后面我可能会稍微放缓速度，让更多人可以参与进来；非必要也不会再开太多新服务。

例如十一年前关于中文本地化的[讨论](https://wiki.gentoo.org/wiki/Help_talk:Translating#About_Chinese_Localization)，今天才得到[回复和更新](https://wiki.gentoo.org/wiki/Help_talk:Translating#Chinese_Localization_Today)，并且伴随不少小问题，之后我会补充到[翻译指南](/posts/2026-06-30-gentoo-wiki-translation/)的文章里。

## 流程的缺失

现在无论是语言交流上的、效率上的、工具使用的难度上的，还是流程的指引，都是很大的缺失。

例如：

**我发现 wiki 翻译或者内容错了**

中文讨论 → 如果没有权限就要找到对的人 → 对照英文 → 修改英文／翻译

**我想翻译**

阅读翻译流程 → 申请翻译帐户 → 讨论翻译内容 → 完成翻译

**我想要做贡献**

我有哪些地方可以贡献 → 找到合适地方和人 → 审核和发布

**我想贡献包**

本地测试 → [overlay](https://github.com/gentoo-zh/overlay) 审核 → 发布之后干净稳定 → 想要推到 main tree → 开 [Bugzilla](https://bugs.gentoo.org/) bug → [proxy-maint](https://wiki.gentoo.org/wiki/Project:Proxy_Maintainers)（交流上的困难，和是否能有人关注和讨论）

补充：正在打算写一个 overlay 的 [CONTRIBUTING.md](https://github.com/gentoo-zh/overlay/issues/12212)。

**我遇到问题**

去哪里问 → 附上什么数据 → 效率和流程是否易于使用

这些流程都没有完善的指引。

## 下一步

1. 完善流程指引
2. 组织翻译维护 wiki
3. 完善权限分配
4. 部署 gentoozh.org 的邮局（已完成，见[开发者邮箱与论坛发信服务](/posts/2026-10-17-gentoozh-mail/)）

## 最后

很高兴看到现在的 [Telegram 群组](https://t.me/gentoo_zh)也真的好几年没达到的突破 900 人了。

能坚持下来，拥有新鲜血液，更多人参与进来，完善交流和减少交流的壁垒也同样十分重要。也希望包括十年以来停滞不前的 [Gentoo Wiki](https://wiki.gentoo.org/)、[gentoozh.org](https://gentoozh.org/) 官网、和个人仓库刚刚完成迁移的 [overlay](https://github.com/gentoo-zh/overlay)，都能重新启动起来。

现在 [Gentoo Wiki](https://wiki.gentoo.org/) zh-cn 的内容也有很多需要大家更新和补充的，在 zh-tw 甚至几乎为 0。

但是请不要直接使用 opencc 等工具进行转换。所有在官方的贡献请遵守相关政策。

## 反馈

错误与建议欢迎在交流平台（Matrix / IRC / Telegram，见[关于页](/about/)）或[论坛](https://forum.gentoozh.org/)提出，也可以发信到 <zakk@gentoozh.org>。
