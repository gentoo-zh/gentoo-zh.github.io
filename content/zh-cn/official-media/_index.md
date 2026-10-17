---
title: "官方安装介质"
description: "Gentoo 官方的最小安装光盘、LiveGUI 与 stage3：文件位置、下载镜像与校验方法"
---

Gentoo 为 amd64、x86、arm64、arm 等架构发布安装介质，完整的架构列表见 [Gentoo 官方下载页](https://www.gentoo.org/downloads/)。

## 文件 {#files}

在任一镜像的 `releases/<架构>/autobuilds/` 下取下列文件（以 amd64 为例）：

<!-- slot:official -->

## 下载镜像 {#mirrors}

其他下载地址见[官方镜像](/gentoo-mirrors/)。

<!-- slot:officialmirrors -->

## 校验 {#verify}

用 `.DIGESTS` 中的 SHA512 摘要校验 ISO：

```bash
$ sha512sum install-amd64-minimal-*.iso          # 计算 SHA512 摘要
$ cat install-amd64-minimal-*.iso.DIGESTS        # 与 DIGESTS 中的值比对
```

写入 U 盘的步骤与 [CJK 最小安装镜像](/iso/#usb) 相同。

