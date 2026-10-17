---
title: "Overlay 軟體套件清理、改名與批次更新"
description: "過去一個月 gentoo-zh overlay 升級 162 個包、新增 60 個、移除 38 個、改名或換分類 5 個，包數從 468 變成 490。本文列出改名與移除清單，以及各自需要怎麼處理。"
date: 2026-07-29
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

過去一個月：162 個包出了新版本，新增 60 個包，移除 38 個，5 個改名或換了分類。overlay 從 468 個包變成 490 個。

## 改名與換分類

下面五個包已改名或換分類。`emerge --sync` 之後 Portage 會自動遷移，無需手動處理：

| 原套件名 | 現套件名 |
| --- | --- |
| `app-i18n/fcitx5-vinput` | `app-i18n/fcitx-vinput` |
| `www-apps/cherry-studio-bin` | `app-misc/cherry-studio-bin` |
| `www-apps/dufs` | `www-servers/dufs` |
| `www-apps/follow-bin` | `www-apps/folo-bin` |
| `net-proxy/clash-verge-bin` | `net-proxy/clash-verge-rev-bin` |

## 改由 ::gentoo 提供

因為下面七個包 ::gentoo 已經有同版本或更新的一份，所以本 overlay 不再維護第二份。同步後改由 ::gentoo 提供，已安裝的無需處理，後續升級來自 ::gentoo：

- `dev-libs/libdatrie`
- `dev-libs/libthai`
- `dev-libs/libratbag`
- `gui-libs/libdecor`
- `media-fonts/smiley-sans`
- `sys-fs/jmtpfs`
- `media-video/amdgpu-pro-amf`

## 移除：上游消失、封存或無人維護

因為上游消失、封存或無人維護，所以刪除下面十個包：

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

## 移除：長期無人維護

因為下面二十一個包由同一位打包者加入後長期無人維護、也沒有第二維護人，所以一併移除：

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
已安裝的被刪除包會成為孤兒包，可用 `emerge --unmerge` 移除。
{{< /callout >}}

## 替代包

因為上游把 `net-misc/biliup-rs` 的程式碼遷到 [biliup/biliup](https://github.com/biliup/biliup)，所以改用該倉庫的預編譯版本，套件名為 `net-misc/biliup-bin`。

## 還有一批已 mask 待移除

另有一批包已經 mask 待移除，原因和移除日期寫在 [`profiles/package.mask`](https://github.com/gentoo-zh/overlay/blob/master/profiles/package.mask) 裡。如果仍在使用其中的包，請在移除日期之前告知。

## 反饋

更新後如果遇到建置失敗或執行異常，請向我們反饋：

- [GitHub issues](https://github.com/gentoo-zh/overlay/issues)
- overlay@gentoozh.org
- [Telegram 群](https://t.me/gentoo_zh)
- [社群論壇](https://forum.gentoozh.org/)（新開的論壇）

若需附帶較長的日誌，請使用 [paste.gentoozh.org](https://paste.gentoozh.org/)。
