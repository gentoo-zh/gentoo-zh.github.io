---
title: "Gentoo Linux with ZFS（轉載）"
description: "轉載 Locez 的《Gentoo Linux with ZFS》：在 9950X3D + 96G 記憶體 + 雙 2T 鏡像上安裝 ZFS 根、ZFS 原生加密、systemd-boot 雙系統。本站補充了面向新手的閱讀提示、關於 SLOG 的編者勘誤，以及社群下載站建議。"
date: 2026-06-18
tags: ["tutorial"]
authors:
  - name: Locez
    image: /authors/locez.webp
    link: https://github.com/locez
---

## 背景

在學生時代我就非常喜歡 `Gentoo Linux`，在使用 Gentoo Linux 的過程中學習到了非常多有用寶貴的 Linux 基礎知識，這些知識在我的職業生涯早期發揮了相當重要的作用。但是由於工作後的忙碌，以及工作需要使用公司的裝置，逐漸沒有空維護我的 Gentoo 作業系統。同時也由於筆記本效能後來確實無法跟上，後來將我的 XPS 13 多裝了一個 `Arch Linux` 使用至今。

所幸隨著我的遊戲機純 Windows 系統的效能逐漸下滑，無法維持正常的遊戲品質，我決定新購裝置，同時滿足我的遊戲以及迴歸 Gentoo 的需求。

本文主要記錄這次安裝 Gentoo 的過程，有些東西可能不會詳細展開。

