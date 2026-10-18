---
title: "常见问题"
description: "社区入门与求助问题，以及配置、排障和镜像问题索引。"
anchors:
  "overlay": "/overlay-troubleshooting/#overlay"
  "overlay-vs-gentoo": "/overlay-troubleshooting/#overlay-vs-gentoo"
  "overlay-sync": "/overlay-troubleshooting/#overlay-sync"
  "distfiles": "/distfiles-troubleshooting/#distfiles"
  "distfiles-faq": "/distfiles-troubleshooting/#distfiles-faq"
  "q15": "/distfiles-troubleshooting/#q15"
  "q16": "/distfiles-troubleshooting/#q16"
  "q14": "/overlay-contributing/#restrict-mirror"
  "binpkg-channel": "/binpkg-setup/#channel"
  "q13": "/binpkg-setup/#channel"
  "q2": "/binpkg-setup/#setup"
  "q6": "/binpkg-setup/#setup"
  "binpkg": "/binpkg-troubleshooting/#binpkg"
  "usage": "/binpkg-troubleshooting/#usage"
  "q3": "/binpkg-troubleshooting/#q3"
  "q1": "/binpkg-troubleshooting/#q1"
  "q4": "/binpkg-troubleshooting/#q4"
  "binpkg-keyring": "/binpkg-troubleshooting/#binpkg-keyring"
  "troubleshooting": "/binpkg-troubleshooting/#troubleshooting"
  "q5": "/binpkg-signing/#verification"
  "signing": "/binpkg-signing/#verification"
  "key-download": "/binpkg-signing/#key-download"
  "q11": "/binpkg-signing/#key-download"
  "q7": "/package-status/#scope"
  "q10": "/package-status/#scope"
  "package-status": "/package-status/#status-help"
  "q12": "/package-status/#status-help"
  "mirrors": "/mirrorlist/#list"
  "q8": "/mirrorlist/#list"
  "cernet-redirect": "/mirrorlist/#cernet-redirect"
  "mirror-sync": "/mirrorlist/#mirror-sync"
  "q9": "/mirrorlist/#own"
questions:
  - title: "首次使用 Gentoo 应从何处开始？"
    href: "#where-to-start"
  - title: "如何寻求技术支持？"
    href: "#where-to-ask"
  - title: "如何为社区贡献？"
    href: "#how-to-contribute"
  - title: "gentoo-zh overlay 和官方 Portage 树是什么关系？"
    href: "/overlay-troubleshooting/#overlay-vs-gentoo"
  - title: "旧的 overlay 同步地址还可用吗？"
    href: "/overlay-troubleshooting/#overlay-sync"
  - title: "如何避免自动镜像某个软件包的 distfile？"
    href: "/overlay-contributing/#restrict-mirror"
  - title: "下载 distfile 时遇到 404，改用本站镜像能解决吗？"
    href: "/distfiles-troubleshooting/#q15"
  - title: "下载文件的大小或校验和与 Manifest 不符，怎么办？"
    href: "/distfiles-troubleshooting/#q16"
  - title: "如何选择 stable 与 unstable 频道？"
    href: "/binpkg-setup/#channel"
  - title: "二进制包应该配置在哪里？"
    href: "/binpkg-setup/#setup"
  - title: "OpenRC 和 systemd 都能使用吗？"
    href: "/binpkg-troubleshooting/#q3"
  - title: "本站提供哪些二进制包？"
    href: "/package-status/#scope"
  - title: "包列表中的状态表示什么？"
    href: "/package-status/#status-help"
  - title: "如何验证下载的二进制包来自本站且内容未被修改？"
    href: "/binpkg-signing/#verification"
  - title: "不安装 sec-keys 软件包时，如何取得签名公钥？"
    href: "/binpkg-signing/#key-download"
  - title: "导入公钥时出现 no writable keyring found，怎么办？"
    href: "/binpkg-troubleshooting/#binpkg-keyring"
  - title: "配置之后 emerge 为何仍然从源码编译？"
    href: "/binpkg-troubleshooting/#q1"
  - title: "二进制包是否可能无法在我的 CPU 上运行？"
    href: "/binpkg-troubleshooting/#q4"
  - title: "有哪些镜像，如何配置？"
    href: "/mirrorlist/#list"
  - title: "使用教育网联合镜像站时，为什么 Git 提示重定向？"
    href: "/mirrorlist/#cernet-redirect"
  - title: "为什么各镜像的版本不一致？"
    href: "/mirrorlist/#mirror-sync"
  - title: "如何自行建立镜像？"
    href: "/mirrorlist/#own"
---

<!-- slot:topics -->

## 社区 {#community}

### 首次使用 Gentoo 应从何处开始？ {#where-to-start}

- 需要理解完整安装过程：按 [Gentoo 官方 Handbook（中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation/zh-cn) 逐步安装。
- 需要在安装环境中显示中文：使用社区的 [CJK 最小安装镜像](/iso/)，其余步骤与 Handbook 相同。
- 系统安装完成后[添加 gentoo-zh overlay](/overlay/)，以安装官方源未收录的中文与 CJK 软件包。

### 如何寻求技术支持？ {#where-to-ask}

Telegram、Matrix、IRC 等渠道见[交流渠道](/channels/)，也可以在[论坛](https://forum.gentoozh.org/)发帖。overlay 的缺陷请到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay/issues) 提交 issue。

### 如何为社区贡献？ {#how-to-contribute}

为 overlay 提交软件包或修复缺陷、为网站撰写文章或补充翻译，流程见[贡献指南](/contributing/)。

<!-- slot:legacy -->
