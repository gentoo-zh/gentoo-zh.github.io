---
title: "Migrating the Site Theme from Blowfish to Hextra"
description: "We switched this site's theme from Blowfish to Hextra: lighter, faster, and friendlier to docs and terminal browsers. Here's why we switched and what changed."
date: 2026-05-29
tags: ["website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

Last time we moved the site from Jekyll to Hugo. This time we've swapped themes again: from [Blowfish](https://blowfish.page/) to [Hextra](https://imfing.github.io/hextra/).

## Why Hextra

Blowfish does a lot, but for a community site that's mostly docs and tutorials it's a bit heavy: it loads a lot of scripts and styles above the fold, the page overhead runs high, and the default typography isn't clean enough for long reads.

Hextra is built on Tailwind CSS and made for docs and blogs:

- **Lighter and faster**: zero third-party requests (no external fonts / CDNs / trackers), around 50 KB (gzipped) of above-the-fold text assets; contributor avatars are auto-scaled to their display size, which cuts page overhead a lot;
- **Cleaner reading**: tidy heading hierarchy, line spacing, and code-block typography make long articles easier to read;
- Built-in **full-text search** (FlexSearch), dark mode, and a responsive layout;
- Pulled in via Hugo Modules, with no Node toolchain required.

## Main Changes

- Reworked home page: hero + quick links + latest posts + community contributors;
- Contributor list: pulls everyone with 5+ commits in the [gentoo-zh Overlay](https://github.com/gentoo-zh/overlay), shows their commit counts, sorts by commit count, and refreshes itself every month;
- Article pages show the author's avatar in the byline;
- Articles are now categorized with `tags`; `#tags` show up on article pages and lists, and you can click through to the `/tags/` aggregation page;
- The "Latest posts" section on the home page has an RSS feed; share a link to Telegram or a social platform and you get a branded preview card;
- The download page highlights the "Chinese-community-customized KDE desktop Live ISO", which newcomers can use out of the box;
- The whole site runs both Simplified and Traditional Chinese (zh-CN / zh-TW) side by side;
- Site-wide full-text search and dark mode.

## Friendly to Terminal Browsers (TUI)

lzamora70 suggested this in the [@talk_something](https://t.me/talk_something) group — a bit of a wild card who's nuked and remade their account more than once, so that handle may already be out of date — so we did a pass to make the site work well in terminal / text browsers. It is Gentoo, after all:

- Semantic HTML and a clean heading hierarchy, so the layout stays readable and links stay reachable in plain-text browsers like [lynx](https://lynx.invisible-island.net/) / [w3m](https://w3m.sourceforge.net/) / links;
- Every page has a "skip to content" link at the top, so you can jump past the nav and start reading right away;
- Every image has sensible alt text; decorative duplicates (the looping copies in the avatar wall, and the light/dark pair of logos) use empty `alt` so text browsers and screen readers don't read them out over and over;
- In text mode, the contributor avatar wall and article bylines list each person only once;
- Pair that with Hextra's "View as Markdown / Copy as Markdown" page menu and it's easy to grab a page's raw text with a script or an LLM.

Try it with `lynx https://gentoozh.org/`.

## Update: English on the public pages

After the migration we also added English to the public pages — about, download, mirror list, contributing and so on — for the gentoo-zh overlay's overseas users, so you can now switch between Simplified / Traditional / English. To be clear, **not every technical article is in English**; only the public pages are translated for now. The English was drafted with translation software and reviewed and polished by Claude Fable 5 (ultracode) — the best and most expensive model we could find to date — so there may still be rough edges; corrections on [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) are welcome.

## Feedback

- Telegram channel: [@gentoocn](https://t.me/gentoocn) · group: [@gentoo_zh](https://t.me/gentoo_zh)
- File an Issue / PR: [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io)

Thanks to the developers of the Blowfish and Hextra themes.
