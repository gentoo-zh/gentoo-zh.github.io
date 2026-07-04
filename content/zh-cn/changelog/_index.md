---
title: "更新记录"
date: 2026-05-31
description: "Gentoo 中文社区网站更新记录"
slug: "changelog"
---

本页面记录网站内容的主要更新，便于读者追踪变更。

---

## 2026 年 7 月

- **社区主域名迁往 [gentoozh.org](https://gentoozh.org/)**：旧域名（gentoo.org.cn、gentoocn.org）全部 301 永久跳转，书签与已有链接不失效，建议尽快更新；详见[迁移公告](/posts/2026-07-01-domain-migration/)
- **gentoo-zh overlay 仓库迁到组织仓库 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)**：旧的 `microcai/gentoo-zh` 会 301 到新仓库，已添加的用户请把同步源更新到新 URL，详见[仓库迁移公告与执行方案](/posts/2026-07-02-gentoo-zh-repo-migration/)
- **社区论坛 [forum.gentoozh.org](https://forum.gentoozh.org/) 上线**（Discourse，简繁双语）：适合发帖、提问和长期讨论；首页「加入社区」与[关于页](/about/)已加入口
- **官网托管迁到 Cloudflare Workers**：从 GitHub Pages 迁到 Workers 静态资源托管（免费不限量、全球边缘节点），见[迁移文的补充说明](/posts/2026-07-01-domain-migration/)
- [下载页](/download/#live-iso)与 [Overlay 页](/overlay/)文案更新：下载页整理登录凭据、虚拟机 AVX2 提示与镜像站清单；Overlay 页重排软件包分类、把两种添加方式收进折叠块、补上国内 git / distfiles 换源地址
- 英文界面站名统一为 **Gentoo-zh Community**

## 2026 年 6 月

- 新增文章 **[如何参与 Gentoo Wiki 的翻译工作](/posts/2026-06-30-gentoo-wiki-translation/)**：面向中文译者的翻译入门，涵盖账号与权限申请、翻译界面用法、翻译规范与中英文排版约定，以及 Gentoo 理事会 AI 政策对翻译的具体影响（作者 YangMame）
- 新增安全文章 **[Linux 页缓存写入型提权漏洞梳理](/posts/2026-06-27-linux-page-cache-lpe/)**：梳理 2026 年 Copy Fail、DirtyFrag、Fragnesia 与 DirtyClone 的共同利用模型、不同根因与修复关系
- 新增安全公告 **[Linux 内核 DirtyClone 本地提权漏洞：Gentoo 更新建议](/posts/2026-06-27-dirtyclone-kernel-lpe/)**（CVE-2026-43503，CVSS 8.8）：Gentoo 受支持内核已有修复，用户应更新并重启
- 新增公告 **[中文社区近期更新：Live ISO、官网、下载站与测速](/posts/2026-06-09-live-iso-improvements/)**：定制 KDE Live ISO、Calamares 安装器、自动构建流水线、官网 Hextra 迁移与英文国际化、下载站与测速站的整体进展
- 新增公告 **[Python 3.14 成为默认版本](/posts/2026-06-01-python-314-default/)**（2026-06-01）：Gentoo 系统默认 Python 从 3.13 换成 3.14，手动控制升级节奏或遇到 USE / 依赖报错的用法说明
- 新增转载文章 **[Gentoo Linux with ZFS](/posts/2026-06-18-gentoo-linux-with-zfs/)**（原作者 [Locez](https://github.com/locez)，经授权按 CC BY-NC-SA 4.0 转载）：在双 NVMe 镜像上安装 ZFS 根 + ZFS 原生加密的实录；本站补充了 SLOG 配置勘误、分区要点，以及各安装步骤对应的官方中文手册链接
- Live ISO 图形安装器支持 **ZFS 根文件系统**：可把 ZFS 装成根，勾选加密即 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引导（btrfs / ext4 / xfs / ZFS 均可在分区页选）。[下载页](/download/#live-iso)与[使用说明](https://mirror.gentoozh.org/about.html)已补充说明
- 下载站上云：Live ISO 下载迁到 **Cloudflare R2**（[r2.gentoozh.org](https://r2.gentoozh.org/)，零出口流量、全球边缘），落地页 [mirror.gentoozh.org](https://mirror.gentoozh.org/) 改成 **Cloudflare Worker**（边缘即时读 R2，列出最新镜像 + 全部历史版本）；测速改用 [Cloudflare 官方测速](https://speed.cloudflare.com/)；自建的美国下载 / 测速服务器随之下线
- 公共页面新增英文（English）国际化：关于、下载、镜像列表、贡献指南等公共页面可在简体 / 正體 / 英文之间切换，方便用 gentoo-zh overlay 的海外用户。技术文章不一定都有英文，目前只做了公共页面；英文借翻译软件初译、再经 AI 校对，难免有错漏，欢迎到 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 指正

## 2026 年 5 月

- 项目结构调整：把表现层（主题）抽成独立的 Hextra 补丁包 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)，本仓库只留内容与配置，更清爽、也便于跟随上游 Hextra 更新
- 首页改版：重新梳理视觉主次（大标题做锚点、主操作更突出），主色统一为 Gentoo 品牌紫，「最新文章」改为优先展示技术内容
- 贡献指南重写「为 gentoo-zh Overlay 贡献」一节：依官方 Gentoo ebuild 仓库规范梳理完整提交流程（EAPI、`metadata.xml`、thin Manifest、`~arch` 测试、`pkgdev`/`pkgcheck`、PR 与 CI），并补 nvchecker 版本跟进；区分 Overlay 贡献（计入贡献者墙）与网站贡献，页面排版改用原生 callout / 折叠块，顶栏新增「贡献指南」入口
- 下载站接入 mirror.gentoozh.org，替代已下线的 iso.gig-os.org；下载 / 镜像列表 / Overlay 三页重写，Live ISO 登录凭据支持点击复制
- 镜像同步源说明：Gentoo 官方自 2025-10-30 起停止为第三方仓库（含 gentoo-zh）提供缓存镜像，overlay 已改为直连 GitHub 上游同步；之前添加过的用户需更新同步源，详见[公告](/posts/2025-10-07-thirdparty-repo-mirror-removal/)
- **网站主题从 Blowfish 迁移到 Hextra**（v0.12.3，基于 Hugo 0.162.1）：重做首页 bento 布局、整理顶栏导航、文章改用原生 `tags` 分类，新增首页 RSS 订阅按钮与社交分享图；详见[迁移公告](/posts/2026-05-29-migrate-to-hextra/)
- 下载页突出「中文社区定制 KDE 桌面 Live ISO」，方便新手快速上手
- 加载优化：贡献者头像按显示尺寸自动缩放（首页图片体积大幅下降），动画尊重「减少动态效果」偏好
- 贡献者自动更新改为每月一次，并在更新时清理已下线贡献者与旧头像，控制仓库体积
- 全站清理与贡献者自动更新脚本的稳定性强化

---

## 更新说明

- 本页面记录网站**内容**的主要更新，不包括纯技术性修改
- 贡献者信息每月自动更新，不在此处记录
- 如有问题或建议，请联系 [zakk@gentoozh.org](mailto:zakk@gentoozh.org) 或在 [Telegram 群组](https://t.me/gentoo_zh) 讨论
