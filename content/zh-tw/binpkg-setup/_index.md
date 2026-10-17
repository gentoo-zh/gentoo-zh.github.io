---
title: "二進位套件設定"
description: "從 gentoo-zh binhost 安裝預先編譯、附簽章的套件"
anchors:
  "key-download": "/binpkg-signing/#key-download"
steps:
  - id: import-key
    title: "匯入簽章公鑰"
    body: |
      公鑰指紋：`6A07 26AF 1476 A2F3 82C6  AC66 38A0 234E C16A D42E`

      ```sh
      $ sudo emerge sec-keys/openpgp-keys-gentoozh
      $ sudo getuto
      $ sudo gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
      $ sudo gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
          --passphrase-file /etc/portage/gnupg/pass \
          --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
      $ sudo gpg --homedir /etc/portage/gnupg --check-trustdb
      ```

      匯入失敗時見[公鑰匯入疑難排解](/binpkg-troubleshooting/#binpkg-keyring)。
  - id: add-repo
    title: "新增儲存庫"
    body: |
      ```conf
      # /etc/portage/binrepos.conf/gentoo-zh.conf
      [gentoo-zh]
      sync-uri = https://distfiles.gentoozh.org/binpkgs/x86-64
      priority = 10
      verify-signature = true
      location = /var/cache/binhost/gentoo-zh
      ```

      鏡像同步本站簽過章的產物，簽章驗證要求不變。
  - id: getbinpkg
    title: "啟用 getbinpkg"
    body: |
      在 `/etc/portage/make.conf` 結尾附加：

      ```conf
      # /etc/portage/make.conf
      FEATURES="${FEATURES} getbinpkg"
      ```
quick: |
      依序執行以下指令，完成手動設定的三個步驟。

      ```sh
      $ sudo emerge sec-keys/openpgp-keys-gentoozh
      $ sudo getuto
      $ sudo gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
      $ sudo gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
          --passphrase-file /etc/portage/gnupg/pass \
          --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
      $ sudo gpg --homedir /etc/portage/gnupg --check-trustdb

      $ sudo mkdir -p /etc/portage/binrepos.conf
      $ sudo tee /etc/portage/binrepos.conf/gentoo-zh.conf > /dev/null <<'EOF'
      [gentoo-zh]
      sync-uri = https://distfiles.gentoozh.org/binpkgs/x86-64
      priority = 10
      verify-signature = true
      location = /var/cache/binhost/gentoo-zh
      EOF

      $ sudo tee -a /etc/portage/make.conf > /dev/null <<'EOF'
      FEATURES="${FEATURES} getbinpkg"
      EOF
      ```
---

{{< callout type="info" >}}
先[新增 gentoo-zh overlay](/overlay/#adding-overlay)並[接受測試關鍵字](/overlay/#testing-keyword)，再依下列步驟設定。
{{< /callout >}}

## 選擇頻道 {#channel}

選與系統主儲存庫關鍵字一致的頻道。兩個頻道都接受 overlay 的 `~amd64` 套件，差別在於相依套件依穩定或測試關鍵字建置。

| 頻道 | Gentoo 主儲存庫 | gentoo-zh overlay | sync-uri 路徑 |
|---|---|---|---|
| stable（預設） | `amd64` | `~amd64` | `/binpkgs/x86-64` |
| unstable | `~amd64` | `~amd64` | `/unstable/binpkgs/x86-64` |

{{< callout type="warning" >}}
unstable 只適合全域設定了 `ACCEPT_KEYWORDS="~amd64"` 的系統，切換前先讀 [Gentoo Wiki 對測試關鍵字的說明](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。
{{< /callout >}}

## 設定 {#setup}

<!-- slot:setup -->

全域簽章要求與本機建置簽章見[二進位套件簽章](/binpkg-signing/#verification)。

不改 `make.conf`，也可以只在單次安裝時使用二進位套件：

```sh
$ sudo emerge --ask --getbinpkg <package>
```

二進位套件沒有生效的常見原因見 [二進位套件疑難排解](/binpkg-troubleshooting/#q1)；進階設定參考 [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)。

<!-- anchor:key-download -->

不使用 sec-keys 套件時，見[公鑰下載說明](/binpkg-signing/#key-download)。
