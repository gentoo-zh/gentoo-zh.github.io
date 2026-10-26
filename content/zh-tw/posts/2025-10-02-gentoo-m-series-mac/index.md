---
title: "在 Apple Silicon Mac 上安裝 Gentoo Linux（M1/M2 MacBook 安裝教學）"
date: 2025-10-02
tags: ["tutorial"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
summary: "在 M1/M2 Mac 安裝 Gentoo，使用 Asahi 開機元件、ARM64 Stage3 與 systemd。"
description: "M1/M2 Mac 的 Gentoo 安裝步驟：Live USB、Stage3 驗證、Asahi 套件、根分割區加密與桌面設定。"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

在支援的 M1/M2 Mac 上安裝 ARM64 Gentoo，保留 macOS。Gentoo 使用 systemd；OpenRC 指令只用於 Live USB。

安裝指南：<https://wiki.gentoo.org/wiki/Project:Asahi/Guide>

分割磁碟前確認機型支援。M2 Mac Pro 安裝支援仍為 WIP；本教學不涵蓋後續世代。

M1 支援表：<https://asahilinux.org/docs/platform/feature-support/m1/>

M2 支援表：<https://asahilinux.org/docs/platform/feature-support/m2/>

各世代支援總表：<https://asahilinux.org/docs/platform/feature-support/overview/>

## 流程概覽

1. 下載 Gentoo Asahi Live USB 映像檔
2. 透過 Asahi 安裝程式設定 U-Boot
3. 從 Live USB 啟動
4. 分割區並掛載檔案系統
5. 解壓 Stage3 並 chroot
6. 安裝 Asahi 支援套件
7. 重啟完成安裝

選用項目：LUKS 加密、自訂核心、PipeWire 音訊、桌面環境。

## 事前準備

### 硬體需求

- Asahi 安裝程式支援的 M1/M2 Mac
- 至少 80 GB 可用磁碟空間，建議 120 GB 以上
- 穩定的 Wi-Fi 或乙太網

### 已知工作情況

支援機型可使用 CPU、儲存裝置、Wi-Fi、筆電鍵盤與觸控板，以及 GPU 加速。顯示與音訊支援依機型而異。Thunderbolt 與 USB-C DisplayPort Alt Mode 標為 WIP，Touch ID 尚不支援。

macOS 虛擬化尚不支援。

## 1. 準備 Gentoo Asahi Live USB

### 1.1 下載鏡像

下載目錄：<https://chadmed.au/pub/gentoo/>

下載日期最新的 `install-arm64-asahi-YYYYMMDD.iso` 和同名的 `.sha256`（`latest` 連結無效），然後校驗：

```bash
$ shasum -a 256 -c install-arm64-asahi-<date>.iso.sha256
```

顯示 `OK` 再寫入 USB。

### 1.2 製作啟動 USB

在下載目錄用 `diskutil list` 找出 USB，替換 `/dev/disk4` 與 `<date>`。寫入會清除 USB 資料：

```bash
$ diskutil list
$ diskutil unmountDisk /dev/disk4
$ sudo dd if=install-arm64-asahi-<date>.iso of=/dev/rdisk4 bs=4m
$ diskutil eject /dev/disk4
```

## 2. 設定 Asahi U-Boot 環境

### 2.1 執行 Asahi 安裝程式

詳情查看 <https://alx.sh> 。

在 macOS 開啟 Terminal，執行：

```bash
$ curl https://alx.sh | sh
```

載入後輸入 sudo 密碼，在 `Press enter to continue` 按 Enter。

以下為 MacBook Air（M2，2022）的輸出。

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

### 2.2 跟隨安裝程式

1. 輸入 `r` 縮小 macOS；已有足夠未配置空間則選 `f`，跳到第 5 步。

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

2. 輸入縮小後 macOS 要保留的大小，剩下的空間留給 Gentoo。

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

   `80GB` 為 macOS 保留 80 GB；`30%` 保留 30%、釋出 70%；`min` 縮至安全下限。須為 Gentoo 留出至少 80 GB。下限取決於已用空間；數值被拒絕時，改填較大的值或 `min`。

   ```text
   Size is too small, please enter a value > 287.41 GB
   ```

3. 確認將釋出的空間，在 `Continue?` 輸入 `y`。

   ```text
   Resizing will free up 128.38 GB of space.

   Note: your system may appear to freeze during the resize.
   This is normal, just wait until the process completes.
   » Continue? (y/N): y
   ```

   fsck 訊息與警告屬正常現象；出現 `Resize complete` 即完成，按 Enter 回到選單。

   ```text
   Finished APFS operation
   Resize complete. Press enter to continue.
   ```

4. 確認釋出的空間：

   ```text
   Partitions in system disk (disk0):
     1: APFS [Macintosh HD] (366.00 GB, 6 volumes)
       OS: [B*] [Macintosh HD] macOS v27.0.1 [disk3s3s1, 0396B26F-E9D1-47A3-AC3C-6D26CC3F2F64]
     2: (free space: 128.38 GB)
     3: APFS (System Recovery) (5.37 GB, 2 volumes)
       OS: [  ] recoveryOS v27.0.1 [Primary recoveryOS]
   ```

   在操作選單輸入 `f`。

   ```text
   Choose what to do:
     f: Install an OS into free space
     r: Resize an existing partition to make space for a new OS
     q: Quit without doing anything
   » Action (f): f
   ```

5. 選擇 `UEFI environment only (m1n1 + U-Boot + ESP)`，不要選 Fedora Asahi Remix。輸入畫面上的編號，不要固定填 `5`。

   ```text
   Choose an OS to install:
     1: Fedora Asahi Remix 44 with KDE Plasma
     2: Fedora Asahi Remix 44 with GNOME
     3: Fedora Asahi Remix 44 Server
     4: Fedora Asahi Remix 44 Minimal
     5: UEFI environment only (m1n1 + U-Boot + ESP)
   » OS: 5
   ```

   名稱可自訂，開機時的卷宗清單會顯示這個名稱。本文填 `Gentoo Linux`。

   ```text
   Minimum required space for this OS: 3.00 GB

   Available free space: 128.38 GB

   Enter a name for your OS
   » OS name (UEFI boot): Gentoo Linux
   ```

6. 等待安裝程式建立 stub macOS 與約 500 MB 的 EFI 分割區。

   ```text
   Creating new stub macOS named Gentoo Linux
   ```

   再次輸入 macOS 管理員密碼，新系統會設為預設開機卷宗。

   ```text
   To continue the installation, you will need to enter your macOS
   admin credentials.
   Password for zakk:
   ```

7. 出現 `Installation successful!` 後，選 `y` 傳送匿名報告、`n` 不傳送，或 `d` 查看內容。

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

### 2.3 完成 Recovery 設定

按 Enter 查看最後指示，再於關機提示按 Enter：

```text
Press enter to shut down the system.
```

1. 等待 25 秒，讓系統完全關機。
2. 按住電源鍵開機，只按一次，不要反覆按。按住期間 Apple 標誌下方的文字會變化：

   | 畫面文字 | 操作 |
   | --- | --- |
   | `Continue holding for startup options...` | 繼續按住 |
   | 正在載入啟動選項...（`Loading startup options...`）| 放開電源鍵 |

3. 等待卷宗清單出現：`Macintosh HD`、`Gentoo Linux`（Asahi 圖示）和「選項」。
4. 選擇 `Gentoo Linux`，按「繼續」。

   ![開機選單：Macintosh HD、Gentoo Linux 和選項，Gentoo Linux 已選取](boot-picker.webp)

5. `macOS Recovery` 會短暫出現。在 `Select a volume to recover` 選擇平常的 macOS 卷宗、按 `Next`，並依提示輸入 macOS 帳號密碼。
6. 出現 `Asahi Linux installer` 畫面後，終端機會自動執行第二步 `step2.sh`。這一步只改變 Gentoo 的安全等級，macOS 不受影響，過程中要輸入兩次 macOS 帳號密碼。

   按 Enter 繼續：

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

   輸入 macOS 密碼：

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

   安裝程式更新本機安全原則並顯示結果。`Security Mode` 變為 `Permissive`，只套用於 Gentoo：

   ```text
   Local policy update is in progress, please wait...

   Resulting local policy:
   （晶片 ID 與雜湊值，略）
   Security Mode:               Permissive (smb0 && smb1): 1
   3rd Party Kexts Status:      Disabled   (smb2): absent
   User-allowed MDM Control:    Disabled   (smb3): absent
   DEP-allowed MDM Control:     Disabled   (smb4): absent
   SIP Status:                  Enabled    (sip0): absent
   Signed System Volume Status: Enabled    (sip1): absent
   Kernel CTRR Status:          Disabled   (sip2): 1
   Boot Args Filtering Status:  Enabled    (sip3): absent
   ```

   輸入 `y` 確認：

   ```text
   By setting a custom boot object, you will be putting your system into Permissive Security.

   Are you sure you want to do this? (enter y or n) y
   found raw boot object, deriving Mach-O boot properties...
   wrapping boot object payload...
   going to change bootpolicy to permissive...
   updating local machine policy...
   ```

   再輸入一次 macOS 使用者名稱和密碼：

   ```text
   Username: zakk
   Password:
   installing boot object...
   done.

   Wrapping up...
   ```

   按 Enter 重新開機：

   ```text
   Installation complete! Press enter to reboot.
   ```


不斷重開機或要求重裝 macOS，表示啟動順序有誤。**先完全關機**：螢幕熄滅後等滿 25 秒，再按住電源鍵一次。

仍失敗時，最後才回到 macOS，重新執行 `curl https://alx.sh | sh` 並選 `p`。

## 3. 從 Live USB 啟動

插入 USB 開機，U-Boot 會自動啟動 USB 的 GRUB。手動指定方式：

```
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

用 NetworkManager 連線，再檢查 IP 連通性與 DNS：

```bash
# nmtui
# ping -c 3 1.1.1.1
# ping -c 3 www.gentoo.org
```

核心已含 Apple Silicon Wi-Fi 驅動程式；連線不穩時改試 2.4 GHz。

透過 SSH 操作 OpenRC Live USB：設定 root 密碼並啟動 sshd。

```bash
# passwd
# rc-service sshd start
# ip a
```

## 4. 分割區與檔案系統

只在 Asahi 安裝程式留下的空間建立分割區，不要刪除、縮放或格式化既有 APFS、EFI 與 Recovery 分割區。破壞開機分割區可能須用另一台 Mac 執行 DFU 回復，並清除內部 SSD。

檢視分割區：

```bash
# lsblk
# blkid --label "EFI - GENTO"
```

將 `/dev/nvme0n1p4`、其他分割區編號與 ESP 標籤換成實際值。

```
nvme0n1p1   500M    Apple Silicon boot
nvme0n1p2   307.3G  Apple APFS (macOS)
nvme0n1p3   2.3G    Apple APFS
nvme0n1p4   477M    EFI System  (不要動)
(free)      ~150G   Linux 可用空間
nvme0n1p5   5G      Apple Silicon recovery
```

### 4.1 建立根分割區

使用 `cfdisk /dev/nvme0n1` 在空閒空間建立 Linux filesystem 型別分割區。

先建立掛載點：

```bash
# mkdir -p /mnt/gentoo
```

不加密：

```bash
# mkfs.btrfs /dev/nvme0n1p6     # 或 mkfs.ext4
# mount /dev/nvme0n1p6 /mnt/gentoo
```

加密（推薦）：

```bash
# cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6
# cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root
# mkfs.btrfs --label root /dev/mapper/gentoo-root
# mount /dev/mapper/gentoo-root /mnt/gentoo
```

### 4.2 掛載 EFI 分割區

掛載 Asahi ESP，不要格式化；支援指令碼需要其中的廠商韌體。

```bash
# mkdir -p /mnt/gentoo/boot
# mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

## 5. Stage3 與 chroot

依 Handbook 安裝，Stage3 使用 ARM64 版。時間不準時，先完成第 5.3 節再下載。

Handbook：<https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn>

### 5.1 下載並解壓 Stage3

下載最新的 arm64 desktop-systemd Stage3，驗證後解壓縮。

驗證方式：<https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage#Verifying_and_validating>

```bash
# cd /mnt/gentoo
# BASE=https://distfiles.gentoo.org/releases/arm64/autobuilds
# STAGE3=$(wget -qO- "${BASE}/latest-stage3-arm64-desktop-systemd.txt" | grep -o '^[^ ]*\.tar\.xz')
# wget "${BASE}/${STAGE3}" "${BASE}/${STAGE3}.asc"
```

Live 映像檔缺少公鑰檔案時，從下列頁面取得並匯入。

發行公鑰：<https://www.gentoo.org/downloads/signatures/>

```bash
# gpg --import /usr/share/openpgp-keys/gentoo-release.asc
# gpg --verify "$(basename "${STAGE3}").asc" "$(basename "${STAGE3}")" && \
    tar xpvf "$(basename "${STAGE3}")" --xattrs-include='*.*' --numeric-owner
```

### 5.2 設定 Portage 儲存庫 {#52-配置-portage-倉庫}

```bash
# mkdir --parents /mnt/gentoo/etc/portage/repos.conf
# cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 5.3 同步系統時間

```bash
# chronyd -q
# date
```

時間錯誤會使 SSL 驗證與 emerge 失敗。

### 5.4 掛載並進入 chroot

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

### 5.5 編輯 make.conf

編輯既有檔案：

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

預設使用官方清單中的 CICKU 台灣站；中國大陸可選 BFSU、USTC 或清華 TUNA。

官方鏡像：<https://www.gentoo.org/downloads/mirrors/>

[Gentoo 鏡像](/gentoo-mirrors/)

各晶片編譯選項：<https://gcc.gnu.org/onlinedocs/gcc/AArch64-Options.html>

同步 Portage，將 `Asia/Shanghai` 換成所在地時區，如 `Asia/Taipei`、`Asia/Hong_Kong`：

```bash
# emerge-webrsync
# ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

在既有檔案啟用語系：

```conf
# /etc/locale.gen
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

產生並選擇語系：

```bash
# locale-gen
# eselect locale set en_US.utf8
# env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

建立使用者：

```bash
# useradd -m -G wheel,audio,video,usb,input <使用者名稱>
# passwd <使用者名稱>
# passwd root
```

## 6. 安裝 Asahi 支援套件

兩種方式都用 dracut 產生 initramfs，不加密也一樣。先建立 USE 設定目錄：

```bash
# mkdir -p /etc/portage/package.use
```

建立檔案，已存在則附加設定：

```conf
# /etc/portage/package.use/installkernel
sys-kernel/installkernel dracut
```

安裝 dracut 與核心安裝整合套件：

```bash
# emerge --ask sys-kernel/dracut sys-kernel/installkernel
```

### 6.1 方法 A：自動化指令碼（推薦）

以 root 在 chroot 內執行，Asahi ESP 掛載於 `/boot`，且須有 `/boot/vendorfw`。指令碼會設定 Portage、啟用 overlay，安裝 Asahi 套件、發行版核心和 GRUB，更新韌體與 m1n1，但不更新 `@world`。

```bash
# emerge --sync
# emerge --ask dev-vcs/git

# cd /tmp
# git clone https://github.com/chadmed/asahi-gentoosupport
# cd asahi-gentoosupport
# ./install.sh
```

依要求合併 USE 設定後重新執行指令碼，完成後跳到第 6.3 節。

### 6.2 方法 B：手動安裝

保留第 5.2 節的 Gentoo 儲存庫，另加入 Asahi。

Overlay：<https://github.com/chadmed/asahi-overlay>

```bash
# emerge --ask dev-vcs/git
# mkdir -p /etc/portage/repos.conf /etc/portage/package.mask /etc/portage/package.use /etc/portage/package.license
```

建立儲存庫設定檔：

```conf
# /etc/portage/repos.conf/asahi.conf
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
```

同步兩個儲存庫：

```bash
# emerge --sync
```

建立遮罩檔，停用 Gentoo 的 dist-kernel 虛擬套件：

```conf
# /etc/portage/package.mask/asahi
virtual/dist-kernel::gentoo
```

建立 Rust 的 USE 設定檔：

```conf
# /etc/portage/package.use/asahi
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
```

若接受這些韌體授權條款，建立授權設定檔：

```conf
# /etc/portage/package.license/firmware
sys-kernel/linux-firmware linux-fw-redistributable no-source-code
```

安裝：

```bash
# emerge -q1 dev-lang/rust-bin
# emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

更新韌體與載入程式：

```bash
# asahi-fwupdate
# update-m1n1
```

安裝 GRUB：

```bash
# emerge -q grub:2
# grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
# grub-mkconfig -o /boot/grub/grub.cfg
```

ESP 掛載於 `/boot`；`--removable` 將 GRUB 放在 U-Boot 的預設 EFI 路徑。第 5.5 節已設 `GRUB_PLATFORMS="efi-64"`。

`asahi-meta` 安裝 m1n1、U-Boot、韌體工具與 Mesa 支援。`virtual/dist-kernel:asahi` 選用 `sys-kernel/asahi-kernel`；手動編譯則用 `sys-kernel/asahi-sources`。Mesa 保留 `VIDEO_CARDS="asahi"`。

### 6.3 配置 fstab

兩種方式完成後都要檢查更新：

```bash
# emerge --ask --update --deep --changed-use @world
```

查出根檔案系統與 ESP 的 UUID。加密根目錄取 `/dev/mapper/gentoo-root` 的 UUID，不是 LUKS UUID：

```bash
# blkid
```

填入 UUID，新增或取代衝突的根目錄與開機掛載項目。ext4 系統將 `btrfs` 改為 `ext4`：

```fstab
# /etc/fstab
UUID=<root-uuid>  /      btrfs  defaults  0 1
UUID=<boot-uuid>  /boot  vfat   defaults  0 2
```

### 6.4 配置 LUKS（僅加密使用者）

建立 USE 檔案，已存在則附加設定：

```conf
# /etc/portage/package.use/fde
sys-apps/systemd cryptsetup
```

重新建置 systemd，啟用 cryptsetup 支援：

```bash
# emerge --ask --oneshot sys-apps/systemd
```

查出 LUKS 容器的 UUID：

```bash
# blkid /dev/nvme0n1p6
```

編輯 `GRUB_CMDLINE_LINUX`，保留其他必要參數。ext4 系統改用 `rootfstype=ext4`：

```conf
# /etc/default/grub
GRUB_CMDLINE_LINUX="rd.luks.name=<LUKS-UUID>=gentoo-root root=/dev/mapper/gentoo-root rootfstype=btrfs rd.luks.allow-discards"
```

- `rd.luks.name=<LUKS-UUID>=gentoo-root`：解鎖容器，將裝置命名為 `gentoo-root`
- `root=/dev/mapper/gentoo-root`：以解鎖後的裝置作為根檔案系統
- `rd.luks.allow-discards`：允許 SSD TRIM 穿透加密層（要權衡安全性）

建立 dracut 設定目錄：

```bash
# mkdir -p /etc/dracut.conf.d
```

建立加密根目錄設定檔。ext4 系統從 `add_dracutmodules` 移除 `btrfs`，將 `filesystems` 改為 `ext4`：

```conf
# /etc/dracut.conf.d/luks.conf
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
filesystems+=" btrfs "
```

選用：在 crypttab 附加根裝置對應，使用相同 LUKS UUID。

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

`installkernel[dracut]` 會在安裝核心時產生 initramfs；Asahi scripts 的安裝掛鉤則執行 `update-m1n1`。

## 7. 完成與重啟

建立或取代主機名稱檔案：

```conf
# /etc/hostname
macbook
```

離開 chroot 前啟用網路，完成設定後重建 initramfs 與 GRUB；不加密也須執行：

```bash
# emerge --ask net-misc/networkmanager
# systemctl enable NetworkManager
# passwd root
# dracut --force --regenerate-all
# grub-mkconfig -o /boot/grub/grub.cfg
# grep initrd /boot/grub/grub.cfg
```

退出 chroot 並重啟：

```bash
# exit
# umount -R /mnt/gentoo
# cryptsetup luksClose gentoo-root   # 若使用加密
# reboot
```

首次啟動順序：U-Boot → GRUB（選 Gentoo）→（若加密）輸入 LUKS 密碼 → 登入提示。

## 8. 安裝後配置

### 8.1 網路

```bash
$ nmtui
```

### 8.2 桌面環境

選擇可用且以 `/systemd` 結尾的 ARM64 桌面 profile：

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

桌面與顯示管理器各選一種。首次建置約需 2–4 小時，使用 `--jobs 3` 或更少，避免記憶體不足。

### 8.3 字型與中文輸入

```bash
# emerge --ask media-fonts/liberation-fonts media-fonts/noto media-fonts/noto-cjk media-fonts/dejavu
# eselect fontconfig enable 10-sub-pixel-rgb.conf
# eselect fontconfig enable 11-lcdfilter-default.conf

# emerge --ask app-i18n/fcitx-chinese-addons
```

使用 `fcitx-chinese-addons`；測試的 `app-i18n/fcitx-rime` 版本無法正常使用。

### 8.4 音訊

以 root 安裝 Asahi 音訊設定：

```bash
# emerge --ask media-libs/asahi-audio
```

以一般使用者停用已安裝的 PulseAudio，再啟用 PipeWire 與 WirePlumber：

```bash
$ systemctl --user disable --now pulseaudio.socket pulseaudio.service
$ systemctl --user enable --now pipewire-pulse.socket
$ systemctl --user enable --now wireplumber.service
```

OpenRC 設定：<https://wiki.gentoo.org/wiki/PipeWire#OpenRC>

## 9. 系統維護

定期更新：

```bash
# emerge --sync
# emerge --ask --update --deep --newuse @world
# emerge --ask --depclean
# dispatch-conf
```

`emerge --sync` 會同步 Asahi overlay，`emerge-webrsync` 不會。只同步 Asahi 時可用 `emaint sync -r asahi`。

更新核心、U-Boot 或 m1n1 後，更新開機檔案：

```bash
# update-m1n1
# grub-mkconfig -o /boot/grub/grub.cfg
```

m1n1 Stage 2 提供核心辨識硬體所需的裝置樹；`sys-apps/asahi-scripts` 的 installkernel hook 可自動更新。

保留 macOS 以取得韌體更新。

## 10. 常見問題

**無法從 USB 啟動**：U-Boot 的 USB 驅動較挑剔，嘗試不同 USB、使用 USB 2.0 裝置、或經過 USB Hub。

**開機停住或黑畫面**：確認核心與 m1n1 裝置樹相符，且 `update-m1n1` 已在 ESP 掛載後執行成功。Recovery 設定失敗則回 macOS 選 `p` 重試（第 2.3 節）。

**加密分割區無法解鎖**：檢查 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX` 與 LUKS UUID（`blkid /dev/nvme0n1p6`），再執行 `grub-mkconfig -o /boot/grub/grub.cfg`。

**Wi-Fi 不穩定**：WPA3 或 6 GHz 頻段問題。改用 WPA2、2.4 GHz 或 5 GHz。

**觸控板失靈**：

```bash
# dmesg | grep -i firmware
# emerge --ask sys-apps/asahi-meta
```

## 11. 進階選項

劉海（Notch）：在 GRUB 核心引數加入

```
appledrm.show_notch=1
```

核心 6.18 前使用 `apple_dcp.show_notch=1`；6.18 將 `apple_dcp` 改名為 `appledrm`。

KDE Plasma 可在頂部加全寬面板，高度對齊劉海底部。

自訂核心：

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

保留可用核心備援。

多核心切換：

```bash
# eselect kernel list
# eselect kernel set <number>
# update-m1n1
```

## 參考

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux 官方站](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo Handbook：Stage3 驗證](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Gentoo 發行簽章](https://www.gentoo.org/downloads/signatures/)
- [Gentoo 原始碼鏡像](https://www.gentoo.org/downloads/mirrors/)
- [GCC Apple CPU 定義](https://github.com/gcc-mirror/gcc/blob/master/gcc/config/aarch64/aarch64-cores.def)

社群支援：

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 頻道：[@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC `#gentoo` / `#asahi` @ [Libera.Chat](https://libera.chat/)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)
