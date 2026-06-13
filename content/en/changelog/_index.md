---
title: "Changelog"
date: 2026-05-31
description: "Changelog for the Gentoo Chinese Community website"
slug: "changelog"
---

This page tracks the major updates to the site's content, so readers can follow what's changed.

---

## June 2026

- Download site moved to the cloud: Live ISO downloads now live on **Cloudflare R2** ([r2.gentoozh.org](https://r2.gentoozh.org/), zero egress, global edge); the landing page [mirror.gentoozh.org](https://mirror.gentoozh.org/) is now a **Cloudflare Worker** that reads R2 at the edge to list the latest image plus all past builds; speed testing points to [Cloudflare's speed test](https://speed.cloudflare.com/); the self-hosted US download / speedtest server was retired
- Added English (i18n) to the public pages: the about, download, mirror list, contributing and similar public pages can now switch between Simplified Chinese / Traditional Chinese / English, mainly to make life easier for the gentoo-zh overlay's overseas users. To be clear: **not every technical article is available in English** — only the public pages are translated for now. The English was drafted with translation software and reviewed and polished by Claude Fable 5 (ultracode) — the best and most expensive model we could find to date — so mistakes are still possible; [corrections on GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) are welcome

## May 2026

- Project restructuring: the presentation layer (the theme) has been split out into a standalone Hextra patch package, [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme). This repo now holds only content and config, which keeps things tidier and makes it easier to track upstream Hextra updates
- Homepage redesign: reworked the visual hierarchy (big headline as an anchor, primary action made more prominent), unified the accent color around Gentoo brand purple, and changed "Latest Posts" to surface technical content first
- Rewrote the "Contributing to the gentoo-zh Overlay" section of the contribution guide: it now walks through the complete submission workflow per the official Gentoo ebuild repository conventions (EAPI, `metadata.xml`, thin Manifest, `~arch` testing, `pkgdev`/`pkgcheck`, PRs and CI), plus version tracking with nvchecker. It also distinguishes overlay contributions (which count toward the contributor wall) from website contributions, switches the page layout to native callouts / collapsible blocks, and adds a "Contributing" entry to the top nav
- The download station now uses mirror.gentoozh.org, replacing the decommissioned iso.gig-os.org. The Download / Mirror list / Overlay pages have been rewritten, and Live ISO login credentials now support click-to-copy
- Mirror sync source notice: as of 2025-10-30, the official Gentoo infrastructure no longer provides cached mirrors for third-party repositories (including gentoo-zh). The overlay has switched to syncing directly from the GitHub upstream. Users who added it earlier need to update their sync source, see the [announcement](/posts/2025-10-07-thirdparty-repo-mirror-removal/) for details
- **The site theme has been migrated from Blowfish to Hextra** (v0.12.3, based on Hugo 0.162.1): redid the homepage bento layout, tidied up the top nav, switched posts to native `tags` categorization, and added an RSS subscribe button and social share images on the homepage. See the [migration announcement](/posts/2026-05-29-migrate-to-hextra/) for details
- The download page now highlights the "Chinese-community-customized KDE desktop Live ISO" to help newcomers get started quickly
- Loading optimizations: contributor avatars are now automatically scaled to their display size (sharply reducing homepage image size), and animations respect the "reduce motion" preference
- Contributor auto-updates are now run once a month, and each run prunes departed contributors and stale avatars to keep the repo size in check
- Made the site-wide cleanup and contributor auto-update scripts more reliable

## January–April 2026

- The installation guide series has been moved to drafts (it had too many errors and omissions; the [Gentoo Wiki](https://wiki.gentoo.org/) is recommended instead)
- Added NVIDIA + Chromium hardware acceleration setup and simplified the related configuration

## December 2025

- Added contributor auto-update functionality (periodically pulls commit data from GitHub and sorts by commit count)
- Rounded out the btrfs subvolume / LUKS / fstab installation walkthrough for better readability
- Marked the Apple silicon Mac installation guide as supporting M1 / M2 only

## November 2025

- Migrated the site from Jekyll to Hugo and launched the new version
- Added the contributor list and individual profile pages
- Improved SEO meta tags, structured data, and dark mode
- Updated the Telegram group rules, download page credentials, and community channel info (IRC moved to Libera Chat)

---

## About these updates

- This page records the major updates to the site's **content**, not purely technical changes
- Contributor information updates automatically each month and isn't recorded here
- Questions or suggestions? Reach out at [admin@zakk.au](mailto:admin@zakk.au) or discuss in the [Telegram group](https://t.me/gentoo_zh)
