---
title: "社区主域名迁往 gentoozh.org"
description: "社区主域名迁往 gentoozh.org"
date: 2026-07-01
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
  - name: Clover（审校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
---

Gentoo 中文社区官网今天正式迁往 **gentoozh.org**。论坛（forum.gentoozh.org）也已搭好，预计于 7 月 5 日前后上线。旧地址（gentoo.org.cn、gentoocn.org）全部 301 永久跳转，书签和已有链接不会失效，但建议尽快更新。

## 不仅仅换个域名

域名迁移是最近一系列整合的收尾。社区沉寂了十多年，积下来的东西不少：TG、QQ 群七八个、域名三四个、官网多年没人动、gentoo-zh GitHub 组织的权限无法统一管理。群组分散导致社群割裂，交流变得十分困难。

最近把这些整理了一下：

- 官网重建
- gentoo-zh 组织拥有了权限
- IRC 和 Matrix 桥接好了
- 各个群统一了
- 域名的控制权集中了
- 组织 Gentoo Wiki 中文翻译

其中域名是最重要的一块。这两周的推进速度较快，通知也多，还请大家见谅。

## 为什么选择 gentoozh.org

旧域名有合规方面的要求，架设论坛、Matrix、下载站这类服务需要走一套我们作为志愿者项目难以完成的流程。gentoozh.org 是国际域名，没有这层限制，一直在我们手里。这次 [@zakkaus](https://github.com/zakkaus) 会把域名和相关服务的管理权限分配给对应的负责人，避免权限再次丢失。

域名里的 zh 来自 ISO 639，是中文这门语言的代码，认的是语言，而不是国家或某个特定地区。而 cn 是 ISO 3166 的国家代码，范围反而更窄。况且 gentoo-zh 就是当年的 gentoo-tw 和 gentoo-china [两岸社区合并](https://code.google.com/archive/p/gentoo-taiwan/issues/2)来的。archlinuxcn 其实也自称「Arch Linux 中文社区」，cn 只是历史留下来的叫法，社区里也有人提过换成 zh，只是体量太大改不动。我们没有那样的历史包袱，既然要动就做到位。

## 官网托管迁到 Cloudflare

顺带一提，官网已从 GitHub Pages 迁到 Cloudflare Workers（静态资源托管），用的是 Workers Paid 方案。

- Cloudflare 的静态资源请求免费、不限量，对社区站来说省心。
- GitHub Pages 有一套[软性限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)（仓库和站点体积、每月带宽、构建频率等），站点再大一点就不太够用了。
- 速度和 GitHub Pages 差不太多，但 Workers Paid 灵活性更高：自定义缓存、响应头都能自己控制，往后要接边缘逻辑也方便，整体体验更好，也更适合社区往后发展。

网站的维护、报错相关事宜，可到 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 开 issue，或通过邮件联系 zakk@gentoozh.org。

## 感谢

gentoo.org.cn 由一位老师长期持有，在社区沉寂的这十多年里一直续着。旧域名保留重定向，不会断链。

同时也感谢[清风老师](/contributors/zhcj/)和[蓝老师](https://packages.gentoo.org/maintainer/dlan@gentoo.org)的指点。这次域名整合的决定很大程度上来自清风老师的建议，他在 2014 年[建立了这个社区](/posts/2014-08-24-gentoo-zh-community-under-construction/)，没有他就没有 gentoo-zh 的起点。

最后感谢 David K. Chau、[依云](https://github.com/lilydjwg)、蜗牛、花火几位菊苣对文章内容提出的意见，以及 Clover 的审校。

## 影响

几乎没有影响，旧地址将全部跳转至新地址：

- `https://gentoo.org.cn` → `https://gentoozh.org`
- `https://www.gentoo.org.cn` → `https://gentoozh.org`
- `https://forum.gentoo.org.cn` → `https://forum.gentoozh.org`
- `https://gentoocn.org` 下所有地址同理

如果发现哪里还留着旧域名没更新，欢迎到 [GitHub](https://github.com/Gentoo-zh/gentoo-zh.github.io) 开 issue 或直接 PR，也可以在 Telegram、Matrix 交流群中告诉我们。

---

## 希望从这里开始，gentoo-zh 能放下历史包袱重新出发，同时也希望大家一起努力

<small>01/07/2026</small>

## 扩展阅读

- [社区域名与基础设施讨论](https://github.com/Gentoo-zh/gentoo-zh.github.io/issues/9)
