---
title: "Changelog"
description: "Notable changes to the site and community services."
---

<!-- anchor:october-2026 -->

<!-- anchor:september-2026 -->

<!-- anchor:august-2026 -->

<!-- anchor:july-2026 -->

<!-- anchor:june-2026 -->

<!-- anchor:may-2026 -->

<!-- anchor:about-these-updates -->

## Earlier update links

The May–October 2026 changelog entries are no longer included after the site redesign. Historical links to those months land here; the current changelog begins below.

## 2026-10 Apple silicon Mac guide update {#apple-silicon-guide}

[Installing Gentoo Linux on Apple Silicon Macs](/en/posts/2025-10-02-gentoo-m-series-mac/) is rewritten from an install on a MacBook Air M2: the 20260827 live ISO verified on hardware (the 20261006 image does not boot), the full Asahi installer and Recovery screens, the latest stage3, and a Taiwan mirror in the `make.conf` example.

The Chinese-only repost "Gentoo Linux with ZFS" is removed; its links redirect to the post list.

## 2026-10 Site redesign {#redesign}

The site moves from Hugo to Astro: pages are generated as static HTML at build time, the interface uses Meta's open-source Astryx component library (React and StyleX), and only a few components such as navigation, search and filters run in the browser. Pagefind provides site search, and the site is deployed on Cloudflare Workers. The download site's guide pages and the service status join the main site, sorted into five categories: Docs, Download, Community, Support and About. The date is set at launch.
