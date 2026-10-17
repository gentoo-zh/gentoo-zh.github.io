---
title: "Binary package setup"
description: "Install prebuilt, signed packages from the gentoo-zh binhost"
anchors:
  "key-download": "/binpkg-signing/#key-download"
steps:
  - id: import-key
    title: "Import the signing key"
    body: |
      Key fingerprint: `6A07 26AF 1476 A2F3 82C6  AC66 38A0 234E C16A D42E`

      ```sh
      $ sudo emerge sec-keys/openpgp-keys-gentoozh
      $ sudo getuto
      $ sudo gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
      $ sudo gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
          --passphrase-file /etc/portage/gnupg/pass \
          --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
      $ sudo gpg --homedir /etc/portage/gnupg --check-trustdb
      ```

      If the import fails, see the [key import troubleshooting](/binpkg-troubleshooting/#binpkg-keyring).
  - id: add-repo
    title: "Add the repository"
    body: |
      ```conf
      # /etc/portage/binrepos.conf/gentoo-zh.conf
      [gentoo-zh]
      sync-uri = https://distfiles.gentoozh.org/binpkgs/x86-64
      priority = 10
      verify-signature = true
      location = /var/cache/binhost/gentoo-zh
      ```

      Mirrors carry the same signed packages, so signature checks stay the same.
  - id: getbinpkg
    title: "Enable getbinpkg"
    body: |
      Append to `/etc/portage/make.conf`:

      ```conf
      # /etc/portage/make.conf
      FEATURES="${FEATURES} getbinpkg"
      ```
quick: |
      This command runs the three manual steps in order.

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
First [add the gentoo-zh overlay](/overlay/#adding-overlay) and [accept its testing keyword](/overlay/#testing-keyword), then follow the steps below.
{{< /callout >}}

## Choose a channel {#channel}

Pick the channel that matches your system's main-repository keyword. Both channels take overlay packages at `~amd64`; they differ in whether dependencies are built with stable or testing keywords.

| Channel | Gentoo repository | gentoo-zh overlay | sync-uri path |
|---|---|---|---|
| stable (default) | `amd64` | `~amd64` | `/binpkgs/x86-64` |
| unstable | `~amd64` | `~amd64` | `/unstable/binpkgs/x86-64` |

{{< callout type="warning" >}}
unstable suits only systems that set `ACCEPT_KEYWORDS="~amd64"` globally. Read the [Gentoo Wiki on testing keywords](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide) before switching.
{{< /callout >}}

## Set up {#setup}

<!-- slot:setup -->

See [Binary package signatures](/binpkg-signing/#verification) for global signature requirements and signing local builds.

To use binary packages for a single install without touching `make.conf`:

```sh
$ sudo emerge --ask --getbinpkg <package>
```

Common reasons binary packages are not used are in the [binary package troubleshooting](/binpkg-troubleshooting/#q1); for advanced setups see the [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide).

<!-- anchor:key-download -->

Without the sec-keys package, use the [key download instructions](/binpkg-signing/#key-download).
