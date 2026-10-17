---
title: "distfiles 排障"
description: "排查 overlay 源码下载的 404 与 Manifest 校验失败。"
---

## distfiles {#distfiles}

<!-- anchor:distfiles-faq -->

### 下载 distfile 时遇到 404，改用本站镜像能解决吗？ {#q15}

只有本站保存了所需文件时才能下载。镜像范围、`GENTOO_MIRRORS` 的地址顺序与备用下载见[distfiles 配置](/distfiles-setup/#setup)。

### 下载文件的大小或校验和与 Manifest 不符，怎么办？ {#q16}

上游可能替换了同一地址的文件，不能只重新生成摘要。[circuitjs1-bin 曾出现这种情况](https://github.com/gentoo-zh/overlay/issues/11038)，需要更新 ebuild 并实际构建、验证新版本。
