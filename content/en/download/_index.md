---
title: "Download"
---

Installing Gentoo requires installation media. The Gentoo-zh Community maintains one amd64 installation image, listed below; for the official media, pick the nearest mirror from the list further down.

{{< callout type="info" >}}
**Apple Silicon Macs (M1 / M2)** can't use the standard amd64 images listed on this page — see [Installing Gentoo Linux on an Apple Silicon Mac](/posts/2025-10-02-gentoo-m-series-mac/).
{{< /callout >}}

## CJK minimal image {#live-iso}

A third-party amd64 minimal installation medium, built by Catalyst from the official Release Engineering specs. The kernel carries the cjktty patch, so the console displays CJK text, and ZFS is supported. The image is rebuilt weekly; downloads, checksums and every mirror directory live on the download site.

{{< hextra/hero-button text="Download the CJK minimal image" link="https://distfiles.gentoozh.org/iso?lang=en" style="margin-top:1.25rem;margin-bottom:.5rem" >}}
{{< hextra/hero-button text="Source repository" link="https://github.com/gentoo-zh/gentoo-cjk-livecd" style="margin-top:1.25rem;margin-bottom:.5rem;margin-left:.5rem;background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor" >}}

{{< callout type="info" >}}
Maintenance of the Gig-OS desktop image is paused because build machine resources are limited.
{{< /callout >}}

## Mirrors

Every node below carries official installation media for amd64 / x86 / arm64 and other architectures. Pick the nearest one by region for a faster download:

{{% gz-table %}}
| Mirror | Region | Download URL (releases/) |
| --- | --- | --- |
| Tsinghua TUNA | North China · Beijing | <https://mirrors.tuna.tsinghua.edu.cn/gentoo/releases/> |
| BFSU | North China · Beijing | <https://mirrors.bfsu.edu.cn/gentoo/releases/> |
| USTC | East China · Hefei | <https://mirrors.ustc.edu.cn/gentoo/releases/> |
| ZJU | East China · Hangzhou | <https://mirrors.zju.edu.cn/gentoo/releases/> |
| NJU | East China · Nanjing | <https://mirrors.nju.edu.cn/gentoo/releases/> |
| SDU | East China · Qingdao | <https://mirrors.sdu.edu.cn/gentoo/releases/> |
| HUST | Central China · Wuhan | <https://mirrors.hust.edu.cn/gentoo/releases/> |
| SUSTech | South China · Shenzhen | <https://mirrors.sustech.edu.cn/gentoo/releases/> |
| HIT | Northeast China · Harbin | <https://mirrors.hit.edu.cn/gentoo/releases/> |
| LZU | Northwest China · Lanzhou | <https://mirror.lzu.edu.cn/gentoo/releases/> |
| Alibaba Cloud | Nationwide · CDN | <https://mirrors.aliyun.com/gentoo/releases/> |
| NetEase 163 | Nationwide · CDN | <https://mirrors.163.com/gentoo/releases/> |
| CERNET | Nationwide · nearest | <https://mirrors.cernet.edu.cn/gentoo/releases/> |
| CICKU | Hong Kong | <https://hk.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | Hong Kong | <https://hippocamp.cn.ext.planetunix.net/pub/gentoo/releases/> |
| xTom | Hong Kong | <https://mirror.xtom.com.hk/gentoo/releases/> |
| Rackspace | Hong Kong | <https://mirror.rackspace.com/gentoo/releases/> |
| aditsu | Hong Kong | <http://gentoo.aditsu.net:8000/releases/> (HTTP) |
| NCHC | Taiwan | <http://ftp.twaren.net/Linux/Gentoo/releases/> |
| CICKU | Taiwan | <https://tw.mirrors.cicku.me/gentoo/releases/> |
| Freedif | Singapore | <https://mirror.freedif.org/gentoo/releases/> |
| CICKU | Singapore | <https://sg.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | Singapore | <https://enceladus.sg.ext.planetunix.net/pub/gentoo/releases/> |
{{% /gz-table %}}

{{% details title="Official media and architectures" %}}

**Official download page**: <https://www.gentoo.org/downloads/>

- **Minimal Installation CD** — a minimal install disc, suited to experienced users
- **LiveGUI** — a Live system with a graphical interface, suited to new users
- **Stage3** — a pre-compiled minimal userspace that includes the full toolchain and Portage; the standard starting point for building from source

Architectures: amd64 (the most common), x86, arm64, arm — see the official download page for others.

{{% /details %}}

{{% details title="Which files to download, and how to verify them" %}}

Under the mirror's `releases/`, pick your architecture (e.g. `amd64/`), then:

- **Install ISO**: grab `install-amd64-minimal-*.iso` + `.DIGESTS` from `autobuilds/current-install-amd64-minimal/`; for the graphical version, take `livegui-amd64-*.iso` from `current-livegui-amd64/`
- **Stage3**: grab `stage3-amd64-*.tar.xz` + `.DIGESTS` from `autobuilds/current-stage3-amd64-*/`

After downloading, verify against the DIGESTS file:

```bash
sha512sum install-amd64-minimal-*.iso          # compute the SHA512
cat install-amd64-minimal-*.iso.DIGESTS        # compare with the value in DIGESTS
```

{{% /details %}}

## Next steps

Once the system is installed, point Portage at mirrors closer to you (git / rsync / distfiles) — see the **[mirror list](/mirrorlist/)**; for the installation walkthrough, follow the **[official Gentoo Handbook (AMD64)](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation)**.
