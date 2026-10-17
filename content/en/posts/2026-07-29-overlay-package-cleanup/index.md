---
title: "Package Cleanup, Renames and Mass Updates"
description: "Over the past month the gentoo-zh overlay updated 162 packages, added 60, removed 38 and renamed or moved 5, going from 468 to 490 packages. Here are the rename and removal lists, and what each one needs from you."
date: 2026-07-29
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

Over the past month 162 packages got a new version, 60 packages were added, 38 were removed and 5 were renamed or moved to another category. The overlay went from 468 to 490 packages.

## Renamed or Moved

The five packages below were renamed or moved. Portage applies this on `emerge --sync`, so nothing has to be done by hand:

| Old name | New name |
| --- | --- |
| `app-i18n/fcitx5-vinput` | `app-i18n/fcitx-vinput` |
| `www-apps/cherry-studio-bin` | `app-misc/cherry-studio-bin` |
| `www-apps/dufs` | `www-servers/dufs` |
| `www-apps/follow-bin` | `www-apps/folo-bin` |
| `net-proxy/clash-verge-bin` | `net-proxy/clash-verge-rev-bin` |

## Now Provided by ::gentoo

::gentoo carries the same or a newer version of the seven packages below, so this overlay no longer keeps a second copy. After syncing they come from ::gentoo. Installed copies need no action, and upgrades follow ::gentoo from now on:

- `dev-libs/libdatrie`
- `dev-libs/libthai`
- `dev-libs/libratbag`
- `gui-libs/libdecor`
- `media-fonts/smiley-sans`
- `sys-fs/jmtpfs`
- `media-video/amdgpu-pro-amf`

## Removed: Upstream Gone or Unmaintained

These ten were removed because upstream disappeared or archived the project, or because nobody maintains them any more:

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

## Removed: Long Unmaintained

The twenty-one below were all added by the same packager, went unmaintained for a long time and had no second maintainer, so they were removed together:

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
An installed copy of a removed package stays behind as an orphan and can be removed with `emerge --unmerge`.
{{< /callout >}}

## Replacement

Upstream moved the `net-misc/biliup-rs` code to [biliup/biliup](https://github.com/biliup/biliup), so the replacement is `net-misc/biliup-bin`, the prebuilt binary from that repository.

## More Packages Masked for Removal

More packages are masked for removal. The reason and the removal date for each are in [`profiles/package.mask`](https://github.com/gentoo-zh/overlay/blob/master/profiles/package.mask). If you still use one of them, tell us before its removal date.

## Feedback

If an update breaks a build or breaks something at runtime, please report it:

- [GitHub issues](https://github.com/gentoo-zh/overlay/issues)
- overlay@gentoozh.org
- [Telegram group](https://t.me/gentoo_zh)
- [Community forum](https://forum.gentoozh.org/) (new forum)

For longer logs please use [paste.gentoozh.org](https://paste.gentoozh.org/).
