---
title: "更新记录"
date: 2026-05-31
description: "Gentoo 中文社区网站更新记录"
slug: "changelog"
---

本页面记录网站内容的主要更新，便于读者追踪变更。

---

## 2026 年 10 月

- 换用 gentoo-zh 新标志：导航栏、favicon、分享图与 404 页一并更换，深色主题用白字版本；新增[标志页](/logo/)，提供横版、竖版、图标与文字标各配色的下载，并说明许可与字形出处
- 新增[致谢页](/thanks/)，列出 OSUOSL、各镜像站与 1Password；首页“社区贡献者”下方加了致谢一栏
- [下载页](/download/)撤下 Gig-OS 桌面镜像：构建机器资源不足，暂停维护；现在只提供 CJK 最小安装镜像
- [基础设施开销页](/costs/)：已停用项目单列一表；OSUOSL 赞助的构建、美国镜像、论坛 SMTP 与 ARM 测试机分列；补记论坛预留 IP 与 Purelymail 邮箱；页首加累计支出与当前月费
- 顶栏菜单按用途分为使用、文章、社区、关于四组，站外链接名字后加 ↗，并补上论坛入口
- 顶栏“服务状态”改指 [Grafana 公开仪表盘](https://grafana.gentoozh.org/public-dashboards/d5754b79824d4d8dbd8c70e13e54c11e)

## 2026 年 9 月

- 新增公告 **[gentoo-zh 下载站重做](/posts/2026-09-30-distfiles-site-redo/)**：overlay、distfiles、binhost 与 Live ISO 集中到 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/)，binhost 迁到 OSUOSL，现有配置不用改
- [Overlay 页](/overlay/)改为跳转到下载站，[下载页](/download/)与顶栏基础设施菜单直接链接下载站对应页面；旧的 iso.gentoozh.org 停用
- [基础设施开销页](/costs/)：自有构建机 2026-09-29 停用，binhost 构建改由 OSUOSL 赞助；Vultr 高可用节点 2026-09-30 停用；期数改按日历月计算

## 2026 年 8 月

- 新增文章 **[成果总结和最近状况的更新和一些待办](/posts/2026-08-26-community-update-and-todo/)**：最近几个月网站、交流平台、overlay 与文档的进展，以及贡献流程上还缺的指引
- 全站审查：修正死链、失效锚点、非法 HTML 与繁体用词漂移
- 主题升到 v0.3.23：调整配色，统一首页徽章与入口按钮的样式，改进文章排版，卡片图标改用强调色
- [常见问题](/faq/)的镜像清单改准，文案去口语化
- 贡献者头像全部重新下载，透明底统一合成到白底
- [镜像列表页](/mirrorlist/)：Gentoo 官方仓库的 Git 同步源补上 CERNET
- [基础设施开销页](/costs/)补记[梁永祥](/contributors/liangyongxiang/)此前提供的构建机

- [镜像列表页](/mirrorlist/)重写：overlay 的 git 同步源、distfiles、二进制包，以及 Gentoo 官方的 rsync、distfiles 与 binhost，各自给出可直接复制的配置块；块内可切换镜像与源站，选中的地址会同时写进命令，另补上 Prefix 用户的配置
- [Overlay 页](/overlay/)的二进制包一节可在 stable 与 unstable 两个频道之间切换：两者的 `binrepos.conf` 与接受关键字写法分开列出，配置块同样支持换源，以及手动编辑配置文件与一条命令快速配置两种方式
- [下载页](/download/)改成两个镜像的卡片入口：Gig-OS 桌面镜像与 CJK 最小安装镜像，配置细节、校验和与各镜像目录都引到 iso.gentoozh.org
- 新增[基础设施开销页](/costs/)：列出各台服务器与服务的配置、单价、起算日与至今累计，币种不同的统一折成美元合计。社区没有商业赞助，费用目前由成员个人承担，也不接受捐款
- 站内文案按中文写作规范审校一轮：收紧口语表达，统一中英文之间的间距与标点全角

## 2026 年 7 月

