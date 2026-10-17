---
title: "二進位套件簽章"
description: "下載 gentoo-zh 簽章公鑰，設定全域驗簽與本機建置簽章"
---

首次啟用二進位套件請依[二進位套件設定](/binpkg-setup/)選擇頻道並完成三個設定步驟。

## 不安裝 sec-keys 套件時如何取得公鑰 {#key-download}

用 curl 或 wget 下載公鑰檔案，再把[公鑰匯入步驟](/binpkg-setup/#import-key)中 `--import` 的路徑換成這個檔案。下載不需要 root 權限。

```sh
$ curl -O https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

```sh
$ wget https://distfiles.gentoozh.org/gentoo-zh-binhost.asc
```

## 全域簽章驗證 {#verification}

公鑰匯入與遠端儲存庫驗簽設定見[二進位套件設定](/binpkg-setup/#setup)。

全域 `FEATURES="binpkg-request-signature"` 會覆寫 `binrepos.conf` 的簽章驗證設定，要求所有二進位套件（包括本機建置的）具有有效且可信的簽章。

## 本機建置簽章 {#local-signing}

本機建置須啟用 `FEATURES="binpkg-signing"`，並設定 `BINPKG_GPG_SIGNING_KEY` 與 `BINPKG_GPG_SIGNING_GPG_HOME`。

若使用 getuto 在 `/etc/portage/gnupg` 建立的本機金鑰簽署二進位套件，還須向 GnuPG 提供儲存在該目錄 `pass` 檔案中的密碼；預設簽署指令不會自動讀取該檔案。
