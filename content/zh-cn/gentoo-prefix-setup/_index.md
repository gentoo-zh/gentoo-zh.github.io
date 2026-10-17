---
title: "Prefix 镜像配置"
description: "设置 Bootstrap 与 EPREFIX 下的镜像"
setupHint: "所选镜像用于本页配置中的地址。"
---

运行 Bootstrap 脚本前，选择镜像并设置以下环境变量：

<!-- slot:setup -->

```bash
$ export GENTOO_MIRRORS="https://mirrors.cernet.edu.cn/gentoo"
$ export SNAPSHOT_URL="https://mirrors.cernet.edu.cn/gentoo/snapshots"
```

Bootstrap 完成后，如需为 Gentoo Portage 和 distfiles（ebuild 声明的下载文件）更换镜像，只需将 `/etc` 替换为 `$EPREFIX/etc`。`GNU_URL` 指向 GNU 软件的镜像，地址见所用镜像站的 GNU 帮助页。
