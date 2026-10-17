---
title: "Binary package signatures"
description: "Download the gentoo-zh signing key and configure global verification and local signing"
---

To enable binary packages for the first time, choose a channel and complete the three steps in [Binary package setup](/binpkg-setup/).

## Get the key without the sec-keys package {#key-download}

Download the key file with curl or wget, then point the `--import` path in the [key import step](/binpkg-setup/#import-key) at it. The download needs no root.

```sh
$ curl -O https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

```sh
$ wget https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

## Global signature verification {#verification}

See [Binary package setup](/binpkg-setup/#setup) for key import and remote repository verification settings.

Global `FEATURES="binpkg-request-signature"` overrides verification settings in `binrepos.conf` and requires valid, trusted signatures on all binary packages, including local builds.

## Sign local builds {#local-signing}

For local builds, enable `FEATURES="binpkg-signing"` and configure `BINPKG_GPG_SIGNING_KEY` and `BINPKG_GPG_SIGNING_GPG_HOME`.

When signing with the local key created by getuto in `/etc/portage/gnupg`, provide GnuPG with the passphrase stored in that directory’s `pass` file; the default signing command does not read it automatically.
