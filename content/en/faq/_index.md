---
title: "FAQ"
description: "Community help and getting started, with an index of setup, troubleshooting and mirror questions."
anchors:
  "overlay": "/overlay-troubleshooting/#overlay"
  "overlay-vs-gentoo": "/overlay-troubleshooting/#overlay-vs-gentoo"
  "overlay-sync": "/overlay-troubleshooting/#overlay-sync"
  "distfiles": "/distfiles-troubleshooting/#distfiles"
  "distfiles-faq": "/distfiles-troubleshooting/#distfiles-faq"
  "q15": "/distfiles-troubleshooting/#q15"
  "q16": "/distfiles-troubleshooting/#q16"
  "q14": "/overlay-contributing/#restrict-mirror"
  "binpkg-channel": "/binpkg-setup/#channel"
  "q13": "/binpkg-setup/#channel"
  "q2": "/binpkg-setup/#setup"
  "q6": "/binpkg-setup/#setup"
  "binpkg": "/binpkg-troubleshooting/#binpkg"
  "usage": "/binpkg-troubleshooting/#usage"
  "q3": "/binpkg-troubleshooting/#q3"
  "q1": "/binpkg-troubleshooting/#q1"
  "q4": "/binpkg-troubleshooting/#q4"
  "binpkg-keyring": "/binpkg-troubleshooting/#binpkg-keyring"
  "troubleshooting": "/binpkg-troubleshooting/#troubleshooting"
  "q5": "/binpkg-signing/#verification"
  "signing": "/binpkg-signing/#verification"
  "key-download": "/binpkg-signing/#key-download"
  "q11": "/binpkg-signing/#key-download"
  "q7": "/package-status/#scope"
  "q10": "/package-status/#scope"
  "package-status": "/package-status/#status-help"
  "q12": "/package-status/#status-help"
  "mirrors": "/mirrorlist/#list"
  "q8": "/mirrorlist/#list"
  "cernet-redirect": "/mirrorlist/#cernet-redirect"
  "mirror-sync": "/mirrorlist/#mirror-sync"
  "q9": "/mirrorlist/#own"
questions:
  - title: "How should I start using Gentoo?"
    href: "#where-to-start"
  - title: "Where can I get technical support?"
    href: "#where-to-ask"
  - title: "How can I contribute?"
    href: "#how-to-contribute"
  - title: "How does the gentoo-zh overlay relate to the official Portage tree?"
    href: "/overlay-troubleshooting/#overlay-vs-gentoo"
  - title: "Do the old overlay sync URLs still work?"
    href: "/overlay-troubleshooting/#overlay-sync"
  - title: "How do I prevent automatic mirroring of a package's distfile?"
    href: "/overlay-contributing/#restrict-mirror"
  - title: "Can this mirror help when a distfile download returns 404?"
    href: "/distfiles-troubleshooting/#q15"
  - title: "What if a downloaded file does not match the Manifest size or checksum?"
    href: "/distfiles-troubleshooting/#q16"
  - title: "Should I choose stable or unstable?"
    href: "/binpkg-setup/#channel"
  - title: "Where do I configure binary packages?"
    href: "/binpkg-setup/#setup"
  - title: "Does it work on both OpenRC and systemd?"
    href: "/binpkg-troubleshooting/#q3"
  - title: "Which binary packages does this host publish?"
    href: "/package-status/#scope"
  - title: "What do the statuses in the package list mean?"
    href: "/package-status/#status-help"
  - title: "How do I verify that a downloaded binary package came from this host unchanged?"
    href: "/binpkg-signing/#verification"
  - title: "How do I get the public signing key without installing the sec-keys package?"
    href: "/binpkg-signing/#key-download"
  - title: "How do I fix no writable keyring found when importing the key?"
    href: "/binpkg-troubleshooting/#binpkg-keyring"
  - title: "Why does emerge still compile from source after binary package setup?"
    href: "/binpkg-troubleshooting/#q1"
  - title: "Could a binary package fail to run on my CPU?"
    href: "/binpkg-troubleshooting/#q4"
  - title: "Which mirrors are available, and how do I configure them?"
    href: "/mirrorlist/#list"
  - title: "Why does Git report a redirect when using CERNET?"
    href: "/mirrorlist/#cernet-redirect"
  - title: "Why do mirrors have different versions?"
    href: "/mirrorlist/#mirror-sync"
  - title: "How do I set up my own mirror?"
    href: "/mirrorlist/#own"
---

<!-- slot:topics -->

## Community {#community}

### How should I start using Gentoo? {#where-to-start}

- To install step by step and understand each part, follow the [Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation).
- To read CJK text on the console while installing, use the community [CJK minimal install image](/iso/); the remaining steps follow the Handbook.
- After installing, [add the gentoo-zh overlay](/overlay/) for Chinese and CJK packages the official tree does not carry.

### Where can I get technical support? {#where-to-ask}

The chat channels (Telegram, Matrix, IRC) are listed on the [channels page](/channels/), and the [forum](https://forum.gentoozh.org/) takes questions too. Report overlay bugs at [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues).

### How can I contribute? {#how-to-contribute}

To submit packages or fixes to the overlay, or write posts and translations for the site, see the [contributing guide](/contributing/).

<!-- slot:legacy -->
