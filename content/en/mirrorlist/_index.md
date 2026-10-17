---
title: "Overlay mirrors"
description: "Mirrors for the gentoo-zh overlay, distfiles and binary packages"
anchors:
  "gentoo-mirrors": "/gentoo-mirrors/#gentoo-mirrors"
  "mirror-overview": "/gentoo-mirrors/#mirror-overview"
  "configuration-tutorials": "/gentoo-repo-setup/#git-sync"
  "synchronize-the-gentoo-ebuild-repository-with-git": "/gentoo-repo-setup/#git-sync"
  "synchronize-the-gentoo-ebuild-repository-with-rsync": "/gentoo-repo-setup/#rsync-sync"
  "distfiles-gentoo_mirrors": "/gentoo-distfiles-setup/#distfiles"
  "official-binary-packages-binhost": "/gentoo-binpkg-setup/#binhost"
  "gentoo-prefix-bootstrap-mirror-configuration": "/gentoo-prefix-setup/#prefix"
---

## gentoo-zh mirrors {#list}

These mirrors carry the gentoo-zh overlay Git repository, distfiles and binary packages. For setup, see the overlay, binary package and distfiles guides under [Docs](/docs/). Sync status of each mirror is on [sync status](/status/). For mirrors of Gentoo's official repositories, see [Official mirrors](/gentoo-mirrors/).

Git mirrors carry the overlay's ebuild repository only, not source archives.

<!-- gz-mirror-table -->

### Run your own mirror {#own}

Sync from the address below. To be listed, open an issue on [GitHub Issues](https://github.com/gentoo-zh/binhost/issues) with the mirror details.

```text
rsync://distfiles.gentoozh.org/gentoo-zh/
```

## Why does Git report a redirect when using CERNET? {#cernet-redirect}

CERNET does not store the files itself. It redirects requests to a nearby mirror, so Git’s redirect message is expected.

## Why do mirrors have different versions? {#mirror-sync}

Mirrors synchronise on separate schedules. If a mirror has an older version, try another mirror and sync again. For ISOs, select the latest version in the directory. See the [mirror list](/mirrorlist/#list).

<!-- anchor:gentoo-mirrors -->

<!-- anchor:mirror-overview -->

<!-- anchor:configuration-tutorials -->

<!-- anchor:synchronize-the-gentoo-ebuild-repository-with-git -->

<!-- anchor:synchronize-the-gentoo-ebuild-repository-with-rsync -->

<!-- anchor:distfiles-gentoo_mirrors -->

<!-- anchor:official-binary-packages-binhost -->

<!-- anchor:gentoo-prefix-bootstrap-mirror-configuration -->

[Official mirrors](/gentoo-mirrors/) · [Official mirror setup](/gentoo-repo-setup/)

<!-- slot:legacy -->
