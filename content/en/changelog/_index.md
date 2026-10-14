---
title: "Changelog"
date: 2026-05-31
description: "Changelog for the Gentoo-zh Community website"
slug: "changelog"
---

This page tracks the major updates to the site's content, so readers can follow what's changed.

---

## October 2026

- The site now uses the new gentoo-zh logo: the navigation bar, favicon, share image and 404 page all switched, with a white-text version for the dark theme. A new [logo page](/logo/) offers the horizontal, vertical, icon and wordmark versions in every color, with the license and lettering sources
- New [acknowledgments page](/thanks/) listing OSUOSL, the mirror sites and 1Password; the homepage has an acknowledgments section below the contributors
- The Gig-OS desktop image is gone from the [download page](/download/): its maintenance is paused because build machine resources are limited, so only the CJK minimal image remains
- [Infrastructure costs page](/costs/): retired items have their own table; OSUOSL's build server, US mirror, forum SMTP and ARM test machine are listed separately; the forum's reserved IPs and the Purelymail mailboxes are added; the top of the page shows the total spent and the current monthly cost
- The top bar menu is now grouped by purpose into Use, Posts, Community and About; off-site links end in ↗, and the forum has an entry
- "Service status" in the top bar now points to the [public Grafana dashboard](https://grafana.gentoozh.org/public-dashboards/d5754b79824d4d8dbd8c70e13e54c11e)

## September 2026

- New announcement **[The gentoo-zh download site, rebuilt](/posts/2026-09-30-distfiles-site-redo/)**: the overlay, distfiles, binhost and Live ISO now live together on [distfiles.gentoozh.org](https://distfiles.gentoozh.org/), and binhost moved to OSUOSL with no configuration changes needed
- The [Overlay page](/overlay/) now redirects to the download site, and the [download page](/download/) and the infrastructure menu link straight to its pages; the old iso.gentoozh.org was retired
- [Infrastructure costs page](/costs/): the self-owned build server was retired on 2026-09-29 and binhost builds are now sponsored by OSUOSL; the Vultr high-availability node was retired on 2026-09-30; billing periods are now counted by calendar month

## August 2026

- New post **[What we have done recently, and what is still open](/posts/2026-08-26-community-update-and-todo/)**: what the past few months brought for the site, the chat platforms, the overlay and the documentation, and what the contribution process still lacks
- A site-wide review fixed dead links, broken anchors, invalid HTML and drift in the Traditional Chinese wording

- The [mirror list page](/mirrorlist/) has been rewritten: the overlay's git sync source, distfiles and binary packages, plus Gentoo's official rsync, distfiles and binhost, each come with a copy-paste configuration block. Every block can switch between mirrors and the origin, and the selected address is written into the commands as you switch. Prefix users get their own settings
- The binary package section on the [Overlay page](/overlay/) can switch between the stable and unstable channels: each channel lists its own `binrepos.conf` and keyword settings, and the blocks support mirror switching as well as both the manual and one-command setup paths
- The [download page](/download/) now leads with two image cards — the Gig-OS desktop image and the CJK minimal image — with the setup details, checksums and mirror directories all pointing at iso.gentoozh.org
- New [infrastructure costs page](/costs/): the specifications, unit price, billing start date and running total for every server and service, converted to a single currency for the total. The community has no commercial sponsor, members currently cover the bills, and donations are not accepted
- A pass over the site's Chinese copy: colloquial phrasing tightened, spacing between Chinese and Latin text and full-width punctuation made consistent

## July 2026

- New announcement **[The gentoo-zh Binary Package Service Is Live](/posts/2026-07-29-binhost-launch/)**: 194 overlay packages now ship as prebuilt binary packages, built nightly, signed, and served from [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) and the Nanjing University mirror. The post covers the three setup steps, why `getuto` has to run first, and which packages are excluded
- The [Overlay page](/overlay/) has a new **binary packages (binhost)** section: x86-64 only for now and not every package is covered, with the three setup steps outlined and the copy-paste commands, addresses, signing key and live package count all linked at [distfiles.gentoozh.org](https://distfiles.gentoozh.org/). The distfiles section's `GENTOO_MIRRORS` now lists both the mirror and the origin, and a stale mirror address in the git sync example has been fixed
- New announcement **[Package cleanup, renames and mass updates](/posts/2026-07-29-overlay-package-cleanup/)**: over the past month 162 packages were updated, 60 added, 38 removed and 5 renamed or moved, taking the overlay from 468 to 490 packages. The post lists the renames, the removals, and what each needs from you
- **The Live ISO download site is now iso.gentoozh.org**: it serves Live ISO downloads, not Gentoo's portage / distfiles mirrors (those are on the [mirror list](/mirrorlist/) page), so the old `mirror` name was misleading. The old address mirror.gentoozh.org still works, so bookmarks and existing links keep working
- **The community Pastebin [paste.gentoozh.org](https://paste.gentoozh.org) is live** (built on [wastebin](https://github.com/matze/wastebin)): for sharing code and logs, with a web UI, command line (curl), and raw links. Entry points have been added in the top-bar "Infrastructure" menu and the [Pastebin guide](/paste/)
- The [About page](/about/) now links to the community's page on the **Gentoo Wiki** ([Gentoo-zh](https://wiki.gentoo.org/wiki/Gentoo-zh)), with structured-data `sameAs`
- Site maintenance and CI: hardened CI, upgraded dependencies, bumped GitHub Actions to their latest major versions (checkout v7, setup-node/go/python v6, still pinned by SHA), and did a round of site review and cleanup
- **The community's main domain moved to [gentoozh.org](https://gentoozh.org/)**: the old domains (gentoo.org.cn, gentoocn.org) all redirect permanently (301), so existing bookmarks and links keep working, but please update them soon. See the [migration announcement](/posts/2026-07-01-domain-migration/) for details
- **The gentoo-zh overlay repo moved to the organization repo [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)**: the old `microcai/gentoo-zh` now redirects (301) to the new repo. If you've already added the overlay, update your sync source to the new URL. See the [repo migration announcement and record](/posts/2026-07-02-gentoo-zh-repo-migration/) for details
- **The community forum [forum.gentoozh.org](https://forum.gentoozh.org/) is live** (Discourse, Simplified and Traditional Chinese): a good place for posts, questions, and long-term discussion. Entry points have been added in the homepage's "Join the community" section and on the [About page](/about/)
- **Site hosting moved to Cloudflare Workers**: moved from GitHub Pages to Workers static-asset hosting (free and unlimited requests, global edge nodes). See the [note in the migration post](/posts/2026-07-01-domain-migration/)
- The [download page](/download/#live-iso) and [Overlay page](/overlay/) text has been refreshed: the download page tidies up the login credentials, the VM AVX2 note, and the mirror list; the Overlay page reorders the package categories, folds the two add methods into collapsible blocks, and adds China-based git / distfiles mirror addresses
- The English UI site name is now unified as **Gentoo-zh Community**
- Three announcements from 2013 and 2014 have been reverted to [microcai](/contributors/microcai/)'s original wording; the later rewrite has been dropped, and an editor's note at the end of each post explains the dead links and what has changed since
- The [Overlay page](/overlay/) setup instructions now use copy-paste configuration blocks: you can switch between the GitHub upstream and the university mirrors, and between editing the config files by hand and running a single command
- The ISO feedback link on the [download page](/download/#live-iso) now points to Gig-OS, where the Live ISO build repository lives

## June 2026

- Added a reposted article **[Gentoo Linux with ZFS](/posts/2026-06-18-gentoo-linux-with-zfs/)** (in Chinese; originally by [Locez](https://github.com/locez), reposted with permission under CC BY-NC-SA 4.0): a hands-on log of installing Gentoo with a ZFS root + ZFS native encryption on a dual-NVMe mirror. We added an erratum on the SLOG setup, partitioning notes, and links to the matching official Handbook chapters
- The Live ISO's graphical installer now supports a **ZFS root filesystem**: you can install onto ZFS, and ticking "encrypt" gives you ZFS native encryption (aes-256-gcm) booted by ZFSBootMenu (btrfs / ext4 / xfs / ZFS all selectable on the partitioning page). The [download page](/download/#live-iso) and the guide have been updated accordingly
- Download site moved to the cloud: Live ISO downloads now live on **Cloudflare R2** (r2.gentoozh.org, zero egress, global edge); the landing page mirror.gentoozh.org is now a **Cloudflare Worker** that reads R2 at the edge to list the latest image plus all past builds; speed testing points to [Cloudflare's speed test](https://speed.cloudflare.com/); the self-hosted US download / speedtest server was retired
- Added English (i18n) to the public pages: the about, download, mirror list, contributing and similar public pages can now switch between Simplified Chinese / Traditional Chinese / English, mainly to make life easier for the gentoo-zh overlay's overseas users. To be clear: **not every technical article is available in English** — only the public pages are translated for now. The English was drafted with translation software and then reviewed with AI, so mistakes are still possible; [corrections on GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) are welcome

## May 2026

- Project restructuring: the presentation layer (the theme) has been split out into a standalone Hextra patch package, [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme). This repo now holds only content and config, which makes it easier to track upstream Hextra updates
- Homepage redesign: reworked the visual hierarchy (big headline as an anchor, primary action made more prominent), unified the accent color around Gentoo brand purple, and changed "Latest Posts" to surface technical content first
- Rewrote the "Contributing to the gentoo-zh Overlay" section of the contribution guide: it now walks through the complete submission workflow per the official Gentoo ebuild repository conventions (EAPI, `metadata.xml`, thin Manifest, `~arch` testing, `pkgdev`/`pkgcheck`, PRs and CI), plus version tracking with nvchecker. It also distinguishes overlay contributions (which count toward the contributor wall) from website contributions, switches the page layout to native callouts / collapsible blocks, and adds a "Contributing" entry to the top nav
- The download station now uses mirror.gentoozh.org, replacing the decommissioned iso.gig-os.org. The Download / Mirror list / Overlay pages have been rewritten, and Live ISO login credentials now support click-to-copy
- Mirror sync source notice: as of 2025-10-30, the official Gentoo infrastructure no longer provides cached mirrors for third-party repositories (including gentoo-zh). The overlay has switched to syncing directly from the GitHub upstream. Users who added it earlier need to update their sync source, see the [announcement](/posts/2025-10-07-thirdparty-repo-mirror-removal/) for details
- **The site theme has been migrated from Blowfish to Hextra** (v0.12.3, based on Hugo 0.162.1): redid the homepage bento layout, tidied up the top nav, switched posts to native `tags` categorization, and added an RSS subscribe button and social share images on the homepage. See the [migration announcement](/posts/2026-05-29-migrate-to-hextra/) for details
- The download page now highlights the "Chinese-community-customized KDE desktop Live ISO" to help newcomers get started quickly
- Loading optimizations: contributor avatars are now automatically scaled to their display size (sharply reducing homepage image size), and animations respect the "reduce motion" preference
- Contributor auto-updates are now run once a month, and each run prunes departed contributors and stale avatars to keep the repo size in check
- Made the site-wide cleanup and contributor auto-update scripts more reliable

---

## About these updates

- This page records the major updates to the site's **content**, not purely technical changes
- Contributor information updates automatically each month and isn't recorded here
- Questions or suggestions? Reach out at [zakk@gentoozh.org](mailto:zakk@gentoozh.org) or discuss in the [Telegram group](https://t.me/gentoo_zh)
