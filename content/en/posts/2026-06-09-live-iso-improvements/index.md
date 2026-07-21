---
title: "Recent Community Updates: Live ISO, Website, Download Site, and Speedtest"
description: "A roundup of what the community has worked on lately: the custom KDE Live ISO, the Calamares installer, the gig overlay, the build pipeline, the website (migrated to Hextra, now with English), the download site, and the speedtest page."
date: 2026-06-09
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

A roundup of what the community has worked on recently, project by project. Each item links to its repo, so you can dig into the full history if you want.

## Live ISO

The Chinese community's custom KDE Plasma 6 desktop Live ISO ([Gentoo-zh/Live-ISO](https://github.com/gentoo-zh/Live-ISO)):

- **Three languages out of the box**: the boot menu offers Simplified / Traditional / English, and the whole live environment follows your choice; the installed system also keeps whatever language you picked in the installer.
- **Chinese input methods preinstalled**: fcitx5 + rime, ready to type out of the box, with Luna Pinyin, Zhuyin, Wubi86, Cangjie, and Cantonese Pinyin built in.
- **Proprietary NVIDIA, optional**: pick the NVIDIA entry in the boot menu to load the proprietary driver normally (disable Secure Boot first); otherwise it uses open-source nouveau.
- **Handy live-only desktop switches**: the desktop has a few one-click toggles meant just for the live session, there when you need them — temporarily turn off auto-sleep / lock (so a long session or install isn't interrupted), enable passwordless sudo, and start SSH (handy for a remote install or debugging).
- **The installed system is clean**: those live conveniences (along with the default passwordless SDDM autologin) only exist in the live session; the installer resets / clears them on install, so the installed system goes back to KDE's normal defaults — login needs a password, sudo needs authorization, and sleep/lock behave normally.
- **Out-of-the-box details**: PipeWire audio, networking connects on boot, and MAKEOPTS / CPU instruction sets adapt to your machine.

For actually installing a system, following the [Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) step by step is the more solid route; the live ISO also ships a graphical installer (Calamares) if you want a quick install.

## The installer (Calamares)

The installer config lives in [Gentoo-zh/calamares-settings-gig](https://github.com/gentoo-zh/calamares-settings-gig): after an install it clears out the live-only leftover settings and configures NVIDIA according to the GPU option you chose in the live session. On the partitioning step the root filesystem defaults to btrfs, with xfs / ext4 / ZFS also available — pick ZFS and tick encrypt and you get ZFS native encryption (aes-256-gcm), booted by ZFSBootMenu (GRUB can't read a natively-encrypted ZFS pool, so a ZFS root uses ZBM instead). The install flow, including the encrypted-ZFS path, has been tested with real installs in a VM.

## The overlay the Live ISO uses

The packages the Live ISO builds from come from [Gentoo-zh/gig](https://github.com/gentoo-zh/gig) — a fork of the Gig OS overlay, specific to the Live ISO, and *not* the same thing as the community's main overlay, [gentoo-zh](https://github.com/gentoo-zh/overlay). This round updated its Calamares to 3.3.14-r8 (which supports Python 3.14), fixed an `emerge --sync` error, and cleaned out a batch of redundant / broken packages.

## Build and release

The build pipeline, [Zakkaus/gentoozh-liveiso-infra](https://github.com/Zakkaus/gentoozh-liveiso-infra): the Live ISO is compiled automatically every Monday and uploaded to **Cloudflare R2**. The pipeline does a byte-for-byte check that "what's on R2 == what was just built" and confirms the download page reflects the new image, publishing only when they match; it also copes with the USE / keyword churn of a rolling-tree transition automatically (see the [Python 3.14](/posts/2026-06-01-python-314-default/) post).

## Website

The website, [gentoozh.org](https://gentoozh.org/) (source: [gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io)), migrated from Blowfish to Hextra — lighter, faster, and friendlier to docs and text browsers (details in the [migration post](/posts/2026-05-29-migrate-to-hextra/)). The presentation layer was split out into a standalone Hextra patch package, [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme), which also rounded out SEO, the footer, and accessibility. The download page was wired up to the download site, with notes on the Live ISO's features and hardware requirements, plus a new FAQ page. This round also added **English** to the public pages, so you can switch between Simplified / Traditional / English.

## Download site

The download site, [mirror.gentoozh.org](https://mirror.gentoozh.org/) (source: [Zakkaus/gentoozh-mirror](https://github.com/Zakkaus/gentoozh-mirror)), **moved to Cloudflare — no more self-hosted server**: ISOs live on **Cloudflare R2** (`r2.gentoozh.org`, zero egress, global edge, cacheable), and the landing page is now a **Cloudflare Worker** that reads R2 at the edge to list the latest image plus **all past builds**, always reflecting current contents. The page keeps Simplified / Traditional / English and light / dark mode.

## Speedtest site

For speed testing we now point to [Cloudflare's own speed test](https://speed.cloudflare.com/) — downloads already go through Cloudflare's edge, so it reflects real download speed; the old self-hosted speed.gentoozh.org was retired together with the download server.

---

Want to try the Live ISO? Head to the [download page](/download/). Questions are welcome on [Telegram](https://t.me/gentoo_zh) or each project's GitHub.
