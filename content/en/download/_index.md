---
title: "Download"
---

Before you install Gentoo, get your installation media sorted. The least hassle for newcomers is the Chinese community's Live ISO; if you'd rather use the official media, pick the nearest mirror from the list below.

{{< callout type="info" >}}
**Apple Silicon Macs (M1 / M2)** can't use the standard amd64 images listed on this page — see [Installing Gentoo Linux on an Apple Silicon Mac](/posts/2025-10-02-gentoo-m-series-mac/).
{{< /callout >}}

## Chinese Community Live ISO {#live-iso}

A **KDE Plasma 6 desktop Live ISO** put together by the Chinese community — Chinese-ready out of the box, three languages to pick from (Simplified / Traditional / English), Chinese input methods (fcitx5 + rime). A good way to get a feel for a Chinese Gentoo desktop first.

- **Download site**: <https://mirror.gentoozh.org/> (served from Cloudflare R2 — global edge, no bandwidth limits)
- **Backup repo**: <https://github.com/Gentoo-zh/Live-ISO> (community fork — build scripts and customizations all live here)
- **Login credentials**: user {{< copy "live" >}} / password {{< copy "live" >}} / Root {{< copy "live" >}}
- **Hardware requirements**: a 64-bit x86 CPU with AVX2 support (roughly post-2013 processors); older CPUs can't boot this image.
- **Update cadence**: recompiled and uploaded automatically every week, so it's always a fairly recent snapshot of the system; the download site only keeps the last few releases, so go by the actual filename on the site (`gig-os-DATE.iso`).
- **New-release alerts**: follow the Telegram channel <https://t.me/gentoomirror> for an automatic announcement whenever a weekly build goes live.

{{< callout type="warning" >}}
**Running in a VM?** The image is built for `x86-64-v3` and needs AVX2. **VirtualBox usually can't pass AVX2 through, so the image won't boot** — use **KVM (`-cpu host`), native Hyper-V, or VMware** instead, and confirm with `grep -o avx2 /proc/cpuinfo` inside the guest.
{{< /callout >}}

{{% details title="What's in this Live ISO (click to expand)" %}}

- **Boots in three languages** — pick Simplified / Traditional / English from the GRUB menu, and the desktop, Firefox, and input method all switch along with it.
- **Multiple boot modes** — besides the normal boot, there's "copy to RAM" (loads the whole disk into memory and runs from there, so you can pull the USB stick and it runs faster) and a "safe graphics mode" fallback, all available in three languages.
- **Chinese input methods: fcitx5 + rime** — Luna Pinyin (朙月拼音) by default; **right-click the input-method tray icon -> "Schema"** to switch to Zhuyin / Wubi86 / Cangjie / Cantonese Pinyin, and more.
- **Open-source / proprietary GPU drivers** — nouveau works plug-and-play by default; for newer cards (RTX 20/30/40/50) that need hardware acceleration, pick the "proprietary NVIDIA" boot entry, but **disable Secure Boot in the BIOS first** (the driver is unsigned and won't load otherwise). For stubborn cards that won't light up, fall back to "safe graphics mode".
- **Graphical installer (optional)** — double-clicking the "Install System" icon launches the Calamares graphical installer (it follows your chosen language) and clears up the live leftovers (boot-time autologin, etc.) after installing; for a proper install where you actually get to know the system, the official handbook is still the recommended route (see the notes below).
- **ZFS root + native encryption + ZBM boot (advanced)** — on the installer's partitioning page you can choose **ZFS** as the filesystem; tick "Encrypt" to enable **ZFS native encryption** (aes-256-gcm, passphrase-unlocked), booted by **ZFSBootMenu** (GRUB can't read ZFS pools that use newer features / native encryption, so a ZFS root uses ZBM instead). The default filesystem is xfs; btrfs / ext4 / ZFS are all selectable on the partitioning page.
- **Per-machine tuning** — once the system is installed, the `CPU_FLAGS_X86` compile flags are generated automatically based on your CPU.

For the full feature list and configuration notes, see the **[mirror site's "About" page](https://mirror.gentoozh.org/about.html)**.

{{% /details %}}

## Mirrors

Every node below has been tested one by one and works, and they all carry installation media for amd64 / x86 / arm64 and other architectures. Picking the nearest one by region is usually faster:

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
