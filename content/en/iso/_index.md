---
title: "CJK minimal install image"
description: "The amd64 minimal install image built by gentoo-zh, with a console that shows Chinese, Japanese and Korean text, updated weekly"
---


{{< callout type="info" >}}
Prepare an amd64 computer and enough storage for the ISO. Writing the image requires a USB drive whose contents can be erased and administrator access.
{{< /callout >}}

<!-- slot:mac -->

## Download the ISO {#minimal}

A third-party minimal install medium, built with Catalyst to the official Gentoo Release Engineering specs.

<!-- slot:download -->

## Mirrors {#minimal-mirrors}

Each release is a directory named after its build time (such as `20261012T114547Z/`) holding the ISO, `.sha256`, `.DIGESTS` and `.CONTENTS.gz`. For mirror redirects and version differences, see the [mirror list](/mirrorlist/#list).

<!-- slot:mirrors -->

## Differences from the official minimal medium {#minimal-differences}

- The gentoo-zh overlay is configured at build time.
- The kernel is `sys-kernel/gentoo-cjk-kernel-bin` with the cjktty patch, so the Linux console shows Chinese, Japanese and Korean text.
- ZFS is supported.
- Everything else matches upstream: the package list, livecd/unmerge, livecd/empty, the dracut parameters and the GRUB theme.

## Verify the ISO {#verify}

<!-- slot:verify -->

## Write to a USB drive {#usb}

<!-- slot:usb -->

