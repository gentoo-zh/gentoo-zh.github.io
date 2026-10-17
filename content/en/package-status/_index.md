---
title: "Package status reference"
description: "The trigger for each status in the package list, and what this host publishes"
---

## Publication scope {#scope}

This host publishes the builder’s entire `PKGDIR`, including selected overlay packages and `::gentoo` dependencies built from source. Before publication, it removes masked binary packages, those restricted by `RESTRICT=bindist`, and those inheriting `linux-mod`; it does not exclude the `acct-group`, `acct-user` or `virtual` categories. The included dependencies do not replace the official Gentoo binhost. See the plain-text lists for [stable](https://distfiles.gentoozh.org/packages.txt) and [unstable](https://distfiles.gentoozh.org/packages-unstable.txt).

## Status labels {#status-help}

The package list shows the public index, direct build list, current publication policy and distfiles mirror status separately. Several statuses can appear on one row because they describe different facts. The distfiles column counts files in the index.

| Status | Trigger and common causes |
| --- | --- |
| `published` | The public index contains a downloadable binary package. The publication policy column describes the current ebuild; the published artifact passed checks for its own version and build-time USE. |
| `pending` | The package is a direct build target, but the public index has no binary package. Its first build may not have completed, or the latest cycle may not have published it; this status only says that no public artifact is currently available. |
| `excluded` | The maintenance list explicitly excludes the package. Common reasons include build failure, missing support or a redistribution condition that needs review; the reason column shows the recorded reason. |
| `not in this channel` | The package remains on the shared build list, but this channel cannot satisfy its dependency or build conditions, so this channel does not build it directly. Another channel may still publish it. If it is built as a dependency of another package, this channel may still hold its binary package. |
| `off-list` | The package is not a direct build target. Packages with upstream prebuilt content or little build benefit are often left off the list, but they may still be published as dependencies. A `-bin` name does not determine this status. This also covers packages with no detected common build eclass, or a detected build process but no build-list entry. This is not a publication restriction. |
| `no binpkg` | The current ebuild's `RESTRICT` includes `bindist`, so this host does not publish a binary package for the package. Source and upstream-prebuilt packages can both carry this restriction, commonly because a licence, upstream release terms or redistribution conditions for prebuilt content prohibit this host from distributing binary artifacts. A `-bin` name is not evidence by itself. Distfile mirroring is evaluated separately, based on the `mirror` and `fetch` values in `RESTRICT` and each `SRC_URI` entry. |
| `licence restricted` | The current ebuild's `LICENSE` expression is outside this host's fixed `@BINARY-REDISTRIBUTABLE` set. The licence may permit redistribution under conditions, but this host does not publish a binary package under that policy. This is evaluated separately from `RESTRICT=bindist`. |
| `removed` | The overlay removed this package, but the public index still holds its binary package, which remains downloadable. The row does not link to the overlay. |
| `Distfiles —` | The package declares no distfile, its `RESTRICT` includes `mirror` or `fetch`, or not every declared file has reached the mirror. This status does not imply that the binary package is unavailable. |
| policy unknown | The current ebuild could not be evaluated against the binary-package publication policy. |
| `no amd64` | No amd64 keyword. |
| `masked` | Masked in `profiles/package.mask`. |
| `9999 only` | Only a live ebuild exists; this host does not publish a binary package. |
