---
title: "官方二進位套件設定"
description: "設定官方 binhost、架構與簽章驗證"
setupHint: "所選鏡像用於本頁設定中的位址。"
---

同步 Stage 3 和官方二進位套件的 HTTP 鏡像在 `releases/` 目錄中提供這些資源。

<!-- slot:setup -->

[Gentoo 官方二進位套件儲存庫](https://wiki.gentoo.org/wiki/Project:Binhost)提供預編譯並簽章的二進位套件。較新的 Stage 3 已在 `/etc/portage/binrepos.conf/` 中預設定該儲存庫；使用鏡像時，編輯 `[gentoo]` 設定中的 `sync-uri`。

以下設定使用當前的 `23.0` profile，具體路徑見 [amd64 二進位套件目錄](https://distfiles-cdn-origin.gentoo.org/releases/amd64/binpackages/)和 [arm64 二進位套件目錄](https://distfiles-cdn-origin.gentoo.org/releases/arm64/binpackages/)。

Gentoo Binhost 專案目前支援使用 GNU 工具鏈（glibc、GCC 和 binutils）的 amd64 和 arm64。其他架構和工具鏈的二進位套件僅限 Release Engineering 建置 Stage 3 所用的套件快取。

以下範例使用常規 amd64 的 x86-64 二進位套件：

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
[gentoo]
priority = 1
sync-uri = https://distfiles.gentoo.org/releases/amd64/binpackages/23.0/x86-64
location = /var/cache/binhost/gentoo
verify-signature = true
```

`sync-uri` 指向包含 `Packages` 檔案的目錄。常規 arm64 系統可將路徑改為 `/releases/arm64/binpackages/23.0/arm64`。

對於常規 amd64 系統，CPU 支援 [x86-64-v3](https://www.gentoo.org/news/2024/02/04/x86-64-v3.html) 時可使用對應的二進位套件，以獲得針對該指令集的最佳化。檢查 CPU 是否支援：

```bash
$ ld.so --help
```

輸出中包含 `x86-64-v3 (supported, searched)` 即表示支援。可將上方設定的路徑末尾改為 `x86-64-v3`：

`/etc/portage/binrepos.conf/gentoo.conf`:

```ini
sync-uri = https://distfiles.gentoo.org/releases/amd64/binpackages/23.0/x86-64-v3
```

在有合適的二進位套件時自動下載並使用：

`/etc/portage/make.conf`:

```ini
FEATURES="${FEATURES} getbinpkg"
```

如果沒有合適的二進位套件，Portage 會照常從原始碼編譯。

單次使用二進位套件安裝：

```bash
$ sudo emerge --ask --getbinpkg <package>
```

根據 [Portage binpkg changes](https://www.gentoo.org/support/news-items/2026-05-03-portage-binpkg-changes.html)，新版 Portage 預設驗證遠端二進位套件的簽章，並將其快取到 `location` 指定的目錄。官方 binhost 使用者不再需要啟用 `FEATURES="binpkg-request-signature"`；首次下載時，Portage 會自動執行 `getuto` 建立可信金鑰環。

更多設定見 [Gentoo Binary Host Quickstart](https://wiki.gentoo.org/wiki/Gentoo_Binary_Host_Quickstart)、[Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)和 [MirrorZ Gentoo 幫助](https://help.mirrorz.org/gentoo/)。
