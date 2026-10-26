---
title: "在 Apple Silicon Mac 上安装 Gentoo Linux（M1/M2 MacBook 安装教程）"
date: 2025-10-02
tags: ["tutorial"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
summary: "在 M1/M2 Mac 上安装 Gentoo，使用 Asahi 引导组件、ARM64 Stage3 和 systemd。"
description: "M1/M2 Mac 的 Gentoo 安装步骤：Live USB、Stage3 验证、Asahi 软件包、根分区加密和桌面配置。"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

在受支持的 M1/M2 Mac 上安装 ARM64 Gentoo，保留 macOS。Gentoo 使用 systemd；OpenRC 命令仅用于 Live USB。

安装指南：<https://wiki.gentoo.org/wiki/Project:Asahi/Guide>

分区前确认机型支持。M2 Mac Pro 安装支持仍为 WIP；本教程不涵盖后续世代。

M1 支持表：<https://asahilinux.org/docs/platform/feature-support/m1/>

M2 支持表：<https://asahilinux.org/docs/platform/feature-support/m2/>

各世代支持总表：<https://asahilinux.org/docs/platform/feature-support/overview/>

## 流程概览

1. 下载 Gentoo Asahi Live USB 镜像
2. 通过 Asahi 安装程序设置 U-Boot
3. 从 Live USB 启动
4. 分区并挂载文件系统
5. 解压 Stage3 并 chroot
6. 安装 Asahi 支持套件
7. 重启完成安装

可选步骤：LUKS 加密、自定义内核、PipeWire 音频、桌面环境。

## 事前准备

### 硬件需求

- Asahi 安装程序支持的 M1/M2 Mac
- 至少 80 GB 可用磁盘空间，建议 120 GB 以上
- 稳定的 Wi-Fi 或以太网

### 已知工作情况

受支持的机型可使用 CPU、存储设备、Wi-Fi、笔记本键盘和触控板，以及 GPU 加速。显示和音频支持因机型而异。Thunderbolt 和 USB-C DisplayPort Alt Mode 标为 WIP，Touch ID 尚不支持。

macOS 虚拟化尚不支持。

## 1. 准备 Gentoo Asahi Live USB

### 1.1 下载镜像

下载 ISO 和同名的 `.sha256`，然后校验：

- <https://chadmed.au/pub/gentoo/install-arm64-asahi-20260827.iso>
- <https://chadmed.au/pub/gentoo/install-arm64-asahi-20260827.iso.sha256>

```bash
$ shasum -a 256 -c install-arm64-asahi-20260827.iso.sha256
```

显示 `OK` 再写入 USB。

20260827 版已在 MacBook Air M2 上验证可正常启动。20261006 版内置 GRUB 2.16，在 Asahi U-Boot 上启动时报错 `cannot allocate memory for memory map`，暂勿使用。

### 1.2 制作启动 USB

在下载目录用 `diskutil list` 找出 USB，替换 `/dev/disk4`。写入会清除 USB 数据：

```bash
$ diskutil list
$ diskutil unmountDisk /dev/disk4
$ sudo dd if=install-arm64-asahi-20260827.iso of=/dev/rdisk4 bs=4m
$ diskutil eject /dev/disk4
```

## 2. 设置 Asahi U-Boot 环境

### 2.1 运行 Asahi 安装程序

详情查看 <https://alx.sh> 。

在 macOS 中打开 Terminal，执行：

```bash
$ curl https://alx.sh | sh
```

加载后输入 sudo 密码，在 `Press enter to continue` 按 Enter。

以下为 MacBook Air（M2，2022）的输出。

```text
Collecting system information...
  Product name: MacBook Air (M2, 2022)
  SoC: Apple M2
  Device class: j413ap
  Product type: Mac14,2
  Board ID: 0x28
  Chip ID: 0x8112
  System firmware: mBoot-20457.1.29
  Boot UUID: 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64
  Boot VGID: 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64
  Default boot VGID: 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64
  Boot mode: macOS
  OS version: 27.0.1 (26A434)
  OS restore version: 26.1.434.0.0,0
  Main firmware version: 27.0.1 (26A434)
  No Fallback System Firmware / rOS
  SFR version: 26.1.434.0.0,0
  SystemRecovery version: 25.7.83.0.0,0 (26.6.2 25G83)
  Login user: zakk
```

### 2.2 跟随安装程序

1. 输入 `r` 缩小 macOS；已有足够未分配空间则选 `f`，跳到第 5 步。

   ```text
   Partitions in system disk (disk0):
     1: APFS [Macintosh HD] (494.38 GB, 6 volumes)
       OS: [B*] [Macintosh HD] macOS v27.0.1 [disk3s3s1, 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64]
     2: APFS (System Recovery) (5.37 GB, 2 volumes)
       OS: [  ] recoveryOS v27.0.1 [Primary recoveryOS]

     [B ] = Booted OS, [R ] = Booted recovery, [? ] = Unknown
     [ *] = Default boot volume

   Using OS 'Macintosh HD' (disk3s3s1) for machine authentication.

   Choose what to do:
     r: Resize an existing partition to make space for a new OS
     q: Quit without doing anything
   » Action (r): r
   ```

2. 输入缩小后 macOS 要保留的大小，剩下的空间留给 Gentoo。

   ```text
   We're going to resize this partition:
     APFS [Macintosh HD] (494.38 GB, 6 volumes)
     Total size: 494.38 GB
     Free space: 244.98 GB
     Available space: 206.98 GB
     Overhead: 0 B
     Minimum new size: 287.41 GB (58.13%)

   Enter the new size for your existing partition:
     You can enter a size such as '1GB', a fraction such as '50%',
     or the word 'min' for the smallest allowable size.

     Examples:
     30%  - 30% to macOS, 70% to the new OS
     80GB - 80GB to macOS, the rest to your new OS
     min  - Shrink macOS as much as (safely) possible

   » New size (min): 366GB
   ```

   `80GB` 为 macOS 保留 80 GB；`30%` 保留 30%、释放 70%；`min` 缩至安全下限。须为 Gentoo 留出至少 80 GB。下限取决于已用空间；输入被拒绝时，改填更大的值或 `min`。

   ```text
   Size is too small, please enter a value > 287.41 GB
   ```

3. 确认将释放的空间，在 `Continue?` 输入 `y`。

   ```text
   Resizing will free up 128.38 GB of space.

   Note: your system may appear to freeze during the resize.
   This is normal, just wait until the process completes.
   » Continue? (y/N): y
   ```

   fsck 信息和警告属于正常现象；出现 `Resize complete` 即完成，按 Enter 返回菜单。

   ```text
   Finished APFS operation
   Resize complete. Press enter to continue.
   ```

4. 确认释放的空间：

   ```text
   Partitions in system disk (disk0):
     1: APFS [Macintosh HD] (366.00 GB, 6 volumes)
       OS: [B*] [Macintosh HD] macOS v27.0.1 [disk3s3s1, 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64]
     2: (free space: 128.38 GB)
     3: APFS (System Recovery) (5.37 GB, 2 volumes)
       OS: [  ] recoveryOS v27.0.1 [Primary recoveryOS]
   ```

   在操作菜单输入 `f`。

   ```text
   Choose what to do:
     f: Install an OS into free space
     r: Resize an existing partition to make space for a new OS
     q: Quit without doing anything
   » Action (f): f
   ```

5. 选择 `UEFI environment only (m1n1 + U-Boot + ESP)`，不要选 Fedora Asahi Remix。输入屏幕上的编号，不要固定填 `5`。

   ```text
   Choose an OS to install:
     1: Fedora Asahi Remix 44 with KDE Plasma
     2: Fedora Asahi Remix 44 with GNOME
     3: Fedora Asahi Remix 44 Server
     4: Fedora Asahi Remix 44 Minimal
     5: UEFI environment only (m1n1 + U-Boot + ESP)
   » OS: 5
   ```

   名称可自定义，开机时的卷列表会显示这个名称。本文填 `Gentoo Linux`。

   ```text
   Minimum required space for this OS: 3.00 GB

   Available free space: 128.38 GB

   Enter a name for your OS
   » OS name (UEFI boot): Gentoo Linux
   ```

6. 等待安装程序创建 stub macOS 和约 500 MB 的 EFI 分区。

   ```text
   Creating new stub macOS named Gentoo Linux
   ```

   再次输入 macOS 管理员密码，新系统会设为默认启动卷。

   ```text
   To continue the installation, you will need to enter your macOS
   admin credentials.
   Password for zakk:
   ```

7. 出现 `Installation successful!` 后，选 `y` 发送匿名报告、`n` 不发送，或 `d` 查看内容。

   ```text
   Installation successful!
   ```

   ```text
   Help us improve Asahi Linux!
   We'd love to know how many people are installing Asahi and on what
   kind of hardware. Would you mind sending a one-time installation
   report to us?

   This will only report what kind of machine you have, the OS you're
   installing, basic version info, and the rough install size.
   No personally identifiable information (such as serial numbers,
   specific partition sizes, etc.) is included. You can view the
   exact data that will be sent.

   Report your install?
     y: Yes
     n: No
     d: View the data that will be sent
   » Choice (y/n/d):
   ```

### 2.3 完成 Recovery 设置

按 Enter 查看最后的说明，再在关机提示处按 Enter：

```text
Press enter to shut down the system.
```

1. 等待 25 秒，让系统完全关机。
2. 按住电源键开机，只按一次，不要反复按。按住期间 Apple 标志下方的文字会变化：

   | 屏幕文字 | 操作 |
   | --- | --- |
   | `Continue holding for startup options...` | 继续按住 |
   | 正在载入启动选项...（`Loading startup options...`）| 松开电源键 |

3. 等待卷列表出现：`Macintosh HD`、`Gentoo Linux`（Asahi 图标）和“选项”。
4. 选择 `Gentoo Linux`，按“继续”。

   ![开机选单：Macintosh HD、Gentoo Linux 和选项，Gentoo Linux 已选中](boot-picker.webp)

5. `macOS Recovery` 会短暂出现。在 `Select a volume to recover` 选择平时的 macOS 卷、点击 `Next`，并按提示输入 macOS 账户凭据。
6. 出现 `Asahi Linux installer` 画面后，终端会自动执行第二步 `step2.sh`。这一步只改变 Gentoo 的安全级别，macOS 不受影响，过程中要输入两次 macOS 用户名和密码。

   按 Enter 继续：

   ```text
   -bash-3.2# /Volumes/Gentoo\ Linux/Finish\ Installation.app/Contents/Resources/step2.sh ; exit;

   Asahi Linux installer (second step)

   VGID: 053D3C79-831B-4D09-9D75-199B5AA0924B
   System volume: /Volumes/Gentoo Linux

   You will see some messages advising you that you are changing the
   security level of your system. These changes apply only to your
   Asahi Linux install, and are necessary to install a third-party OS.

   Apple Silicon platforms maintain a separate security level for each
   installed OS, and are designed to retain their security with mixed OSes.
   The security level of your macOS install will not be affected.

   You will be prompted for login credentials two times.
   Please enter your macOS credentials (for the macOS that you
   used to run the first step of the installation).

   Press enter to continue.
   ```

   输入 macOS 密码：

   ```text
   Operating on Volume Group UUID 053D3C79-831B-4D09-9D75-199B5AA0924B

   This utility is not meant for normal users or even sysadmins.
   It provides unabstracted access to capabilities which are normally handled for the user automatically when changing the security policy through GUIs such as the Startup Security Utility in macOS Recovery ("recoveryOS").
   It is possible to make your system security much weaker and therefore easier to compromise using this tool.
   This tool is not to be used in production environments.
   It is possible to render your system unbootable with this tool.
   It should only be used to understand how the security of Apple Silicon Macs works.
   Use at your own risk!

   Please enter password for user zakk:
   ```

   安装程序更新本机安全策略并显示结果。`Security Mode` 变为 `Permissive`，只应用于 Gentoo：

   ```text
   Local policy update is in progress, please wait...

   Resulting local policy:
   （芯片 ID 与哈希值，略）
   Security Mode:               Permissive (smb0 && smb1): 1
   3rd Party Kexts Status:      Disabled   (smb2): absent
   User-allowed MDM Control:    Disabled   (smb3): absent
   DEP-allowed MDM Control:     Disabled   (smb4): absent
   SIP Status:                  Enabled    (sip0): absent
   Signed System Volume Status: Enabled    (sip1): absent
   Kernel CTRR Status:          Disabled   (sip2): 1
   Boot Args Filtering Status:  Enabled    (sip3): absent
   ```

   输入 `y` 确认：

   ```text
   By setting a custom boot object, you will be putting your system into Permissive Security.

   Are you sure you want to do this? (enter y or n) y
   found raw boot object, deriving Mach-O boot properties...
   wrapping boot object payload...
   going to change bootpolicy to permissive...
   updating local machine policy...
   ```

   再输入一次 macOS 用户名和密码：

   ```text
   Username: zakk
   Password:
   installing boot object...
   done.

   Wrapping up...
   ```

   按 Enter 重启：

   ```text
   Installation complete! Press enter to reboot.
   ```


反复重启或要求重装 macOS，说明启动顺序有误。**先完全关机**：屏幕熄灭后等满 25 秒，再按住电源键一次。

仍然失败时，最后再进入 macOS，重新执行 `curl https://alx.sh | sh` 并选 `p`。

## 3. 从 Live USB 启动

插入 USB 开机，U-Boot 会自动启动 USB 的 GRUB。手动指定方式：

```
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

### 3.1 连接 Wi-Fi

Live USB 没有 NetworkManager，用 `net-setup` 设置 Wi-Fi：

```bash
# net-setup
```

1. 选择无线网卡 `wld0`。

   ![net-setup 接口菜单，列出 wld0](net-setup-1.webp)

2. `Interface details` 确认网卡信息，选 `Yes`。
3. 选 `3 My network is wireless (WPA-PSK/WPA2-PSK)`。

   ![net-setup 网络类型菜单，选中 WPA-PSK/WPA2-PSK](net-setup-2.webp)

4. 输入 Wi-Fi 名称（SSID）。

   ![net-setup 输入 SSID](net-setup-3.webp)

5. 输入 Wi-Fi 密码，长度 8 至 63 个字符。

   ![net-setup 输入 WPA 密码](net-setup-4.webp)

6. `TCP/IP setup` 选 `1 Use DHCP to auto-detect my network settings`。

确认获得 IP，并检查 DNS：

```bash
# ip a show wld0
# ping -c 3 www.gentoo.org
```

内核已含 Apple Silicon Wi-Fi 驱动；连接不稳时改试 2.4 GHz。

### 3.2 开启 SSH

Live USB 只有 `root` 账户。设置 root 密码并启动 sshd：

```bash
# passwd
# rc-service sshd start
```

从另一台电脑连接，`192.168.8.155` 替换为 `ip a show wld0` 显示的地址：

```bash
$ ssh root@192.168.8.155
```

## 4. 分区与文件系统

只在 Asahi 安装程序留下的空间创建分区，不要删除、调整或格式化已有的 APFS、EFI 和 Recovery 分区。破坏引导分区可能需要另一台 Mac 执行 DFU 恢复，并清除内部 SSD。

查看分区：

```bash
# lsblk
# blkid --label "EFI - GENTO"
```

将 `/dev/nvme0n1p4`、其他分区编号和 ESP 标签换成实际值。

```
nvme0n1p1   500M    Apple Silicon boot
nvme0n1p2   307.3G  Apple APFS (macOS)
nvme0n1p3   2.3G    Apple APFS
nvme0n1p4   477M    EFI System  (不要动)
(free)      ~150G   Linux 可用空间
nvme0n1p5   5G      Apple Silicon recovery
```

### 4.1 建立根分区

使用 `cfdisk /dev/nvme0n1` 在空闲空间建立 Linux filesystem 类型分区。

先创建挂载点：

```bash
# mkdir -p /mnt/gentoo
```

不加密：

```bash
# mkfs.btrfs /dev/nvme0n1p6     # 或 mkfs.ext4
# mount /dev/nvme0n1p6 /mnt/gentoo
```

加密（推荐）：

```bash
# cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6
# cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root
# mkfs.btrfs --label root /dev/mapper/gentoo-root
# mount /dev/mapper/gentoo-root /mnt/gentoo
```

### 4.2 挂载 EFI 分区

挂载 Asahi ESP，不要格式化；支持脚本需要其中的厂商固件。

```bash
# mkdir -p /mnt/gentoo/boot
# mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

## 5. Stage3 与 chroot

按 Handbook 安装，Stage3 使用 ARM64 版。时间不准时，先完成第 5.3 节再下载。

Handbook：<https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn>

### 5.1 下载并解压 Stage3

下载最新的 arm64 desktop-systemd Stage3，验证后解压。

验证方法：<https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage#Verifying_and_validating>

```bash
# cd /mnt/gentoo
# BASE=https://distfiles.gentoo.org/releases/arm64/autobuilds
# STAGE3=$(wget -qO- "${BASE}/latest-stage3-arm64-desktop-systemd.txt" | grep -o '^[^ ]*\.tar\.xz')
# wget "${BASE}/${STAGE3}" "${BASE}/${STAGE3}.asc"
```

Live 镜像缺少公钥文件时，从以下页面获取并导入。

发布公钥：<https://www.gentoo.org/downloads/signatures/>

```bash
# gpg --import /usr/share/openpgp-keys/gentoo-release.asc
# gpg --verify "$(basename "${STAGE3}").asc" "$(basename "${STAGE3}")" && \
    tar xpvf "$(basename "${STAGE3}")" --xattrs-include='*.*' --numeric-owner
```

### 5.2 配置 Portage 仓库

```bash
# mkdir --parents /mnt/gentoo/etc/portage/repos.conf
# cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 5.3 同步系统时间

```bash
# chronyd -q
# date
```

时间错误会使 SSL 验证和 emerge 失败。

### 5.4 挂载并进入 chroot

```bash
# cp --dereference /etc/resolv.conf /mnt/gentoo/etc/
# mount --types proc /proc /mnt/gentoo/proc
# mount --rbind /sys /mnt/gentoo/sys
# mount --make-rslave /mnt/gentoo/sys
# mount --rbind /dev /mnt/gentoo/dev
# mount --make-rslave /mnt/gentoo/dev
# mount --bind /run /mnt/gentoo/run
# mount --make-slave /mnt/gentoo/run

# chroot /mnt/gentoo /bin/bash
# source /etc/profile
# export PS1="(chroot) ${PS1}"
```

### 5.5 编辑 make.conf

编辑已有文件：

```conf
# /etc/portage/make.conf
CHOST="aarch64-unknown-linux-gnu"
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"
LC_MESSAGES=C
MAKEOPTS="-j4"
GENTOO_MIRRORS="https://tw.mirrors.cicku.me/gentoo/"
EMERGE_DEFAULT_OPTS="--jobs 3"
VIDEO_CARDS="asahi"
GRUB_PLATFORMS="efi-64"
L10N="zh-CN zh-TW zh en"
```

默认使用官方列表中的 CICKU 台湾站；中国大陆可选 BFSU、USTC 或清华 TUNA。

官方镜像：<https://www.gentoo.org/downloads/mirrors/>

[Gentoo 镜像](/gentoo-mirrors/)

各芯片编译选项：<https://gcc.gnu.org/onlinedocs/gcc/AArch64-Options.html>

同步 Portage，将 `Asia/Shanghai` 换成所在地时区，如 `Asia/Taipei`、`Asia/Hong_Kong`：

```bash
# emerge-webrsync
# ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

在已有文件中启用区域设置：

```conf
# /etc/locale.gen
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

生成并选择区域设置：

```bash
# locale-gen
# eselect locale set en_US.utf8
# env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

建立用户：

```bash
# useradd -m -G wheel,audio,video,usb,input <用户名>
# passwd <用户名>
# passwd root
```

## 6. 安装 Asahi 支持套件

两种方式都用 dracut 生成 initramfs，非加密系统也一样。先创建 USE 配置目录：

```bash
# mkdir -p /etc/portage/package.use
```

创建文件，已存在则追加设置：

```conf
# /etc/portage/package.use/installkernel
sys-kernel/installkernel dracut
```

安装 dracut 和内核安装集成软件包：

```bash
# emerge --ask sys-kernel/dracut sys-kernel/installkernel
```

### 6.1 方法 A：自动化脚本（推荐）

以 root 在 chroot 内执行，Asahi ESP 挂载到 `/boot`，且须有 `/boot/vendorfw`。脚本会配置 Portage、启用 overlay，安装 Asahi 软件包、发行版内核和 GRUB，更新固件与 m1n1，但不更新 `@world`。

```bash
# emerge --sync
# emerge --ask dev-vcs/git

# cd /tmp
# git clone https://github.com/chadmed/asahi-gentoosupport
# cd asahi-gentoosupport
# ./install.sh
```

按要求合并 USE 配置后重新执行脚本，完成后跳到第 6.3 节。

### 6.2 方法 B：手动安装

保留第 5.2 节的 Gentoo 仓库，另外加入 Asahi。

Overlay：<https://github.com/chadmed/asahi-overlay>

```bash
# emerge --ask dev-vcs/git
# mkdir -p /etc/portage/repos.conf /etc/portage/package.mask /etc/portage/package.use /etc/portage/package.license
```

创建仓库配置文件：

```conf
# /etc/portage/repos.conf/asahi.conf
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
```

同步两个仓库：

```bash
# emerge --sync
```

创建屏蔽文件，禁用 Gentoo 的 dist-kernel 虚拟包：

```conf
# /etc/portage/package.mask/asahi
virtual/dist-kernel::gentoo
```

创建 Rust 的 USE 配置文件：

```conf
# /etc/portage/package.use/asahi
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
```

如果接受这些固件许可证，创建许可证配置文件：

```conf
# /etc/portage/package.license/firmware
sys-kernel/linux-firmware linux-fw-redistributable no-source-code
```

安装：

```bash
# emerge -q1 dev-lang/rust-bin
# emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

更新固件与引导程序：

```bash
# asahi-fwupdate
# update-m1n1
```

安装 GRUB：

```bash
# emerge -q grub:2
# grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
# grub-mkconfig -o /boot/grub/grub.cfg
```

ESP 挂载到 `/boot`；`--removable` 将 GRUB 放在 U-Boot 的默认 EFI 路径。第 5.5 节已设 `GRUB_PLATFORMS="efi-64"`。

`asahi-meta` 安装 m1n1、U-Boot、固件工具和 Mesa 支持。`virtual/dist-kernel:asahi` 选用 `sys-kernel/asahi-kernel`；手动编译则用 `sys-kernel/asahi-sources`。Mesa 保留 `VIDEO_CARDS="asahi"`。

### 6.3 配置 fstab

两种方式完成后都要检查更新：

```bash
# emerge --ask --update --deep --changed-use @world
```

查询根文件系统和 ESP 的 UUID。加密根目录取 `/dev/mapper/gentoo-root` 的 UUID，不是 LUKS UUID：

```bash
# blkid
```

填入 UUID，新增或替换冲突的根目录和引导挂载条目。ext4 系统将 `btrfs` 改为 `ext4`：

```fstab
# /etc/fstab
UUID=<root-uuid>  /      btrfs  defaults  0 1
UUID=<boot-uuid>  /boot  vfat   defaults  0 2
```

### 6.4 配置 LUKS（仅加密用户）

创建 USE 文件，已存在则追加设置：

```conf
# /etc/portage/package.use/fde
sys-apps/systemd cryptsetup
```

重新构建 systemd，启用 cryptsetup 支持：

```bash
# emerge --ask --oneshot sys-apps/systemd
```

查询 LUKS 容器的 UUID：

```bash
# blkid /dev/nvme0n1p6
```

编辑 `GRUB_CMDLINE_LINUX`，保留其他必要参数。ext4 系统改用 `rootfstype=ext4`：

```conf
# /etc/default/grub
GRUB_CMDLINE_LINUX="rd.luks.name=<LUKS-UUID>=gentoo-root root=/dev/mapper/gentoo-root rootfstype=btrfs rd.luks.allow-discards"
```

- `rd.luks.name=<LUKS-UUID>=gentoo-root`：解锁容器，将设备命名为 `gentoo-root`
- `root=/dev/mapper/gentoo-root`：使用解锁后的设备作为根文件系统
- `rd.luks.allow-discards`：允许 SSD TRIM 穿透加密层（要权衡安全性）

创建 dracut 配置目录：

```bash
# mkdir -p /etc/dracut.conf.d
```

创建加密根目录配置文件。ext4 系统从 `add_dracutmodules` 中删除 `btrfs`，将 `filesystems` 改为 `ext4`：

```conf
# /etc/dracut.conf.d/luks.conf
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
filesystems+=" btrfs "
```

可选：在 crypttab 中追加根设备映射，使用相同的 LUKS UUID。

```conf
# /etc/crypttab
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

生成 initramfs：

```bash
# dracut --force --regenerate-all
# grub-mkconfig -o /boot/grub/grub.cfg
# grep initrd /boot/grub/grub.cfg
```

`installkernel[dracut]` 会在安装内核时生成 initramfs；Asahi scripts 的安装钩子则执行 `update-m1n1`。

## 7. 完成与重启

创建或替换主机名文件：

```conf
# /etc/hostname
macbook
```

退出 chroot 前启用网络，完成配置后重建 initramfs 和 GRUB；非加密系统也须执行：

```bash
# emerge --ask net-misc/networkmanager
# systemctl enable NetworkManager
# passwd root
# dracut --force --regenerate-all
# grub-mkconfig -o /boot/grub/grub.cfg
# grep initrd /boot/grub/grub.cfg
```

退出 chroot 并重启：

```bash
# exit
# umount -R /mnt/gentoo
# cryptsetup luksClose gentoo-root   # 若使用加密
# reboot
```

首次启动顺序：U-Boot → GRUB（选 Gentoo）→（若加密）输入 LUKS 密码 → 登录提示。

## 8. 安装后配置

### 8.1 网络

```bash
$ nmtui
```

### 8.2 桌面环境

选择可用且以 `/systemd` 结尾的 ARM64 桌面 profile：

```bash
# eselect profile list
# eselect profile set default/linux/arm64/23.0/desktop/plasma/systemd
# emerge -avuDN @world
```

KDE Plasma：

```bash
# emerge --ask kde-plasma/plasma-meta kde-apps/kate kde-apps/dolphin
# systemctl enable sddm
```

GNOME：

```bash
# eselect profile set default/linux/arm64/23.0/desktop/gnome/systemd
# emerge -avuDN @world
# emerge --ask gnome-base/gnome gnome-extra/gnome-tweaks
# systemctl enable gdm
```

Xfce：

```bash
# eselect profile set default/linux/arm64/23.0/desktop/systemd
# emerge -avuDN @world
# emerge --ask xfce-base/xfce4-meta x11-misc/lightdm
# systemctl enable lightdm
```

桌面和显示管理器各选一种。首次构建约需 2–4 小时，使用 `--jobs 3` 或更少，避免内存不足。

### 8.3 字体与中文输入

```bash
# emerge --ask media-fonts/liberation-fonts media-fonts/noto media-fonts/noto-cjk media-fonts/dejavu
# eselect fontconfig enable 10-sub-pixel-rgb.conf
# eselect fontconfig enable 11-lcdfilter-default.conf

# emerge --ask app-i18n/fcitx-chinese-addons
```

使用 `fcitx-chinese-addons`；测试的 `app-i18n/fcitx-rime` 版本无法正常使用。

### 8.4 音频

以 root 安装 Asahi 音频配置：

```bash
# emerge --ask media-libs/asahi-audio
```

以普通用户停用已安装的 PulseAudio，再启用 PipeWire 和 WirePlumber：

```bash
$ systemctl --user disable --now pulseaudio.socket pulseaudio.service
$ systemctl --user enable --now pipewire-pulse.socket
$ systemctl --user enable --now wireplumber.service
```

OpenRC 配置：<https://wiki.gentoo.org/wiki/PipeWire#OpenRC>

## 9. 系统维护

定期更新：

```bash
# emerge --sync
# emerge --ask --update --deep --newuse @world
# emerge --ask --depclean
# dispatch-conf
```

`emerge --sync` 会同步 Asahi overlay，`emerge-webrsync` 不会。只同步 Asahi 时可用 `emaint sync -r asahi`。

更新内核、U-Boot 或 m1n1 后，更新引导文件：

```bash
# update-m1n1
# grub-mkconfig -o /boot/grub/grub.cfg
```

m1n1 Stage 2 提供内核识别硬件所需的设备树；`sys-apps/asahi-scripts` 的 installkernel hook 可自动更新。

保留 macOS 以获取固件更新。

## 10. 常见问题

**无法从 USB 启动**：U-Boot 的 USB 驱动较挑剔，尝试不同 USB、使用 USB 2.0 设备、或经过 USB Hub。

**启动停滞或黑屏**：确认内核与 m1n1 设备树匹配，且 `update-m1n1` 已在挂载 ESP 后执行成功。Recovery 设置失败则回 macOS 选 `p` 重试（第 2.3 节）。

**加密分区无法解锁**：检查 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX` 和 LUKS UUID（`blkid /dev/nvme0n1p6`），再执行 `grub-mkconfig -o /boot/grub/grub.cfg`。

**Wi-Fi 不稳定**：WPA3 或 6 GHz 频段问题。改用 WPA2、2.4 GHz 或 5 GHz。

**触控板失灵**：

```bash
# dmesg | grep -i firmware
# emerge --ask sys-apps/asahi-meta
```

## 11. 进阶选项

刘海（Notch）：在 GRUB 内核参数加入

```
appledrm.show_notch=1
```

内核 6.18 前使用 `apple_dcp.show_notch=1`；6.18 将 `apple_dcp` 改名为 `appledrm`。

KDE Plasma 可在顶部加全宽面板，高度对齐刘海底部。

自定义内核：

```bash
# emerge --ask sys-kernel/asahi-sources
# cd /usr/src/linux
# make menuconfig
# make -j$(nproc)
# make modules_install
# make install
# update-m1n1
# grub-mkconfig -o /boot/grub/grub.cfg
```

保留可用内核备用。

多内核切换：

```bash
# eselect kernel list
# eselect kernel set <number>
# update-m1n1
```

## 参考

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux 官方站](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo Handbook：Stage3 验证](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Gentoo 发布签名](https://www.gentoo.org/downloads/signatures/)
- [Gentoo 源码镜像](https://www.gentoo.org/downloads/mirrors/)
- [GCC Apple CPU 定义](https://github.com/gcc-mirror/gcc/blob/master/gcc/config/aarch64/aarch64-cores.def)

社区支持：

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 频道：[@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC `#gentoo` / `#asahi` @ [Libera.Chat](https://libera.chat/)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)
