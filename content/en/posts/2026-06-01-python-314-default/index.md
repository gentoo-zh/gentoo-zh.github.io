---
title: "Python 3.14 Becomes the Default (2026-06-01)"
description: "Gentoo has switched the system default Python from 3.13 to 3.14. Most people don't need to do anything — just let it roll through on the next upgrade. If you want to control the timing, or hit a USE / dependency error, here's what to do."
date: 2026-06-01
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

**As of 2026-06-01, Gentoo switched the system default Python from 3.13 to 3.14.**

If you've never set `PYTHON_TARGETS` or `PYTHON_SINGLE_TARGET` yourself (most people haven't), there's basically nothing to do — the next time you run `emerge` to upgrade, the system will start switching to 3.14 on its own.

> Official announcement: [Python 3.14 to become the default on 2026-06-01](https://www.gentoo.org/support/news-items/2026-04-16-python3-14.html) (posted 2026-04-16; you can also read it locally with `eselect news read`).

## Most people: just let it upgrade

Plenty of packages are still being ported to 3.14, so **there's no rush** — let it switch over gradually as part of your normal `@world` upgrades.

Here's how the upgrade works: each package switches to the new Python as it gets rebuilt. So a chain of interdependent packages all has to support 3.14 before the upgrade can go through, and along the way a command or two may **temporarily** fail to find a dependency (programs that are already running are usually fine). That's all normal for the transition, and it sorts itself out once everything has rebuilt.

## If you've set a Python version in make.conf, remove it first

{{< callout type="warning" >}}
If you've put `PYTHON_TARGETS` or `PYTHON_SINGLE_TARGET` in `make.conf`, **remove them first** — upstream recommends against setting Python versions in make.conf, because it overrides the per-package defaults that should apply. Everything below assumes you put the config in the file **`/etc/portage/package.use/python`** (`package.use` is a directory; the filename is up to you — here it's `python`).
{{< /callout >}}

## If you want to control the timing

Pick one of these.

**① Go with the default, upgrade automatically**

Set nothing, and the system handles it. If it gets stuck partway, run the upgrade commands below by hand.

**② Hold off, stay on 3.13 for now**

Put this in `/etc/portage/package.use/python`:

```
*/* PYTHON_TARGETS: -* python3_13
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

This only buys you time — you'll have to migrate eventually.

**③ Switch to 3.14 right now**

Put this in `/etc/portage/package.use/python`:

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

Then run the upgrade commands below. Once the default officially flips, remember to **remove** these two lines, or they'll block the automatic upgrade to 3.15 later on.

**④ The more cautious, step-by-step way**

Keep both 3.13 and 3.14 enabled first, then drop 3.13. The affected packages get built twice, so it's slower, but less likely to break partway.

Step one — put this in `/etc/portage/package.use/python` (both enabled) and run one round of the upgrade commands:

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

Step two — change it to this and run another round:

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

Step three — keep only 3.14 and upgrade one last time:

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

## Upgrade commands

When you switch versions, the old 3.13 has to be cleared out of the whole dependency tree **at once**; if some straggler package is left behind, you'll get dependency conflicts. So the upgrade should go through `--deep --changed-use @world`, and clear out orphaned packages first:

```
emerge --depclean
emerge -1vUD @world
emerge --depclean
```

## Python 3.11 and PyPy 3.11 are being removed too

This round also drops support for `python3_11` and PyPy 3.11 (`pypy3_11`). PyPy doesn't have a Python 3.12-compatible release yet, so Gentoo is dropping PyPy support for now and will bring it back once a new version ships.

## If an upgrade reports a USE conflict

During the transition, if a package hasn't been ported to 3.14 yet, a `@world` upgrade may report `The following USE changes are necessary to proceed`. This is usually temporary: either pin the Python version for that package as in **②** above, or wait a few days for the packages to catch up, and it'll go through.

Questions are welcome on [Telegram](https://t.me/gentoo_zh) or [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io).
