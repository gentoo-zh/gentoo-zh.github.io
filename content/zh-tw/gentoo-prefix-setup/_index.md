---
title: "Prefix 鏡像設定"
description: "設定 Bootstrap 與 EPREFIX 下的鏡像"
setupHint: "所選鏡像用於本頁設定中的位址。"
---

執行 Bootstrap 指令碼前，選擇鏡像並設定以下環境變數：

<!-- slot:setup -->

```bash
$ export GENTOO_MIRRORS="https://distfiles.gentoo.org"
$ export SNAPSHOT_URL="https://distfiles.gentoo.org/snapshots"
```

Bootstrap 完成後，如需為 Gentoo Portage 和 distfiles（ebuild 宣告的下載檔案）更換鏡像，只需將 `/etc` 替換為 `$EPREFIX/etc`。`GNU_URL` 指向 GNU 軟體的鏡像，位址見所用鏡像站的 GNU 說明頁。
