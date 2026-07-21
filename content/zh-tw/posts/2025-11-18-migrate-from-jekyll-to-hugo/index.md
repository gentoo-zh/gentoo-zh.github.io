---
title: "網站從 Jekyll 遷移至 Hugo"
description: "2025 年接手維護後，把網站從 Jekyll 搬到了 Hugo——建置更快、部署更省事。這篇記一下為什麼換、遷了哪些東西。"
date: 2025-11-18
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

經創始人 [@biergaizi](https://github.com/biergaizi) 授權，[@Zakkaus](https://github.com/zakkaus) 於 2025 年接手本站日常維護，並將網站從 Jekyll 遷移到 Hugo。

## 為什麼換 Hugo

Jekyll 依賴 Ruby 環境，建置較慢，主題生態也不如以往活躍。Hugo 是單一 Go 二進位制，建置速度快、部署簡單，原生支援多語言。主題選用 [Blowfish](https://blowfish.page/)。

## 遷移內容

- `_posts` 目錄改用 Hugo 的 Page Bundles 組織（`content/posts/<slug>/index.zh-cn.md`）
- Front matter 從 YAML 改為 TOML
- 簡繁雙語並存（zh-CN / zh-TW）
- 作者資料集中到 `data/authors/`
- 部署改走 GitHub Actions，定期自動更新貢獻者列表

> 注：以上是當年 Jekyll → Hugo 遷移時的結構。2026 年本站[遷移到 Hextra](/posts/2026-05-29-migrate-to-hextra/) 後已調整：front matter 統一為 YAML，內容按語言分目錄（`content/zh-cn/`、`content/zh-tw/`，檔名均為 `index.md`），作者署名改用 front matter 的 map-form（不再使用 `data/authors/`）。

## 反饋

- Telegram 群：[@gentoo_zh](https://t.me/gentoo_zh)
- Telegram 頻道：[@gentoocn](https://t.me/gentoocn)
- 提交 Issue / PR：[GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io)

感謝 [@biergaizi](https://github.com/biergaizi) 與 [@zhcj](https://github.com/zhcj) 創立並長期維護 Gentoo 中文社群，也感謝 Blowfish 主題的開發者。
