---
title: "网站从 Jekyll 迁移至 Hugo"
description: "2025 年接手维护后，把站点从 Jekyll 搬到了 Hugo——构建更快、部署更省心。这篇记一下为什么换、迁了哪些东西。"
date: 2025-11-18
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

经创始人 [@biergaizi](https://github.com/biergaizi) 授权，[@Zakkaus](https://github.com/zakkaus) 于 2025 年接手本站日常维护，并将站点从 Jekyll 迁移到 Hugo。

## 为什么换 Hugo

Jekyll 依赖 Ruby 环境，构建较慢，主题生态也不如以往活跃。Hugo 是单一 Go 二进制，构建速度快、部署简单，原生支持多语言。主题选用 [Blowfish](https://blowfish.page/)。

## 迁移内容

- `_posts` 目录改用 Hugo 的 Page Bundles 组织（`content/posts/<slug>/index.zh-cn.md`）
- Front matter 从 YAML 改为 TOML
- 简繁双语并存（zh-CN / zh-TW）
- 作者数据集中到 `data/authors/`
- 部署改走 GitHub Actions，定期自动更新贡献者列表

> 注：以上是当年 Jekyll → Hugo 迁移时的结构。2026 年本站[迁移到 Hextra](/posts/2026-05-29-migrate-to-hextra/) 后已调整：front matter 统一为 YAML，内容按语言分目录（`content/zh-cn/`、`content/zh-tw/`，文件名均为 `index.md`），作者署名改用 front matter 的 map-form（不再使用 `data/authors/`）。

## 反馈

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 频道：[@gentoocn](https://t.me/gentoocn)
- 提交 Issue / PR：[GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io)

感谢 [@biergaizi](https://github.com/biergaizi) 与 [@zhcj](https://github.com/zhcj) 创立并长期维护 Gentoo 中文社区，也感谢 Blowfish 主题的开发者。
