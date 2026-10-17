---
title: "CJK 最小安装镜像"
description: "gentoo-zh 构建的 amd64 最小安装镜像，控制台能显示中日韩文字，每周更新"
---


{{< callout type="info" >}}
准备一台 amd64 计算机和足够存放 ISO 的空间。写入镜像需要管理员权限，以及一个可以清空全部内容的 U 盘。
{{< /callout >}}

<!-- slot:mac -->

## 下载 ISO {#minimal}

第三方最小安装介质，用 Catalyst 按 Gentoo 官方 Release Engineering 规范构建。

<!-- slot:download -->

## 镜像站 {#minimal-mirrors}

每个版本是一个以构建时间命名的目录（如 `20261012T114547Z/`），内含 ISO、`.sha256`、`.DIGESTS` 与 `.CONTENTS.gz`。镜像重定向与版本差异见[镜像列表](/mirrorlist/#list)。

<!-- slot:mirrors -->

## 与官方最小安装介质的差异 {#minimal-differences}

- 构建时配置了 gentoo-zh overlay。
- 内核为 `sys-kernel/gentoo-cjk-kernel-bin`，带 cjktty 补丁，因此 Linux 控制台能显示中日韩文字。
- 支持 ZFS。
- 其余与上游一致：软件包清单、livecd/unmerge、livecd/empty、dracut 参数与 GRUB 主题均为官方版本。

## 校验 ISO {#verify}

<!-- slot:verify -->

## 写入 U 盘 {#usb}

<!-- slot:usb -->

