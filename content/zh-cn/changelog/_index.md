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

## 2026-10 致谢与开销 {#sponsors}

[致谢](/thanks/)加入 Onidel：它通过 Launch Pack 计划提供 120 USD 云服务额度，用于论坛与 Matrix 桥接。页面另新增「个人」一节。[基础设施开销](/costs/)的支出表加入这笔额度，已抵扣的部分从累计支出中扣除。

## 2026-10 Apple Silicon Mac 安装教程更新 {#apple-silicon-guide}

[在 Apple Silicon Mac 上安装 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/) 按 MacBook Air M2 的实际安装过程重写：改用经实机验证的 20260827 版 Live ISO（20261006 版无法启动），列出 Asahi 安装程序与 Recovery 的完整画面，Stage3 改为下载最新版本，`make.conf` 示例改用台湾镜像。

教程后半部分同样按实机补齐：Live 环境用 `net-setup` 连接 Wi-Fi，加密根分区的 fstab、crypttab、dracut 与 GRUB 配置改用实际输出，安装后配置改以 KDE 为例，涵盖 Rime 输入法、音频、睡眠、刘海与自定义内核。教程改为分页阅读，每节一页，旧链接自动跳转到对应页面。

安装后配置重新分成「桌面」（桌面环境、字体与中文输入、音频、蓝牙）与「系统」（睡眠、内存）两章，并补上实机检查发现的缺口：启用时间同步与蓝牙，加入 zram 与 systemd-oomd，关闭重复启动的 fcitx5。新增「Mac 键位与触摸板」一章：启用 gentoo-zh overlay，用 keyd 映射 Mac 键位，并让「键盘输入时禁用触摸板」在 keyd 下继续生效。分页阅读的章节目录改为与文档侧栏相同的折叠列表：列出各章小节，默认展开当前章节，并标出正在阅读的一节。

移除转载文章《Gentoo Linux with ZFS》，原网址重定向到文章列表。

## 2026-10 Overlay 配置 {#overlay-arch}

[Overlay 配置](/overlay/)的选项栏加入 amd64／arm64 切换，接受测试关键字的命令随所选架构改为 `~amd64` 或 `~arm64`。

## 2026-10 网站改版 {#redesign}

网站从 Hugo 迁移至 Astro：页面在构建时生成静态 HTML，界面使用 Meta 开源的 Astryx 组件库（React 与 StyleX），只有导航、搜索、筛选等少数组件在浏览器中运行。站内搜索由 Pagefind 提供，网站部署在 Cloudflare Workers。下载站的说明页面与服务状态并入主站，按文档、下载、社区、支持、关于五类整理。日期在上线时确定。
