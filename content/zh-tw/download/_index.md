---
title: "下載"
---

安裝 Gentoo 前需要準備安裝媒體。中文社群維護一個 amd64 安裝鏡像，見下一節；使用官方媒體請從下面的鏡像站就近選擇。

{{< callout type="info" >}}
**Apple Silicon Mac（M1 / M2）** 不適用本頁列出的標準 amd64 鏡像，請看 [在 Apple Silicon Mac 上安裝 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/)。
{{< /callout >}}

## CJK 最小安裝鏡像 {#live-iso}

第三方 amd64 最小安裝媒體，用 Catalyst 按官方 Release Engineering 的 spec 建置。核心帶 cjktty 修補，控制台能顯示中日韓文字，並支援 ZFS。鏡像每週自動建置，下載、校驗和與各鏡像目錄都在下載站。

{{< hextra/hero-button text="下載 CJK 最小安裝鏡像" link="https://distfiles.gentoozh.org/iso?lang=zh-tw" style="margin-top:1.25rem;margin-bottom:.5rem" >}}
{{< hextra/hero-button text="專案倉庫" link="https://github.com/gentoo-zh/gentoo-cjk-livecd" style="margin-top:1.25rem;margin-bottom:.5rem;margin-left:.5rem;background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor" >}}

{{< callout type="info" >}}
因建置機器資源不足，Gig-OS 桌面鏡像暫停維護。
{{< /callout >}}

## 鏡像站 {#鏡像源}

下面節點均提供 amd64 / x86 / arm64 等架構的官方安裝媒體。按地區就近選擇，下載更快：

{{% gz-table %}}
| 鏡像 | 地區 | 下載地址（releases/） |
| --- | --- | --- |
| 清華 TUNA | 華北·北京 | <https://mirrors.tuna.tsinghua.edu.cn/gentoo/releases/> |
| 北外 BFSU | 華北·北京 | <https://mirrors.bfsu.edu.cn/gentoo/releases/> |
| 中科大 USTC | 華東·合肥 | <https://mirrors.ustc.edu.cn/gentoo/releases/> |
| 浙大 ZJU | 華東·杭州 | <https://mirrors.zju.edu.cn/gentoo/releases/> |
| 南大 NJU | 華東·南京 | <https://mirrors.nju.edu.cn/gentoo/releases/> |
| 山大 SDU | 華東·青島 | <https://mirrors.sdu.edu.cn/gentoo/releases/> |
| 華科 HUST | 華中·武漢 | <https://mirrors.hust.edu.cn/gentoo/releases/> |
| 南科大 SUSTech | 華南·深圳 | <https://mirrors.sustech.edu.cn/gentoo/releases/> |
| 哈工大 HIT | 東北·哈爾濱 | <https://mirrors.hit.edu.cn/gentoo/releases/> |
| 蘭大 LZU | 西北·蘭州 | <https://mirror.lzu.edu.cn/gentoo/releases/> |
| 阿里雲 | 全國·CDN | <https://mirrors.aliyun.com/gentoo/releases/> |
| 網易 163 | 全國·CDN | <https://mirrors.163.com/gentoo/releases/> |
| CERNET | 全國·就近 | <https://mirrors.cernet.edu.cn/gentoo/releases/> |
| CICKU | 香港 | <https://hk.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | 香港 | <https://hippocamp.cn.ext.planetunix.net/pub/gentoo/releases/> |
| xTom | 香港 | <https://mirror.xtom.com.hk/gentoo/releases/> |
| Rackspace | 香港 | <https://mirror.rackspace.com/gentoo/releases/> |
| aditsu | 香港 | <http://gentoo.aditsu.net:8000/releases/>（HTTP） |
| NCHC | 臺灣 | <http://ftp.twaren.net/Linux/Gentoo/releases/> |
| CICKU | 臺灣 | <https://tw.mirrors.cicku.me/gentoo/releases/> |
| Freedif | 新加坡 | <https://mirror.freedif.org/gentoo/releases/> |
| CICKU | 新加坡 | <https://sg.mirrors.cicku.me/gentoo/releases/> |
| PlanetUnix | 新加坡 | <https://enceladus.sg.ext.planetunix.net/pub/gentoo/releases/> |
{{% /gz-table %}}

{{% details title="官方媒體與架構" %}}

**官方下載頁**：<https://www.gentoo.org/downloads/>

- **Minimal Installation CD** — 最小化安裝光碟，適合有經驗的使用者
- **LiveGUI** — 帶圖形介面的 Live 系統，適合新使用者
- **Stage3** — 預先編譯好的最小化使用者空間，含完整編譯工具鏈與 Portage，是從原始碼建置的標準起點

架構：amd64（最常用）、x86、arm64、arm，其他見官方下載頁。

{{% /details %}}

{{% details title="下載哪些檔案、怎麼校驗" %}}

在鏡像的 `releases/` 下選好架構（如 `amd64/`），然後：

- **安裝 ISO**：`autobuilds/current-install-amd64-minimal/` 裡的 `install-amd64-minimal-*.iso` + `.DIGESTS`；圖形版取 `current-livegui-amd64/` 裡的 `livegui-amd64-*.iso`
- **Stage3**：`autobuilds/current-stage3-amd64-*/` 裡的 `stage3-amd64-*.tar.xz` + `.DIGESTS`

下載後用 DIGESTS 校驗：

```bash
sha512sum install-amd64-minimal-*.iso          # 算 SHA512
cat install-amd64-minimal-*.iso.DIGESTS        # 跟 DIGESTS 裡的值對比
```

{{% /details %}}

## 下一步

裝好系統後給 Portage 換中國內陸源（git / rsync / distfiles），見 **[鏡像列表](/mirrorlist/)**；安裝流程參考 **[Gentoo 官方手冊（AMD64 · 中文）](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)**。
