---
title: "Overlay 設定"
description: "新增 gentoo-zh overlay，接受測試關鍵字，安裝套件"
anchors:
  "mirrors": "/mirrorlist/#list"
  "新增-overlay": adding-overlay
  "接受測試關鍵字": testing-keyword
  "安裝軟體套件": install-package
  "distfiles-鏡像與二進位包": "/distfiles-setup/"
  "注意事項": notes
  "distfiles-mirror": "/distfiles-setup/"
  "binary-packages": "/binpkg-setup/"
  "distfiles-mirrors": "/distfiles-setup/"
  "distfiles-鏡像": "/distfiles-setup/"
  "二進位包binhost": "/binpkg-setup/"
  "distfiles-binpkg": "/distfiles-setup/"
steps:
  - id: adding-overlay
    title: "新增 overlay"
    body: |
      安裝 `eselect-repository`，用 Git 鏡像新增並同步 overlay。其他鏡像見 [Overlay 鏡像表](/mirrorlist/#list)。

      ```sh
      $ sudo emerge --ask app-eselect/eselect-repository
      $ sudo eselect repository add gentoo-zh git https://github.com/gentoo-zh/overlay.git
      $ sudo emaint sync -r gentoo-zh
      ```
  - id: testing-keyword
    title: "接受測試關鍵字"
    body: |
      gentoo-zh 的套件只有 `~ARCH`（測試）關鍵字。全域使用 `~amd64` 的系統可略過這一步；使用穩定關鍵字的系統要先接受 `~amd64`，說明見 [Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。

      接受整個 overlay 的 `~amd64`。`::gentoo-zh` 把規則限定在本 overlay，主儲存庫的套件不受影響：

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      */*::gentoo-zh ~amd64
      ```

      也可以逐一接受：

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      net-im/tencent-qq ~amd64
      ```
  - id: install-package
    title: "安裝套件"
    body: |
      ```sh
      $ sudo emerge --ask net-im/tencent-qq
      ```

      列出 overlay 提供的全部套件：`eix -RO gentoo-zh`。
---

{{< callout type="info" >}}
這些指令用於已安裝 Portage 的 Gentoo 系統，需要 sudo 權限。測試關鍵字應與系統架構一致，範例使用 amd64。
{{< /callout >}}

[gentoo-zh](https://github.com/gentoo-zh/overlay) 是一個包容的 overlay，面向所有 Gentoo 使用者，前身是 2003 年的 gentoo-tw 與 gentoo-china。收錄的全部套件見[軟體套件清單](/packages/)。

<!-- slot:setup -->

<!-- steps -->

<!-- anchor:mirrors -->

## 手動設定與更換鏡像 {#manual-config}

Git 位址見 [Overlay 鏡像表](/mirrorlist/#list)。

`eselect-repository` 產生的設定在 `/etc/portage/repos.conf/eselect-repo.conf`。若不使用 `eselect-repository`，手動建立 `/etc/portage/repos.conf/gentoo-zh.conf`：

```ini
# /etc/portage/repos.conf/gentoo-zh.conf
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

更換鏡像時，修改含 `[gentoo-zh]` 的設定檔裡的 `sync-uri`，再刪除本機儲存庫並重新同步：

```sh
$ sudo rm -rf /var/db/repos/gentoo-zh
$ sudo emaint sync -r gentoo-zh
```

## 注意事項 {#notes}

{{< callout type="info" >}}
舊同步位址、重新導向與版本差異見 [Overlay 疑難排解](/overlay-troubleshooting/#overlay) 與[鏡像列表](/mirrorlist/#list)。
{{< /callout >}}
