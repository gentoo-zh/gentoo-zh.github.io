---
title: "二进制包签名"
description: "下载 gentoo-zh 签名公钥，配置全局验签与本地构建签名"
---

首次启用二进制包请按[二进制包配置](/binpkg-setup/)选择频道并完成三步设置。

## 不安装 sec-keys 软件包时如何取得公钥 {#key-download}

用 curl 或 wget 下载公钥文件，再把[公钥导入步骤](/binpkg-setup/#import-key)中 `--import` 的路径换成这个文件。下载不需要 root 权限。

```sh
$ curl -O https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

```sh
$ wget https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

## 全局签名验证 {#verification}

公钥导入与远端仓库验签设置见[二进制包配置](/binpkg-setup/#setup)。

全局 `FEATURES="binpkg-request-signature"` 会覆盖 `binrepos.conf` 的验签设置，要求所有二进制包（包括本地构建的）带有效且可信的签名。

## 本地构建签名 {#local-signing}

本地构建需启用 `FEATURES="binpkg-signing"`，并配置 `BINPKG_GPG_SIGNING_KEY` 与 `BINPKG_GPG_SIGNING_GPG_HOME`。

若用 getuto 在 `/etc/portage/gnupg` 创建的本地密钥签名，还须向 GnuPG 提供保存在该目录 `pass` 文件中的口令；默认签名命令不会自动读取该文件。
