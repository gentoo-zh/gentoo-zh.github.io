---
title: "在 Apple Silicon Mac 上安裝 Gentoo Linux（M1/M2 MacBook 安裝教學）"
date: 2025-10-02
tags: ["tutorial"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
summary: "在 Apple Silicon Mac（M1/M2）上安裝 Gentoo Linux 的完整流程，基於 Asahi Linux 官方支援。"
description: "在 M1/M2 MacBook 上裝 Gentoo 的完整流程，基於 Asahi Linux：Live USB、分割槽、核心到桌面都有。"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

本文記錄在 Apple Silicon Mac（M1/M2 系列）上安裝原生 ARM64 Gentoo Linux 的完整流程。

得益於 Asahi Linux 專案團隊（尤其是 [chadmed](https://github.com/chadmed/gentoo-asahi-releng)）的工作，Gentoo 現已有[官方 Asahi 安裝指南](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)，本文基於該指南並補充實測細節。

硬體支援（按 Asahi [Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/) 現況）：

- M1、M2 全系列：可作日常桌面使用
- M3：GPU 進行中，Wi-Fi / 音訊等仍 TBA，不建議作桌面
- M4：核心驅動多為 TBA，暫不可用
- M5：官方支援表尚未列出

本文流程以 M1/M2 為準。最後核對日期：2026 年 5 月 29 日。

## 流程概覽

必選步驟：

1. 下載官方 Gentoo Asahi Live USB 鏡像
2. 透過 Asahi 安裝程式設定 U-Boot
3. 從 Live USB 啟動
4. 分割槽並掛載檔案系統
5. 解壓 Stage3 並 chroot
6. 安裝 Asahi 支援套件
7. 重啟完成安裝

可選步驟：LUKS 加密、自定義核心、PipeWire 音訊、桌面環境。

整個流程會在 Mac 上建立 macOS + Gentoo Linux ARM64 雙啟動環境。

## 事前準備

### 硬體需求

- Apple Silicon Mac（僅 M1/M2 可作桌面使用；M3/M4 驅動不完整，M5 尚未列入官方支援表）
- 至少 80 GB 可用磁碟空間，建議 120 GB 以上
- 穩定的 Wi-Fi 或乙太網
- 備份所有重要資料

### 已知工作情況

可用：CPU、記憶體、儲存、Wi-Fi、鍵盤、觸控板、電池管理、內建與外接顯示、USB-C / Thunderbolt。

部分支援：GPU 加速（OpenGL 部分支援）。

不可用：Touch ID、macOS 虛擬化。

## 1. 準備 Gentoo Asahi Live USB

### 1.1 下載鏡像

直接使用 Gentoo 提供的 ARM64 Live USB，無需 Fedora 中轉：

```
https://chadmed.au/pub/gentoo/
```

推薦 `install-arm64-asahi-latest.iso`（chadmed 維護的穩定符號連結），或選擇有具體日期的版本以便後續復現。若遇到啟動問題，可以嘗試上一個穩定日期版本。

### 1.2 製作啟動 USB

在 macOS 中：

```bash
diskutil list
diskutil unmountDisk /dev/disk4
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress
diskutil eject /dev/disk4
```

## 2. 設定 Asahi U-Boot 環境

### 2.1 執行 Asahi 安裝程式

在 macOS Terminal 中：

```bash
curl https://alx.sh | sh
```

建議先訪問 <https://alx.sh> 檢視指令碼內容再執行。

### 2.2 跟隨安裝程式

1. 選擇 `r`（Resize an existing partition to make space for a new OS）
2. 分配給 Linux 的空間（建議至少 80 GB，可填百分比或絕對大小）
3. 選擇 **UEFI environment only (m1n1 + U-Boot + ESP)**
4. OS 名稱輸入 `Gentoo`
5. 按指示關機

### 2.3 完成 Recovery 設定

1. 等待 25 秒確保完全關機
2. 按住電源鍵直到出現 "Loading startup options..."
3. 釋放電源鍵
4. 在卷列表中選擇 Gentoo
5. 進入 macOS Recovery，輸入使用者密碼（FileVault）
6. 按指示完成設定

如遇啟動迴圈或要求重灌 macOS，請按住電源鍵關機後從頭開始；或開機進入 macOS 重新執行 `curl https://alx.sh | sh` 選 `p` 重試。

## 3. 從 Live USB 啟動

插入 USB 並開機，U-Boot 會自動從 USB 啟動 GRUB。若需手動指定：

```
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

設定網路（Gentoo Live USB 現在用 NetworkManager，nmtui 是最快方式）：

```bash
nmtui                  # 選 Wi-Fi 網路或編輯有線連線
ping -c 3 1.1.1.1      # 先用 IP 驗證連通性（避開 DNS 問題）
ping -c 3 www.gentoo.org   # 再測 DNS
```

Apple Silicon 的 Wi-Fi 驅動已包含在核心中。若不穩定，嘗試 2.4 GHz 網路。

可選啟用 SSH 遠端操作（Live USB 用 OpenRC）：

```bash
passwd                 # 設 root 密碼
rc-service sshd start  # 啟動 SSH（OpenRC 指令）
ip a | grep inet       # 檢視 IP 地址
```

## 4. 分割槽與檔案系統

不要修改現有的 APFS 容器、EFI 分割槽或 Recovery 分割槽，只在 Asahi 安裝程式預留的空間中操作。

檢視分割槽：

```bash
lsblk
blkid --label "EFI - GENTO"
```

典型佈局：

```
nvme0n1p1   500M    Apple Silicon boot
nvme0n1p2   307.3G  Apple APFS (macOS)
nvme0n1p3   2.3G    Apple APFS
nvme0n1p4   477M    EFI System  (不要動)
(free)      ~150G   Linux 可用空間
nvme0n1p5   5G      Apple Silicon recovery
```

### 4.1 建立根分割槽

使用 `cfdisk /dev/nvme0n1` 在空閒空間建立 Linux filesystem 型別分割槽。

不加密：

```bash
mkfs.btrfs /dev/nvme0n1p6     # 或 mkfs.ext4
mount /dev/nvme0n1p6 /mnt/gentoo
```

加密（推薦）：

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root
mkfs.btrfs --label root /dev/mapper/gentoo-root
mount /dev/mapper/gentoo-root /mnt/gentoo
```

引數說明：`argon2id` 抗 ASIC/GPU 暴力破解；`luks2` 支援更好的安全工具；M1 自帶 AES 指令集，可硬體加速 `aes-xts`。

### 4.2 掛載 EFI 分割槽

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

## 5. Stage3 與 chroot

從此處開始可參考 [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)，直到核心安裝章節。

### 5.1 下載並解壓 Stage3

`wget` 在 HTTPS 上不支援萬用字元，需要先從 `latest-stage3-*.txt` 索引檔案取得當前實際的 Stage3 檔名，再下載並用 Gentoo Release Engineering 的 GPG 公鑰驗證：

```bash
cd /mnt/gentoo
BASE=https://distfiles.gentoo.org/releases/arm64/autobuilds

# 1. 從官方索引取得最新 Stage3 路徑
STAGE3=$(wget -qO- ${BASE}/latest-stage3-arm64-desktop-systemd.txt | grep -v '^#' | cut -d' ' -f1)

# 2. 下載 tarball + 簽名
wget "${BASE}/${STAGE3}"
wget "${BASE}/${STAGE3}.asc"

# 3. 取得 Gentoo Release Engineering 簽名公鑰（首次需要）
gpg --keyserver hkps://keys.gentoo.org --recv-keys 13EBBDBEDE7A12775DFDB1BABB572E0E2D182910 D99EAC7379A850BCE47DA5F29E6438C817072058

# 4. 驗證簽名（必須看到 "Good signature from ..."）
gpg --verify "$(basename ${STAGE3}).asc" "$(basename ${STAGE3})"

# 5. 解壓（保持屬性）
tar xpvf "$(basename ${STAGE3})" --xattrs-include='*.*' --numeric-owner
```

或用 `links` 文字瀏覽器手動選取：

```bash
links https://distfiles.gentoo.org/releases/arm64/autobuilds/current-stage3-arm64-desktop-systemd/
```

### 5.2 配置 Portage 倉庫

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 5.3 同步系統時間

```bash
chronyd -q
date
```

時間錯誤會導致 SSL 證書驗證失敗和 emerge 報錯。

### 5.4 掛載並進入 chroot

```bash
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

### 5.5 編輯 make.conf

```bash
nano -w /etc/portage/make.conf
```

```conf
CHOST="aarch64-unknown-linux-gnu"
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"
LC_MESSAGES=C
MAKEOPTS="-j4"
# Asahi 社群主推的 R2 鏡像；中國大陸使用者可換成 BFSU / USTC / 清華，詳見 /mirrorlist/
GENTOO_MIRRORS="https://gentoo.rgst.io/gentoo"
EMERGE_DEFAULT_OPTS="--jobs 3"
VIDEO_CARDS="asahi"
L10N="zh-CN zh-TW zh en"
```

`MAKEOPTS` 根據核心數調整。檔案末尾保留換行。

```bash
emerge-webrsync
# 時區按所在地選擇：大陸 Asia/Shanghai，臺灣 Asia/Taipei，香港 Asia/Hong_Kong
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

編輯 `/etc/locale.gen` 取消註釋需要的語系，然後：

```bash
locale-gen
eselect locale set en_US.utf8
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

建立使用者：

```bash
useradd -m -G wheel,audio,video,usb,input <使用者名稱>
passwd <使用者名稱>
passwd root
```

## 6. 安裝 Asahi 支援套件

本節取代官方 Handbook 的「安裝核心」章節。

### 6.1 方法 A：自動化指令碼（推薦）

```bash
emerge --sync
emerge --ask dev-vcs/git

cd /tmp
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

指令碼會啟用 Asahi overlay、安裝 GRUB、設定 `VIDEO_CARDS="asahi"`、安裝 `asahi-meta`（含核心、韌體、m1n1、U-Boot）、執行 `asahi-fwupdate` 和 `update-m1n1`、最後更新系統。

如遇 USE flag 衝突：

```bash
# Ctrl+C 中斷指令碼
emerge --autounmask-write <衝突包>
etc-update              # 通常選 -3 自動合併
cd /tmp/asahi-gentoosupport && ./install.sh
```

指令碼完成後跳到 6.3 配置 fstab。

### 6.2 方法 B：手動安裝

設定 Portage 與 Asahi overlay（使用 git 同步）：

```bash
emerge --sync
emerge --ask dev-vcs/git
rm -rf /var/db/repos/gentoo

sudo tee /etc/portage/repos.conf/gentoo.conf << 'EOF'
[DEFAULT]
main-repo = gentoo
[gentoo]
location = /var/db/repos/gentoo
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
auto-sync = yes
sync-depth = 1
EOF

sudo tee /etc/portage/repos.conf/asahi.conf << 'EOF'
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
EOF

emerge --sync
```

簡體中文使用者可以使用北外源 `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git`。其他鏡像見[鏡像列表](/mirrorlist/)。

防止官方 dist-kernel 覆蓋 Asahi 版本：

```bash
mkdir -p /etc/portage/package.mask
cat > /etc/portage/package.mask/asahi << 'EOF'
virtual/dist-kernel::gentoo
EOF
```

配置 USE flags 與 VIDEO_CARDS：

```bash
mkdir -p /etc/portage/package.use
cat > /etc/portage/package.use/asahi << 'EOF'
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
EOF
echo 'VIDEO_CARDS="asahi"' >> /etc/portage/make.conf
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
```

韌體許可證：

```bash
mkdir -p /etc/portage/package.license
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' \
  > /etc/portage/package.license/firmware
```

安裝：

```bash
emerge -q1 dev-lang/rust-bin
emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

更新韌體與載入程式：

```bash
asahi-fwupdate
update-m1n1
```

每次更新核心、U-Boot 或 m1n1 後都必須執行 `update-m1n1`。

安裝 GRUB：

```bash
emerge -q grub:2
grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
grub-mkconfig -o /boot/grub/grub.cfg
```

`--removable` 必須，確保系統能從 ESP 啟動；`--boot-directory` 與 `--efi-directory` 都指向 `/boot/`；`make.conf` 中必須有 `GRUB_PLATFORMS="efi-64"`。

最後可選 `emerge --ask --update --deep --changed-use @world` 更新系統。

### 6.3 配置 fstab

獲取分割槽 UUID（按你實際的裝置路徑調整）：

```bash
# 根分割槽（非加密直接用裝置；加密用解密後的 mapper 裝置）
blkid /dev/nvme0n1p6                    # 非加密
blkid /dev/mapper/gentoo-root           # 加密

# EFI 分割槽（Asahi 安裝時設的卷標 "EFI - GENTO"）
blkid --label "EFI - GENTO"

nano -w /etc/fstab
```

```fstab
UUID=<root-uuid>  /      btrfs  defaults  0 1
# 若用 ext4，第三欄改為 ext4
UUID=<boot-uuid>  /boot  vfat   defaults  0 2
```

### 6.4 配置 LUKS（僅加密使用者）

啟用 systemd 的 cryptsetup 支援：

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde
emerge --ask --oneshot sys-apps/systemd
```

獲取 LUKS UUID（注意是加密容器的 UUID，不是其中檔案系統的）：

```bash
blkid /dev/nvme0n1p6
```

編輯 `/etc/default/grub`：

```conf
GRUB_CMDLINE_LINUX="rd.luks.name=<LUKS-UUID>=gentoo-root root=/dev/mapper/gentoo-root rootfstype=btrfs rd.luks.allow-discards"
```

- `rd.luks.name=<LUKS-UUID>=gentoo-root`：用 LUKS 容器 UUID（`blkid /dev/nvme0n1p6`）解鎖並明確命名 mapper 為 `gentoo-root`，與 crypttab / luksClose 一致
- `root=/dev/mapper/gentoo-root`：解密後的 btrfs root（避免再查一次檔案系統 UUID）
- `rd.luks.allow-discards`：允許 SSD TRIM 穿透加密層（要權衡安全性）

dracut 配置：

```bash
emerge --ask sys-kernel/dracut

# 讓 dist-kernel 更新時自動呼叫 dracut 重建 initramfs（推薦）
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask --oneshot sys-kernel/installkernel

nano -w /etc/dracut.conf.d/luks.conf
```

```conf
# kernel_cmdline 留空，GRUB 的 GRUB_CMDLINE_LINUX 會覆蓋
kernel_cmdline=""
# crypt 模組自動包含 cryptsetup，無需手動 install_items
add_dracutmodules+=" btrfs systemd crypt dm "
filesystems+=" btrfs "
```

可選寫入 `/etc/crypttab`，系統會自動提示解鎖：

```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

生成 initramfs：

```bash
# 重新生成所有已安裝核心的 initramfs（dist-kernel:asahi 推薦）
dracut --force --regenerate-all

# 或只針對當前已選核心：
# KVER=$(uname -r)   # chroot 內無效，需要在已裝系統上執行
# dracut --force --kver "${KVER}"

grub-mkconfig -o /boot/grub/grub.cfg
grep initrd /boot/grub/grub.cfg
```

每次更新核心後都要重新執行此步驟。安裝 `sys-apps/asahi-scripts` 會提供 installkernel hook 自動處理。

## 7. 完成與重啟

```bash
echo "macbook" > /etc/hostname
systemctl enable NetworkManager
passwd root
```

退出 chroot 並重啟：

```bash
exit
umount -R /mnt/gentoo
cryptsetup luksClose gentoo-root   # 若使用加密
reboot
```

首次啟動順序：U-Boot → GRUB（選 Gentoo）→（若加密）輸入 LUKS 密碼 → 登入提示。

## 8. 安裝後配置

### 8.1 網路

```bash
nmcli device wifi connect <SSID> password <密碼>
# 或圖形介面
nmtui
```

### 8.2 桌面環境

先切換合適的 profile（編號會因系統而異，按 profile 名稱選）：

```bash
eselect profile list
# 輸出類似：
#   default/linux/arm64/23.0/systemd
#   default/linux/arm64/23.0/desktop/gnome/systemd
#   default/linux/arm64/23.0/desktop/plasma/systemd
#   default/linux/arm64/23.0/desktop（通用，Xfce 等）
```

按需選擇對應編號。本文範例（實際請用 `eselect profile list` 看到的編號）：

```bash
# 選 desktop/plasma/systemd 那一行的編號，例如：
eselect profile set default/linux/arm64/23.0/desktop/plasma/systemd
emerge -avuDN @world
```

KDE Plasma：

```bash
emerge --ask kde-plasma/plasma-meta kde-apps/kate kde-apps/dolphin
systemctl enable sddm
```

GNOME：

```bash
eselect profile set default/linux/arm64/23.0/desktop/gnome/systemd
emerge -avuDN @world
emerge --ask gnome-base/gnome gnome-extra/gnome-tweaks
systemctl enable gdm
```

Xfce：

```bash
eselect profile set default/linux/arm64/23.0/desktop
emerge -avuDN @world
emerge --ask xfce-base/xfce4-meta x11-misc/lightdm
systemctl enable lightdm
```

首次構建桌面環境約需 2–4 小時，建議 `--jobs 3` 或更少避免 OOM。

### 8.3 字型與中文輸入

```bash
emerge --ask media-fonts/liberation-fonts media-fonts/noto media-fonts/noto-cjk media-fonts/dejavu
eselect fontconfig enable 10-sub-pixel-rgb.conf
eselect fontconfig enable 11-lcdfilter-default.conf

emerge --ask app-i18n/fcitx-chinese-addons
```

`app-i18n/fcitx-rime` 實測在當前版本無法正常使用，建議使用 `fcitx-chinese-addons`。

### 8.4 音訊

```bash
emerge --ask media-libs/asahi-audio

# 如果已裝 PulseAudio，先停掉避免衝突
systemctl --user disable --now pulseaudio.socket pulseaudio.service 2>/dev/null

# 啟用 PipeWire（socket-activation，pipewire 守護程序會按需啟動）
systemctl --user enable --now pipewire-pulse.socket
systemctl --user enable --now wireplumber.service
```

## 9. 系統維護

定期更新：

```bash
emerge --sync             # 包含 Asahi overlay
# 或只同步 overlay
emaint sync -r asahi
emerge --ask --update --deep --newuse @world
emerge --ask --depclean   # 先確認要刪除的包再執行
dispatch-conf             # 處理 .__cfg 配置變更
```

每次核心更新後必做：

```bash
update-m1n1
grub-mkconfig -o /boot/grub/grub.cfg
```

m1n1 Stage 2 包含 devicetree blobs，核心依賴它識別硬體。`sys-apps/asahi-scripts` 提供 installkernel hook 可以自動化。

macOS 更新會附帶韌體更新，建議保留 macOS 分割槽以便獲取最新韌體。

## 10. 常見問題

**無法從 USB 啟動**：U-Boot 的 USB 驅動較挑剔，嘗試不同 USB、使用 USB 2.0 裝置、或經過 USB Hub。

**啟動卡住或黑屏**：m1n1 / U-Boot / 核心版本不匹配。從 macOS 重跑 `curl https://alx.sh | sh` 選 `p`，並確認 chroot 中已執行 `update-m1n1`。

**加密分割槽無法解鎖**：檢查 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX`、確認 LUKS UUID（`blkid /dev/nvme0n1p6`）、重新 `grub-mkconfig -o /boot/grub/grub.cfg`。

**Wi-Fi 不穩定**：WPA3 或 6 GHz 頻段問題。改用 WPA2、2.4 GHz 或 5 GHz。

**觸控板失靈**：

```bash
dmesg | grep -i firmware
emerge --ask sys-apps/asahi-meta
```

## 11. 進階選項

劉海（Notch）：在 GRUB 核心引數加入

```
appledrm.show_notch=1
```

（Asahi 核心 6.18 之前的名稱是 `apple_dcp.show_notch=1`，從 6.18 起 `apple_dcp` 模組被改名為 `appledrm`。）

KDE Plasma 可在頂部加全寬面板，高度對齊劉海底部。

自定義核心：

```bash
emerge --ask sys-kernel/asahi-sources
cd /usr/src/linux
make menuconfig
make -j$(nproc)
make modules_install
make install
update-m1n1
grub-mkconfig -o /boot/grub/grub.cfg
```

記得保留可用核心作為備援。

多核心切換：

```bash
eselect kernel list
eselect kernel set <number>
update-m1n1
```

## 參考

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux 官方站](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)

社群支援：

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 頻道：[@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/Gentoo-zh)
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC `#gentoo` / `#asahi` @ [Libera.Chat](https://libera.chat/)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)
