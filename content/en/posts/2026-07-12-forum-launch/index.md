---
title: "The Community Forum Is Now Live"
description: "The Gentoo Chinese community forum at forum.gentoozh.org is now live: boards by topic, automatic Simplified/Traditional switching, Chinese search and message bridging, plus the server security setup and a call for moderators."
date: 2026-07-12
featured: true
tags: ["announcement"]
authors:
  - name: Zakk (layout, deploy, QA & writing)
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover (writing)
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

The Gentoo Chinese community forum is now live at **[forum.gentoozh.org](https://forum.gentoozh.org)**.
~~Actually it's been up for about a week already — I've been out and about, but with everything else going on, kicking back for a bit felt kind of nice, heh~~

## Why a Forum?

It's for people who'd rather not use the community's real-time chat, or who don't want to flood a group and would rather lay a question out in full. And it gives Chinese-speaking users a place to meet when the platforms they're on don't talk to each other.


## What's on the Forum?

- The boards are sorted by purpose: Getting Started, Installation & Configuration, Portage & Packages, Kernel & Hardware, Desktop & Applications, Networking, and Build Showcases — and gaming and off-topic chat get their own spots too.
- Both Simplified and Traditional Chinese interfaces are available, matched to your browser language automatically, with a manual toggle too. Traditional-Chinese users reading a Simplified post see it converted to Traditional on the fly with OpenCC — it doesn't touch what you actually write.
- Usernames can be in Chinese, and full-text Chinese search works.
- The News and Bug Tracker boards automatically pull in official Gentoo news, GLSA security advisories, Planet blogs, and new Bugzilla bugs. They stay out of the Latest list by default, so they don't crowd the feed or the posts we push out to chat.
- You can read posts and subscribe to RSS without registering.
- New-post alerts: the Gentoo Technical Discussion board pushes to the [main group](https://t.me/gentoo_zh); other boards push to the [chat group](https://t.me/talk_something); and both are bridged across to IRC and Matrix.
> If you have other ideas, or a board you'd like added, [tell us](#moderators-wanted).

## Server Security

While I'm at it, let me show off the forum server setup:

```text
Forum server · AMD EPYC Milan · Debian 13 · Singapore
├── Base specs
│   ├── 4 vCPU (EPYC Milan) · 8 GiB RAM
│   ├── 40 GiB NVMe (XFS, room to expand later)
│   └── Linux 6.12
├── Confidential computing (AMD SEV)
│   ├── AMD SEV (memory encryption)
│   ├── AMD SEV-ES (CPU register encryption)
│   ├── AMD SEV-SNP (memory integrity protection)
│   └── SEV-SNP remote attestation (proves it runs on genuine AMD hardware)
├── Disk encryption
│   └── LUKS2 (AES-256-XTS + Argon2id, remote unlock over SSH)
├── High availability (cloud-provided)
│   ├── Self-healing failover (if the host dies, it restarts on a healthy node on its own, no hands needed)
│   ├── NVMe block storage · CEPH 3× replication
│   └── Single node (small scale, no peer server yet — will buy one when we scale up!)
├── Network
│   ├── 80 / 443 open only to Cloudflare (firewall allowlist)
│   ├── Authenticated Origin Pulls (mTLS origin auth — bypass Cloudflare and hit the origin directly, and you get nothing)
│   ├── Cloudflare (CDN / WAF / L7 DDoS)
│   └── Datacenter L4 DDoS mitigation (best-effort — it is Singapore, after all)
├── Access & account
│   ├── IPv4 / IPv6 dual-stack
│   ├── Static reserved IP
│   └── Cloud-console 2FA
├── Monitoring & maintenance
│   ├── Resource alerts (CPU / disk / network, 5-minute granularity)
│   └── Auto-upgrade Discourse early Sunday (~3-min maintenance window)
└── Backups
    ├── Automated cloud backups · VM snapshots
    ├── Cloudflare R2 off-site backup (weekly / monthly, separate encryption keys · IP allowlist)
    └── GFS rotation (7 daily / 4 weekly / 3 monthly)
```
> ~~As long as CF doesn't get hacked, we should be fine.~~

And to answer the question we'll definitely get: a forum for the Gentoo community that doesn't run Gentoo itself? For now the scale is just too small, and this VPS is pretty ordinary, so for convenience we went with Debian. It's a tradeoff: get the forum running solid first, and if we grow later we'd like to migrate it over. ~~The other reason is that I don't like using binpkgs.~~

In the near term we'll keep refining the boards and the message bridging, smoothing out the day-to-day feel. Once we grow, we'll upgrade the hardware and shore up high availability and backups step by step.

## Rules and Limits

- When using the forum, follow the laws that apply where our domain registrar (Porkbun) and the site's CDN (Cloudflare) are based (the United States), where the forum server is (Singapore), and wherever you are. This is a community for Chinese speakers worldwide, not one tied to any single region — "local law" means the law where you yourself are.
- No pornographic content.
- No inappropriate content involving minors of any kind — text, images, or links alike. Post it and the account gets banned.
- No prohibited content, like glorifying violence, fraud, or selling banned goods.
- No personal attacks, harassment, or hate speech.
- No ads, spam, or commercial promotion.
- No impersonating others, hijacking accounts, or using bots to scrape or attack the forum.

For the full version, see the forum's [Terms of Service](https://forum.gentoozh.org/tos) and [Privacy Policy](https://forum.gentoozh.org/privacy).


## Thanks

For the forum's early build, thanks to Yiyun, Woniu, Mu, and the other gurus for their pointers, and to Clover for writing the forum rules.

## Moderators Wanted

We're recruiting forum moderators.
(For the off-topic, gaming, general, and hardware boards, you don't even need to be a Gentoo Linux user.)

How to apply:
- Post an application on the forum's [Site Admin board](https://forum.gentoozh.org/c/15).
- Or reach us over chat (main groups/channels only: [IRC](ircs://irc.libera.chat:6697/#gentoo-zh), [Telegram](https://t.me/gentoo_zh), [Matrix](https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org)) — see the [About page](/about) for details.
