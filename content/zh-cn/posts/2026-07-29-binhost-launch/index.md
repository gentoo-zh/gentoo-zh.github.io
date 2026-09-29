---
title: "gentoo-zh 二进制包服务上线"
description: "gentoo-zh overlay 的 194 个包现在有预编译的二进制包，签名后由 distfiles.gentoozh.org 与南京大学镜像分发。本文说明如何配置、验签怎么工作，以及哪些包不在其中。"
date: 2026-07-29
tags: ["announcement", "binhost", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

overlay 目前 490 个包，其中 194 个有预编译的二进制包，每晚构建、签名后分发。配置说明在 <https://distfiles.gentoozh.org>。

收录的以编译耗时长的包为主：Electron 应用、浏览器、办公套件，以及带大量 crate 或 Go module 的项目。因为这些包在本机编译动辄数十分钟到数小时，所以取二进制包省下的时间与编译时长成正比。

## 配置

{{< callout type="info" >}}
配置方法见 **[distfiles.gentoozh.org](https://distfiles.gentoozh.org/)**。
{{< /callout >}}

## 哪些包不在其中

收录清单里排除了几类包，所以二进制包的数量会少于 overlay 的总数：

- `RESTRICT=bindist`，上游不允许再分发构建产物
- 许可证不允许再分发，构建时 `ACCEPT_LICENSE="-* @BINARY-REDISTRIBUTABLE"` 会拦下
- 上游已经发布二进制的 `-bin` 包，安装过程只是解压
- 字体、词库、主题这类没有构建系统的包
- `virtual`、`acct-user` 这类不安装文件的包
- 只有 `9999` 的 live 包，没有固定版本可供构建

包属于哪一类，可以在 <https://distfiles.gentoozh.org/packages> 的状态列上查到。因为那张表只收录有源码文件或被构建过的包，所以只有 `9999` 的 live 包不会出现在上面。

不在清单上、但作为 overlay 内部依赖被连带构建的包（`acct-*`、`virtual/*` 这类），仍会出现在索引里。

因为二进制包只在 USE 完全匹配时才会被 Portage 采用，所以 USE 组合差异大的包命中率低，构建成本收不回来，也不在清单上。配置好之后若 `emerge` 仍然编译源码，用 `emerge -pv` 检查，前缀为 `[binary]` 才表示采用了二进制包。

## distfiles 镜像

二进制包与 distfiles 两者互相独立，按需分别配置。distfiles 镜像是 overlay 里各包的源码，目前约 1200 个文件、33 GB；它只存 overlay 的源码，不能替代官方源，所以是追加到 `GENTOO_MIRRORS` 而不是替换。地址与可复制的配置同样在 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 首页，`::gentoo` 的源另见[镜像列表](/mirrorlist/)。

## 构建与分发

每晚 02:00（Asia/Shanghai）构建一轮，产物签名后发布。因为构建一个包会把它的依赖一并编出来，所以实际发布数会多于收录清单的条数。

overlay 里已经删除的包，会在下一轮构建时从索引中移除，本地已安装的包不受影响。

镜像站也可以使用 rsync 同步（包含二进制包与 distfiles）：

```shell
rsync rsync://distfiles.gentoozh.org/gentoo-zh/
```

若因版权等原因不希望某个包的源码被镜像，请在其 ebuild 中加入 `RESTRICT="mirror"`，同步工具会跳过。构建产物是另一回事：不希望它被再分发，要写 `RESTRICT="bindist"`，收录清单的校验会据此拒绝该包。

## 收录新包

请在 [binhost 仓库](https://github.com/gentoo-zh/binhost)的 `build/packages.txt` 中添加一行 `category/package`，然后提交 PR。合并后会在下一轮构建中产出。

相关的服务端配置、构建与发布脚本都在同一个仓库，如有问题请提 issue。
