---
title: "Moving the Community's Main Domain to gentoozh.org"
description: "Moving the Community's Main Domain to gentoozh.org"
date: 2026-07-01
featured: true
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover (reviewed by)
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

The Gentoo-zh Community website officially moves to **gentoozh.org** today. The forum (forum.gentoozh.org) is up as well, and should go live around July 5. The old addresses (gentoo.org.cn, gentoocn.org) all 301 permanent-redirect, so bookmarks and existing links won't break, but it's best to update them soon.

## More Than Just a New Domain

The domain migration wraps up a recent round of consolidation. The community was quiet for more than ten years, and a lot had piled up: seven or eight Telegram and QQ groups, three or four domains, an official site nobody had touched in years, and no unified way to manage permissions on the gentoo-zh GitHub organization. Scattered groups split the community and made talking to each other hard.

We recently sorted these out:

- Rebuilt the site
- Gained control of the gentoo-zh org's permissions
- Bridged IRC and Matrix
- Unified the various groups
- Centralized control of the domains
- Coordinating the Chinese translation of the Gentoo Wiki

The domain is the most important piece. Things have moved quickly these last two weeks, with a lot of announcements. Thanks for bearing with us.

## Why gentoozh.org

The old domains came with compliance requirements. Standing up services like a forum, Matrix, or a download site meant going through a process that is hard for a volunteer project like ours to complete. gentoozh.org is an international domain, without that restriction, and has always been in our hands. This time [@zakkaus](https://github.com/zakkaus) will hand out management access for the domain and related services to the people responsible for each, so control doesn't get lost again.

The zh in the domain comes from ISO 639, the code for the Chinese language. It identifies a language, not a country or any particular region. The cn, by contrast, is an ISO 3166 country code, and its scope is actually narrower. On top of that, gentoo-zh came from the old gentoo-tw and gentoo-china [when the two communities merged](https://code.google.com/archive/p/gentoo-taiwan/issues/2). archlinuxcn actually calls itself the "Arch Linux Chinese community" too; the cn there is just a name left over from history. People there have suggested switching to zh, but it's too big to change now. We don't carry that kind of baggage, so since we're changing it, we'll do it right.

## Moving Site Hosting to Cloudflare

By the way, the site has moved from GitHub Pages to Cloudflare Workers (static asset hosting), on the Workers Paid plan.

- Static asset requests on Cloudflare are free and unlimited, which is easy on a community site.
- GitHub Pages has a set of [soft limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) (repo and site size, monthly bandwidth, build frequency, and so on), and once the site grows a bit they start to pinch.
- Speed is about the same as GitHub Pages, but Workers Paid is more flexible: we control caching and response headers ourselves, and adding edge logic later is easy. Overall it works better and fits where the community is heading.

For site maintenance or bug reports, open an issue on [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io), or email zakk@gentoozh.org.

## Thanks

gentoo.org.cn has been held by a teacher for a long time, kept renewed through the ten-plus years the community lay quiet. The old domain keeps its redirect, so nothing will break.

Thanks as well to [Qingfeng](/contributors/zhcj/) and [Lan](https://packages.gentoo.org/maintainer/dlan@gentoo.org) for their guidance. The decision to consolidate the domains this time came largely from Qingfeng's suggestion. He [founded this community](/posts/2014-08-24-gentoo-zh-community-under-construction/) in 2014; without him there would be no gentoo-zh to begin with.

Finally, thanks to David K. Chau, [Yiyun](https://github.com/lilydjwg), Woniu, and Huahuo for their comments on the post, and to Clover for the review.

## Impact

Almost no impact. All old addresses will redirect to the new ones:

- `https://gentoo.org.cn` → `https://gentoozh.org`
- `https://www.gentoo.org.cn` → `https://gentoozh.org`
- `https://forum.gentoo.org.cn` → `https://forum.gentoozh.org`
- `https://distfiles.gentoocn.org` → `https://distfiles.gentoozh.org`
- `https://gentoocn.org` → `https://gentoozh.org`

If you spot the old domain still lingering somewhere, feel free to open an issue or send a PR on [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io), or let us know in the Telegram or Matrix groups.

---

## Hopefully this is where gentoo-zh sets down its historical baggage and starts fresh, and where we all pull together

<small>01/07/2026</small>

## Further Reading

- [Community domain and infrastructure discussion](https://github.com/gentoo-zh/gentoo-zh.github.io/issues/9)
