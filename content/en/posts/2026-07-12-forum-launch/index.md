---
title: "The Community Forum Is Now Live"
description: "The Gentoo Chinese community forum at forum.gentoozh.org is now live: boards by topic, automatic Simplified/Traditional switching, Chinese search and message bridging, plus the server security setup and a call for moderators."
date: 2026-07-12
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
├── Disk encryption & auto-unlock
│   ├── LUKS2 full-disk encryption (AES-256-XTS + Argon2id)
│   ├── Network-bound auto-unlock (Clevis + Tang · McCallum-Relyea)
│   │   ├── Key rebuilt at boot to unlock the disk — never stored on disk, no TPM
│   │   └── Several mutually-trusted Tang nodes; any one online is enough to auto-unlock
│   └── dropbear-initramfs (manual remote unlock over SSH · fallback)
├── High availability & self-healing
│   ├── NVMe block storage · CEPH 3× replication
│   ├── Confidential-computing VMs can't live-migrate, so host maintenance forces a reboot (this bit us once)
│   └── Home-grown self-healing: auto-unlock + a cross-node watchdog → auto power-on, auto-decrypt, service back within minutes, hands-free
├── Network
│   ├── 80 / 443 open only to Cloudflare (firewall allowlist)
│   ├── Authenticated Origin Pulls (mTLS origin auth — bypass Cloudflare and hit the origin directly, and you get nothing)
│   ├── Cloudflare (CDN / WAF / L7 DDoS)
│   └── Datacenter L4 DDoS mitigation (best-effort — it is Singapore, after all)
├── Access & account
│   ├── IPv4 / IPv6 dual-stack
│   ├── Static reserved IP
│   └── Cloud-console 2FA
├── Monitoring & self-healing (dual-site active-active)
│   ├── Two Prometheus / Grafana / Alertmanager clusters watching each other, deduped (across failure domains)
│   ├── Host metrics + website uptime probes + SSL-expiry monitoring
│   ├── Real-time Telegram alerts · public status page status.gentoozh.org (zh-Hans / zh-Hant / en)
│   └── Auto-upgrade Discourse early Sunday (~3-min maintenance window)
└── Backups
    ├── Automated cloud backups · VM snapshots
    ├── Cloudflare R2 off-site backup (weekly / monthly, separate encryption keys · IP allowlist)
    └── GFS rotation (7 daily / 4 weekly / 3 monthly)
```
> ~~As long as CF doesn't get hacked, we should be fine.~~

A couple more words on the "auto-decrypt" and monitoring we added. Full-disk LUKS used to need someone to SSH in and type a passphrase to unlock — so the moment a confidential-computing box got rebooted by host maintenance, it just sat there waiting for a human (yes, this bit us once). Now it uses **Clevis + Tang** network-bound unlock: at boot the decryption key is recomputed from several mutually trusted nodes (the McCallum–Relyea protocol) — the key never touches the disk and isn't kept in a TPM, and any one node being online is enough to unlock. Paired with a cross-node watchdog, "host-maintenance reboot → auto power-on + auto-decrypt + service restored" now happens entirely hands-free. dropbear remote manual unlock is still there as a fallback.

Monitoring also went from a single-box probe to **two off-site Prometheus/Alertmanager stacks watching each other with cluster dedup** — if either one (along with its datacenter) goes down, the other still fires alerts, so you never get "monitoring and service going silent together." Hosts, the uptime of all four sites, and SSL expiry are all watched; alerts hit Telegram in real time, and status is mirrored publicly at [status.gentoozh.org](https://status.gentoozh.org).

And to answer the question we'll definitely get: a forum for the Gentoo community that doesn't run Gentoo itself? For now the scale is just too small, and this VPS is pretty ordinary, so for convenience — and to get the forum running solidly first — we went with Debian. It's a tradeoff, and if we grow later we'd like to migrate it over. ~~The other reason is that I don't like using binpkgs.~~

We'll keep tidying up the boards and the bridging so it feels nicer to use. And as we get bigger, we'll beef up the hardware, failover, and backups bit by bit.

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

For the forum's early build, thanks to [Yiyun](https://github.com/lilydjwg), Woniu, [Locez](https://github.com/locez), and the other gurus for their pointers, and to Clover for writing the forum rules.

## Moderators Wanted

We're recruiting forum moderators.
(For the off-topic, gaming, general, and hardware boards, you don't even need to be a Gentoo Linux user.)

How to apply:
- Post an application on the forum's [Site Admin board](https://forum.gentoozh.org/c/15).
- Or reach us over chat (main groups/channels only: [IRC](https://web.libera.chat/#gentoo-zh), [Telegram](https://t.me/gentoo_zh), [Matrix](https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org)) — see the [About page](/about) for details.
