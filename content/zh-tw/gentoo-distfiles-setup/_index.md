---
title: "官方 distfiles 設定"
description: "設定 Portage 下載原始碼時使用的 GENTOO_MIRRORS"
setupHint: "所選鏡像用於本頁設定中的位址。"
---

distfiles 是 ebuild 宣告的下載檔案，包括原始碼封存檔及建置所需的其他檔案。

<!-- slot:setup -->

選擇鏡像後，將下方產生的設定寫入 `/etc/portage/make.conf`。`GENTOO_MIRRORS` 可列出多個鏡像，Portage 會依序嘗試，順序在前的優先。

`/etc/portage/make.conf`:

```ini
GENTOO_MIRRORS="https://distfiles.gentoo.org https://mirrors.cernet.edu.cn/gentoo https://mirrors.tuna.tsinghua.edu.cn/gentoo https://mirrors.bfsu.edu.cn/gentoo https://mirrors.ustc.edu.cn/gentoo https://mirrors.zju.edu.cn/gentoo https://mirrors.nju.edu.cn/gentoo https://mirrors.sdu.edu.cn/gentoo https://mirrors.hust.edu.cn/gentoo"
```

儲存設定後，Portage 在後續檔案下載中使用這些鏡像。ebuild 儲存庫同步見[官方儲存庫設定](/gentoo-repo-setup/)。

其他鏡像及其服務見[鏡像總覽](/gentoo-mirrors/#鏡像總覽)。
