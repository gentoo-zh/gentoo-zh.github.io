---
title: "下載"
---

在安裝 Gentoo 之前請先把安裝媒體準備好。建議新手使用由我們中文社群客製的 Live ISO；希望使用官方媒體的，請從下面的鏡像站中就近選擇一個。

{{< callout type="info" >}}
**Apple Silicon Mac（M1 / M2）** 不適用本頁列出的標準 amd64 鏡像，請看 [在 Apple Silicon Mac 上安裝 Gentoo Linux](/posts/2025-10-02-gentoo-m-series-mac/)。
{{< /callout >}}

## 中文社群 Live ISO {#live-iso}

中文社群客製的 **KDE Plasma 6 桌面 Live ISO**——預設帶有三語言可選（簡 / 正體 / 英）、中文輸入法（fcitx5 + rime），適合新手體驗中文 Gentoo 桌面。

- **下載**：<https://mirror.gentoozh.org/>（下載節點由 Cloudflare R2 提供，全球邊緣節點、不限流量）
- **倉庫**：<https://github.com/gentoo-zh/Live-ISO>（包含建置指令碼與相關客製）
- **登入憑據**：使用者 {{< copy "live" >}} / 密碼 {{< copy "live" >}} / root 密碼 {{< copy "live" >}}
- **硬體要求**：64 位元 x86 CPU，需支援 AVX2（約 2013 年後的處理器，更老的 CPU 無法啟動）。
- **更新頻率**：每週自動編譯並上傳，始終是較新的系統快照；下載站只保留最近幾個版本，請以站上實際檔名（`gig-os-日期.iso`）為準。
- **新版通知**：關注 Telegram 頻道 <https://t.me/gentoomirror>，每週建置上線時將會自動播報。

{{< callout type="warning" >}}
**需要在虛擬機器裡執行？** 鏡像按 `x86-64-v3` 編譯，必須要有 AVX2。而 **VirtualBox 多半傳遞不了 AVX2，這將會導致鏡像無法啟動**——建議換用 **KVM（`-cpu host`）、原生 Hyper-V 或 VMware**；具體是否支援 AVX2 以 guest 裡 `grep -o avx2 /proc/cpuinfo` 為準。
{{< /callout >}}

{{% details title="這個 Live ISO 有什麼（點開看更多）" %}}

- **三語言支援** — GRUB 選單可以選擇 簡體 / 正體 / English，桌面語言、Firefox 語言、相關的輸入法將會跟隨切換。
- **多種啟動方式** — 除常規啟動外，還支援「載入到記憶體執行」（將整盤載入記憶體後執行，可以移除 隨身碟，執行速度更快），同時還支援「安全顯示卡模式」。
- **中文輸入法 fcitx5 + rime** — 預設朙月拼音；**右鍵系統匣輸入法圖示 →「方案」** 可切換 注音 / 五筆86 / 倉頡 / 粵拼 等。
- **開源 / 閉源顯示卡** — 預設 nouveau 隨插即用；新卡（RTX 20/30/40/50）想要硬體加速請選擇「閉源 NVIDIA」啟動項，**需提前在 UEFI 中關閉 Secure Boot**（因為驅動未簽名，無法載入）。如果仍然無法點亮的話，請使用「安全顯示卡模式」。
- **圖形安裝器（可選）** — 桌面雙擊「安裝系統」可啟動 Calamares 圖形安裝器（跟隨所選語言），安裝完成後將會自動清理 live 殘留（開機自動登入等）；希望正經安裝、深入瞭解系統，推薦按照官方手冊一步步來（見下方說明）。
- **ZFS 根 + 原生加密 + ZBM 引導（進階）** — 安裝器分割區頁檔案系統可選 **ZFS**；勾選「加密」即啟用 **ZFS 原生加密**（aes-256-gcm、密碼解鎖），並由 **ZFSBootMenu** 原生引導（GRUB 讀不了帶新特性 / 原生加密的 ZFS 池，故 ZFS 根改用 ZBM）。預設檔案系統為 btrfs，在分割區頁面可選擇 xfs / ext4 / ZFS 檔案系統。
- **按機最佳化** — 裝好系統後，編譯參數 `CPU_FLAGS_X86` 將按你的 CPU 自動生成。

完整功能與配置說明見 **[鏡像站「使用說明」頁](https://mirror.gentoozh.org/about.html)**。

{{% /details %}}

## 鏡像站 {#鏡像源}

下面節點均提供 amd64 / x86 / arm64 等架構的官方安裝媒體。按地區就近選擇，下載更快：

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
