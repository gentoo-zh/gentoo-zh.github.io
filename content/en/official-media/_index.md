---
title: "Official media"
description: "Gentoo's official minimal install CD, LiveGUI and stage3: where the files are, mirrors to download from, and how to verify them"
---

Gentoo publishes install media for amd64, x86, arm64, arm and other architectures; the full list is on the [Gentoo download page](https://www.gentoo.org/downloads/).

## Files {#files}

Take these files from `releases/<arch>/autobuilds/` on any mirror (amd64 shown):

<!-- slot:official -->

## Mirrors {#mirrors}

For other download locations, see [Official mirrors](/gentoo-mirrors/).

<!-- slot:officialmirrors -->

## Verify {#verify}

Check the ISO against the SHA512 digest in `.DIGESTS`:

```bash
$ sha512sum install-amd64-minimal-*.iso          # compute the SHA512 digest
$ cat install-amd64-minimal-*.iso.DIGESTS        # compare with the value in DIGESTS
```

To write it to a USB drive, follow the steps for the [CJK minimal install image](/iso/#usb).

