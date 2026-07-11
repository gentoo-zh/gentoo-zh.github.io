---
title: "社区论坛正式启用"
description: "Gentoo 中文社区论坛 forum.gentoozh.org 正式上线：版块划分、简繁自动切换、中文搜索与消息桥接，附服务器安全配置和版主招募。"
date: 2026-07-12
featured: true
tags: ["announcement"]
authors:
  - name: Zakk（排版/上架/校验/撰写）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover（撰写）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

Gentoo 中文社区论坛已正式启用，地址：**[forum.gentoozh.org](https://forum.gentoozh.org)**
~~其实已经上线一周了，最近在出门，不过最近有动作也很多休闲一下好像也不错？（~~

## 为何新设论坛？

为了方便那些不愿使用社区即时交流方式，或者不想在群里刷屏、想把问题说清楚的人；也方便一些因平台之间无法互联互通而难以一起交流的中文用户。


## 论坛有什么？

- 已按用途划分版块：新手入门、安装与配置、Portage 与软件包、内核与硬件、桌面与应用、网络相关、装机分享，游戏和闲聊
- 界面语言支持简体、正体，默认按浏览器语言自动匹配，可以手动切换；正体用户看简体帖子会自动使用 OpenCC 转成正体显示，读/写帖子不受影响
- 支持使用中文作为用户名，同时也支持中文全文搜索
- 「资讯」和「Bug 追踪」两个版块自动收录 Gentoo 官方新闻、GLSA 安全通告、Planet 博客和 Bugzilla 新 bug，默认不进「最新」的列表，不会影响文章推送
- 无需注册即可看帖、订 RSS
- 新帖提醒推送：【Gentoo 技术交流】分区将会推送到 [主群](https://t.me/gentoo_zh)，其他分区会推送到[闲聊群](https://t.me/talk_something)，并且会同步桥接到 IRC 与 Matrix
> 如果还有其他想法或者有希望新增的分区也可以 [告诉我们](#版主招募)。

## 服务器安全

顺带晒一下论坛服务器的配置：

```text
论坛服务器 · AMD EPYC Milan · Debian 13 · 新加坡
├── 基本配置
│   ├── 4 vCPU（EPYC Milan）· 8 GiB 内存
│   ├── 40 GiB NVMe（XFS，日后再扩容）
│   └── Linux 6.12
├── 机密计算（AMD SEV）
│   ├── AMD SEV（内存加密）
│   ├── AMD SEV-ES（CPU 寄存器加密）
│   ├── AMD SEV-SNP（内存完整性保护）
│   └── SEV-SNP 远程证明能力（可验证运行于真实 AMD 硬件）
├── 磁盘加密
│   └── LUKS2（AES-256-XTS + Argon2id，SSH 远程解密）
├── 高可用（云平台提供）
│   ├── 自愈故障转移（宿主故障，自动在健康节点重启，无需人工介入）
│   ├── NVMe 块存储 · CEPH 三副本
│   └── 单节点（规模小，未上对等服务器，上规模再买！）
├── 网络防护
│   ├── 80 / 443 仅放行 Cloudflare（防火墙白名单）
│   ├── Authenticated Origin Pulls（mTLS 回源鉴权，非 Cloudflare 直连拿不到内容）
│   ├── Cloudflare（CDN / WAF / L7 DDoS）
│   └── 机房 L4 DDoS 缓解（新加坡嘛尽力而为）
├── 接入与账户
│   ├── IPv4 / IPv6 双栈
│   ├── 静态保留 IP（Reserved IP）
│   └── 云控制台 2FA
├── 监控与维护
│   ├── 资源告警（CPU / 磁盘 / 网络，5 分钟粒度）
│   └── 每周日凌晨自动升级 Discourse（约 3 分钟维护窗口）
└── 备份
    ├── 云平台自动备份 · VM 快照
    ├── Cloudflare R2 异地备份（周 / 月独立密钥加密 · IP 白名单）
    └── GFS 轮转（每日 7 / 每周 4 / 每月 3）
```
> ~~只要 CF 不会被黑我们应该是安全的~~

顺便答一个肯定会被问的问题：Gentoo 社区的论坛，自己怎么不跑 Gentoo？——现在规模太小了，这台 VPS 配置也比较普通，为了方便，我们先决定用 Debian，只能先取舍：先让论坛稳稳跑起来，如果以后规模可以加大，我们也想迁移过去。~~还有一个原因是我不喜欢用 binpkg。~~

近期我们会继续完善版块划分和消息桥接，把使用体验打磨顺手；等规模上来，再逐步升级机器、加强高可用与备份。

## 论坛有什么规则或限制？

- 使用本论坛时，请遵守社区域名注册商（Porkbun）与网站 CDN（Cloudflare）所在地（美国）、论坛服务器所在地（新加坡）、您所在地相关的法律法规。这是一个面向全球中文用户的社区，不特定服务于某个地区，「当地法律」以您自己所在的地方为准
- 不允许发布色情内容
- 不允许发布任何涉及未成年人的不当内容，无论是文字、图片还是链接，一经发现将封禁账户
- 不允许发布违规内容，比如宣扬暴力、诈骗、贩卖违禁品这些
- 不允许人身攻击、骚扰或仇恨言论
- 不允许发广告、垃圾内容、商业推广
- 不允许冒充他人、盗用他人账号，或者用自动化程序爬取、攻击本论坛

完整版见论坛的[服务条款](https://forum.gentoozh.org/tos)和[隐私条款](https://forum.gentoozh.org/privacy)。


## 感谢

社区论坛初期的建设感谢依云菊苣、蜗牛菊苣、睦菊苣等菊苣的指点，以及 Clover 撰写的论坛规则。

## 版主招募

论坛版主招募中
（其中闲聊区、游戏区、综合区、硬件区不是 Gentoo Linux 用户也可以）

申请论坛版主的方式：
- 前往论坛 [站务版](https://forum.gentoozh.org/c/15) 发帖申请
- 使用即时聊天软件与我们联系（仅限 [IRC](ircs://irc.libera.chat:6697/#gentoo-zh)、[Telegram](https://t.me/gentoo_zh)、[Matrix](https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org) 主群/主频道）（详情请前往[关于页](/about)查看）
