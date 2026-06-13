---
title: "下载"
---

装 Gentoo 先把安装介质准备好。新手最省事的是中文社区的 Live ISO；想用官方介质的，从下面的镜像里就近选一个。

{{< callout type="info" >}}
**Apple Silicon Mac（M1 / M2）** 不适用本页列出的标准 amd64 镜像，请看 [在 Apple Silicon Mac 上安装 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/)。
{{< /callout >}}

## 中文社区 Live ISO {#live-iso}

中文社区定制的 **KDE Plasma 6 桌面 Live ISO**——开箱即中文、三语言可选（简 / 繁 / 英）、中文输入法（fcitx5 + rime），适合先上手体验中文 Gentoo 桌面。

- **下载站**：<https://mirror.gentoozh.org/>（下载由 Cloudflare R2 提供，全球边缘节点、不限流量）
- **备用仓库**：<https://github.com/Gentoo-zh/Live-ISO>（社区 fork，构建脚本与定制都在这）
- **登录凭据**：用户 {{< copy "live" >}} / 密码 {{< copy "live" >}} / Root {{< copy "live" >}}
- **硬件要求**：64 位 x86 CPU，需支持 AVX2（约 2013 年后的处理器）；更老的 CPU 无法启动本镜像。
- **更新频率**：每周自动重新编译并上传，始终是较新的系统快照；下载站只保留最近几个版本，请以站上实际文件名（`gig-os-日期.iso`）为准。
- **新版通知**：关注 Telegram 频道 <https://t.me/gentoomirror>，每周构建上线时自动播报。

{{< callout type="warning" >}}
**在虚拟机里跑？** 镜像按 `x86-64-v3` 编译、必须有 AVX2。**VirtualBox 多半透传不了 AVX2、镜像起不来**——请改用 **KVM（`-cpu host`）、原生 Hyper-V 或 VMware**；是否真有 AVX2 以 guest 里 `grep -o avx2 /proc/cpuinfo` 为准。
{{< /callout >}}

{{% details title="这个 Live ISO 有什么（点开看更多）" %}}

- **三语言开机** — GRUB 菜单选 简体 / 正體 / English，桌面、Firefox、输入法都跟着切。
- **多种启动方式** — 除常规启动外，还有「拷贝到内存」（整盘载入内存后运行，U 盘可拔、跑得更快）与「安全显卡模式」兜底，均含三语言。
- **中文输入法 fcitx5 + rime** — 默认朙月拼音；**右键托盘输入法图标 →「方案」** 可切换 注音 / 五笔86 / 仓颉 / 粤拼 等。
- **开源 / 闭源显卡** — 默认 nouveau 即插即用；新卡（RTX 20/30/40/50）想要硬件加速选「闭源 NVIDIA」启动项，**需先在 BIOS 关闭 Secure Boot**（驱动未签名，否则加载不了）。点不亮的疑难卡用「安全显卡模式」兜底。
- **图形安装器（可选）** — 桌面双击「安装系统」可启动 Calamares 图形安装器（跟随所选语言），装好后自动清理 live 残留（开机自动登录等）；想正经装、深入了解系统，仍推荐照官方手册一步步来（见下方说明）。
- **按机优化** — 装好系统后，编译参数 `CPU_FLAGS_X86` 按你的 CPU 自动生成。

完整功能与配置说明见 **[镜像站「使用说明」页](https://mirror.gentoozh.org/about.html)**。

{{% /details %}}

## 镜像源

下面节点都已逐项实测可用，均提供 amd64 / x86 / arm64 等架构的安装介质。按地区就近选一般更快：

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
