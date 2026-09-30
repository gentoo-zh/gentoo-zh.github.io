---
title: "Infrastructure costs"
description: "The specification, price and running total for each server the Gentoo Chinese Community runs; the numbers update with every site build."
---

Among the servers and services below, the build server is sponsored by [OSUOSL](https://osuosl.org/); [Zakk](/contributors/zakkaus/) pays for the rest personally, and there is no community fund. Two more domains are paid for by other members and are listed at the end.

## Machines

{{< gz-costs >}}

## Spending

{{< gz-costs table="ledger" >}}

## How the totals are calculated

- Running totals count from the billing start date to today: monthly items by the number of months started, yearly items by the years paid. A yearly item is paid in full up front, so it is not spread across the days.
- The exchange rates come from the download server's actual annual charge: 100 EUR is 115.24 USD, 777 CNY, 3713.80 TWD or 900 HKD. The items are billed in different currencies, so the table converts everything to USD before adding it up.

## What each item pays for

- **Download server**: the origin behind [distfiles.gentoozh.org](https://distfiles.gentoozh.org/). It serves the overlay's distfiles and binary packages, and is the rsync source the university mirrors pull from.
- **Build server**: builds the overlay's [binary packages](/posts/2026-07-29-binhost-launch/) nightly. Since 2026-09-27 a server sponsored by OSUOSL does this at no cost. The self-owned 80-thread server was retired on 2026-09-29, and the tables keep what it cost until then.
- **Forum server**: runs [forum.gentoozh.org](https://forum.gentoozh.org/).
- **Matrix and bridge server**: runs the Matrix homeserver and forwards messages between Telegram, IRC and Matrix.
- **High-availability node**: probes the mirrors and the sites from another facility, so it does not fail together with the main machines.
- **Domains**: [gentoozh.org](/posts/2026-07-01-domain-migration/) and gentootw.org, both registered at Porkbun.
- **Cloudflare Workers**: hosts the site and the mirror landing pages; the paid plan buys request quota and CPU time.
- **Email sending**: the forum sends its sign-up and notification mail through Hostinger rather than a self-hosted SMTP server, because mail from a self-hosted IP rarely reaches the big inboxes.
- **Monitoring and alerting**: runs Grafana and Alertmanager, with the status published at [status.gentoozh.org](https://status.gentoozh.org/).

## Paid for by other members

The items below are not in the tables above; the people named pay for them:

- **gentoocn.org**: renewed by [Clover](/contributors/simplewrite/).
- **gentoo.org.cn**: renewed by a long-time community member who prefers not to be named.
- **The earlier build machine**: provided by [Liang Yongxiang](/contributors/liangyongxiang/) from 2022-08-09 to 2026-04-30, at 37.30 EUR a month — 45 months, 1678.50 EUR in total, about 1934.30 USD. Binary package builds now run on the OSUOSL-sponsored build server.
- **The earlier download site**: the server was provided by [peeweep](/contributors/peeweep/). It has been shut down, and the Live ISO and distfiles moved to the download server listed above.

## How to help

The community does not accept donations. OSUOSL provides the binhost builder and the US mirror for free; to give money, [donate to OSUOSL](https://osuosl.org/donate/).

The [contributing guide](/contributing/) covers submitting ebuilds, fixing bugs and improving documentation.