{{< callout type="info" >}}
**編者注**：如作者所說，本文是一份安裝實錄、並不逐步展開，預設你對 Gentoo 已有基礎（分割槽、`chroot`、`emerge`、核心與引導等）。想認真學、把系統弄明白，推薦照 [Gentoo 官方手冊（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 一步步裝——自己動手、搞懂每一步，本來就是本社群的初衷。如果只是想先體驗一下，社群定製的 [Live ISO](/download/) 帶圖形安裝器（Calamares），能快速裝上（同樣支援 ZFS）；但那只是一條省事的捷徑，認真用 Gentoo 還是建議自己走一遍手冊。
{{< /callout >}}

## 裝置配置

 - CPU: AMD Ryzen 9 9950X3D 16-Core Processor
 - MainBoard: MPG X870E CARBON WIFI
 - Memroy Size: DDR5 96G
 - Disk: 2 * 2T (ZFS mirror)

## 準備

### 檔案

 - adminCD，支援 zfs 的 liveCD 安裝環境
 - Gentoo Stage3 ISO 檔案

我們使用 Gentoo 的 adminCD 來進行安裝，我使用的是 [ventoy](https://github.com/ventoy/Ventoy) 進行 USB 啟動鏡像製作。

Gentoo 相關的檔案，可以在 [Downloads](https://www.gentoo.org/downloads/) 中找到，也可以選擇一個鏡像站進行加速下載。

{{< callout type="info" >}}
**編者建議**：想給下載 Gentoo 檔案提速，可以用中文社群下載頁彙總的官方鏡像站，見[下載頁 → 鏡像源](/download/#鏡像源)；下載頁的社群 [Live ISO](/download/#live-iso) 同樣支援 ZFS 安裝（含原生加密）。
{{< /callout >}}

### BIOS setup

 - 關閉 secure boot

## 安裝

### ZFS

由於我安裝 Windows 時未手動分割槽，萬惡的 Windows 這次只給我分了 100M 的 EFI 分割槽，所以我在此處需要進行額外的處理。

我要將 2根 SSD 前 16G 切出來做 ESP 分割槽，都切是為了做對齊，總體的分割槽佈局如下：

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
**編者注（補充操作）**：原文只給了分割槽**佈局**、沒說具體怎麼分。建分割槽、設型別、格式化的標準操作，照官方手冊「[準備磁碟](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks/zh-cn)」做即可（`cfdisk` / `gdisk` 都行）。本文是 **ZFS 鏡像**佈局，照官方做的同時注意這幾點：

- 認盤別認錯：先 `lsblk -f` + `ls -al /dev/disk/by-id/`，用型號 + 序列號（`…2406GT` / `…240A4C`）對上是哪根，別只認 `nvme0` / `nvme1`。
- 每根盤第一個 **16G**：盤 A 設 **EFI System**、`mkfs.vfat -F 32` 做 ESP；盤 B 設 **Linux swap**（**別當 SLOG**——下面建池指令本站已去掉 SLOG，見那裡的編者注）。
- 兩根盤**剩餘的第二個分割槽不用格式化**——直接留給下面的 `zpool create ... mirror`，由 ZFS 接管（建池後才會顯示 `zfs_member`）。
{{< /callout >}}

使用如下的指令建立 ZFS Pool，我們在 2 根 SSD 都劃分了 16G，但是其中只需要一個 16G 做 ESP 分割槽，由於我的記憶體已經相對夠大，所以我將另一根未設為 ESP 型別的，用作 ZFS 的 SLOG。根據需求，你也可以作為 SWAP 分割槽。

其中的 id 可以透過 `ls -al /dev/disk/by-id/` 得到。
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
**編者注**　指令裡各引數（`-o` 池屬性、`-O` 資料集屬性、`feature@*` 池特性）的權威含義，見 OpenZFS 官方文件：[zpoolprops](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html) · [zpool-features](https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html) · [zfsprops](https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html)。

另：原文這裡把另一根盤的 16G 當 ZFS 的 SLOG（即 `log` 一項）。消費級盤沒有掉電保護（PLP）、又和鏡像擠在同一顆盤上，對桌面 / 遊戲機只會拖慢——**本站已從上面的 `zpool create` 裡去掉該 SLOG**（那 16G 按原文自己提的退路當 swap 或空著即可）。
{{< /callout >}}

建立 rootfs 卷， 注意此處我使用了 zfs 加密，如果不需要可以去掉。

``` bash
zfs create -o mountpoint=legacy \
	-o canmount=noauto \
	-o encryption=aes-256-gcm \
	-o keylocation=prompt \
	-o keyformat=passphrase \
	zroot/root
```

建立 home 卷，此處將加密設定成與父卷一樣的方式，但是不新增密碼，我們就可以在開機時輸入密碼後共享同一個密碼，無需二次解密。

``` bash
zfs create -o mountpoint=legacy \
	-o canmount=noauto \ 
	-o encryption=aes-256-gcm \
	zroot/root/home
```

掛載對應的卷和分割槽，注意此處掛載的是 ESP 分割槽

``` bash
mount -t zfs zroot/root /mnt/gentoo
mount -t zfs zroot/root/home /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/boot
```

### 安裝 Gentoo

下載解壓 stage 3，我這裡 example 選擇 `systemd` 和 `desktop` 的，根據需求選擇你要的。

> 官方手冊：[安裝 stage3 檔案、配置編譯選項（make.conf）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage/zh-cn)

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
其中的 CPU_FLAGS 可以透過 `cpuid2cpuflags` 得到。

配置必要的 package USE `/etc/portage/package.use/custom`：

``` bash
# required by Locez
*/* CPU_FLAGS_X86: aes avx avx2 avx512_bf16 avx512_bitalg avx512_vbmi2 avx512_vnni avx512_vp2intersect avx512_vpopcntdq avx512bw avx512cd avx512dq avx512f avx51
2ifma avx512vbmi avx512vl f16c fma3 mmx mmxext pclmul popcnt rdrand sha sse sse2 sse3 sse4_1 sse4_2 sse4a ssse3 vpclmulqdq
*/* VIDEO_CARDS: -* amdgpu radeonsi nvidia
```
遵循新的標準，在這裡繼續配置 `CPU_FLAGS` 和 `VIDEO_CARDS`，其中顯示卡的需要根據硬體具體進行配置，我這裡含有 AMD 的集顯和 nvidia 的顯示卡

準備 chroot

> 官方手冊：[chroot、安裝基礎系統](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base/zh-cn)

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

配置時區與區域

``` bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

cat /etc/locale.gen | grep -v ^#
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8

locale-gen
```

配置核心與 ZFS 核心模組

> 官方手冊：[配置核心](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel/zh-cn)

``` bash
emerge-webrsync
emerge -av sys-kernel/linux-firmware
emerge -av sys-kernel/gentoo-kernel-bin
emerge -av sys-fs/zfs sys-fs/zfs-kmod
```
配置 `dracut` 生成 `initramfs`，新增 ZFS 支援，以便開機的時候能正確使用載入 ZFS，其中 `systemd-ask-password` 是因為上述建立 ZFS Pool 的步驟中，我們在建立子卷的時候填寫了密碼，用這個來提示我們輸入密碼。

**注意**：配置前後的空格是必須的

`/etc/dracut.conf.d/zol.conf`

``` bash
fsck="yes"
add_dracutmodules+=" zfs systemd-ask-password "
```
生成 initramfs

``` bash
emerge --config sys-kernel/gentoo-kernel-bin
```

安裝更新系統

``` bash
emerge --ask --verbose --update --deep --newuse @world app-shells/fish
systemctl enable networkmanager
```

安裝 KDE 與 SDDM

> 官方手冊：[桌面環境](https://wiki.gentoo.org/wiki/Desktop_environment/zh-cn)（KDE 只是作者的選擇，GNOME / Xfce / Sway 等都行）

``` bash
emerge -auDv kde-plasma/plasma-meta sddm
systemctl enable sddm
```

修改 sddm 配置，文章有實效性，最新的配置可以參考： [plasma-wayland.conf](https://github.com/KDE/plasma-workspace/blob/master/sddm-wayland-session/plasma-wayland.conf)

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

建立普通使用者，並且配置對應許可權分組，其中 sddm 踩坑在登入後需要 daemon group 才能正常執行（截至 20250413 仍然是這樣，請注意時間有效性）。

> 官方手冊：[收尾工作（使用者管理）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing/zh-cn)

``` bash
useradd -m -G daemon,adm,wheel,audio,video,users -s /usr/bin/fish locez
passwd locez
```

生成 fstab

> 官方手冊：[配置系統（fstab）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System/zh-cn)

``` bash
emerge -a genfstab
genfstab -U / > /etc/fstab
```

配置啟動項，透過 `bootctl` 安裝，並且檢查 /boot 下的配置是否正確

> 官方手冊：[配置引導器](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader/zh-cn)

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
**編者注**：文中用 systemd-boot 直接引導 ZFS 根（`root=ZFS=zroot/root`）。如果想用專為 ZFS 設計的引導方案，也可以瞭解 [ZFSBootMenu](https://wiki.gentoo.org/wiki/ZFS/ZFSBootMenu)——社群 Live ISO 的 ZFS 安裝用的就是它；這也只是一種選擇。
{{< /callout >}}

重啟進入系統

``` bash
exit
cd
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -n -R /mnt/gentoo
zpool export zroot
reboot
```

到此為止， Gentoo 的整個安裝過程已經結束，順利的話能直接進入系統，不順利的話只能 liveCD 繼續 chroot 修問題啦。

如果需要 chroot 修問題，這個時候需要在 liveCD 中解密，首次建立的時候輸入密碼沒這個步驟

``` bash
zpool import zroot
zfs load-key zroot/root
```
登入進去普通使用者以後如果聲音不正常還需要啟動 `pipewire` 和 `wireplumber`

```bash
systemctl --user enable --now pipewire-pulse pipewire wireplumber
```

## 雙系統啟動配置

由於使用了 2 個 ESP 分割槽，雙系統啟動有兩種方式，一種是開機的時候選擇啟動項，另一種則使用 systemd-boot 管理。

雖然 systemd-boot 無法直接管理另一個 ESP 分割槽中的啟動，但是我們可以透過 UEFI SHELL 進行跳轉。

首先安裝 `edk2`，將其複製到我們的 /boot 中，這樣啟動選擇後可以得到一個 UEFI SHELL，我們可以透過這個 SHELL 得到 Windows 的 `FS alias`

```
emerge -1 -a edk2-bin
cp /usr/share/edk2-ovmf/Shell.efi /boot/shellx64.efi
```
重啟然後登入到 UEFI SHELL 中，使用 map 指令得到 Windows 的 UEFI 的 FS alias

然後手動建立以下啟動項 `/boot/loader/entries/windows.conf`， 其中 `HD0b` 就是 FS alias
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
**轉載宣告**　本文為轉載，已獲原作者授權。原作者 [Locez](https://github.com/locez)（個人站 [locez.com](https://locez.com)），原文《[Gentoo Linux with ZFS](https://locez.com/linux/gentoo-linux-with-zfs/)》（釋出於 2025-04-13，更新於 2026-02-11）。原文以 [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International（CC BY-NC-SA 4.0）](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 協議釋出，本文經作者授權、並同樣以該協議轉載。

本站對原文做了少量修改並標註（均為本站觀點，非原作者意見）：**`zpool create` 指令裡的 SLOG（`log`）已去掉**（理由見正文該指令下的編者注）；另補充了新手閱讀提示、分割槽要點、下載鏡像建議、ZFSBootMenu 說明，以及各步驟對應的 [Gentoo 官方手冊（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 章節連結，方便照官方最新文件操作。
{{< /callout >}}
