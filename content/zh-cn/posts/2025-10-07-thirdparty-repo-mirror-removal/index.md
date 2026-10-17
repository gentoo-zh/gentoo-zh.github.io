---
title: "Gentoo 停止为第三方仓库提供缓存镜像（gentoo-zh 用户请更新同步源）"
date: 2025-10-07
tags: ["announcement"]
description: "2025-10-30 起 Gentoo 不再为 gentoo-zh 等第三方 overlay 提供官方缓存镜像，改为直接从 GitHub 上游同步。之前添加过 gentoo-zh 的用户按本文更新同步 URI 即可。"
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

根据 [Gentoo 官方公告](https://www.gentoo.org/support/news-items/2025-10-07-cache-enabled-mirrors-removal.html)，Gentoo 已停止为第三方仓库提供缓存镜像支持。从 2025-10-30 起，所有第三方仓库（包括 gentoo-zh）的镜像配置都会从官方仓库列表里移除。

## 这意味着什么

- `eselect repository`、`layman` 等工具照常能用
- 官方不再为第三方仓库提供缓存镜像，改为直接从上游源（GitHub）同步
- 官方仓库（`::gentoo`、`::guru`、`::kde`、`::science`）不受影响，仍使用镜像

## 已经添加过 gentoo-zh

更新同步 URI 即可——移除再重新启用，会自动使用正确的上游源：

```bash
# 查看已安装的仓库
# eselect repository list -i

# 移除旧配置
# eselect repository remove gentoo-zh

# 重新启用（自动使用正确的上游源）
# eselect repository enable gentoo-zh
```

之后照常 `emerge --sync gentoo-zh`。

新添加 gentoo-zh 的用户不受影响，按 [Overlay 安装](/overlay/) 正常启用即可。国内直连 GitHub 较慢时，可以使用 [国内 git 镜像](/mirrorlist/#list)。
