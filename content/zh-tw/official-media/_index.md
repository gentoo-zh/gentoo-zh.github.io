---
title: "官方安裝媒體"
description: "Gentoo 官方的最小安裝光碟、LiveGUI 與 stage3：檔案位置、下載鏡像與驗證方法"
---

Gentoo 為 amd64、x86、arm64、arm 等架構發布安裝媒體，完整的架構列表見 [Gentoo 官方下載頁](https://www.gentoo.org/downloads/)。

## 檔案 {#files}

在任一鏡像的 `releases/<架構>/autobuilds/` 下取下列檔案（以 amd64 為例）：

<!-- slot:official -->

## 下載鏡像 {#mirrors}

其他下載位址見[官方鏡像](/gentoo-mirrors/)。

<!-- slot:officialmirrors -->

## 驗證 {#verify}

用 `.DIGESTS` 中的 SHA512 摘要驗證 ISO：

```bash
$ sha512sum install-amd64-minimal-*.iso          # 計算 SHA512 摘要
$ cat install-amd64-minimal-*.iso.DIGESTS        # 與 DIGESTS 中的值比對
```

寫入 USB 隨身碟的步驟與 [CJK 最小安裝映像檔](/iso/#usb) 相同。

