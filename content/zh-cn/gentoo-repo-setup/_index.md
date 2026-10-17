---
title: "官方仓库配置"
description: "使用 Git 或 rsync 同步 Gentoo ebuild 仓库"
setupHint: "所选镜像用于下方同步配置；缺少的 Git／rsync 服务使用本语言的默认源。"
---

Gentoo ebuild 仓库包含 Portage 解析和构建软件包所需的 ebuild 与元数据。

<!-- slot:setup -->

## 使用 Git 同步 Gentoo ebuild 仓库 {#git-sync}

### 实测可用的 Git 源

| 镜像 | 同步地址 |
| --- | --- |
| 清华 TUNA | `https://mirrors.tuna.tsinghua.edu.cn/git/gentoo-portage.git` |
| 中科大 USTC | `https://mirrors.ustc.edu.cn/gentoo.git` |
| 浙大 ZJU | `https://mirrors.zju.edu.cn/git/gentoo-portage.git` |
| 南大 NJU | `https://mirrors.nju.edu.cn/git/gentoo-portage.git` |
| 北外 BFSU | `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git` |
| 山大 SDU | `https://mirrors.sdu.edu.cn/git/gentoo-portage.git` |
| 华科 HUST | `https://mirrors.hust.edu.cn/git/gentoo-portage.git` |
| GitHub（国外） | `https://github.com/gentoo-mirror/gentoo.git` |

安装 `eselect-repository`：

```bash
$ sudo emerge --ask app-eselect/eselect-repository
$ sudo eselect repository remove -f gentoo
$ sudo eselect repository add gentoo git https://mirrors.cernet.edu.cn/gentoo-portage.git
$ sudo emaint sync -r gentoo
```

删除现有的 Gentoo ebuild 仓库配置和本地副本，再使用所选镜像添加 Git 仓库。不同镜像的同步进度可能不同；更换 Git 镜像时，建议删除并重新添加仓库。

选 CERNET 时，git 会提示 `warning: redirecting to ...`，因为 CERNET 按来源把请求转到就近的成员镜像，同步本身照常完成。

手动配置或更换镜像时，编辑 `/etc/portage/repos.conf/` 中包含 `[gentoo]` 的配置文件。首次配置可创建 `/etc/portage/repos.conf/gentoo.conf`；通过 `eselect-repository` 生成的配置位于 `/etc/portage/repos.conf/eselect-repo.conf`。

完整配置示例：

`/etc/portage/repos.conf/gentoo.conf`:

```ini
[gentoo]
location = /var/db/repos/gentoo
sync-type = git
sync-uri = https://mirrors.cernet.edu.cn/gentoo-portage.git
auto-sync = yes
```

首次从 rsync 切换到 Git 或更换镜像时，删除现有的本地仓库并重新同步：

```bash
$ sudo rm -rf /var/db/repos/gentoo
$ sudo emaint sync -r gentoo
```

配置原理和排障方法见 [Portage with Git](https://wiki.gentoo.org/wiki/Portage_with_Git)。

## 使用 rsync 同步 Gentoo ebuild 仓库 {#rsync-sync}

{{< callout type="warning" >}}
多数镜像只提供 Git / Distfiles，并不提供 rsync 同步。下面这些镜像实测能列出 `gentoo-portage` 模块。
{{< /callout >}}

| 镜像 | 同步地址 |
| --- | --- |
| 清华 TUNA | `rsync://mirrors.tuna.tsinghua.edu.cn/gentoo-portage` |
| 中科大 USTC | `rsync://rsync.mirrors.ustc.edu.cn/gentoo-portage` |
| 北外 BFSU | `rsync://mirrors.bfsu.edu.cn/gentoo-portage` |
| 台湾 NCHC | `rsync://ftp.twaren.net/gentoo-portage` |
| 香港 PlanetUnix | `rsync://hippocamp.cn.ext.planetunix.net/gentoo-portage` |

编辑 `/etc/portage/repos.conf/gentoo.conf`，把 `sync-uri` 指向上面任一地址：

`/etc/portage/repos.conf/gentoo.conf`:

```ini
[gentoo]
location = /var/db/repos/gentoo
sync-type = rsync
sync-uri = rsync://mirrors.tuna.tsinghua.edu.cn/gentoo-portage
auto-sync = yes
```

然后执行 `emaint sync -r gentoo`。
