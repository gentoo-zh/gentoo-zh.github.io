---
title: "官方 distfiles 配置"
description: "设置 Portage 下载源码时使用的 GENTOO_MIRRORS"
setupHint: "所选镜像用于本页配置中的地址。"
---

distfiles 是 ebuild 声明的下载文件，包括源码归档及构建所需的其他文件。

<!-- slot:setup -->

选择镜像后，将下方生成的配置写入 `/etc/portage/make.conf`。`GENTOO_MIRRORS` 可填多个镜像，Portage 按顺序尝试，前面的优先。

`/etc/portage/make.conf`:

```ini
GENTOO_MIRRORS="https://mirrors.cernet.edu.cn/gentoo https://mirrors.tuna.tsinghua.edu.cn/gentoo https://mirrors.bfsu.edu.cn/gentoo https://mirrors.ustc.edu.cn/gentoo https://mirrors.zju.edu.cn/gentoo https://mirrors.nju.edu.cn/gentoo https://mirrors.sdu.edu.cn/gentoo https://mirrors.hust.edu.cn/gentoo https://distfiles.gentoo.org"
```

保存配置后，Portage 在后续文件下载中使用这些镜像。ebuild 仓库同步见[官方仓库配置](/gentoo-repo-setup/)。

其他镜像及其服务见[镜像总览](/gentoo-mirrors/#镜像总览)。
