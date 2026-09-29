---
title: "The gentoo-zh download site, rebuilt"
description: "Overlay, distfiles, binhost and Live ISO guides in one place; the binhost moved to OSUOSL, and existing setups need no changes."
date: 2026-09-30
featured: true
tags: ["announcement", "binhost"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

The [gentoo-zh download site](https://distfiles.gentoozh.org/?lang=en) (distfiles.gentoozh.org) has been rebuilt. Adding the overlay, setting up distfiles and the binhost, downloading a Live ISO and picking a mirror now all happen on that one site, and the Overlay and download pages here link straight to it.

## The binhost moved to OSUOSL

The binhost builder now runs on a server provided by the [Oregon State University Open Source Lab (OSUOSL)](https://osuosl.org/). The public address and the signing key are unchanged, so existing `binrepos.conf` files need no changes.

The build profile also changed to `default/linux/amd64/23.0/desktop/systemd`. Far more users run systemd than OpenRC, and build capacity is limited, so only this profile is built. About 4% of packages have USE flags tied to systemd; for those, Portage skips the binary package on OpenRC systems and builds from source. All other packages are unaffected.

## A new US mirror

OSUOSL also provides a [US mirror](https://ftp2.osuosl.org/pub/gentoo-zh/). Mirrors now cover Germany (the origin), mainland China and the United States; see the [mirror list](https://distfiles.gentoozh.org/mirrors?lang=en).

There is no mirror yet in Asia outside mainland China. To host one, sync from `rsync://distfiles.gentoozh.org/gentoo-zh/` and send the mirror details through [GitHub Issues](https://github.com/gentoo-zh/binhost/issues).

## Thanks

Thanks to OSUOSL for the builder and the mirror, and to the CERNET mirror service, Nanjing University, Nanyang Institute of Technology and the Henan Education and Research Network for their mirrors.
