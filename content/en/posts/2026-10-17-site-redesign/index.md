---
title: "gentoo-zh website redesign"
description: "The main site moves from Hugo to Astro and Astryx and absorbs the download site's guides and the service status page; GigOS is paused; OSUOSL provides an ARM test machine."
date: 2026-10-17
tags: ["announcement", "website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

gentoozh.org, previously generated with Hugo, has been rewritten with Astro and Astryx. The guide pages from the download site (distfiles.gentoozh.org) and the service status from status.gentoozh.org now live on the main site.

## What changed

- Setup guides for the overlay, binary packages and distfiles, the mirror list, the package list and the installation images are sorted into five categories: Docs, Download, Community, Support and About.
- [Service status](/status/) replaces status.gentoozh.org; the probes and their history are unchanged.
- Simplified Chinese, Traditional Chinese and English are each written separately.

The [changelog](/changelog/#redesign) describes the site's architecture.

## GigOS paused

For lack of resources, GigOS images (a KDE Plasma 6 desktop live OS with Chinese settings built in) are paused for now. The [download page](/download/) still offers the CJK minimal installation image.

## OSUOSL provides an ARM test machine

The [Oregon State University Open Source Lab (OSUOSL)](https://osuosl.org/) has provided gentoo-zh with an ARM test machine. It is used first for version bumps of overlay packages; see [Costs](/costs/).

Report problems on [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io/issues).
