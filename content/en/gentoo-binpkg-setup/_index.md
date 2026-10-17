---
title: "Official binary package setup"
description: "Configure the official binhost, architecture and signature verification"
setupHint: "The selected mirror supplies the URLs in this page’s configuration."
---

HTTP mirrors that synchronize Stage 3 and official binary packages provide them under `releases/`.

<!-- slot:setup -->

The [official Gentoo binary package host](https://wiki.gentoo.org/wiki/Project:Binhost) provides prebuilt, signed packages. Recent Stage 3 archives already configure this repository under `/etc/portage/binrepos.conf/`. To use a mirror, edit `sync-uri` in the `[gentoo]` section.

This configuration uses the current `23.0` profile. See the [amd64 binary package directory](https://distfiles-cdn-origin.gentoo.org/releases/amd64/binpackages/) and [arm64 binary package directory](https://distfiles-cdn-origin.gentoo.org/releases/arm64/binpackages/) for exact paths. The Gentoo Binhost project currently supports amd64 and arm64 with the GNU toolchain (glibc, GCC and binutils); binary packages for other architectures and toolchains are limited to the package cache used by Release Engineering to build Stage 3.

This example uses baseline amd64 x86-64 packages:

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
[gentoo]
priority = 1
sync-uri = https://distfiles.gentoo.org/releases/amd64/binpackages/23.0/x86-64
location = /var/cache/binhost/gentoo
verify-signature = true
```

`sync-uri` must point to a directory containing `Packages`. Baseline arm64 systems can change the path to `/releases/arm64/binpackages/23.0/arm64`.

On baseline amd64 systems, use x86-64-v3 packages when the CPU supports [x86-64-v3](https://www.gentoo.org/news/2024/02/04/x86-64-v3.html) for instruction-set-specific optimizations. Check support with:

```bash
$ ld.so --help
```

If the output includes `x86-64-v3 (supported, searched)`, change the final path component above to `x86-64-v3`:

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
sync-uri = https://distfiles.gentoo.org/releases/amd64/binpackages/23.0/x86-64-v3
```

To download and install a suitable binary package automatically when one is available, add this to `/etc/portage/make.conf`:

`/etc/portage/make.conf`:

```ini
FEATURES="${FEATURES} getbinpkg"
```

When no suitable binary package is available, Portage builds from source as usual.

To use binary packages for one command:

```bash
$ sudo emerge --ask --getbinpkg <package>
```

According to [Portage binpkg changes](https://www.gentoo.org/support/news-items/2026-05-03-portage-binpkg-changes.html), newer Portage verifies remote binary package signatures by default and caches them in the directory set by `location`. Official binhost users no longer need `FEATURES="binpkg-request-signature"`; on the first download, Portage runs `getuto` to create the trusted keyring.

See the [Gentoo Binary Host Quickstart](https://wiki.gentoo.org/wiki/Gentoo_Binary_Host_Quickstart), [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide) and [MirrorZ Gentoo help](https://help.mirrorz.org/gentoo/) for further configuration.
