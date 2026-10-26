---
title: "Installing Gentoo Linux on Apple Silicon Macs (M1/M2 MacBook Install Guide)"
date: 2025-10-02
tags: ["tutorial"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
summary: "Install Gentoo on an M1/M2 Mac with Asahi boot support, an ARM64 Stage3, and systemd."
description: "Gentoo installation on M1/M2 Macs: live USB, Stage3 verification, Asahi packages, encrypted root, and desktop setup."
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

Install ARM64 Gentoo alongside macOS on supported M1/M2 Macs. Use systemd for Gentoo; the OpenRC commands apply only to the live USB.

Installation guide: <https://wiki.gentoo.org/wiki/Project:Asahi/Guide>

Check model support before partitioning. M2 Mac Pro installer support is WIP; later generations are outside this guide.

M1 support: <https://asahilinux.org/docs/platform/feature-support/m1/>

M2 support: <https://asahilinux.org/docs/platform/feature-support/m2/>

All generations: <https://asahilinux.org/docs/platform/feature-support/overview/>

## Process Overview

1. Download the Gentoo Asahi live USB image
2. Set up U-Boot via the Asahi installer
3. Boot from the live USB
4. Partition and mount the filesystem
5. Extract the Stage3 and chroot
6. Install the Asahi support package set
7. Reboot to finish the install

Optional steps: LUKS encryption, a custom kernel, PipeWire audio, a desktop environment.

## Prerequisites

### Hardware Requirements

- An M1/M2 Mac supported by the Asahi installer
- At least 80 GB of free disk space, 120 GB or more is better
- Stable Wi-Fi or Ethernet

### Known Working Status

CPU, storage, Wi-Fi, laptop keyboards and trackpads, and GPU acceleration work on supported models. Display and audio support vary by model. Thunderbolt and USB-C DisplayPort Alt Mode are marked WIP; Touch ID is unsupported.

macOS virtualization is not supported.

## 1. Prepare the Gentoo Asahi Live USB

### 1.1 Download the Image

Download the ISO and its `.sha256`, then check it:

- <https://chadmed.au/pub/gentoo/install-arm64-asahi-20260827.iso>
- <https://chadmed.au/pub/gentoo/install-arm64-asahi-20260827.iso.sha256>

```bash
$ shasum -a 256 -c install-arm64-asahi-20260827.iso.sha256
```

Write the USB only after it prints `OK`.

The 20260827 image has been verified to boot on a MacBook Air M2. The 20261006 image ships GRUB 2.16, which fails on Asahi U-Boot with `cannot allocate memory for memory map`; do not use it for now.

### 1.2 Create the Bootable USB

In the download directory, identify the USB with `diskutil list`; replace `/dev/disk4`. Writing erases the USB:

```bash
$ diskutil list
$ diskutil unmountDisk /dev/disk4
$ sudo dd if=install-arm64-asahi-20260827.iso of=/dev/rdisk4 bs=4m
$ diskutil eject /dev/disk4
```

## 2. Set Up the Asahi U-Boot Environment

### 2.1 Run the Asahi Installer

Details: <https://alx.sh>

Open Terminal in macOS and run:

```bash
$ curl https://alx.sh | sh
```

Enter the sudo password after bootstrapping, then press Enter at `Press enter to continue`.

Output from a MacBook Air (M2, 2022):

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

### 2.2 Follow the Installer

1. Enter `r` to shrink macOS, or `f` if enough unallocated space exists (skip to step 5).

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

2. Enter the size macOS keeps after shrinking; the rest is left for Gentoo.

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

   `80GB` keeps 80 GB for macOS; `30%` keeps 30% and frees 70%; `min` uses the smallest safe size. Leave at least 80 GB for Gentoo. The minimum depends on used space; if rejected, enter a larger value or `min`.

   ```text
   Size is too small, please enter a value > 287.41 GB
   ```

3. Check the space to be freed, then enter `y` at `Continue?`.

   ```text
   Resizing will free up 128.38 GB of space.

   Note: your system may appear to freeze during the resize.
   This is normal, just wait until the process completes.
   » Continue? (y/N): y
   ```

   The fsck lines and warnings are normal. At `Resize complete`, press Enter to return to the menu.

   ```text
   Finished APFS operation
   Resize complete. Press enter to continue.
   ```

4. Check the newly freed space:

   ```text
   Partitions in system disk (disk0):
     1: APFS [Macintosh HD] (366.00 GB, 6 volumes)
       OS: [B*] [Macintosh HD] macOS v27.0.1 [disk3s3s1, 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64]
     2: (free space: 128.38 GB)
     3: APFS (System Recovery) (5.37 GB, 2 volumes)
       OS: [  ] recoveryOS v27.0.1 [Primary recoveryOS]
   ```

   Enter `f` at the action menu.

   ```text
   Choose what to do:
     f: Install an OS into free space
     r: Resize an existing partition to make space for a new OS
     q: Quit without doing anything
   » Action (f): f
   ```

5. Choose `UEFI environment only (m1n1 + U-Boot + ESP)`, not Fedora Asahi Remix. Use its displayed number, not a fixed `5`.

   ```text
   Choose an OS to install:
     1: Fedora Asahi Remix 44 with KDE Plasma
     2: Fedora Asahi Remix 44 with GNOME
     3: Fedora Asahi Remix 44 Server
     4: Fedora Asahi Remix 44 Minimal
     5: UEFI environment only (m1n1 + U-Boot + ESP)
   » OS: 5
   ```

   Enter any name; the startup volume list shows it. This guide uses `Gentoo Linux`.

   ```text
   Minimum required space for this OS: 3.00 GB

   Available free space: 128.38 GB

   Enter a name for your OS
   » OS name (UEFI boot): Gentoo Linux
   ```

6. Wait for the stub macOS and roughly 500 MB EFI partition to be created.

   ```text
   Creating new stub macOS named Gentoo Linux
   ```

   Re-enter the macOS administrator password; the new OS becomes the default boot volume.

   ```text
   To continue the installation, you will need to enter your macOS
   admin credentials.
   Password for zakk:
   ```

7. After `Installation successful!`, choose `y` to send the anonymous report, `n` to decline, or `d` to inspect it.

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

### 2.3 Complete the Recovery Setup

Press Enter to view the final instructions, then Enter at the shutdown prompt:

```text
Press enter to shut down the system.
```

1. Wait 25 seconds for the system to shut down fully.
2. Press and hold the power button once; do not press it repeatedly. The text below the Apple logo changes while you hold it:

   | Screen text | Action |
   | --- | --- |
   | `Continue holding for startup options...` | Keep holding |
   | `Loading startup options...` | Release the button |

3. Wait for the volume list: `Macintosh HD`, `Gentoo Linux` (Asahi icon) and `Options`.
4. Select `Gentoo Linux` and click `Continue`.

   ![Startup picker with Macintosh HD, Gentoo Linux and Options; Gentoo Linux is selected](boot-picker.webp)

5. `macOS Recovery` appears briefly. At `Select a volume to recover`, choose your normal macOS volume, click `Next`, and enter your macOS credentials if asked.
6. When the `Asahi Linux installer` screen appears, Terminal runs the second step, `step2.sh`, on its own. It changes the security level of the Gentoo install only; macOS is not affected. You enter your macOS credentials twice.

   Press Enter to continue:

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

   Enter your macOS password:

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

   The installer updates the local policy and prints it. `Security Mode` becomes `Permissive`, for Gentoo only:

   ```text
   Local policy update is in progress, please wait...

   Resulting local policy:
   (chip ID and hashes omitted)
   Security Mode:               Permissive (smb0 && smb1): 1
   3rd Party Kexts Status:      Disabled   (smb2): absent
   User-allowed MDM Control:    Disabled   (smb3): absent
   DEP-allowed MDM Control:     Disabled   (smb4): absent
   SIP Status:                  Enabled    (sip0): absent
   Signed System Volume Status: Enabled    (sip1): absent
   Kernel CTRR Status:          Disabled   (sip2): 1
   Boot Args Filtering Status:  Enabled    (sip3): absent
   ```

   Enter `y` to confirm:

   ```text
   By setting a custom boot object, you will be putting your system into Permissive Security.

   Are you sure you want to do this? (enter y or n) y
   found raw boot object, deriving Mach-O boot properties...
   wrapping boot object payload...
   going to change bootpolicy to permissive...
   updating local machine policy...
   ```

   Enter your macOS user name and password again:

   ```text
   Username: zakk
   Password:
   installing boot object...
   done.

   Wrapping up...
   ```

   Press Enter to reboot:

   ```text
   Installation complete! Press enter to reboot.
   ```


A boot loop or macOS reinstall message means the startup sequence was missed. **Shut down fully:** wait the full 25 seconds with the screen dark, then press and hold the power button once.

Only if that retry still fails, boot macOS, rerun `curl https://alx.sh | sh`, and choose `p` as a last resort.

## 3. Boot from the Live USB

Insert the USB and power on; U-Boot boots its GRUB automatically. To select it manually:

```
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

Connect with NetworkManager, then check IP connectivity and DNS:

```bash
# nmtui
# ping -c 3 1.1.1.1
# ping -c 3 www.gentoo.org
```

The kernel includes the Apple Silicon Wi-Fi driver. Try 2.4 GHz if unstable.

For SSH on the OpenRC live USB, set a root password and start sshd:

```bash
# passwd
# rc-service sshd start
# ip a
```

## 4. Partitioning and Filesystem

Partition only the space left by the Asahi installer. Do not delete, resize, or format existing APFS, EFI, or Recovery partitions. Boot partition damage may require a second Mac for DFU restore, erasing the internal SSD.

Inspect the partitions:

```bash
# lsblk
# blkid --label "EFI - GENTO"
```

Replace `/dev/nvme0n1p4`, the other partition numbers, and the ESP label with yours.

```
nvme0n1p1   500M    Apple Silicon boot
nvme0n1p2   307.3G  Apple APFS (macOS)
nvme0n1p3   2.3G    Apple APFS
nvme0n1p4   477M    EFI System  (do not touch)
(free)      ~150G   free space for Linux
nvme0n1p5   5G      Apple Silicon recovery
```

### 4.1 Create the Root Partition

Create a Linux filesystem partition in free space with `cfdisk /dev/nvme0n1`.

Create the mount point:

```bash
# mkdir -p /mnt/gentoo
```

Without encryption:

```bash
# mkfs.btrfs /dev/nvme0n1p6     # or mkfs.ext4
# mount /dev/nvme0n1p6 /mnt/gentoo
```

With encryption (recommended):

```bash
# cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6
# cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root
# mkfs.btrfs --label root /dev/mapper/gentoo-root
# mount /dev/mapper/gentoo-root /mnt/gentoo
```

### 4.2 Mount the EFI Partition

Mount the Asahi ESP without formatting; the support script needs its vendor firmware.

```bash
# mkdir -p /mnt/gentoo/boot
# mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

## 5. Stage3 and chroot

Follow the Handbook with an ARM64 Stage3. If the clock is wrong, complete section 5.3 before downloading.

Handbook: <https://wiki.gentoo.org/wiki/Handbook:AMD64>

### 5.1 Download and Extract the Stage3

Download, verify, and extract the latest arm64 desktop-systemd Stage3.

Verification: <https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage#Verifying_and_validating>

```bash
# cd /mnt/gentoo
# BASE=https://distfiles.gentoo.org/releases/arm64/autobuilds
# STAGE3=$(wget -qO- "${BASE}/latest-stage3-arm64-desktop-systemd.txt" | grep -o '^[^ ]*\.tar\.xz')
# wget "${BASE}/${STAGE3}" "${BASE}/${STAGE3}.asc"
```

If the live image lacks the key file, obtain and import it here:

Release keys: <https://www.gentoo.org/downloads/signatures/>

```bash
# gpg --import /usr/share/openpgp-keys/gentoo-release.asc
# gpg --verify "$(basename "${STAGE3}").asc" "$(basename "${STAGE3}")" && \
    tar xpvf "$(basename "${STAGE3}")" --xattrs-include='*.*' --numeric-owner
```

### 5.2 Configure the Portage Repository

```bash
# mkdir --parents /mnt/gentoo/etc/portage/repos.conf
# cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 5.3 Sync the System Clock

```bash
# chronyd -q
# date
```

A wrong clock breaks SSL verification and emerge.

### 5.4 Mount and Enter the chroot

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

### 5.5 Edit make.conf

Edit the existing file:

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

Use CICKU Taiwan from the official mirror list, or BFSU, USTC, or Tsinghua TUNA in mainland China.

Official mirrors: <https://www.gentoo.org/downloads/mirrors/>

[Gentoo mirrors](/gentoo-mirrors/)

Per-chip compiler options: <https://gcc.gnu.org/onlinedocs/gcc/AArch64-Options.html>

Sync Portage and set your time zone; replace `Asia/Shanghai` with `Asia/Taipei`, `Asia/Hong_Kong`, or your zone:

```bash
# emerge-webrsync
# ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

Enable locales in the existing file:

```conf
# /etc/locale.gen
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

Generate and select the locale:

```bash
# locale-gen
# eselect locale set en_US.utf8
# env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

Create a user:

```bash
# useradd -m -G wheel,audio,video,usb,input <username>
# passwd <username>
# passwd root
```

## 6. Install the Asahi Support Package Set

Both methods use dracut for initramfs, with or without encryption. Create the USE configuration directory:

```bash
# mkdir -p /etc/portage/package.use
```

Create the file or append to it:

```conf
# /etc/portage/package.use/installkernel
sys-kernel/installkernel dracut
```

Install the generator and its kernel-install integration:

```bash
# emerge --ask sys-kernel/dracut sys-kernel/installkernel
```

### 6.1 Method A: Automated Script (Recommended)

Run as root in the chroot, with the Asahi ESP at `/boot` and `/boot/vendorfw` present. The script configures Portage, enables the overlay, installs Asahi packages, the distribution kernel and GRUB, and updates firmware and m1n1—not `@world`.

```bash
# emerge --sync
# emerge --ask dev-vcs/git

# cd /tmp
# git clone https://github.com/chadmed/asahi-gentoosupport
# cd asahi-gentoosupport
# ./install.sh
```

Merge requested USE changes and rerun the script; on completion, go to section 6.3.

### 6.2 Method B: Manual Install

Keep the Gentoo repository from section 5.2 and add Asahi.

Overlay: <https://github.com/chadmed/asahi-overlay>

```bash
# emerge --ask dev-vcs/git
# mkdir -p /etc/portage/repos.conf /etc/portage/package.mask /etc/portage/package.use /etc/portage/package.license
```

Create the repository configuration:

```conf
# /etc/portage/repos.conf/asahi.conf
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
```

Sync both repositories:

```bash
# emerge --sync
```

Create a mask file for the Gentoo dist-kernel virtual:

```conf
# /etc/portage/package.mask/asahi
virtual/dist-kernel::gentoo
```

Create the Rust USE configuration:

```conf
# /etc/portage/package.use/asahi
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
```

Create the license file if you accept these firmware licenses:

```conf
# /etc/portage/package.license/firmware
sys-kernel/linux-firmware linux-fw-redistributable no-source-code
```

Install:

```bash
# emerge -q1 dev-lang/rust-bin
# emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

Update the firmware and bootloader:

```bash
# asahi-fwupdate
# update-m1n1
```

Install GRUB:

```bash
# emerge -q grub:2
# grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
# grub-mkconfig -o /boot/grub/grub.cfg
```

The ESP mounts at `/boot`; `--removable` puts GRUB at U-Boot's fallback EFI path. Section 5.5 sets `GRUB_PLATFORMS="efi-64"`.

`asahi-meta` installs m1n1, U-Boot, firmware tools and Mesa support. `virtual/dist-kernel:asahi` selects `sys-kernel/asahi-kernel`; use `sys-kernel/asahi-sources` for manual builds. Keep `VIDEO_CARDS="asahi"` for Mesa.

### 6.3 Configure fstab

After either method, review the system update:

```bash
# emerge --ask --update --deep --changed-use @world
```

Get the root filesystem and ESP UUIDs. For encrypted root, use `/dev/mapper/gentoo-root`, not the LUKS UUID:

```bash
# blkid
```

Add these entries with your UUIDs, replacing conflicting root/boot entries. For ext4, replace `btrfs` with `ext4`:

```fstab
# /etc/fstab
UUID=<root-uuid>  /      btrfs  defaults  0 1
UUID=<boot-uuid>  /boot  vfat   defaults  0 2
```

### 6.4 Configure LUKS (Encrypted Installations Only) {#64-configure-luks-encrypted-users-only}

Create the USE file or append to it:

```conf
# /etc/portage/package.use/fde
sys-apps/systemd cryptsetup
```

Rebuild systemd with cryptsetup support:

```bash
# emerge --ask --oneshot sys-apps/systemd
```

Get the UUID of the LUKS container:

```bash
# blkid /dev/nvme0n1p6
```

Edit `GRUB_CMDLINE_LINUX`, keeping other required parameters. For ext4, use `rootfstype=ext4`:

```conf
# /etc/default/grub
GRUB_CMDLINE_LINUX="rd.luks.name=<LUKS-UUID>=gentoo-root root=/dev/mapper/gentoo-root rootfstype=btrfs rd.luks.allow-discards"
```

- `rd.luks.name=<LUKS-UUID>=gentoo-root`: unlock the container as `gentoo-root`
- `root=/dev/mapper/gentoo-root`: use the unlocked device as the root filesystem
- `rd.luks.allow-discards`: lets SSD TRIM pass through the encryption layer (a security trade-off)

Create the dracut configuration directory:

```bash
# mkdir -p /etc/dracut.conf.d
```

Create the encrypted-root configuration. For ext4, remove `btrfs` from `add_dracutmodules` and set `filesystems` to `ext4`:

```conf
# /etc/dracut.conf.d/luks.conf
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
filesystems+=" btrfs "
```

Optionally append the root mapping to crypttab with the same LUKS UUID:

```conf
# /etc/crypttab
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

Generate the initramfs:

```bash
# dracut --force --regenerate-all
# grub-mkconfig -o /boot/grub/grub.cfg
# grep initrd /boot/grub/grub.cfg
```

`installkernel[dracut]` generates initramfs images when kernels are installed; the Asahi scripts hook runs `update-m1n1`.

## 7. Finishing Up and Rebooting

Create or replace the hostname file:

```conf
# /etc/hostname
macbook
```

Before leaving the chroot, enable networking and regenerate initramfs and GRUB after configuration, even without encryption:

```bash
# emerge --ask net-misc/networkmanager
# systemctl enable NetworkManager
# passwd root
# dracut --force --regenerate-all
# grub-mkconfig -o /boot/grub/grub.cfg
# grep initrd /boot/grub/grub.cfg
```

Exit the chroot and reboot:

```bash
# exit
# umount -R /mnt/gentoo
# cryptsetup luksClose gentoo-root   # If using encryption
# reboot
```

First boot order: U-Boot → GRUB (pick Gentoo) → (if encrypted) type the LUKS password → login prompt.

## 8. Post-Install Configuration

### 8.1 Networking

```bash
$ nmtui
```

### 8.2 Desktop Environment

Select an available ARM64 desktop profile ending in `/systemd`:

```bash
# eselect profile list
# eselect profile set default/linux/arm64/23.0/desktop/plasma/systemd
# emerge -avuDN @world
```

KDE Plasma:

```bash
# emerge --ask kde-plasma/plasma-meta kde-apps/kate kde-apps/dolphin
# systemctl enable sddm
```

GNOME:

```bash
# eselect profile set default/linux/arm64/23.0/desktop/gnome/systemd
# emerge -avuDN @world
# emerge --ask gnome-base/gnome gnome-extra/gnome-tweaks
# systemctl enable gdm
```

Xfce:

```bash
# eselect profile set default/linux/arm64/23.0/desktop/systemd
# emerge -avuDN @world
# emerge --ask xfce-base/xfce4-meta x11-misc/lightdm
# systemctl enable lightdm
```

Choose one desktop and display manager. The first build takes about 2–4 hours; use `--jobs 3` or fewer to avoid OOM.

### 8.3 Fonts and Chinese Input

```bash
# emerge --ask media-fonts/liberation-fonts media-fonts/noto media-fonts/noto-cjk media-fonts/dejavu
# eselect fontconfig enable 10-sub-pixel-rgb.conf
# eselect fontconfig enable 11-lcdfilter-default.conf

# emerge --ask app-i18n/fcitx-chinese-addons
```

Use `fcitx-chinese-addons`; the tested `app-i18n/fcitx-rime` version does not work.

### 8.4 Audio

Install the Asahi audio configuration as root:

```bash
# emerge --ask media-libs/asahi-audio
```

As your normal user, stop PulseAudio if installed, then enable PipeWire and WirePlumber:

```bash
$ systemctl --user disable --now pulseaudio.socket pulseaudio.service
$ systemctl --user enable --now pipewire-pulse.socket
$ systemctl --user enable --now wireplumber.service
```

OpenRC setup: <https://wiki.gentoo.org/wiki/PipeWire#OpenRC>

## 9. System Maintenance

Update regularly:

```bash
# emerge --sync
# emerge --ask --update --deep --newuse @world
# emerge --ask --depclean
# dispatch-conf
```

`emerge --sync` includes the Asahi overlay; `emerge-webrsync` does not. To sync only Asahi, use `emaint sync -r asahi`.

Refresh boot files after kernel, U-Boot, or m1n1 updates:

```bash
# update-m1n1
# grub-mkconfig -o /boot/grub/grub.cfg
```

m1n1 Stage 2 supplies the kernel's hardware devicetrees. The `sys-apps/asahi-scripts` installkernel hook can automate updates.

Keep macOS for firmware updates.

## 10. Troubleshooting

**Can't boot from USB**: U-Boot's USB driver is picky. Try a different USB drive, a USB 2.0 device, or go through a USB hub.

**Boot hangs or black screen**: match the kernel and m1n1 devicetrees; confirm `update-m1n1` ran with the ESP mounted. For installer Recovery failures, retry with `p` from macOS (section 2.3).

**Encrypted partition won't unlock**: check `/etc/default/grub`'s `GRUB_CMDLINE_LINUX` and the LUKS UUID (`blkid /dev/nvme0n1p6`), then rerun `grub-mkconfig -o /boot/grub/grub.cfg`.

**Wi-Fi is unstable**: usually a WPA3 or 6 GHz band issue. Switch to WPA2, 2.4 GHz, or 5 GHz.

**Trackpad dead**:

```bash
# dmesg | grep -i firmware
# emerge --ask sys-apps/asahi-meta
```

## 11. Advanced Options

The notch: add this to the GRUB kernel parameters

```
appledrm.show_notch=1
```

Before kernel 6.18, use `apple_dcp.show_notch=1`; 6.18 renamed `apple_dcp` to `appledrm`.

In KDE Plasma, add a full-width top panel reaching the notch's lower edge.

Custom kernel:

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

Keep a working fallback kernel.

Switching between kernels:

```bash
# eselect kernel list
# eselect kernel set <number>
# update-m1n1
```

## References

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux official site](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo Handbook: Stage file verification](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Gentoo release signatures](https://www.gentoo.org/downloads/signatures/)
- [Gentoo source mirrors](https://www.gentoo.org/downloads/mirrors/)
- [GCC Apple CPU definitions](https://github.com/gcc-mirror/gcc/blob/master/gcc/config/aarch64/aarch64-cores.def)

Community support:

- Telegram group: [@gentoo_zh](https://t.me/gentoo_zh)
- Telegram channel: [@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC `#gentoo` / `#asahi` @ [Libera.Chat](https://libera.chat/)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)
