---
title: "更新记录"
description: "网站与社区服务的重要变更。"
---

<!-- anchor:2026-年-10-月 -->

<!-- anchor:2026-年-9-月 -->

<!-- anchor:2026-年-8-月 -->

<!-- anchor:2026-年-7-月 -->

<!-- anchor:2026-年-6-月 -->

<!-- anchor:2026-年-5-月 -->

<!-- anchor:更新说明 -->

## 旧版更新链接

网站改版后不再保留 2026 年 5 至 10 月的旧版更新记录。指向这些月份的历史链接会定位到此处；当前更新记录见下方。

## 2026-10 Apple Silicon Mac 安装教程更新 {#apple-silicon-guide}

[在 Apple Silicon Mac 上安装 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/) 按 MacBook Air M2 的实际安装过程重写：改用经实机验证的 20260827 版 Live ISO（20261006 版无法启动），列出 Asahi 安装程序与 Recovery 的完整画面，Stage3 改为下载最新版本，`make.conf` 示例改用台湾镜像。

教程后半部分同样按实机补齐：Live 环境用 `net-setup` 连接 Wi-Fi，加密根分区的 fstab、crypttab、dracut 与 GRUB 配置改用实际输出，安装后配置改以 KDE 为例，涵盖 Rime 输入法、音频、睡眠、刘海与自定义内核。教程改为分页阅读，每节一页，旧链接自动跳转到对应页面。

移除转载文章《Gentoo Linux with ZFS》，原网址重定向到文章列表。

## 2026-10 网站改版 {#redesign}

网站从 Hugo 迁移至 Astro：页面在构建时生成静态 HTML，界面使用 Meta 开源的 Astryx 组件库（React 与 StyleX），只有导航、搜索、筛选等少数组件在浏览器中运行。站内搜索由 Pagefind 提供，网站部署在 Cloudflare Workers。下载站的说明页面与服务状态并入主站，按文档、下载、社区、支持、关于五类整理。日期在上线时确定。
