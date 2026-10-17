---
title: "二进制包配置"
description: "从 gentoo-zh binhost 安装预先编译、带签名的软件包"
anchors:
  "key-download": "/binpkg-signing/#key-download"
steps:
  - id: import-key
    title: "导入签名公钥"
    body: |
      公钥指纹：`6A07 26AF 1476 A2F3 82C6  AC66 38A0 234E C16A D42E`

      ```sh
      $ sudo emerge sec-keys/openpgp-keys-gentoozh
      $ sudo getuto
      $ sudo gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
      $ sudo gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
          --passphrase-file /etc/portage/gnupg/pass \
          --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
      $ sudo gpg --homedir /etc/portage/gnupg --check-trustdb
      ```

      导入失败时见[公钥导入排障](/binpkg-troubleshooting/#binpkg-keyring)。
  - id: add-repo
    title: "添加仓库"
    body: |
      ```conf
      # /etc/portage/binrepos.conf/gentoo-zh.conf
      [gentoo-zh]
      sync-uri = https://mirrors.cernet.edu.cn/gentoo-zh/binpkgs/x86-64
      priority = 10
      verify-signature = true
      location = /var/cache/binhost/gentoo-zh
      ```

      镜像同步本站签过名的产物，签名校验要求不变。
  - id: getbinpkg
    title: "启用 getbinpkg"
    body: |
      在 `/etc/portage/make.conf` 末尾追加：

      ```conf
      # /etc/portage/make.conf
      FEATURES="${FEATURES} getbinpkg"
      ```
quick: |
      依次执行以下命令，完成手动配置的三个步骤。

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
      sync-uri = https://mirrors.cernet.edu.cn/gentoo-zh/binpkgs/x86-64
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
先[添加 gentoo-zh overlay](/overlay/#adding-overlay)并[接受测试关键字](/overlay/#testing-keyword)，再按下面的步骤配置。
{{< /callout >}}

## 选择频道 {#channel}

选与系统主仓库关键字一致的频道。两个频道都接受 overlay 的 `~amd64` 软件包，区别在于依赖按稳定还是测试关键字构建。

| 频道 | Gentoo 主仓库 | gentoo-zh overlay | sync-uri 路径 |
|---|---|---|---|
| stable（默认） | `amd64` | `~amd64` | `/binpkgs/x86-64` |
| unstable | `~amd64` | `~amd64` | `/unstable/binpkgs/x86-64` |

{{< callout type="warning" >}}
unstable 只适合全局设置了 `ACCEPT_KEYWORDS="~amd64"` 的系统，切换前先读 [Gentoo Wiki 对测试关键字的说明](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。
{{< /callout >}}

## 配置 {#setup}

<!-- slot:setup -->

全局签名要求与本地构建签名见[二进制包签名](/binpkg-signing/#verification)。

不改 `make.conf`，也可以只在单次安装时使用二进制包：

```sh
$ sudo emerge --ask --getbinpkg <package>
```

二进制包没有生效的常见原因见 [二进制包排障](/binpkg-troubleshooting/#q1)；高级配置参考 [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)。

<!-- anchor:key-download -->

不用 sec-keys 软件包时，见[公钥下载说明](/binpkg-signing/#key-download)。
