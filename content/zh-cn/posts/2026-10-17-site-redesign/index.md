---
title: "gentoo-zh 网站改版"
description: "主站从 Hugo 迁到 Astro 与 Astryx，下载站说明与服务状态并入主站；GigOS 暂停提供；OSUOSL 提供 ARM 测试机。"
date: 2026-10-17
cover: "cover.webp"
coverAlt: "由贡献者头像拼成的 gentoo-zh 标志"
pinned: true
tag: "公告"
tags: ["announcement", "website"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

gentoozh.org 原来用 Hugo 生成，现已改用 Astro 与 Astryx 重写。原来在下载站（distfiles.gentoozh.org）的说明页面，以及 status.gentoozh.org 的服务状态，都并入了主站。

## 改版内容

- Overlay、二进制包与 distfiles 的配置说明、镜像列表、软件包列表和安装镜像下载，按文档、下载、社区、支持、关于五类整理。
- [服务状态](/status/)取代 status.gentoozh.org，服务探测与历史记录不变。
- 简体中文、正体中文与英文三个版本分别撰写。

网站架构见[更新记录](/changelog/#redesign)。

## GigOS 暂停提供

因资源原因，GigOS（自带中文配置的 KDE Plasma 6 桌面 Live OS）镜像暂时停止提供。[下载页](/download/)继续提供 CJK 最小安装镜像。

## OSUOSL 提供 ARM 测试机

[俄勒冈州立大学开源实验室（OSUOSL）](https://osuosl.org/)为 gentoo-zh 提供了一台 ARM 测试机，目前先用于 overlay 软件包的版本更新（bump）。记录见[开销](/costs/)。

发现问题请在 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io/issues) 反馈。
