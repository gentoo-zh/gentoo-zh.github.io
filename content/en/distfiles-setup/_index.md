---
title: "distfiles setup"
description: "Let Portage fetch distfiles for overlay packages from gentoo-zh mirrors"
manual: |
      ```conf
      # /etc/portage/make.conf
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://ftp2.osuosl.org/pub/gentoo-zh https://distfiles.gentoozh.org"
      ```
quick: |
      ```sh
      $ sudo tee -a /etc/portage/make.conf > /dev/null <<'EOF'
      GENTOO_MIRRORS="${GENTOO_MIRRORS} https://ftp2.osuosl.org/pub/gentoo-zh https://distfiles.gentoozh.org"
      EOF
      ```
---

{{< callout type="info" >}}
First [add the gentoo-zh overlay](/overlay/#adding-overlay) and [accept its testing keyword](/overlay/#testing-keyword).
{{< /callout >}}

## Add the mirrors {#setup}

This mirror carries only the distfiles that overlay ebuilds declare; it does not replace a Gentoo mirror (see [Official distfiles setup](/gentoo-distfiles-setup/)). Leave `distfiles/` off the address; Portage appends it.

Append the mirror to `GENTOO_MIRRORS` in `/etc/portage/make.conf`. This configuration keeps existing mirrors first and places the selected mirror first among the appended mirrors.

When a file is missing, Portage continues to the next URL in `GENTOO_MIRRORS`.

<!-- slot:setup -->

## Mirrors {#mirrors}

To use another mirror, put it before the origin server, which stays as the fallback. The binary package `sync-uri` starts with the same addresses.

The [mirror list](/mirrorlist/) gives every mirror's address.

Download problems are covered in the [distfile troubleshooting](/distfiles-troubleshooting/#distfiles).

## Keep a distfile off this mirror {#restrict-mirror}

How to stop a distfile from being mirrored automatically is in the [overlay contribution guide](/overlay-contributing/#restrict-mirror).
