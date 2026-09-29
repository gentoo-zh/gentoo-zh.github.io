---
title: "下载"
---

安装 Gentoo 前需要准备安装介质。中文社区维护两个 amd64 镜像，见下一节；使用官方介质请从下面的镜像站就近选择。

{{< callout type="info" >}}
**Apple Silicon Mac（M1 / M2）** 不适用本页列出的标准 amd64 镜像，请看 [在 Apple Silicon Mac 上安装 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/)。
{{< /callout >}}

## 中文社区镜像 {#live-iso}

两个镜像都是每周自动构建，下载、校验和与各镜像目录都在下载站：

{{< cards cols="2" >}}
  {{< card link="https://distfiles.gentoozh.org/gigos/?lang=zh-cn" title="Gig-OS 桌面镜像" icon="desktop-computer" subtitle="KDE Plasma 6 桌面，预置中文环境与输入法，可直接试用，也可用图形安装器安装到硬盘。需要支持 AVX2 的处理器。" >}}
  {{< card link="https://distfiles.gentoozh.org/iso?lang=zh-cn" title="CJK 最小安装镜像" icon="terminal" subtitle="第三方 amd64 最小安装介质，用 Catalyst 按官方 Release Engineering 的 spec 构建。内核带 cjktty 补丁，控制台能显示中日韩文字，并支持 ZFS。" >}}
{{< /cards >}}

{{< hextra/hero-button text="前往下载站" link="https://distfiles.gentoozh.org/?lang=zh-cn" style="margin-top:1.25rem;margin-bottom:.5rem" >}}

- **Gig-OS 登录凭据**：用户 {{< copy "live" >}} / 密码 {{< copy "live" >}} / root 密码 {{< copy "live" >}}
- **项目仓库**：[Gig-OS/Live-ISO](https://github.com/Gig-OS/Live-ISO) · [gentoo-zh/gentoo-cjk-livecd](https://github.com/gentoo-zh/gentoo-cjk-livecd)
- **新版通知**：Telegram 频道 [@gentoomirror](https://t.me/gentoomirror)，每周构建上线时自动播报

## 镜像站 {#镜像源}

下面节点均提供 amd64 / x86 / arm64 等架构的官方安装介质。按地区就近选择，下载更快：

{{% gz-table %}}
| 镜像 | 地区 | 下载地址（releases/） |
| --- | --- | --- |
| 清华 TUNA | 华北·北京 | <https://mirrors.tuna.tsinghua.edu.cn/gentoo/releases/> |
| 北外 BFSU | 华北·北京 | <https://mirrors.bfsu.edu.cn/gentoo/releases/> |
| 中科大 USTC | 华东·合肥 | <https://mirrors.ustc.edu.cn/gentoo/releases/> |
| 浙大 ZJU | 华东·杭州 | <https://mirrors.zju.edu.cn/gentoo/releases/> |
| 南大 NJU | 华东·南京 | <https://mirrors.nju.edu.cn/gentoo/releases/> |
| 山大 SDU | 华东·青岛 | <https://mirrors.sdu.edu.cn/gentoo/releases/> |
| 华科 HUST | 华中·武汉 | <https://mirrors.hust.edu.cn/gentoo/releases/> |
| 南科大 SUSTech | 华南·深圳 | <https://mirrors.sustech.edu.cn/gentoo/releases/> |
| 哈工大 HIT | 东北·哈尔滨 | <https://mirrors.hit.edu.cn/gentoo/releases/> |
| 兰大 LZU | 西北·兰州 | <https://mirror.lzu.edu.cn/gentoo/releases/> |
| 阿里云 | 全国·CDN | <https://mirrors.aliyun.com/gentoo/releases/> |
| 网易 163 | 全国·CDN | <https://mirrors.163.com/gentoo/releases/> |
| CERNET | 全国·就近 | <https://mirrors.cernet.edu.cn/gentoo/releases/> |
| CICKU | 香港 | <https://hk.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | 香港 | <https://hippocamp.cn.ext.planetunix.net/pub/gentoo/releases/> |
| xTom | 香港 | <https://mirror.xtom.com.hk/gentoo/releases/> |
| Rackspace | 香港 | <https://mirror.rackspace.com/gentoo/releases/> |
| aditsu | 香港 | <http://gentoo.aditsu.net:8000/releases/>（HTTP） |
| NCHC | 台湾 | <http://ftp.twaren.net/Linux/Gentoo/releases/> |
| CICKU | 台湾 | <https://tw.mirrors.cicku.me/gentoo/releases/> |
| Freedif | 新加坡 | <https://mirror.freedif.org/gentoo/releases/> |
| CICKU | 新加坡 | <https://sg.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | 新加坡 | <https://enceladus.sg.ext.planetunix.net/pub/gentoo/releases/> |
{{% /gz-table %}}

{{% details title="官方介质与架构" %}}

**官方下载页**：<https://www.gentoo.org/downloads/>

- **Minimal Installation CD** — 最小化安装光盘，适合有经验的用户
- **LiveGUI** — 带图形界面的 Live 系统，适合新用户
- **Stage3** — 预先编译好的最小化用户空间，含完整编译工具链与 Portage，是从源码构建的标准起点

架构：amd64（最常用）、x86、arm64、arm，其他见官方下载页。

{{% /details %}}

{{% details title="下载哪些文件、怎么校验" %}}

在镜像的 `releases/` 下选好架构（如 `amd64/`），然后：

- **安装 ISO**：`autobuilds/current-install-amd64-minimal/` 里的 `install-amd64-minimal-*.iso` + `.DIGESTS`；图形版取 `current-livegui-amd64/` 里的 `livegui-amd64-*.iso`
- **Stage3**：`autobuilds/current-stage3-amd64-*/` 里的 `stage3-amd64-*.tar.xz` + `.DIGESTS`

下载后用 DIGESTS 校验：

```bash
sha512sum install-amd64-minimal-*.iso          # 算 SHA512
cat install-amd64-minimal-*.iso.DIGESTS        # 跟 DIGESTS 里的值对比
```

{{% /details %}}

## 下一步

装好系统后给 Portage 换国内源（git / rsync / distfiles），见 **[镜像列表](/mirrorlist/)**；安装流程参考 **[Gentoo 官方手册（AMD64 · 中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)**。
