---
title: "distfiles 設定"
description: "讓 Portage 從 gentoo-zh 鏡像下載 overlay 套件的 distfiles"
manual: |
      ```conf
      # /etc/portage/make.conf
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://distfiles.gentoozh.org"
      ```
quick: |
      ```sh
      $ sudo tee -a /etc/portage/make.conf > /dev/null <<'EOF'
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://distfiles.gentoozh.org"
      EOF
      ```
---

{{< callout type="info" >}}
先[新增 gentoo-zh overlay](/overlay/#adding-overlay)並[接受測試關鍵字](/overlay/#testing-keyword)。
{{< /callout >}}

## 新增鏡像 {#setup}

本站只鏡像 overlay 的 ebuild 宣告的 distfiles，不取代 Gentoo 主儲存庫的鏡像；主儲存庫鏡像見[官方 distfiles 設定](/gentoo-distfiles-setup/)。位址結尾不用加 `distfiles/`，Portage 會自動補上。

把鏡像附加到 `/etc/portage/make.conf` 的 `GENTOO_MIRRORS`。以下設定保留現有鏡像的順序，並將所選鏡像置於新增鏡像之首。

缺少檔案時，Portage 會繼續嘗試 `GENTOO_MIRRORS` 中的後續位址。

<!-- slot:setup -->

## 鏡像 {#mirrors}

改用其他鏡像時，把它加在源站之前，源站留作備援。二進位套件的 `sync-uri` 也以這些位址開頭。

各鏡像的位址見[鏡像列表](/mirrorlist/)。

下載問題見 [distfiles 疑難排解](/distfiles-troubleshooting/#distfiles)。

## 不讓本站鏡像某個 distfile {#restrict-mirror}

避免自動鏡像 distfiles 的方法見 [Overlay 貢獻指南](/overlay-contributing/#restrict-mirror)。
