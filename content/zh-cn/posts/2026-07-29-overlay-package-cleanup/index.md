---
title: "Overlay 软件包清理、改名与批量更新"
description: "过去一个月 gentoo-zh overlay 升级 162 个包、新增 60 个、移除 38 个、改名或换分类 5 个，包数从 468 变成 490。本文列出改名与移除清单，以及各自需要怎么处理。"
date: 2026-07-29
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

过去一个月：162 个包出了新版本，新增 60 个包，移除 38 个，5 个改名或换了分类。overlay 从 468 个包变成 490 个。

## 改名与换分类

下面五个包已改名或换分类。`emerge --sync` 之后 Portage 会自动迁移，无需手动处理：

| 原包名 | 现包名 |
| --- | --- |
| `app-i18n/fcitx5-vinput` | `app-i18n/fcitx-vinput` |
| `www-apps/cherry-studio-bin` | `app-misc/cherry-studio-bin` |
| `www-apps/dufs` | `www-servers/dufs` |
| `www-apps/follow-bin` | `www-apps/folo-bin` |
| `net-proxy/clash-verge-bin` | `net-proxy/clash-verge-rev-bin` |

## 改由 ::gentoo 提供

因为下面七个包 ::gentoo 已经有同版本或更新的一份，所以本 overlay 不再维护第二份。同步后改由 ::gentoo 提供，已安装的无需处理，后续升级来自 ::gentoo：

- `dev-libs/libdatrie`
- `dev-libs/libthai`
- `dev-libs/libratbag`
- `gui-libs/libdecor`
- `media-fonts/smiley-sans`
- `sys-fs/jmtpfs`
- `media-video/amdgpu-pro-amf`

## 移除：上游消失、封存或无人维护

因为上游消失、封存或无人维护，所以删除下面十个包：

- `app-containers/distrobox-boost`
- `dev-db/dbeaver-bin`
- `dev-python/pytube`
- `net-misc/bbdown-bin`
- `net-misc/biliup-rs`
- `net-print/kyodialog`
- `net-proxy/mihomo-party-bin`
- `net-proxy/tun2socks`
- `x11-misc/snapd-xdg-open`
- `x11-themes/fcitx-breeze`

## 移除：长期无人维护

因为下面二十一个包由同一位打包者加入后长期无人维护、也没有第二维护人，所以一并移除：

- `app-doc/reeknote`
- `app-editors/flowblade`
- `app-office/evernote-repack`
- `app-text/tre`
- `app-text/wik`
- `app-text/wiki2man_on_rust`
- `dev-python/exifread`
- `dev-python/iptcinfo3`
- `dev-python/mwparserfromhell`
- `dev-python/pywikibot`
- `dev-vcs/git-remote-mediawiki`
- `games-emulation/conty`
- `games-fps/openarena`
- `games-fps/openarena-bin`
- `games-roguelike/tsl`
- `games-strategy/zedonline-bin`
- `mate-base/caja-bin`
- `media-sound/rew`
- `media-sound/yamusic-tui-bin`
- `net-im/kotatogram-bin`
- `x11-themes/kvantum-black`

{{< callout type="warning" >}}
已安装的被删除包会成为孤儿包，可用 `emerge --unmerge` 移除。
{{< /callout >}}

## 替代包

因为上游把 `net-misc/biliup-rs` 的代码迁到 [biliup/biliup](https://github.com/biliup/biliup)，所以改用该仓库的预编译版本，包名为 `net-misc/biliup-bin`。

## 还有一批已 mask 待移除

另有一批包已经 mask 待移除，原因和移除日期写在 [`profiles/package.mask`](https://github.com/gentoo-zh/overlay/blob/master/profiles/package.mask) 里。如果仍在使用其中的包，请在移除日期之前告知。

## 反馈

更新后如果遇到构建失败或运行异常，请向我们反馈：

- [GitHub issues](https://github.com/gentoo-zh/overlay/issues)
- overlay@gentoozh.org
- [Telegram 群](https://t.me/gentoo_zh)
- [社区论坛](https://forum.gentoozh.org/)（新开的论坛）

若需附带较长的日志，请使用 [paste.gentoozh.org](https://paste.gentoozh.org/)。
