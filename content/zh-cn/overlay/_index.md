---
title: "Overlay 配置"
description: "添加 gentoo-zh overlay，接受测试关键字，安装软件包"
anchors:
  "mirrors": "/mirrorlist/#list"
  "添加-overlay": adding-overlay
  "接受测试关键字": testing-keyword
  "安装软件包": install-package
  "distfiles-镜像与二进制包": "/distfiles-setup/"
  "注意事项": notes
  "distfiles-mirror": "/distfiles-setup/"
  "binary-packages": "/binpkg-setup/"
  "distfiles-mirrors": "/distfiles-setup/"
  "binary-packages-binhost": "/binpkg-setup/"
  "distfiles-镜像": "/distfiles-setup/"
  "二进制包binhost": "/binpkg-setup/"
  "distfiles-binpkg": "/distfiles-setup/"
steps:
  - id: adding-overlay
    title: "添加 overlay"
    body: |
      安装 `eselect-repository`，用 Git 镜像添加并同步 overlay。其他镜像见 [Overlay 镜像表](/mirrorlist/#list)。

      ```sh
      $ sudo emerge --ask app-eselect/eselect-repository
      $ sudo eselect repository add gentoo-zh git https://mirrors.cernet.edu.cn/gentoo-zh.git
      $ sudo emaint sync -r gentoo-zh
      ```
  - id: testing-keyword
    title: "接受测试关键字"
    body: |
      gentoo-zh 的软件包只有 `~ARCH`（测试）关键字，例如 `~amd64` 或 `~arm64`。全局使用 `~ARCH` 的系统跳过这一步；使用稳定关键字的系统要先接受 `~ARCH`，说明见 [Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。

      接受整个 overlay 的 `~ARCH`。`::gentoo-zh` 把规则限定在本 overlay，主仓库的软件包不受影响：

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      */*::gentoo-zh ~amd64
      ```

      也可以逐个接受：

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      net-im/tencent-qq ~amd64
      ```
  - id: install-package
    title: "安装软件包"
    body: |
      ```sh
      $ sudo emerge --ask net-im/tencent-qq
      ```

      列出 overlay 提供的全部软件包：`eix -RO gentoo-zh`。
---

{{< callout type="info" >}}
这些命令用于已安装 Portage 的 Gentoo 系统，需要 sudo 权限。测试关键字必须与系统架构一致，可在上方切换。
{{< /callout >}}

[gentoo-zh](https://github.com/gentoo-zh/overlay) 是一个包容的 overlay，面向所有 Gentoo 用户，前身是 2003 年的 gentoo-tw 与 gentoo-china。收录的全部软件包见[软件包列表](/packages/)。

<!-- slot:setup -->

<!-- steps -->

<!-- anchor:mirrors -->

## 手动配置与更换镜像 {#manual-config}

Git 地址见 [Overlay 镜像表](/mirrorlist/#list)。

`eselect-repository` 生成的配置在 `/etc/portage/repos.conf/eselect-repo.conf`。若不使用 `eselect-repository`，手动创建 `/etc/portage/repos.conf/gentoo-zh.conf`：

```ini
# /etc/portage/repos.conf/gentoo-zh.conf
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://mirrors.cernet.edu.cn/gentoo-zh.git
auto-sync = yes
```

更换镜像时，修改含 `[gentoo-zh]` 的配置文件里的 `sync-uri`，再删除本地仓库并重新同步：

```sh
$ sudo rm -rf /var/db/repos/gentoo-zh
$ sudo emaint sync -r gentoo-zh
```

## 注意事项 {#notes}

{{< callout type="info" >}}
旧同步地址、重定向与版本差异见 [Overlay 排障](/overlay-troubleshooting/#overlay) 与[镜像列表](/mirrorlist/#list)。
{{< /callout >}}
