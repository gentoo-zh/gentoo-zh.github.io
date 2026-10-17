---
title: "官方二进制包配置"
description: "设置官方 binhost、架构与签名验证"
setupHint: "所选镜像用于本页配置中的地址。"
---

同步 Stage 3 和官方二进制包的 HTTP 镜像在 `releases/` 目录中提供这些资源。

<!-- slot:setup -->

[Gentoo 官方二进制包仓库](https://wiki.gentoo.org/wiki/Project:Binhost)提供预编译并签名的二进制包。较新的 Stage 3 已在 `/etc/portage/binrepos.conf/` 中预配置该仓库；使用镜像时，编辑 `[gentoo]` 配置中的 `sync-uri`。

以下配置使用当前的 `23.0` profile，具体路径见 [amd64 二进制包目录](https://distfiles-cdn-origin.gentoo.org/releases/amd64/binpackages/)和 [arm64 二进制包目录](https://distfiles-cdn-origin.gentoo.org/releases/arm64/binpackages/)。

Gentoo Binhost 项目目前支持使用 GNU 工具链（glibc、GCC 和 binutils）的 amd64 和 arm64。其他架构和工具链的二进制包仅限 Release Engineering 构建 Stage 3 所用的包缓存。

以下示例使用常规 amd64 的 x86-64 二进制包：

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
[gentoo]
priority = 1
sync-uri = https://mirrors.cernet.edu.cn/gentoo/releases/amd64/binpackages/23.0/x86-64
location = /var/cache/binhost/gentoo
verify-signature = true
```

`sync-uri` 指向包含 `Packages` 文件的目录。常规 arm64 系统可将路径改为 `/releases/arm64/binpackages/23.0/arm64`。

对于常规 amd64 系统，CPU 支持 [x86-64-v3](https://www.gentoo.org/news/2024/02/04/x86-64-v3.html) 时可使用对应的二进制包，以获得针对该指令集的优化。检查 CPU 是否支持：

```bash
$ ld.so --help
```

输出中包含 `x86-64-v3 (supported, searched)` 即表示支持。可将上方配置的路径末尾改为 `x86-64-v3`：

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
sync-uri = https://mirrors.cernet.edu.cn/gentoo/releases/amd64/binpackages/23.0/x86-64-v3
```

在有合适的二进制包时自动下载并使用：

`/etc/portage/make.conf`:

```ini
FEATURES="${FEATURES} getbinpkg"
```

如果没有合适的二进制包，Portage 会照常从源码编译。

单次使用二进制包安装：

```bash
$ sudo emerge --ask --getbinpkg <package>
```

根据 [Portage binpkg changes](https://www.gentoo.org/support/news-items/2026-05-03-portage-binpkg-changes.html)，新版 Portage 默认验证远程二进制包的签名，并将其缓存到 `location` 指定的目录。官方 binhost 用户不再需要启用 `FEATURES="binpkg-request-signature"`；首次下载时，Portage 会自动运行 `getuto` 创建可信密钥环。

更多配置见 [Gentoo Binary Host Quickstart](https://wiki.gentoo.org/wiki/Gentoo_Binary_Host_Quickstart)、[Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)和 [MirrorZ Gentoo 帮助](https://help.mirrorz.org/gentoo/)。
