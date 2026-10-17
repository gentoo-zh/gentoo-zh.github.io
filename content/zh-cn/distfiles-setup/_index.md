---
title: "distfiles 配置"
description: "让 Portage 从 gentoo-zh 镜像下载 overlay 软件包的 distfiles"
manual: |
      ```conf
      # /etc/portage/make.conf
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://mirrors.cernet.edu.cn/gentoo-zh https://distfiles.gentoozh.org"
      ```
quick: |
      ```sh
      $ sudo tee -a /etc/portage/make.conf > /dev/null <<'EOF'
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://mirrors.cernet.edu.cn/gentoo-zh https://distfiles.gentoozh.org"
      EOF
      ```
---

{{< callout type="info" >}}
先[添加 gentoo-zh overlay](/overlay/#adding-overlay)并[接受测试关键字](/overlay/#testing-keyword)。
{{< /callout >}}

## 添加镜像 {#setup}

本站只镜像 overlay 的 ebuild 声明的 distfiles，不代替 Gentoo 主仓库的镜像；主仓库镜像见[官方 distfiles 配置](/gentoo-distfiles-setup/)。地址末尾不用加 `distfiles/`，Portage 会自动补上。

把镜像追加到 `/etc/portage/make.conf` 的 `GENTOO_MIRRORS`。以下配置保留现有镜像的顺序，并将所选镜像置于新增镜像之首。

缺少文件时，Portage 会继续尝试 `GENTOO_MIRRORS` 中的后续地址。

<!-- slot:setup -->

## 镜像 {#mirrors}

换用其他镜像时，替换上面的第一个地址，源站作为备用下载地址。二进制包的 `sync-uri` 也以这些地址开头。

各镜像的地址见[镜像列表](/mirrorlist/)。

下载问题见 [distfiles 排障](/distfiles-troubleshooting/#distfiles)。

## 不让本站镜像某个 distfile {#restrict-mirror}

避免自动镜像 distfiles 的方法见 [Overlay 贡献指南](/overlay-contributing/#restrict-mirror)。
