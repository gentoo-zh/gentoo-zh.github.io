---
title: "Overlay 排障"
description: "处理 gentoo-zh overlay 的同步地址问题。"
---

## Overlay {#overlay}

### gentoo-zh overlay 和官方 Portage 树是什么关系？ {#overlay-vs-gentoo}

overlay 是叠加在官方 Portage 树之上的软件来源，存放官方源没有的包：中文输入法、字体、词库，以及跟进新版或打了补丁的包。安装与测试关键字见 [Overlay 配置](/overlay/)。

### 旧的 overlay 同步地址还可用吗？ {#overlay-sync}

2025 年 10 月起，Gentoo 官方不再为第三方仓库提供缓存镜像。此前添加的 gentoo-zh 仓库需更新同步源。旧的 `microcai/gentoo-zh` 地址会重定向到 `gentoo-zh/overlay`，手动设置过 remote 的用户也应更新地址。

配置步骤见 [Overlay 配置](/overlay/#manual-config)；背景见[缓存镜像停用说明](/posts/2025-10-07-thirdparty-repo-mirror-removal/)与[仓库迁移记录](/posts/2026-07-02-gentoo-zh-repo-migration/)。
