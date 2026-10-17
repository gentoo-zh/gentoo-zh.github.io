---
title: "Gentoo 停止為第三方倉庫提供快取鏡像（gentoo-zh 使用者請更新同步源）"
date: 2025-10-07
tags: ["announcement"]
description: "2025-10-30 起 Gentoo 不再為 gentoo-zh 等第三方 overlay 提供官方快取鏡像，改為直接從 GitHub 上游同步。之前新增過 gentoo-zh 的使用者按本文更新同步 URI 即可。"
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

根據 [Gentoo 官方公告](https://www.gentoo.org/support/news-items/2025-10-07-cache-enabled-mirrors-removal.html)，Gentoo 已停止為第三方倉庫提供快取鏡像支援。從 2025-10-30 起，所有第三方倉庫（包括 gentoo-zh）的鏡像配置都會從官方倉庫列表裡移除。

## 這意味著什麼

- `eselect repository`、`layman` 等工具照常能用
- 官方不再為第三方倉庫提供快取鏡像，改為直接從上游源（GitHub）同步
- 官方倉庫（`::gentoo`、`::guru`、`::kde`、`::science`）不受影響，仍使用鏡像

## 已經新增過 gentoo-zh

更新同步 URI 即可——移除再重新啟用，會自動使用正確的上游源：

```bash
# 檢視已安裝的倉庫
# eselect repository list -i

# 移除舊配置
# eselect repository remove gentoo-zh

# 重新啟用（自動使用正確的上游源）
# eselect repository enable gentoo-zh
```

之後照常 `emerge --sync gentoo-zh`。

新增 gentoo-zh 的使用者不受影響，按 [Overlay 安裝](/overlay/) 正常啟用即可。中國大陸直連 GitHub 較慢時，可以使用 [中國大陸 git 鏡像](/mirrorlist/#list)。
