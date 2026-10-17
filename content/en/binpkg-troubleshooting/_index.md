---
title: "Binary package troubleshooting"
description: "Diagnose binary package compatibility, key import failures and source fallbacks."
---

## Binary packages {#binpkg}

<!-- anchor:usage -->

### Does it work on both OpenRC and systemd? {#q3}

Compatibility depends on whether the package’s USE flags and dependencies match your system. Both channels build with a `desktop/systemd` profile, without separate OpenRC artifacts. For USE mismatches, see [source fallback troubleshooting](#q1).

### How do I fix no writable keyring found when importing the key? {#binpkg-keyring}

Run `getuto` first, then follow all commands in the [key import step](/binpkg-setup/#import-key). That step initializes the directory, Portage Local Trust Key, passphrase and `trustdb`.

<!-- anchor:troubleshooting -->

### Why does emerge still compile from source after binary package setup? {#q1}

Enabling binary packages does not guarantee a usable binary for every package. When USE flags do not match, a normal Portage installation falls back to an available source ebuild; dependency resolution also depends on your system. Check the [getbinpkg configuration](/binpkg-setup/#setup), [channel](/binpkg-setup/#channel) and [package list](/packages/); check [service status](/status/) for service failures.

### Could a binary package fail to run on my CPU? {#q4}

Yes. Both channels use `CFLAGS="-O2 -pipe -march=x86-64 -mtune=generic"`, without `-march=native`, but these flags cannot change upstream prebuilt objects or libraries bundled by an ebuild. Portage does not compare `CFLAGS` when selecting a binary package, so selection does not guarantee CPU compatibility.
