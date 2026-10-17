---
title: "Official distfiles setup"
description: "Choose GENTOO_MIRRORS for Portage source downloads"
setupHint: "The selected mirror supplies the URLs in this page’s configuration."
---

Distfiles are files declared by ebuilds for download, including source archives and other build inputs.

<!-- slot:setup -->

Choose a mirror, then save the generated configuration below in `/etc/portage/make.conf`. `GENTOO_MIRRORS` accepts multiple mirrors; Portage tries them in order, giving earlier entries priority.

`/etc/portage/make.conf`:

```ini
GENTOO_MIRRORS="https://distfiles.gentoo.org https://mirrors.cernet.edu.cn/gentoo https://mirrors.tuna.tsinghua.edu.cn/gentoo https://mirrors.bfsu.edu.cn/gentoo https://mirrors.ustc.edu.cn/gentoo https://mirrors.zju.edu.cn/gentoo https://mirrors.nju.edu.cn/gentoo https://mirrors.sdu.edu.cn/gentoo https://mirrors.hust.edu.cn/gentoo"
```

After saving, Portage uses these mirrors for subsequent file downloads. For ebuild repository synchronization, see [Official repository setup](/gentoo-repo-setup/).

See the [mirror overview](/gentoo-mirrors/#mirror-overview) for other mirrors and their services.
