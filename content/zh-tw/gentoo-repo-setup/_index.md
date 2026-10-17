---
title: "官方儲存庫設定"
description: "使用 Git 或 rsync 同步 Gentoo ebuild 儲存庫"
setupHint: "所選鏡像用於下方同步設定；缺少的 Git／rsync 服務使用本語言的預設來源。"
---

Gentoo ebuild 儲存庫包含 Portage 解析和建置軟體套件所需的 ebuild 與元資料。

<!-- slot:setup -->

## 使用 Git 同步 Gentoo ebuild 儲存庫 {#git-sync}

### 實測可用的 Git 源

| 鏡像 | 同步位址 |
| --- | --- |
| 清華 TUNA | `https://mirrors.tuna.tsinghua.edu.cn/git/gentoo-portage.git` |
| 中科大 USTC | `https://mirrors.ustc.edu.cn/gentoo.git` |
| 浙大 ZJU | `https://mirrors.zju.edu.cn/git/gentoo-portage.git` |
| 南大 NJU | `https://mirrors.nju.edu.cn/git/gentoo-portage.git` |
| 北外 BFSU | `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git` |
| 山大 SDU | `https://mirrors.sdu.edu.cn/git/gentoo-portage.git` |
| 華科 HUST | `https://mirrors.hust.edu.cn/git/gentoo-portage.git` |
| GitHub（國外） | `https://github.com/gentoo-mirror/gentoo.git` |

安裝 `eselect-repository`：

```bash
$ sudo emerge --ask app-eselect/eselect-repository
$ sudo eselect repository remove -f gentoo
$ sudo eselect repository add gentoo git https://github.com/gentoo-mirror/gentoo.git
$ sudo emaint sync -r gentoo
```

刪除現有的 Gentoo ebuild 儲存庫設定和本地副本，再使用所選鏡像新增 Git 儲存庫。不同鏡像的同步進度可能不同；更換 Git 鏡像時，建議刪除並重新新增儲存庫。

選 CERNET 時，git 會提示 `warning: redirecting to ...`，因為 CERNET 按來源把請求轉到就近的成員鏡像，同步本身照常完成。

手動設定或更換鏡像時，編輯 `/etc/portage/repos.conf/` 中包含 `[gentoo]` 的設定檔。首次設定可建立 `/etc/portage/repos.conf/gentoo.conf`；透過 `eselect-repository` 產生的設定位於 `/etc/portage/repos.conf/eselect-repo.conf`。

完整設定範例：

`/etc/portage/repos.conf/gentoo.conf`:

```ini
[gentoo]
location = /var/db/repos/gentoo
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
auto-sync = yes
```

首次從 rsync 切換到 Git 或更換鏡像時，刪除現有的本地儲存庫並重新同步：

```bash
$ sudo rm -rf /var/db/repos/gentoo
$ sudo emaint sync -r gentoo
```

設定原理與疑難排解方法見 [Portage with Git](https://wiki.gentoo.org/wiki/Portage_with_Git)。

## 使用 rsync 同步 Gentoo ebuild 儲存庫 {#rsync-sync}

{{< callout type="warning" >}}
多數鏡像只提供 Git / Distfiles，並不提供 rsync 同步。下面這些鏡像實測能列出 `gentoo-portage` 模組。
{{< /callout >}}

| 鏡像 | 同步位址 |
| --- | --- |
| 清華 TUNA | `rsync://mirrors.tuna.tsinghua.edu.cn/gentoo-portage` |
| 中科大 USTC | `rsync://rsync.mirrors.ustc.edu.cn/gentoo-portage` |
| 北外 BFSU | `rsync://mirrors.bfsu.edu.cn/gentoo-portage` |
| 臺灣 NCHC | `rsync://ftp.twaren.net/gentoo-portage` |
| 香港 PlanetUnix | `rsync://hippocamp.cn.ext.planetunix.net/gentoo-portage` |

編輯 `/etc/portage/repos.conf/gentoo.conf`，把 `sync-uri` 指向上方任一位址：

`/etc/portage/repos.conf/gentoo.conf`:

```ini
[gentoo]
location = /var/db/repos/gentoo
sync-type = rsync
sync-uri = rsync://ftp.twaren.net/gentoo-portage
auto-sync = yes
```

然後執行 `emaint sync -r gentoo`。
