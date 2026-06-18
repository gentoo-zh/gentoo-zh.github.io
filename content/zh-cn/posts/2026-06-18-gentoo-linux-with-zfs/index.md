---
title: "Gentoo Linux with ZFS（转载）"
description: "转载 Locez 的《Gentoo Linux with ZFS》：在 9950X3D + 96G 内存 + 双 2T 镜像上安装 ZFS 根、ZFS 原生加密、systemd-boot 双系统。本站补充了面向新手的阅读提示、关于 SLOG 的编者勘误，以及社区下载站建议。"
date: 2026-06-18
tags: ["tutorial"]
authors:
  - name: Locez
    image: /authors/locez.webp
    link: https://github.com/locez
---

## 背景

在学生时代我就非常喜欢 `Gentoo Linux`，在使用 Gentoo Linux 的过程中学习到了非常多有用宝贵的 Linux 基础知识，这些知识在我的职业生涯早期发挥了相当重要的作用。但是由于工作后的忙碌，以及工作需要使用公司的设备，逐渐没有空维护我的 Gentoo 操作系统。同时也由于笔记本性能后来确实无法跟上，后来将我的 XPS 13 多装了一个 `Arch Linux` 使用至今。

所幸随着我的游戏机纯 Windows 系统的性能逐渐下滑，无法维持正常的游戏质量，我决定新购设备，同时满足我的游戏以及回归 Gentoo 的需求。

本文主要记录这次安装 Gentoo 的过程，有些东西可能不会详细展开。

