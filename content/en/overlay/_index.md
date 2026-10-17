---
title: "Overlay setup"
description: "Add the gentoo-zh overlay, accept its testing keyword, and install packages"
anchors:
  "mirrors": "/mirrorlist/#list"
  "adding-the-overlay": adding-overlay
  "accept-the-testing-keyword": testing-keyword
  "install-a-package": install-package
  "distfiles-and-binary-packages": "/distfiles-setup/"
  "distfiles-mirror": "/distfiles-setup/"
  "worth-knowing": notes
  "binary-packages": "/binpkg-setup/"
  "distfiles-mirrors": "/distfiles-setup/"
  "binary-packages-binhost": "/binpkg-setup/"
  "distfiles-binpkg": "/distfiles-setup/"
steps:
  - id: adding-overlay
    title: "Add the overlay"
    body: |
      Install `eselect-repository`, then add and sync the overlay from a Git mirror. Other mirrors are listed in the [overlay mirror list](/mirrorlist/#list).

      ```sh
      $ sudo emerge --ask app-eselect/eselect-repository
      $ sudo eselect repository add gentoo-zh git https://github.com/gentoo-zh/overlay.git
      $ sudo emaint sync -r gentoo-zh
      ```
  - id: testing-keyword
    title: "Accept the testing keyword"
    body: |
      gentoo-zh packages carry only the `~ARCH` (testing) keyword. Systems that already accept `~amd64` globally can skip this step; stable systems must accept `~amd64` first. See the [Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide).

      Accept `~amd64` for the whole overlay. `::gentoo-zh` limits the rule to this overlay, so packages from the main repository are unaffected:

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      */*::gentoo-zh ~amd64
      ```

      Or accept packages one by one:

      ```sh
      # /etc/portage/package.accept_keywords/gentoo-zh
      net-im/tencent-qq ~amd64
      ```
  - id: install-package
    title: "Install a package"
    body: |
      ```sh
      $ sudo emerge --ask net-im/tencent-qq
      ```

      List every package in the overlay with `eix -RO gentoo-zh`.
---

{{< callout type="info" >}}
Run these commands on an installed Gentoo system with Portage and sudo access. Choose the testing keyword that matches your architecture; the examples use amd64.
{{< /callout >}}

[gentoo-zh](https://github.com/gentoo-zh/overlay) is an inclusive overlay for all Gentoo users, started in 2003 as gentoo-tw and gentoo-china. The [package list](/packages/) shows everything it carries.

<!-- slot:setup -->

<!-- steps -->

<!-- anchor:mirrors -->

## Manual configuration and changing mirrors {#manual-config}

See the [overlay mirror list](/mirrorlist/#list) for Git addresses.

`eselect-repository` writes its configuration to `/etc/portage/repos.conf/eselect-repo.conf`. Without it, create `/etc/portage/repos.conf/gentoo-zh.conf`:

```ini
# /etc/portage/repos.conf/gentoo-zh.conf
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

To switch mirrors, change `sync-uri` in the file that holds `[gentoo-zh]`, then delete the local repository and sync again:

```sh
$ sudo rm -rf /var/db/repos/gentoo-zh
$ sudo emaint sync -r gentoo-zh
```

## Worth knowing {#notes}

{{< callout type="info" >}}
Old sync addresses, redirects and version differences are covered in the [overlay troubleshooting](/overlay-troubleshooting/#overlay) and the [mirror list](/mirrorlist/#list).
{{< /callout >}}
