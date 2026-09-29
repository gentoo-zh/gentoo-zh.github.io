---
title: "gentoo-zh 二進位包服務上線"
description: "gentoo-zh overlay 的 194 個包現在有預編譯的二進位包，簽名後由 distfiles.gentoozh.org 與南京大學鏡像分發。本文說明如何配置、驗簽怎麼工作，以及哪些包不在其中。"
date: 2026-07-29
tags: ["announcement", "binhost", "overlay"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

overlay 目前 490 個包，其中 194 個有預編譯的二進位包，每晚建置、簽名後分發。配置說明在 <https://distfiles.gentoozh.org>。

收錄的以編譯耗時長的包為主：Electron 應用、瀏覽器、辦公套件，以及帶大量 crate 或 Go module 的專案。因為這些包在本機編譯動輒數十分鐘到數小時，所以取二進位包省下的時間與編譯時長成正比。

## 配置

{{< callout type="info" >}}
配置方法見 **[distfiles.gentoozh.org](https://distfiles.gentoozh.org/)**。
{{< /callout >}}

## 哪些包不在其中

收錄清單裡排除了幾類包，所以二進位包的數量會少於 overlay 的總數：

- `RESTRICT=bindist`，上游不允許再分發建置產物
- 許可證不允許再分發，建置時 `ACCEPT_LICENSE="-* @BINARY-REDISTRIBUTABLE"` 會攔下
- 上游已經發布二進位的 `-bin` 包，安裝過程只是解壓
- 字型、詞庫、主題這類沒有建置系統的包
- `virtual`、`acct-user` 這類不安裝檔案的包
- 只有 `9999` 的 live 包，沒有固定版本可供建置

包屬於哪一類，可以在 <https://distfiles.gentoozh.org/packages> 的狀態列上查到。因為那張表只收錄有原始碼檔案或被建置過的包，所以只有 `9999` 的 live 包不會出現在上面。

不在清單上、但作為 overlay 內部依賴被連帶建置的包（`acct-*`、`virtual/*` 這類），仍會出現在索引裡。

因為二進位包只在 USE 完全匹配時才會被 Portage 採用，所以 USE 組合差異大的包命中率低，建置成本收不回來，也不在清單上。配置好之後若 `emerge` 仍然編譯原始碼，用 `emerge -pv` 檢查，前綴為 `[binary]` 才表示採用了二進位包。

## distfiles 鏡像

二進位包與 distfiles 兩者互相獨立，按需分別配置。distfiles 鏡像是 overlay 裡各包的原始碼，目前約 1200 個檔案、33 GB；它只存 overlay 的原始碼，不能替代官方源，所以是追加到 `GENTOO_MIRRORS` 而不是替換。地址與可複製的配置同樣在 [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 首頁，`::gentoo` 的源另見[鏡像列表](/mirrorlist/)。

## 建置與分發

每晚 02:00（Asia/Shanghai）建置一輪，產物簽名後釋出。因為建置一個包會把它的依賴一併編出來，所以實際釋出數會多於收錄清單的條數。

overlay 裡已經刪除的包，會在下一輪建置時從索引中移除，本地已安裝的包不受影響。

鏡像站也可以使用 rsync 同步（包含二進位包與 distfiles）：

```shell
rsync rsync://distfiles.gentoozh.org/gentoo-zh/
```

若因版權等原因不希望某個包的原始碼被鏡像，請在其 ebuild 中加入 `RESTRICT="mirror"`，同步工具會跳過。建置產物是另一回事：不希望它被再分發，要寫 `RESTRICT="bindist"`，收錄清單的校驗會據此拒絕該包。

## 收錄新包

請在 [binhost 倉庫](https://github.com/gentoo-zh/binhost)的 `build/packages.txt` 中新增一行 `category/package`，然後提交 PR。合併後會在下一輪建置中產出。

相關的服務端配置、建置與釋出指令碼都在同一個倉庫，如有問題請提 issue。
