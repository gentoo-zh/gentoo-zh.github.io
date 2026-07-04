---
title: "FAQ"
description: "Common questions for newcomers to the Gentoo-zh Community: where to start, how the overlay relates to the official tree, mirror speedups, where to ask, and how to contribute."
---

The questions newcomers ask most. For more detailed install steps, see the [official Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation).

{{% details title="I'm new here. Where do I start? Official Gentoo or the community Live ISO?" %}}

- **Want to build everything from scratch and really understand it**: following the [official Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation) is the safest bet.
- **Want to get going fast and skip the hassle**: grab the community's [KDE desktop Live ISO](/download/#live-iso) — out-of-the-box, with a Chinese environment already set up.
- Once your system is up, [add the gentoo-zh overlay](/overlay/) to pull in packages the official tree doesn't carry, like Chinese / CJK software.

{{% /details %}}

{{% details title="How does the gentoo-zh overlay relate to the official Portage tree?" %}}

An overlay is an extra package source layered on top of the official Portage tree — anything the official tree doesn't ship (Chinese input methods, fonts, dictionaries, plus newer or patched versions of packages) lives here. One catch: gentoo-zh packages are all keyworded `~arch` (testing), never stable, so you can't install them straight onto a stable system. To accept the testing keyword before installing, see the [Overlay page](/overlay/).

{{% /details %}}

{{% details title="Downloading or syncing is too slow. What can I do?" %}}

When a direct connection to GitHub / the official distfiles is slow, point the overlay sync source and distfiles at a mirror inside mainland China (Chongqing University, Nanjing University, and others — all tested and working). For the exact addresses, see the [Overlay page](/overlay/) and the [mirror list](/mirrorlist/).

{{% /details %}}

{{% details title="Where do I go when I run into trouble?" %}}

- **Telegram group** [@gentoo_zh](https://t.me/gentoo_zh) — day-to-day help
- **Telegram channel** [@gentoocn](https://t.me/gentoocn) — announcements
- **Overlay bugs**: file an issue at [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues)
- More channels (IRC / Matrix, etc.) on the [About page](/about/)

{{% /details %}}

{{% details title="I want to pitch in. How do I get started?" %}}

Two tracks: send packages / fix bugs for the **overlay** (that's where the [contributors wall](/contributors/) comes from), or write articles / help with translations for the **website**. The full workflow is in the [contributing guide](/contributing/).

{{% /details %}}
