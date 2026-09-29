---
title: "distfiles.gentoozh.org 重做，binhost 迁到 OSUOSL"
description: "overlay、distfiles、binhost 与 Live ISO 的说明合并到一个站点；binhost 改由 OSUOSL 的服务器构建，并新增美国镜像。现有配置不需要修改。"
date: 2026-09-30
tags: ["announcement", "binhost"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

[distfiles.gentoozh.org](https://distfiles.gentoozh.org/?lang=zh-cn) 已经重做。添加 overlay、配置 distfiles 与 binhost、下载 Live ISO、选择镜像，现在都在这一个站点完成，本站的 Overlay 页与下载页也直接链接过去。

## binhost 迁到 OSUOSL

binhost 构建机已迁到[俄勒冈州立大学开源实验室（OSUOSL）](https://osuosl.org/)提供的服务器。公开地址与签名公钥不变，现有的 `binrepos.conf` 不需要修改。

构建使用的 profile 同时改为 `default/linux/amd64/23.0/desktop/systemd`。两种 init 的用户数量差距明显，构建算力有限，所以只构建这一套。约 4% 的包的 USE 与 systemd 有关，OpenRC 用户安装这些包时，Portage 会跳过二进制包、改为本机编译，其余的包不受影响。

## 新增美国镜像

OSUOSL 同时提供了[美国镜像](https://ftp2.osuosl.org/pub/gentoo-zh/)。现在德国（源站）、中国大陆与美国都有镜像，列表见[镜像页](https://distfiles.gentoozh.org/mirrors?lang=zh-cn)。

中国大陆以外的亚洲地区还没有镜像。愿意提供的话，从 `rsync://distfiles.gentoozh.org/gentoo-zh/` 同步，再到 [GitHub Issues](https://github.com/gentoo-zh/binhost/issues) 提交镜像信息。

## 致谢

感谢 OSUOSL 提供构建机与镜像，感谢教育网联合镜像站、南京大学、南阳理工学院与河南省教育科研网提供镜像。
