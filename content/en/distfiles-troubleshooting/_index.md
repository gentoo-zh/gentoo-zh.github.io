---
title: "distfiles troubleshooting"
description: "Diagnose overlay source download 404s and Manifest verification failures."
---

## distfiles {#distfiles}

<!-- anchor:distfiles-faq -->

### Can this mirror help when a distfile download returns 404? {#q15}

Only if this mirror has the required file. See [distfiles setup](/distfiles-setup/#setup) for mirror scope, `GENTOO_MIRRORS` ordering and fallback downloads.

### What if a downloaded file does not match the Manifest size or checksum? {#q16}

Upstream may have replaced the file at the same URL; regenerating the digest alone is insufficient. [This happened to circuitjs1-bin](https://github.com/gentoo-zh/overlay/issues/11038); update the ebuild, then build and verify the new version.
