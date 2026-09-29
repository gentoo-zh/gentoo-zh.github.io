---
title: "The gentoo-zh Binary Package Service Is Live"
description: "194 packages from the gentoo-zh overlay now ship as prebuilt binary packages, signed and served from distfiles.gentoozh.org, with a Nanjing University mirror. How to set it up, how signature verification works, and which packages are left out."
date: 2026-07-29
tags: ["announcement", "binhost", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

The overlay currently holds 490 packages, 194 of which ship as prebuilt binary packages, built nightly and signed before they go out. Setup instructions live at <https://distfiles.gentoozh.org>.

The selection favours packages that take a long time to compile: Electron apps, browsers, office suites, and projects carrying a large number of crates or Go modules. Compiling these locally takes anywhere from tens of minutes to several hours, so the time a binary package saves scales with how long the build would have taken.

## Setup

{{< callout type="info" >}}
For how to set it up, see **[distfiles.gentoozh.org](https://distfiles.gentoozh.org/)**.
{{< /callout >}}

## Which packages are left out

The build list leaves out several kinds of package, so there are fewer binary packages than packages in the overlay:

- `RESTRICT=bindist`, where upstream does not allow the build output to be redistributed
- Licenses that forbid redistribution, which `ACCEPT_LICENSE="-* @BINARY-REDISTRIBUTABLE"` filters out at build time
- `-bin` packages, where upstream already publishes a binary and installation is just an unpack
- Fonts, dictionaries, themes and similar packages that have no build system at all
- `virtual` and `acct-user` packages, which install no files
- Live packages with only a `9999` ebuild, which have no fixed version to build

The status column at <https://distfiles.gentoozh.org/packages> shows which category a package falls into. That table only covers packages that have source files or have been built, so live packages with only a `9999` ebuild do not appear there.

Packages that are not on the list but get built as dependencies inside the overlay (`acct-*`, `virtual/*` and the like) still show up in the index.

Portage only takes a binary package when the USE flags match exactly, so packages whose USE combinations vary widely rarely get a hit, the build cost never pays off, and they are not on the list either. If `emerge` still compiles from source after you have set this up, check with `emerge -pv`: only a `[binary]` prefix means a binary package was used.

## distfiles mirror

The binary packages and the distfiles mirror are independent of each other, so set up whichever you need. The mirror holds the source code for the overlay's packages, currently around 1200 files and 33 GB. It carries the overlay's source only and cannot replace the official mirrors, so it is appended to `GENTOO_MIRRORS` rather than substituted. The addresses and copy-paste config are on the [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) home page as well; for `::gentoo` itself see the [mirror list](/mirrorlist/).

## Building and distribution

A build round runs nightly at 02:00 (Asia/Shanghai), and the output is signed before publication. Building one package also builds its dependencies, so more packages are published than the list has entries.

Packages removed from the overlay drop out of the index on the next build round; copies already installed are unaffected.

Mirrors can also sync over rsync (binary packages and distfiles both):

```shell
rsync rsync://distfiles.gentoozh.org/gentoo-zh/
```

If a package's source should not be mirrored, for copyright or similar reasons, add `RESTRICT="mirror"` to its ebuild and the sync tool skips it. Build output is a separate matter: to keep it from being redistributed, set `RESTRICT="bindist"`, and validation rejects the package from the build list.

## Getting a package added

Add a `category/package` line to `build/packages.txt` in the [binhost repository](https://github.com/gentoo-zh/binhost) and open a pull request. Once merged, the package is produced in the next build round.

The server configuration and the build and publish scripts live in that same repository; open an issue there if something goes wrong.
