---
title: "社区论坛正式启用"
description: "Gentoo 中文社区论坛 forum.gentoozh.org 正式上线：版块划分、简繁自动切换、中文搜索与消息桥接，附服务器安全配置和版主招募。"
date: 2026-07-12
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

为了方便那些不愿使用社区即时交流方式，或者不想在群里刷屏、想把问题说清楚的人；也方便一些平时被各个平台隔开、凑不到一起的中文用户。


## 论坛有什么？

- 已按用途划分版块：新手入门、安装与配置、Portage 与软件包、内核与硬件、桌面与应用、网络相关、装机分享，游戏和闲聊
- 界面语言支持简体、正体，默认按浏览器语言自动匹配，可以手动切换；正体用户看简体帖子会自动使用 OpenCC 转成正体显示，读/写帖子不受影响
- 支持使用中文作为用户名，同时也支持中文全文搜索
- 资讯和 Bug 追踪两个版块自动收录 Gentoo 官方新闻、GLSA 安全通告、Planet 博客和 Bugzilla 新 bug，默认不进入最新列表，不会影响文章推送
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
├── 磁盘加密与自动解锁
│   ├── LUKS2 全盘加密（AES-256-XTS + Argon2id）
│   ├── 网络绑定自动解锁（Clevis + Tang · McCallum-Relyea 协议）
│   │   ├── 开机自动重建密钥解盘，密钥不落任何磁盘、不依赖 TPM
│   │   └── 多节点 Tang 互信冗余，任一对端在线即可自动解锁
│   └── dropbear-initramfs（SSH 远程手动解锁 · 兜底）
├── 高可用与自愈
│   ├── NVMe 块存储 · CEPH 三副本
│   ├── 机密计算 VM 不能热迁移，宿主维护会触发重启（曾因此手动解密卡过一次）
│   └── 自建自愈闭环：自动解锁 + 跨节点看门狗 → 数分钟内自动开机、自动解密、恢复，全程无人
├── 网络防护
│   ├── 80 / 443 仅放行 Cloudflare（防火墙白名单）
│   ├── Authenticated Origin Pulls（mTLS 回源鉴权，非 Cloudflare 直连拿不到内容）
│   ├── Cloudflare（CDN / WAF / L7 DDoS）
│   └── 机房 L4 DDoS 缓解（新加坡嘛尽力而为）
├── 接入与账户
│   ├── IPv4 / IPv6 双栈
│   ├── 静态保留 IP（Reserved IP）
│   └── 云控制台 2FA
├── 监控与自愈（双活异地）
│   ├── 两套 Prometheus / Grafana / Alertmanager 集群互监去重（跨故障域）
│   ├── 主机指标 + 网站可用性拨测 + SSL 证书到期监控
│   ├── Telegram 实时告警 · 公开状态页 status.gentoozh.org（简 / 繁 / 英）
│   └── 每周日凌晨自动升级 Discourse（约 3 分钟维护窗口）
└── 备份
    ├── 云平台自动备份 · VM 快照
    ├── Cloudflare R2 异地备份（周 / 月独立密钥加密 · IP 白名单）
    └── GFS 轮转（每日 7 / 每周 4 / 每月 3）
```
> ~~只要 CF 不会被黑我们应该是安全的~~

多说两句这次新加的自动解密和监控。全盘 LUKS 以前得有人手动 SSH 进去输密码解锁——机密计算的机器一旦被宿主维护重启，就只能干等着人来解密（我们确实为此卡过一次）。现在换成 **Clevis + Tang** 的网络绑定解锁：开机时从多台互信节点重新算出解密密钥（McCallum-Relyea 协议），密钥不落盘、也不塞进 TPM，任一节点在线就能自动开锁；配上跨节点看门狗，宿主维护重启后自动开机、自动解密、恢复服务，全程无人。dropbear 远程手动解锁仍保留作兜底。

监控也从单机拨测升级成**两套异地 Prometheus/Alertmanager 互相盯着、集群去重**——任一套（连同它所在的机房）挂了，另一套仍会发告警，不会出现监控和服务一起静默的情况。主机、四个站点的可用性、SSL 到期都在盯，告警实时进 Telegram，状态同步公开到 [status.gentoozh.org](https://status.gentoozh.org)。

顺便答一个肯定会被问的问题：Gentoo 社区的论坛，自己怎么不跑 Gentoo？——现在规模太小了，这台 VPS 配置也比较普通，为了方便，也为了先让论坛稳定跑起来，所以先用 Debian；这是取舍，如果以后规模可以加大，我们也想迁移过去。~~还有一个原因是我不喜欢用 binpkg。~~

版块和桥接后面还会接着调整，让论坛用起来更顺手；机器、高可用和备份这些，等人多了再慢慢补。

## 论坛有什么规则或限制？

- 使用本论坛时，请遵守社区域名注册商（Porkbun）与网站 CDN（Cloudflare）所在地（美国）、论坛服务器所在地（新加坡）、您所在地相关的法律法规。这是一个面向全球中文用户的社区，不特定服务于某个地区，这里说的当地法律，以您自己所在的地方为准
- 不允许发布色情内容
- 不允许发布任何涉及未成年人的不当内容，无论是文字、图片还是链接，一经发现将封禁账户
- 不允许发布违规内容，比如宣扬暴力、诈骗、贩卖违禁品这些
- 不允许人身攻击、骚扰或仇恨言论
- 不允许发广告、垃圾内容、商业推广
- 不允许冒充他人、盗用他人账号，或者用自动化程序爬取、攻击本论坛

完整版见论坛的[服务条款](https://forum.gentoozh.org/tos)和[隐私条款](https://forum.gentoozh.org/privacy)。


## 感谢

社区论坛初期的建设感谢[依云](https://github.com/lilydjwg)菊苣、蜗牛菊苣、[睦](https://github.com/locez)菊苣等菊苣的指点，以及 Clover 撰写的论坛规则。

## 版主招募

论坛版主招募中
（其中闲聊区、游戏区、综合区、硬件区不是 Gentoo Linux 用户也可以）

申请论坛版主的方式：
- 前往论坛 [站务版](https://forum.gentoozh.org/c/15) 发帖申请
- 使用即时聊天软件与我们联系（仅限 [IRC](https://web.libera.chat/#gentoo-zh)、[Telegram](https://t.me/gentoo_zh)、[Matrix](https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org) 主群/主频道）（详情请前往[关于页](/about)查看）
