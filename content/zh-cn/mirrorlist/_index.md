---
title: "Overlay 镜像"
description: "gentoo-zh overlay、distfiles 与二进制包的镜像"
anchors:
  "gentoo-镜像": "/gentoo-mirrors/#gentoo-镜像"
  "镜像总览": "/gentoo-mirrors/#镜像总览"
  "配置教程": "/gentoo-repo-setup/#git-sync"
  "使用-git-同步-gentoo-ebuild-仓库": "/gentoo-repo-setup/#git-sync"
  "使用-rsync-同步-gentoo-ebuild-仓库": "/gentoo-repo-setup/#rsync-sync"
  "distfiles-配置gentoo_mirrors": "/gentoo-distfiles-setup/#distfiles"
  "官方二进制包binhost": "/gentoo-binpkg-setup/#binhost"
  "gentoo-prefix-bootstrap-镜像配置": "/gentoo-prefix-setup/#prefix"
---

## gentoo-zh 镜像 {#list}

gentoo-zh overlay 的 Git 仓库、distfiles 与二进制包由下列镜像提供。用法见[文档](/docs/)中的 overlay、二进制包与 distfiles 配置；各镜像的同步状态见 [同步状态](/status/)。Gentoo 官方仓库的镜像见[官方镜像](/gentoo-mirrors/)。

Git 镜像只同步 overlay 的 ebuild 仓库，不含源码包。

<!-- gz-mirror-table -->

### 自建镜像 {#own}

从下面的地址同步；如需加入镜像列表，请在 [GitHub Issues](https://github.com/gentoo-zh/binhost/issues) 提交镜像信息。

```text
rsync://distfiles.gentoozh.org/gentoo-zh/
```

## 使用教育网联合镜像站时，为什么 Git 提示重定向？ {#cernet-redirect}

教育网联合镜像站将请求重定向到就近的其他镜像站，本身不保存文件。因此，Git 提示重定向是正常现象。

## 为什么各镜像的版本不一致？ {#mirror-sync}

各镜像按自己的计划同步，进度可能不同。某个镜像版本偏旧时，可换另一个镜像再同步；ISO 请选择对应目录中的最新版本。地址见[镜像列表](/mirrorlist/#list)。

<!-- anchor:gentoo-镜像 -->

<!-- anchor:镜像总览 -->

<!-- anchor:配置教程 -->

<!-- anchor:使用-git-同步-gentoo-ebuild-仓库 -->

<!-- anchor:使用-rsync-同步-gentoo-ebuild-仓库 -->

<!-- anchor:distfiles-配置gentoo_mirrors -->

<!-- anchor:官方二进制包binhost -->

<!-- anchor:gentoo-prefix-bootstrap-镜像配置 -->

[官方镜像](/gentoo-mirrors/) · [官方镜像配置](/gentoo-repo-setup/)

<!-- slot:legacy -->
