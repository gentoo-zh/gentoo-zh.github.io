---
title: "Migrating the Site from Jekyll to Hugo"
description: "After taking over maintenance in 2025, I moved the site from Jekyll to Hugo—faster builds, less deployment hassle. A quick note on why we switched and what got moved."
date: 2025-11-18
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

With the blessing of founder [@biergaizi](https://github.com/biergaizi), [@Zakkaus](https://github.com/zakkaus) took over day-to-day maintenance of this site in 2025 and migrated it from Jekyll to Hugo.

## Why Switch to Hugo

Jekyll needs a Ruby environment, builds are on the slow side, and its theme scene isn't as lively as it used to be. Hugo is a single Go binary—builds are fast, deployment is simple, and multilingual support is built in. We went with the [Blowfish](https://blowfish.page/) theme.

## What Got Migrated

- The `_posts` directory moved to Hugo's Page Bundles (`content/posts/<slug>/index.zh-cn.md`)
- Front matter went from YAML to TOML
- Simplified and Traditional Chinese live side by side (zh-CN / zh-TW)
- Author data got pulled together under `data/authors/`
- Deployment moved to GitHub Actions, with the contributor list refreshed automatically on a schedule

> Note: that's the layout from the original Jekyll → Hugo migration. After the site [migrated to Hextra](/posts/2026-05-29-migrate-to-hextra/) in 2026 it changed again: front matter is all YAML now, content is split into per-language directories (`content/zh-cn/`, `content/zh-tw/`, files all named `index.md`), and author credits moved into the front matter as a map (no more `data/authors/`).

## Feedback

- Telegram group: [@gentoo_zh](https://t.me/gentoo_zh)
- Telegram channel: [@gentoocn](https://t.me/gentoocn)
- File an Issue / PR: [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io)

Thanks to [@biergaizi](https://github.com/biergaizi) and [@zhcj](https://github.com/zhcj) for founding and long maintaining the Gentoo Chinese Community, and to the developers of the Blowfish theme.