{{< callout type="info" >}}
**编者注**：如作者所说，本文是一份安装实录、并不逐步展开，默认你对 Gentoo 已有基础（分区、`chroot`、`emerge`、内核与引导等）。想认真学、把系统弄明白，推荐照 [Gentoo 官方手册（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 一步步装——自己动手、搞懂每一步，本来就是本社区的初衷。如果只是想先体验一下，社区定制的 [Live ISO](/download/) 带图形安装器（Calamares），能快速装上（同样支持 ZFS）；但那只是一条省事的捷径，认真用 Gentoo 还是建议自己走一遍手册。
{{< /callout >}}

## 设备配置

 - CPU: AMD Ryzen 9 9950X3D 16-Core Processor
 - MainBoard: MPG X870E CARBON WIFI
 - Memroy Size: DDR5 96G
 - Disk: 2 * 2T (ZFS mirror)

## 准备

### 文件

 - adminCD，支持 zfs 的 liveCD 安装环境
 - Gentoo Stage3 ISO 文件

我们使用 Gentoo 的 adminCD 来进行安装，我使用的是 [ventoy](https://github.com/ventoy/Ventoy) 进行 USB 启动镜像制作。

Gentoo 相关的文件，可以在 [Downloads](https://www.gentoo.org/downloads/) 中找到，也可以选择一个镜像站进行加速下载。

{{< callout type="info" >}}
**编者建议**：想给下载 Gentoo 文件提速，可以用中文社区下载页汇总的官方镜像站，见[下载页 → 镜像源](/download/#镜像源)；下载页的社区 [Live ISO](/download/#live-iso) 同样支持 ZFS 安装（含原生加密）。
{{< /callout >}}

### BIOS setup

 - 关闭 secure boot

## 安装

### ZFS

由于我安装 Windows 时未手动分区，万恶的 Windows 这次只给我分了 100M 的 EFI 分区，所以我在此处需要进行额外的处理。

我要将 2根 SSD 前 16G 切出来做 ESP 分区，都切是为了做对齐，总体的分区布局如下：

```
Part. #     Size        Partition Type            Partition Name
----------------------------------------------------------------
            1007.0 KiB  free space
   1        16.0 GiB    EFI system partition      EFI System Partition
   2        1.8 TiB     Linux filesystem          ZFS0
            327.5 KiB   free space
```

```
Part. #     Size        Partition Type            Partition Name
----------------------------------------------------------------
            1007.0 KiB  free space
   1        16.0 GiB    Linux filesystem
   2        1.8 TiB     Linux filesystem          ZFS1
            327.5 KiB   free space
```

{{< callout type="info" >}}
**编者注（补充操作）**：原文只给了分区**布局**、没说具体怎么分。建分区、设类型、格式化的标准操作，照官方手册「[准备磁盘](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks/zh-cn)」做即可（`cfdisk` / `gdisk` 都行）。本文是 **ZFS 镜像**布局，照官方做的同时注意这几点：

- 认盘别认错：先 `lsblk -f` + `ls -al /dev/disk/by-id/`，用型号 + 序列号（`…2406GT` / `…240A4C`）对上是哪根，别只认 `nvme0` / `nvme1`。
- 每根盘第一个 **16G**：盘 A 设 **EFI System**、`mkfs.vfat -F 32` 做 ESP；盘 B 设 **Linux swap**（**别当 SLOG**——下面建池命令本站已去掉 SLOG，见那里的编者注）。
- 两根盘**剩余的第二个分区不用格式化**——直接留给下面的 `zpool create ... mirror`，由 ZFS 接管（建池后才会显示 `zfs_member`）。
{{< /callout >}}

使用如下的命令创建 ZFS Pool，我们在 2 根 SSD 都划分了 16G，但是其中只需要一个 16G 做 ESP 分区，由于我的内存已经相对够大，所以我将另一根未设为 ESP 类型的，用作 ZFS 的 SLOG。根据需求，你也可以作为 SWAP 分区。

其中的 id 可以通过 `ls -al /dev/disk/by-id/` 得到。
``` bash
zpool create -o feature@allocation_classes=enabled \
             -o feature@async_destroy=enabled \
             -o feature@bookmarks=enabled \
             -o feature@bookmark_v2=enabled \
             -o feature@device_rebuild=enabled \
             -o feature@device_removal=enabled \
             -o feature@draid=enabled \
             -o feature@embedded_data=enabled \
             -o feature@empty_bpobj=enabled \
             -o feature@enabled_txg=enabled \
             -o feature@encryption=enabled \
             -o feature@extensible_dataset=enabled \
             -o feature@filesystem_limits=enabled \
             -o feature@hole_birth=enabled \
             -o feature@large_blocks=enabled \
             -o feature@large_dnode=enabled \
             -o feature@livelist=enabled \
             -o feature@log_spacemap=enabled \
             -o feature@obsolete_counts=enabled \
             -o feature@project_quota=enabled \
             -o feature@resilver_defer=enabled \
             -o feature@spacemap_histogram=enabled \
             -o feature@spacemap_v2=enabled \
             -o feature@userobj_accounting=enabled \
             -o feature@zpool_checkpoint=enabled \
             -o feature@zstd_compress=enabled \
             -o ashift=12 \
             -o autoexpand=on \
             -o autoreplace=on \
             -o autotrim=on \
             -O acltype=posixacl \
             -O canmount=off \
             -O devices=off \
             -O normalization=formC \
             -O relatime=on \
             -O xattr=sa \
             -O compression=zstd \
             -O dnodesize=auto \
             -O overlay=off \
             zroot \
               mirror \
                 nvme-ZHITAI_TiPlus7100_2TB_ZTA72T0AB2452406GT-part2 \
                 nvme-ZHITAI_TiPlus7100_2TB_ZTA72T0AB245240A4C-part2
```

{{< callout type="info" >}}
**编者注**　命令里各参数（`-o` 池属性、`-O` 数据集属性、`feature@*` 池特性）的权威含义，见 OpenZFS 官方文档：[zpoolprops](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html) · [zpool-features](https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html) · [zfsprops](https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html)。

另：原文这里把另一根盘的 16G 当 ZFS 的 SLOG（即 `log` 一项）。消费级盘没有掉电保护（PLP）、又和镜像挤在同一颗盘上，对桌面 / 游戏机只会拖慢——**本站已从上面的 `zpool create` 里去掉该 SLOG**（那 16G 按原文自己提的退路当 swap 或空着即可）。
{{< /callout >}}

创建 rootfs 卷， 注意此处我使用了 zfs 加密，如果不需要可以去掉。

``` bash
zfs create -o mountpoint=legacy \
	-o canmount=noauto \
	-o encryption=aes-256-gcm \
	-o keylocation=prompt \
	-o keyformat=passphrase \
	zroot/root
```

创建 home 卷，此处将加密设置成与父卷一样的方式，但是不添加密码，我们就可以在开机时输入密码后共享同一个密码，无需二次解密。

``` bash
zfs create -o mountpoint=legacy \
	-o canmount=noauto \ 
	-o encryption=aes-256-gcm \
	zroot/root/home
```

挂载对应的卷和分区，注意此处挂载的是 ESP 分区

``` bash
mount -t zfs zroot/root /mnt/gentoo
mount -t zfs zroot/root/home /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/boot
```

### 安装 Gentoo

下载解压 stage 3，我这里 example 选择 `systemd` 和 `desktop` 的，根据需求选择你要的。

> 官方手册：[安装 stage3 文件、配置编译选项（make.conf）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage/zh-cn)

``` bash
cd /mnt/gentoo
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20250406T165023Z/stage3-amd64-desktop-systemd-20250406T165023Z.tar.xz
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```
配置 `/etc/portage/make.conf`：

``` conf
USE="cjk dist-kernel dracut egl -handbook -kwallet networkmanager sddm systemd-boot wayland wacom"

MAKEOPTS="--jobs 16 --load-average 25"
INPUT_DEVICES="wacom"

CFLAGS="-march=native -O3 -pipe"
CXXFLAGS="${CFLAGS}"
CPU_FLAGS="aes avx avx2 avx512_bf16 avx512_bitalg avx512_vbmi2 avx512_vnni avx512_vp2intersect avx512_vpopcntdq avx512bw avx512cd avx512dq avx512f avx512ifma avx512vbmi avx512vl f16c fma3 mmx mmxext pclmul popcnt rdrand sha sse sse2 sse3 sse4_1 sse4_2 sse4a ssse3 vpclmulqdq"
CPU_FLAGS_X86="${CPU_FLAGS}"

GENTOO_MIRRORS="https://mirrors.ustc.edu.cn/gentoo https://mirrors.tuna.tsinghua.edu.cn/gentoo https://distfiles.gentoo.org"
```
其中的 CPU_FLAGS 可以通过 `cpuid2cpuflags` 得到。

配置必要的 package USE `/etc/portage/package.use/custom`：

``` bash
# required by Locez
*/* CPU_FLAGS_X86: aes avx avx2 avx512_bf16 avx512_bitalg avx512_vbmi2 avx512_vnni avx512_vp2intersect avx512_vpopcntdq avx512bw avx512cd avx512dq avx512f avx51
2ifma avx512vbmi avx512vl f16c fma3 mmx mmxext pclmul popcnt rdrand sha sse sse2 sse3 sse4_1 sse4_2 sse4a ssse3 vpclmulqdq
*/* VIDEO_CARDS: -* amdgpu radeonsi nvidia
```
遵循新的标准，在这里继续配置 `CPU_FLAGS` 和 `VIDEO_CARDS`，其中显卡的需要根据硬件具体进行配置，我这里含有 AMD 的集显和 nvidia 的显卡

准备 chroot

> 官方手册：[chroot、安装基础系统](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base/zh-cn)

``` bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --make-rslave /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/dev
mount --bind /run /mnt/gentoo/run
mount --make-slave /mnt/gentoo/run

chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

配置时区与区域

``` bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

cat /etc/locale.gen | grep -v ^#
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8

locale-gen
```

配置内核与 ZFS 内核模块

> 官方手册：[配置内核](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel/zh-cn)

``` bash
emerge-webrsync
emerge -av sys-kernel/linux-firmware
emerge -av sys-kernel/gentoo-kernel-bin
emerge -av sys-fs/zfs sys-fs/zfs-kmod
```
配置 `dracut` 生成 `initramfs`，添加 ZFS 支持，以便开机的时候能正确使用加载 ZFS，其中 `systemd-ask-password` 是因为上述创建 ZFS Pool 的步骤中，我们在创建子卷的时候填写了密码，用这个来提示我们输入密码。

**注意**：配置前后的空格是必须的

`/etc/dracut.conf.d/zol.conf`

``` bash
fsck="yes"
add_dracutmodules+=" zfs systemd-ask-password "
```
生成 initramfs

``` bash
emerge --config sys-kernel/gentoo-kernel-bin
```

安装更新系统

``` bash
emerge --ask --verbose --update --deep --newuse @world app-shells/fish
systemctl enable networkmanager
```

安装 KDE 与 SDDM

> 官方手册：[桌面环境](https://wiki.gentoo.org/wiki/Desktop_environment/zh-cn)（KDE 只是作者的选择，GNOME / Xfce / Sway 等都行）

``` bash
emerge -auDv kde-plasma/plasma-meta sddm
systemctl enable sddm
```

修改 sddm 配置，文章有实效性，最新的配置可以参考： [plasma-wayland.conf](https://github.com/KDE/plasma-workspace/blob/master/sddm-wayland-session/plasma-wayland.conf)

``` conf
[General]
DisplayServer=wayland
GreeterEnvironment=QT_WAYLAND_SHELL_INTEGRATION=layer-shell
InputMethod=

[Theme]
Current=breeze

[Wayland]
CompositorCommand=kwin_wayland --no-global-shortcuts --no-lockscreen --inputmethod maliit-keyboard --locale1
```

创建普通用户，并且配置对应权限分组，其中 sddm 踩坑在登录后需要 daemon group 才能正常运行（截至 20250413 仍然是这样，请注意时间有效性）。

> 官方手册：[收尾工作（用户管理）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing/zh-cn)

``` bash
useradd -m -G daemon,adm,wheel,audio,video,users -s /usr/bin/fish locez
passwd locez
```

生成 fstab

> 官方手册：[配置系统（fstab）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System/zh-cn)

``` bash
emerge -a genfstab
genfstab -U / > /etc/fstab
```

配置启动项，通过 `bootctl` 安装，并且检查 /boot 下的配置是否正确

> 官方手册：[配置引导器](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader/zh-cn)

``` bash
bootctl install
ls /boot

❯ cat /boot/loader/entries/gentoo-6.12.21-gentoo-dist.conf
# Boot Loader Specification type#1 entry
# File created by /usr/lib/kernel/install.d/90-loaderentry.install (systemd 256.10)
title      Gentoo Linux
version    6.12.21-gentoo-dist
sort-key   gentoo
options    dokeymap root=ZFS=zroot/root ro
linux      /gentoo/6.12.21-gentoo-dist/linux
initrd     /gentoo/6.12.21-gentoo-dist/initrd
```

{{< callout type="info" >}}
**编者注**：文中用 systemd-boot 直接引导 ZFS 根（`root=ZFS=zroot/root`）。如果想用专为 ZFS 设计的引导方案，也可以了解 [ZFSBootMenu](https://wiki.gentoo.org/wiki/ZFS/ZFSBootMenu)——社区 Live ISO 的 ZFS 安装用的就是它；这也只是一种选择。
{{< /callout >}}

重启进入系统

``` bash
exit
cd
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -n -R /mnt/gentoo
zpool export zroot
reboot
```

到此为止， Gentoo 的整个安装过程已经结束，顺利的话能直接进入系统，不顺利的话只能 liveCD 继续 chroot 修问题啦。

如果需要 chroot 修问题，这个时候需要在 liveCD 中解密，首次创建的时候输入密码没这个步骤

``` bash
zpool import zroot
zfs load-key zroot/root
```
登录进去普通用户以后如果声音不正常还需要启动 `pipewire` 和 `wireplumber`

```bash
systemctl --user enable --now pipewire-pulse pipewire wireplumber
```

## 双系统启动配置

由于使用了 2 个 ESP 分区，双系统启动有两种方式，一种是开机的时候选择启动项，另一种则使用 systemd-boot 管理。

虽然 systemd-boot 无法直接管理另一个 ESP 分区中的启动，但是我们可以通过 UEFI SHELL 进行跳转。

首先安装 `edk2`，将其拷贝到我们的 /boot 中，这样启动选择后可以得到一个 UEFI SHELL，我们可以通过这个 SHELL 得到 Windows 的 `FS alias`

```
emerge -1 -a edk2-bin
cp /usr/share/edk2-ovmf/Shell.efi /boot/shellx64.efi
```
重启然后登录到 UEFI SHELL 中，使用 map 命令得到 Windows 的 UEFI 的 FS alias

然后手动创建以下启动项 `/boot/loader/entries/windows.conf`， 其中 `HD0b` 就是 FS alias
``` conf
title Windows 11
efi     /shellx64.efi
options -nointerrupt -nomap -noversion HD0b:EFI\Microsoft\Boot\Bootmgfw.efi
```

## 引用

 - [https://wiki.gentoo.org/wiki/ZFS/rootfs](https://wiki.gentoo.org/wiki/ZFS/rootfs)
 - [https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)
 - [https://github.com/KDE/plasma-workspace/blob/master/sddm-wayland-session/plasma-wayland.conf](https://github.com/KDE/plasma-workspace/blob/master/sddm-wayland-session/plasma-wayland.conf)
 - [https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html](https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html)
 - [https://wiki.archlinux.org/title/Systemd-bootArchWiki-Systemd-boot](https://wiki.archlinux.org/title/Systemd-boot)

{{< callout type="info" >}}
**转载声明**　本文为转载，已获原作者授权。原作者 [Locez](https://github.com/locez)（个人站 [locez.com](https://locez.com)），原文《[Gentoo Linux with ZFS](https://locez.com/linux/gentoo-linux-with-zfs/)》（发布于 2025-04-13，更新于 2026-02-11）。原文以 [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International（CC BY-NC-SA 4.0）](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 协议发布，本文经作者授权、并同样以该协议转载。

本站对原文做了少量修改并标注（均为本站观点，非原作者意见）：**`zpool create` 命令里的 SLOG（`log`）已去掉**（理由见正文该命令下的编者注）；另补充了新手阅读提示、分区要点、下载镜像建议、ZFSBootMenu 说明，以及各步骤对应的 [Gentoo 官方手册（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 章节链接，方便照官方最新文档操作。
{{< /callout >}}
