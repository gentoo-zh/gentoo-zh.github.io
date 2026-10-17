---
title: "CJK 最小安裝映像檔"
description: "gentoo-zh 建置的 amd64 最小安裝映像檔，控制台能顯示中日韓文字，每週更新"
---


{{< callout type="info" >}}
準備一台 amd64 電腦和足夠存放 ISO 的空間。寫入映像檔需要管理員權限，以及一個可以清空全部內容的 USB 隨身碟。
{{< /callout >}}

<!-- slot:mac -->

## 下載 ISO {#minimal}

第三方最小安裝媒體，用 Catalyst 依 Gentoo 官方 Release Engineering 規範建置。

<!-- slot:download -->

## 鏡像站 {#minimal-mirrors}

每個版本是一個以建置時間命名的目錄（如 `20261012T114547Z/`），內含 ISO、`.sha256`、`.DIGESTS` 與 `.CONTENTS.gz`。鏡像重新導向與版本差異見[鏡像列表](/mirrorlist/#list)。

<!-- slot:mirrors -->

## 與官方最小安裝媒體的差異 {#minimal-differences}

- 建置時設定了 gentoo-zh overlay。
- 核心為 `sys-kernel/gentoo-cjk-kernel-bin`，帶 cjktty 修補，因此 Linux 控制台能顯示中日韓文字。
- 支援 ZFS。
- 其餘與上游一致：套件清單、livecd/unmerge、livecd/empty、dracut 參數與 GRUB 主題均為官方版本。

## 驗證 ISO {#verify}

<!-- slot:verify -->

## 寫入 USB 隨身碟 {#usb}

<!-- slot:usb -->

