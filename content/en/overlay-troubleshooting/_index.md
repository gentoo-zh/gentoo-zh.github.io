---
title: "Overlay troubleshooting"
description: "Resolve gentoo-zh overlay sync URL problems."
---

## Overlay {#overlay}

### How does the gentoo-zh overlay relate to the official Portage tree? {#overlay-vs-gentoo}

An overlay is an extra package source layered on the official Portage tree. It holds packages the official tree lacks: input methods, fonts, dictionaries, and newer or patched versions. See [Overlay setup](/overlay/) for installation and testing keywords.

### Do the old overlay sync URLs still work? {#overlay-sync}

Since October 2025, Gentoo no longer provides cache mirrors for third-party repositories. Update the sync source if you added gentoo-zh before then. The old `microcai/gentoo-zh` URL redirects to `gentoo-zh/overlay`; update manually configured remotes too.

See the [Overlay setup](/overlay/#manual-config), [cache mirror retirement notice](/posts/2025-10-07-thirdparty-repo-mirror-removal/) and [repository migration record](/posts/2026-07-02-gentoo-zh-repo-migration/).