- 新增公告 **[gentoo-zh 二进制包服务上线](/posts/2026-07-29-binhost-launch/)**：overlay 的 194 个包有了预编译的二进制包，每晚构建、签名后由 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 与南京大学镜像分发；文中给出三步配置、验签为什么要先执行 `getuto`，以及哪些包不收录
- [Overlay 页](/overlay/)新增**二进制包（binhost）**一节：说明目前只有 x86-64、并非每个包都有，配置的三步与可复制的命令、地址、签名公钥和实时的包数量统一引到 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/)；distfiles 一节的 `GENTOO_MIRRORS` 改成同时列出镜像与源站，并修正 git 换源示例里残留的旧镜像地址
- 新增公告 **[Overlay 软件包清理、改名与批量更新](/posts/2026-07-29-overlay-package-cleanup/)**：过去一个月升级 162 个包、新增 60 个、移除 38 个、改名或换分类 5 个，overlay 从 468 个包变成 490 个；文中列出改名清单、移除清单与各自的处理办法
- **Live ISO 下载站改用 iso.gentoozh.org**：站点服务的是 Live ISO 下载，不是 Gentoo 的 portage / distfiles 镜像（那些在[镜像列表](/mirrorlist/)页），原来的 mirror 名字容易误解；旧地址 mirror.gentoozh.org 继续可用，书签和已有链接不失效
- **社区 Pastebin [paste.gentoozh.org](https://paste.gentoozh.org) 上线**（基于 [wastebin](https://github.com/matze/wastebin)）：贴代码 / 日志用，支持网页、命令行（curl）与 raw 链接；顶栏的基础设施菜单和 [Pastebin 使用说明](/paste/) 已加入口
- [关于页](/about/)补上社区在 **Gentoo Wiki** 的页面链接（[Gentoo-zh](https://wiki.gentoo.org/wiki/Gentoo-zh/zh-cn)），并加入结构化数据 `sameAs`
- 站点维护与 CI：加固 CI、升级依赖，GitHub Actions 升到最新大版本（checkout v7、setup-node/go/python v6，仍按 SHA 钉版），并做了一轮站点核对清理
- **社区主域名迁往 [gentoozh.org](https://gentoozh.org/)**：旧域名（gentoo.org.cn、gentoocn.org）全部 301 永久跳转，书签与已有链接不失效，建议尽快更新；详见[迁移公告](/posts/2026-07-01-domain-migration/)
- **gentoo-zh overlay 仓库迁到组织仓库 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)**：旧的 `microcai/gentoo-zh` 会 301 到新仓库，已添加的用户请把同步源更新到新 URL，详见[仓库迁移公告与执行记录](/posts/2026-07-02-gentoo-zh-repo-migration/)
- **社区论坛 [forum.gentoozh.org](https://forum.gentoozh.org/) 上线**（Discourse，简繁双语）：适合发帖、提问和长期讨论；首页的加入社区一节与[关于页](/about/)已加入口
- **官网托管迁到 Cloudflare Workers**：从 GitHub Pages 迁到 Workers 静态资源托管（免费不限量、全球边缘节点），见[迁移文的补充说明](/posts/2026-07-01-domain-migration/)
- [下载页](/download/#live-iso)与 [Overlay 页](/overlay/)文案更新：下载页整理登录凭据、虚拟机 AVX2 提示与镜像站清单；Overlay 页重排软件包分类、把两种添加方式收进折叠块、补上国内 git / distfiles 换源地址
- 英文界面站名统一为 **Gentoo-zh Community**
- 三篇 2013 至 2014 年的老公告正文改回[清风](/contributors/microcai/)当年的原文，此前的改写已撤回，只在文末加编者注说明失效的链接与后续变化
- [Overlay 页](/overlay/)的配置改用可复制的配置块：可在 GitHub 上游与各高校镜像之间换源，也可在手动编辑配置文件与一条命令快速配置之间切换
- [下载页](/download/#live-iso)的 ISO 问题反馈入口改指 Gig-OS，因为 Live ISO 的构建仓库在那边

## 2026 年 6 月

- 新增文章 **[如何参与 Gentoo Wiki 的翻译工作](/posts/2026-06-30-gentoo-wiki-translation/)**：面向中文译者的翻译入门，涵盖账号与权限申请、翻译界面用法、翻译规范与中英文排版约定，以及 Gentoo 理事会 AI 政策对翻译的具体影响（作者 YangMame）
- 新增公告 **[中文社区近期更新：Live ISO、官网、下载站与测速](/posts/2026-06-09-live-iso-improvements/)**：定制 KDE Live ISO、Calamares 安装器、自动构建流水线、官网 Hextra 迁移与英文国际化、下载站与测速站的整体进展
- 新增公告 **[Python 3.14 成为默认版本](/posts/2026-06-01-python-314-default/)**（2026-06-01）：Gentoo 系统默认 Python 从 3.13 换成 3.14，手动控制升级节奏或遇到 USE / 依赖报错的用法说明
- 新增转载文章 **[Gentoo Linux with ZFS](/posts/2026-06-18-gentoo-linux-with-zfs/)**（原作者 [Locez](https://github.com/locez)，经授权按 CC BY-NC-SA 4.0 转载）：在双 NVMe 镜像上安装 ZFS 根 + ZFS 原生加密的实录；本站补充了 SLOG 配置勘误、分区要点，以及各安装步骤对应的官方中文手册链接
- Live ISO 图形安装器支持 **ZFS 根文件系统**：可把 ZFS 装成根，勾选加密即 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引导（btrfs / ext4 / xfs / ZFS 均可在分区页选）。[下载页](/download/#live-iso)与使用说明已补充说明
- 下载站上云：Live ISO 下载迁到 **Cloudflare R2**（r2.gentoozh.org，零出口流量、全球边缘），落地页 mirror.gentoozh.org 改成 **Cloudflare Worker**（边缘即时读 R2，列出最新镜像 + 全部历史版本）；测速改用 [Cloudflare 官方测速](https://speed.cloudflare.com/)；自建的美国下载 / 测速服务器随之下线
- 公共页面新增英文（English）国际化：关于、下载、镜像列表、贡献指南等公共页面可在简体 / 正体 / 英文之间切换，方便用 gentoo-zh overlay 的海外用户。技术文章不一定都有英文，目前只做了公共页面；英文借翻译软件初译、再经 AI 校对，难免有错漏，欢迎到 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 指正

## 2026 年 5 月

- 项目结构调整：把表现层（主题）抽成独立的 Hextra 补丁包 [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme)，本仓库只留内容与配置，便于跟随上游 Hextra 更新
- 首页改版：重新梳理视觉主次（大标题做锚点、主操作更突出），主色统一为 Gentoo 品牌紫，最新文章一栏改为优先展示技术内容
- 贡献指南重写 gentoo-zh Overlay 贡献一节：依官方 Gentoo ebuild 仓库规范梳理完整提交流程（EAPI、`metadata.xml`、thin Manifest、`~arch` 测试、`pkgdev`/`pkgcheck`、PR 与 CI），并补 nvchecker 版本跟进；区分 Overlay 贡献（计入贡献者墙）与网站贡献，页面排版改用原生 callout / 折叠块，顶栏新增贡献指南入口
- 下载站接入 mirror.gentoozh.org，替代已下线的 iso.gig-os.org；下载 / 镜像列表 / Overlay 三页重写，Live ISO 登录凭据支持点击复制
- 镜像同步源说明：Gentoo 官方自 2025-10-30 起停止为第三方仓库（含 gentoo-zh）提供缓存镜像，overlay 已改为直连 GitHub 上游同步；之前添加过的用户需更新同步源，详见[公告](/posts/2025-10-07-thirdparty-repo-mirror-removal/)
- **网站主题从 Blowfish 迁移到 Hextra**（v0.12.3，基于 Hugo 0.162.1）：重做首页 bento 布局、整理顶栏导航、文章改用原生 `tags` 分类，新增首页 RSS 订阅按钮与社交分享图；详见[迁移公告](/posts/2026-05-29-migrate-to-hextra/)
- 下载页突出中文社区定制的 KDE 桌面 Live ISO，方便新手快速上手
- 加载优化：贡献者头像按显示尺寸自动缩放（首页图片体积大幅下降），动画尊重减少动态效果的偏好设置
- 贡献者自动更新改为每月一次，并在更新时清理已下线贡献者与旧头像，控制仓库体积
- 全站清理与贡献者自动更新脚本的稳定性强化

---

## 更新说明

- 本页面记录网站**内容**的主要更新，不包括纯技术性修改
- 贡献者信息每月自动更新，不在此处记录
- 如有问题或建议，请联系 [zakk@gentoozh.org](mailto:zakk@gentoozh.org) 或在 [Telegram 群组](https://t.me/gentoo_zh) 讨论
