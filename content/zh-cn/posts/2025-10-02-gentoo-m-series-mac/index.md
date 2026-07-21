---
title: "在 Apple Silicon Mac 上安装 Gentoo Linux（M1/M2 MacBook 安装教程）"
date: 2025-10-02
tags: ["tutorial"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
summary: "在 Apple Silicon Mac（M1/M2）上安装 Gentoo Linux 的完整流程，基于 Asahi Linux 官方支持。"
description: "在 M1/M2 MacBook 上装 Gentoo 的完整流程，基于 Asahi Linux：Live USB、分区、内核到桌面都有。"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

本文记录在 Apple Silicon Mac（M1/M2 系列）上安装原生 ARM64 Gentoo Linux 的完整流程。

得益于 Asahi Linux 项目团队（尤其是 [chadmed](https://github.com/chadmed/gentoo-asahi-releng)）的工作，Gentoo 现已有[官方 Asahi 安装指南](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)，本文基于该指南并补充实测细节。

硬件支持（按 Asahi [Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/) 现况）：

- M1、M2 全系列：可作日常桌面使用
- M3：GPU 进行中，Wi-Fi / 音频等仍 TBA，不建议作桌面
- M4：核心驱动多为 TBA，暂不可用
- M5：官方支持表尚未列出

本文流程以 M1/M2 为准。最后核对日期：2026 年 5 月 29 日。

## 流程概览

必选步骤：

1. 下载官方 Gentoo Asahi Live USB 镜像
2. 通过 Asahi 安装程序设置 U-Boot
3. 从 Live USB 启动
4. 分区并挂载文件系统
5. 解压 Stage3 并 chroot
6. 安装 Asahi 支持套件
7. 重启完成安装

可选步骤：LUKS 加密、自定义内核、PipeWire 音频、桌面环境。

整个流程会在 Mac 上建立 macOS + Gentoo Linux ARM64 双启动环境。

## 事前准备

### 硬件需求

- Apple Silicon Mac（仅 M1/M2 可作桌面使用；M3/M4 驱动不完整，M5 尚未列入官方支持表）
- 至少 80 GB 可用磁盘空间，建议 120 GB 以上
- 稳定的 Wi-Fi 或以太网
- 备份所有重要数据

### 已知工作情况

可用：CPU、内存、存储、Wi-Fi、键盘、触控板、电池管理、内建与外接显示、USB-C / Thunderbolt。

部分支持：GPU 加速（OpenGL 部分支持）。

不可用：Touch ID、macOS 虚拟化。

## 1. 准备 Gentoo Asahi Live USB

### 1.1 下载镜像

直接使用 Gentoo 提供的 ARM64 Live USB，无需 Fedora 中转：

```
https://chadmed.au/pub/gentoo/
```

推荐 `install-arm64-asahi-latest.iso`（chadmed 维护的稳定符号链接），或选择有具体日期的版本以便后续复现。若遇到启动问题，可以尝试上一个稳定日期版本。

### 1.2 制作启动 USB

在 macOS 中：

```bash
diskutil list
diskutil unmountDisk /dev/disk4
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress
diskutil eject /dev/disk4
```

## 2. 设置 Asahi U-Boot 环境

### 2.1 运行 Asahi 安装程序

在 macOS Terminal 中：

```bash
curl https://alx.sh | sh
```

建议先访问 <https://alx.sh> 查看脚本内容再执行。

### 2.2 跟随安装程序

1. 选择 `r`（Resize an existing partition to make space for a new OS）
2. 分配给 Linux 的空间（建议至少 80 GB，可填百分比或绝对大小）
3. 选择 **UEFI environment only (m1n1 + U-Boot + ESP)**
4. OS 名称输入 `Gentoo`
5. 按指示关机

### 2.3 完成 Recovery 设置

1. 等待 25 秒确保完全关机
2. 按住电源键直到出现 "Loading startup options..."
3. 释放电源键
4. 在卷列表中选择 Gentoo
5. 进入 macOS Recovery，输入用户密码（FileVault）
6. 按指示完成设置

如遇启动循环或要求重装 macOS，请按住电源键关机后从头开始；或开机进入 macOS 重新执行 `curl https://alx.sh | sh` 选 `p` 重试。

## 3. 从 Live USB 启动

插入 USB 并开机，U-Boot 会自动从 USB 启动 GRUB。若需手动指定：

```
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

设置网络（Gentoo Live USB 现在用 NetworkManager，nmtui 是最快方式）：

```bash
nmtui                  # 选 Wi-Fi 网络或编辑有线连接
ping -c 3 1.1.1.1      # 先用 IP 验证连通性（避开 DNS 问题）
ping -c 3 www.gentoo.org   # 再测 DNS
```

Apple Silicon 的 Wi-Fi 驱动已包含在内核中。若不稳定，尝试 2.4 GHz 网络。

可选启用 SSH 远程操作（Live USB 用 OpenRC）：

```bash
passwd                 # 设 root 密码
rc-service sshd start  # 启动 SSH（OpenRC 命令）
ip a | grep inet       # 查看 IP 地址
```

## 4. 分区与文件系统

不要修改现有的 APFS 容器、EFI 分区或 Recovery 分区，只在 Asahi 安装程序预留的空间中操作。

查看分区：

```bash
lsblk
blkid --label "EFI - GENTO"
```

典型布局：

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

不加密：

```bash
mkfs.btrfs /dev/nvme0n1p6     # 或 mkfs.ext4
mount /dev/nvme0n1p6 /mnt/gentoo
```

加密（推荐）：

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root
mkfs.btrfs --label root /dev/mapper/gentoo-root
mount /dev/mapper/gentoo-root /mnt/gentoo
```

参数说明：`argon2id` 抗 ASIC/GPU 暴力破解；`luks2` 支持更好的安全工具；M1 自带 AES 指令集，可硬件加速 `aes-xts`。

### 4.2 挂载 EFI 分区

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

## 5. Stage3 与 chroot

从此处开始可参考 [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)，直到内核安装章节。

### 5.1 下载并解压 Stage3

`wget` 在 HTTPS 上不支持通配符，需要先从 `latest-stage3-*.txt` 索引文件取得当前实际的 Stage3 文件名，再下载并用 Gentoo Release Engineering 的 GPG 公钥验证：

```bash
cd /mnt/gentoo
BASE=https://distfiles.gentoo.org/releases/arm64/autobuilds

# 1. 从官方索引取得最新 Stage3 路径
STAGE3=$(wget -qO- ${BASE}/latest-stage3-arm64-desktop-systemd.txt | grep -v '^#' | cut -d' ' -f1)

# 2. 下载 tarball + 签名
wget "${BASE}/${STAGE3}"
wget "${BASE}/${STAGE3}.asc"

# 3. 取得 Gentoo Release Engineering 签名公钥（首次需要）
gpg --keyserver hkps://keys.gentoo.org --recv-keys 13EBBDBEDE7A12775DFDB1BABB572E0E2D182910 D99EAC7379A850BCE47DA5F29E6438C817072058

# 4. 验证签名（必须看到 "Good signature from ..."）
gpg --verify "$(basename ${STAGE3}).asc" "$(basename ${STAGE3})"

# 5. 解压（保持属性）
tar xpvf "$(basename ${STAGE3})" --xattrs-include='*.*' --numeric-owner
```

或用 `links` 文字浏览器手动选取：

```bash
links https://distfiles.gentoo.org/releases/arm64/autobuilds/current-stage3-arm64-desktop-systemd/
```

### 5.2 配置 Portage 仓库

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 5.3 同步系统时间

```bash
chronyd -q
date
```

时间错误会导致 SSL 证书验证失败和 emerge 报错。

### 5.4 挂载并进入 chroot

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

### 5.5 编辑 make.conf

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
# Asahi 社区主推的 R2 镜像；中国大陆用户可换成 BFSU / USTC / 清华，详见 /mirrorlist/
GENTOO_MIRRORS="https://gentoo.rgst.io/gentoo"
EMERGE_DEFAULT_OPTS="--jobs 3"
VIDEO_CARDS="asahi"
L10N="zh-CN zh-TW zh en"
```

`MAKEOPTS` 根据核心数调整。文件末尾保留换行。

```bash
emerge-webrsync
# 时区按所在地选择：大陆 Asia/Shanghai，台湾 Asia/Taipei，香港 Asia/Hong_Kong
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

编辑 `/etc/locale.gen` 取消注释需要的语系，然后：

```bash
locale-gen
eselect locale set en_US.utf8
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

建立用户：

```bash
useradd -m -G wheel,audio,video,usb,input <用户名>
passwd <用户名>
passwd root
```

## 6. 安装 Asahi 支持套件

本节取代官方 Handbook 的「安装内核」章节。

### 6.1 方法 A：自动化脚本（推荐）

```bash
emerge --sync
emerge --ask dev-vcs/git

cd /tmp
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

脚本会启用 Asahi overlay、安装 GRUB、设置 `VIDEO_CARDS="asahi"`、安装 `asahi-meta`（含内核、固件、m1n1、U-Boot）、运行 `asahi-fwupdate` 和 `update-m1n1`、最后更新系统。

如遇 USE flag 冲突：

```bash
# Ctrl+C 中断脚本
emerge --autounmask-write <冲突包>
etc-update              # 通常选 -3 自动合并
cd /tmp/asahi-gentoosupport && ./install.sh
```

脚本完成后跳到 6.3 配置 fstab。

### 6.2 方法 B：手动安装

设置 Portage 与 Asahi overlay（使用 git 同步）：

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
sync-uri = https://mirrors.bfsu.edu.cn/git/gentoo-portage.git
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

简体中文用户可以使用北外源 `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git`。其他镜像见[镜像列表](/mirrorlist/)。

防止官方 dist-kernel 覆盖 Asahi 版本：

```bash
mkdir -p /etc/portage/package.mask
cat > /etc/portage/package.mask/asahi << 'EOF'
virtual/dist-kernel::gentoo
EOF
```

配置 USE flags 与 VIDEO_CARDS：

```bash
mkdir -p /etc/portage/package.use
cat > /etc/portage/package.use/asahi << 'EOF'
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
EOF
echo 'VIDEO_CARDS="asahi"' >> /etc/portage/make.conf
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
```

固件许可证：

```bash
mkdir -p /etc/portage/package.license
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' \
  > /etc/portage/package.license/firmware
```

安装：

```bash
emerge -q1 dev-lang/rust-bin
emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

更新固件与引导程序：

```bash
asahi-fwupdate
update-m1n1
```

每次更新内核、U-Boot 或 m1n1 后都必须执行 `update-m1n1`。

安装 GRUB：

```bash
emerge -q grub:2
grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
grub-mkconfig -o /boot/grub/grub.cfg
```

`--removable` 必须，确保系统能从 ESP 启动；`--boot-directory` 与 `--efi-directory` 都指向 `/boot/`；`make.conf` 中必须有 `GRUB_PLATFORMS="efi-64"`。

最后可选 `emerge --ask --update --deep --changed-use @world` 更新系统。

### 6.3 配置 fstab

获取分区 UUID（按你实际的设备路径调整）：

```bash
# 根分区（非加密直接用设备；加密用解密后的 mapper 设备）
blkid /dev/nvme0n1p6                    # 非加密
blkid /dev/mapper/gentoo-root           # 加密

# EFI 分区（Asahi 安装时设的卷标 "EFI - GENTO"）
blkid --label "EFI - GENTO"

nano -w /etc/fstab
```

```fstab
UUID=<root-uuid>  /      btrfs  defaults  0 1
# 若用 ext4，第三栏改为 ext4
UUID=<boot-uuid>  /boot  vfat   defaults  0 2
```

### 6.4 配置 LUKS（仅加密用户）

启用 systemd 的 cryptsetup 支持：

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde
emerge --ask --oneshot sys-apps/systemd
```

获取 LUKS UUID（注意是加密容器的 UUID，不是其中文件系统的）：

```bash
blkid /dev/nvme0n1p6
```

编辑 `/etc/default/grub`：

```conf
GRUB_CMDLINE_LINUX="rd.luks.name=<LUKS-UUID>=gentoo-root root=/dev/mapper/gentoo-root rootfstype=btrfs rd.luks.allow-discards"
```

- `rd.luks.name=<LUKS-UUID>=gentoo-root`：用 LUKS 容器 UUID（`blkid /dev/nvme0n1p6`）解锁并明确命名 mapper 为 `gentoo-root`，与 crypttab / luksClose 一致
- `root=/dev/mapper/gentoo-root`：解密后的 btrfs root（避免再查一次文件系统 UUID）
- `rd.luks.allow-discards`：允许 SSD TRIM 穿透加密层（要权衡安全性）

dracut 配置：

```bash
emerge --ask sys-kernel/dracut

# 让 dist-kernel 更新时自动调用 dracut 重建 initramfs（推荐）
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask --oneshot sys-kernel/installkernel

nano -w /etc/dracut.conf.d/luks.conf
```

```conf
# kernel_cmdline 留空，GRUB 的 GRUB_CMDLINE_LINUX 会覆盖
kernel_cmdline=""
# crypt 模块自动包含 cryptsetup，无需手动 install_items
add_dracutmodules+=" btrfs systemd crypt dm "
filesystems+=" btrfs "
```

可选写入 `/etc/crypttab`，系统会自动提示解锁：

```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

生成 initramfs：

```bash
# 重新生成所有已安装内核的 initramfs（dist-kernel:asahi 推荐）
dracut --force --regenerate-all

# 或只针对当前已选内核：
# KVER=$(uname -r)   # chroot 内无效，需要在已装系统上执行
# dracut --force --kver "${KVER}"

grub-mkconfig -o /boot/grub/grub.cfg
grep initrd /boot/grub/grub.cfg
```

每次更新内核后都要重新执行此步骤。安装 `sys-apps/asahi-scripts` 会提供 installkernel hook 自动处理。

## 7. 完成与重启

```bash
echo "macbook" > /etc/hostname
systemctl enable NetworkManager
passwd root
```

退出 chroot 并重启：

```bash
exit
umount -R /mnt/gentoo
cryptsetup luksClose gentoo-root   # 若使用加密
reboot
```

首次启动顺序：U-Boot → GRUB（选 Gentoo）→（若加密）输入 LUKS 密码 → 登录提示。

## 8. 安装后配置

### 8.1 网络

```bash
nmcli device wifi connect <SSID> password <密码>
# 或图形界面
nmtui
```

### 8.2 桌面环境

先切换合适的 profile（编号会因系统而异，按 profile 名称选）：

```bash
eselect profile list
# 输出类似：
#   default/linux/arm64/23.0/systemd
#   default/linux/arm64/23.0/desktop/gnome/systemd
#   default/linux/arm64/23.0/desktop/plasma/systemd
#   default/linux/arm64/23.0/desktop（通用，Xfce 等）
```

按需选择对应编号。本文示例（实际请用 `eselect profile list` 看到的编号）：

```bash
# 选 desktop/plasma/systemd 那一行的编号，例如：
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

首次构建桌面环境约需 2–4 小时，建议 `--jobs 3` 或更少避免 OOM。

### 8.3 字体与中文输入

```bash
emerge --ask media-fonts/liberation-fonts media-fonts/noto media-fonts/noto-cjk media-fonts/dejavu
eselect fontconfig enable 10-sub-pixel-rgb.conf
eselect fontconfig enable 11-lcdfilter-default.conf

emerge --ask app-i18n/fcitx-chinese-addons
```

`app-i18n/fcitx-rime` 实测在当前版本无法正常使用，建议使用 `fcitx-chinese-addons`。

### 8.4 音频

```bash
emerge --ask media-libs/asahi-audio

# 如果已装 PulseAudio，先停掉避免冲突
systemctl --user disable --now pulseaudio.socket pulseaudio.service 2>/dev/null

# 启用 PipeWire（socket-activation，pipewire 守护进程会按需启动）
systemctl --user enable --now pipewire-pulse.socket
systemctl --user enable --now wireplumber.service
```

## 9. 系统维护

定期更新：

```bash
emerge --sync             # 包含 Asahi overlay
# 或只同步 overlay
emaint sync -r asahi
emerge --ask --update --deep --newuse @world
emerge --ask --depclean   # 先确认要删除的包再执行
dispatch-conf             # 处理 .__cfg 配置变更
```

每次内核更新后必做：

```bash
update-m1n1
grub-mkconfig -o /boot/grub/grub.cfg
```

m1n1 Stage 2 包含 devicetree blobs，内核依赖它识别硬件。`sys-apps/asahi-scripts` 提供 installkernel hook 可以自动化。

macOS 更新会附带固件更新，建议保留 macOS 分区以便获取最新固件。

## 10. 常见问题

**无法从 USB 启动**：U-Boot 的 USB 驱动较挑剔，尝试不同 USB、使用 USB 2.0 设备、或经过 USB Hub。

**启动卡住或黑屏**：m1n1 / U-Boot / 内核版本不匹配。从 macOS 重跑 `curl https://alx.sh | sh` 选 `p`，并确认 chroot 中已执行 `update-m1n1`。

**加密分区无法解锁**：检查 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX`、确认 LUKS UUID（`blkid /dev/nvme0n1p6`）、重新 `grub-mkconfig -o /boot/grub/grub.cfg`。

**Wi-Fi 不稳定**：WPA3 或 6 GHz 频段问题。改用 WPA2、2.4 GHz 或 5 GHz。

**触控板失灵**：

```bash
dmesg | grep -i firmware
emerge --ask sys-apps/asahi-meta
```

## 11. 进阶选项

刘海（Notch）：在 GRUB 内核参数加入

```
appledrm.show_notch=1
```

（Asahi 核心 6.18 之前的名称是 `apple_dcp.show_notch=1`，从 6.18 起 `apple_dcp` 模块被改名为 `appledrm`。）

KDE Plasma 可在顶部加全宽面板，高度对齐刘海底部。

自定义内核：

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

记得保留可用内核作为备援。

多内核切换：

```bash
eselect kernel list
eselect kernel set <number>
update-m1n1
```

## 参考

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux 官方站](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)

社区支持：

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 频道：[@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC `#gentoo` / `#asahi` @ [Libera.Chat](https://libera.chat/)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)
