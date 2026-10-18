---
title: "Gentoo is dropping cache mirrors for third-party repos (gentoo-zh users, update your sync source)"
date: 2025-10-07
tags: ["announcement"]
description: "Starting 2025-10-30, Gentoo no longer provides official cache mirrors for third-party overlays like gentoo-zh; these overlays now sync straight from their GitHub upstream. If you added gentoo-zh before, just update your sync URI as described here."
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

Per the [official Gentoo news item](https://www.gentoo.org/support/news-items/2025-10-07-cache-enabled-mirrors-removal.html), Gentoo has stopped offering cache mirrors for third-party repositories. Starting 2025-10-30, the mirror config for all third-party repos (gentoo-zh included) gets dropped from the official repository list.

## What this means

- `eselect repository`, `layman` and similar tools keep working as usual
- Gentoo no longer mirrors third-party repos; they now sync straight from upstream (GitHub)
- Official repos (`::gentoo`, `::guru`, `::kde`, `::science`) are unaffected and still go through the mirrors

## If you already added gentoo-zh

Just update the sync URI — remove it and re-enable it, and the correct upstream source gets picked up automatically:

```bash
# List the installed repositories
# eselect repository list -i

# Remove the old config
# eselect repository remove gentoo-zh

# Re-enable it (automatically uses the correct upstream source)
# eselect repository enable gentoo-zh
```

Then `emerge --sync gentoo-zh` as usual.

Adding gentoo-zh for the first time? You're not affected — just enable it normally from the [Install the overlay](/overlay/) guide. If connecting straight to GitHub from mainland China is slow for you, use the [mainland China Git mirror](/mirrorlist/#list).
