---
title: "中文社区近期更新：Live ISO、官网、下载站与测速"
description: "把社区最近这段时间的改动整理一下：定制的 KDE Live ISO、Calamares 安装器、gentoo-zh overlay、自动构建流水线、官网（迁移到 Hextra 并新增英文）、下载站与测速站。"
date: 2026-06-09
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

把社区最近这段时间的改动整理一下，分项目说。各项都附了仓库链接，想看完整改动可以翻提交记录。

## Live ISO

中文社区定制的 KDE Plasma 6 桌面 Live ISO（[Gentoo-zh/Live-ISO](https://github.com/gentoo-zh/Live-ISO)）：

- **三语言开箱即用**：引导菜单分简体 / 繁体 / 英文三档，整套 live 环境跟着所选语言走；装好的系统也沿用你在安装器里选的语言。
- **预置中文输入法**：fcitx5 + rime，开箱即可输入，内置朙月拼音、注音、五笔86、仓颉、粤拼。
- **闭源 NVIDIA 可选**：引导菜单选 NVIDIA 项会常规加载闭源驱动（需先关 Secure Boot）；不选则用开源 nouveau。
- **顺手的 live 桌面开关**：桌面放了几个仅 live 用的一键图标，需要时点一下即可——临时关闭自动休眠 / 锁屏（折腾或装机时不被打断）、开启免密 sudo、一键开启 SSH（方便远程装机或调试）。
- **装好的系统是干净的**：上面这些 live 便利（连同默认的 SDDM 免密自动登录）都只在 live 里，安装器装机时会复位 / 清掉，装好的系统回到 KDE 正常默认：登录要密码、sudo 要授权、休眠锁屏照常。
- **开箱即用的细节**：PipeWire 音频、网络开机自动连、MAKEOPTS 与 CPU 指令集按你的机器自适应。

装系统推荐照 [Gentoo 官方手册](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 一步步来更稳妥；live 里也带了图形安装器（Calamares），想快速装也可以用。

## 安装器（Calamares）

安装器配置 [Gentoo-zh/calamares-settings-gig](https://github.com/gentoo-zh/calamares-settings-gig)：装机后会清掉 live 专用的残留设置，并按你在 live 里选的显卡方案配置 NVIDIA。分区时根文件系统默认 btrfs，也可选 xfs / ext4 / ZFS——选 ZFS 并勾选加密就是 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引导（GRUB 读不了带原生加密的 ZFS 池，所以 ZFS 根改用 ZBM）。这套装机流程（含 ZFS 加密安装）在虚拟机上做过实机安装测试。

## Live ISO 用的 overlay

Live ISO 构建所需的包来自 [Gentoo-zh/gig](https://github.com/gentoo-zh/gig)——它是 Gig OS overlay 的 fork、专给 Live ISO 用，跟社区主 overlay [gentoo-zh](https://github.com/gentoo-zh/overlay) 不是一个。这次把其中的 Calamares 更新到支持 Python 3.14 的 3.3.14-r8，修复了 `emerge --sync` 的报错，并清理了一批冗余 / 失效的包。

## 自动构建与发布

构建流水线 [Zakkaus/gentoozh-liveiso-infra](https://github.com/Zakkaus/gentoozh-liveiso-infra)：Live ISO 每周一自动编译，编好后上传到 **Cloudflare R2**。流水线会逐字节核对「R2 上的 = 这次编出来的」、并确认下载页已反映新镜像，一致才算上线；也加了对滚动树过渡期 USE / 关键字变化的自适应处理（见 [Python 3.14 成为默认版本](/posts/2026-06-01-python-314-default/)）。

## 官网

官网 [gentoozh.org](https://gentoozh.org/)（源码 [gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io)）从 Blowfish 迁移到了 Hextra——更轻、更快、对文档和文本浏览器更友好（细节见[迁移那篇](/posts/2026-05-29-migrate-to-hextra/)）。表现层抽成了独立的 Hextra 补丁包 [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme)，补全了 SEO、页脚与无障碍。下载页也接入了下载站、补了 Live ISO 的功能说明和硬件要求，并新增了 FAQ 页。这次还给公共页面加了**英文国际化**，简 / 繁 / 英可切。

## 下载站

下载站 [mirror.gentoozh.org](https://mirror.gentoozh.org/)（源码 [Zakkaus/gentoozh-mirror](https://github.com/Zakkaus/gentoozh-mirror)）**迁到了 Cloudflare，不再用自建服务器**：ISO 存 **Cloudflare R2**（`r2.gentoozh.org`，零出口流量、全球边缘、可缓存），落地页改成 **Cloudflare Worker**——在边缘即时读 R2，列出最新镜像和**全部历史版本**，永远反映当前内容。页面保留简 / 繁 / 英三语与浅 / 深色。

## 测速站

测速改用 [Cloudflare 官方测速](https://speed.cloudflare.com/)——下载本来就走 Cloudflare 边缘，用它测更贴近实际下载速度；原先自建的 speed.gentoozh.org 随下载站上云一并下线。

---

想试 Live ISO 就到[下载页](/download/)。有问题欢迎到 [Telegram 群](https://t.me/gentoo_zh) 或各项目的 GitHub 反馈。
