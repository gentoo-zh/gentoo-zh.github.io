---
title: "Prefix mirror setup"
description: "Choose mirrors for Bootstrap and the EPREFIX environment"
setupHint: "The selected mirror supplies the URLs in this page’s configuration."
---

Before running the Bootstrap script, choose a mirror and set these environment variables:

<!-- slot:setup -->

```bash
$ export GENTOO_MIRRORS="https://distfiles.gentoo.org"
$ export SNAPSHOT_URL="https://distfiles.gentoo.org/snapshots"
```

After Bootstrap completes, replace `/etc` with `$EPREFIX/etc` when changing Gentoo Portage and distfiles mirrors. `GNU_URL` points at a mirror of GNU software; take the address from that mirror’s GNU help page.
