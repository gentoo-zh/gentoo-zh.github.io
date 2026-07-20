---
title: "Overlay"
---

Overlay 是官方 Portage 樹之外的軟體來源——疊加上去，就能裝到官方源裡沒有的包。gentoo-zh 是其中歷史悠久的一個：前身是 2003 年的 gentoo-tw 與隨後的 gentoo-china，兩岸社群合併而來，原始碼在 [GitHub](https://github.com/gentoo-zh/overlay)。

{{< callout type="info" >}}
overlay 倉庫已遷移到組織倉庫 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)，舊的 `microcai/gentoo-zh` 個人倉庫會 301 到新倉庫，建議在方便時更新到新 URL，詳見[公告與執行記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)。
{{< /callout >}}

至今為止 gentoo-zh 已收錄了 450 多個軟體套件，可大致分為：

- **中文 / CJK**：fcitx 輸入法和一大堆外掛、碼表（rime、chinese-addons 等），搜狗 / 萌娘 / zhwiki 拼音詞庫，中文字型，以及一些軟體的 CJK 修補
- **網路、開發工具等**：畢竟是 Gentoo 使用者，誰手裡沒幾個自己維護的包
- **打好修補的桌面 / 效能向核心**：cachyos-sources、xanmod、liquorix 這些

還有部分是官方源暫時沒人管的包，這邊接著出新版。以及一些錯誤修復，開發者踩到 Bug，解決後第一時間把修補推回源裡。

只有一條規則：別弄壞別人的系統。每個 ebuild 在進源之前都得在它支援的架構上測過。

## 新增 gentoo-zh Overlay

{{% details title="使用 eselect repository 啟用" %}}

需先安裝 `app-eselect/eselect-repository`：

```bash
eselect repository enable gentoo-zh
emerge --sync gentoo-zh
```

{{% /details %}}

{{% details title="手動配置（不想用 eselect）" %}}

在 `/etc/portage/repos.conf/` 下建立 `gentoo-zh.conf`：

```ini
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

然後 `emerge --sync gentoo-zh`。

{{% /details %}}

{{< callout type="info" >}}
2025 年 10 月起官方不再為第三方倉庫提供快取鏡像，gentoo-zh 改為直接從 GitHub 上游同步。之前新增過的使用者需更新同步源，見 [這篇說明](/posts/2025-10-07-thirdparty-repo-mirror-removal/)。
{{< /callout >}}

## 中國內陸鏡像加速

直連 GitHub 或官方 distfiles 偏慢時，可將 gentoo-zh 換成中國內陸鏡像。整理自 [peeweep](/contributors/peeweep/) 的[公告](https://t.me/gentoocn/56)，感謝！

### git 同步源

將 overlay 的同步源切到中國內陸鏡像（gentoo-zh 是 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay) 的完整 ebuild 鏡像，只含 ebuild、不含原始碼）。可用源：

- 重慶大學：`https://mirrors.cqu.edu.cn/git/gentoo-zh.git`
- 南京大學：`https://mirror.nju.edu.cn/git/gentoo-zh.git`

首次新增（需先安裝 git）：

```bash
sudo emerge -aq dev-vcs/git          # 沒裝 git 先裝
rm -rf /var/db/repos/gentoo-zh       # 同步過的話先清掉舊的
eselect repository add gentoo-zh git https://mirrors.cqu.edu.cn/git/gentoo-zh.git
emerge --sync gentoo-zh
```

已經新增過的，把 `/etc/portage/repos.conf/gentoo-zh.conf` 裡的 `sync-uri` 改成上面任一地址即可。

### distfiles 快取

加速軟體套件原始碼下載。源站 <https://distfiles.gentoozh.org/>，可用鏡像：

- 南京大學：`https://mirror.nju.edu.cn/gentoo-zh`

在 `/etc/portage/make.conf` 的 `GENTOO_MIRRORS` 裡，官方源之後追加：

```bash
GENTOO_MIRRORS="${GENTOO_MIRRORS} https://distfiles.gentoozh.org"
```

{{< callout type="info" >}}
不想 mirror 某些 distfiles（版權等原因）時，在對應 ebuild 裡加 `RESTRICT="mirror"`。
{{< /callout >}}

## 用 overlay 裡的包

gentoo-zh 的包**都是 `~arch`（測試）關鍵字、不收 stable**。已經在跑 `~amd64`（測試分支）的系統直接 `emerge` 即可；**穩定分支**的系統安裝前要先為這些包接受測試關鍵字。

按需放行你要裝的包（推薦，只接受用到的）：

```bash
echo "app-foo/bar ~amd64" >> /etc/portage/package.accept_keywords/gentoo-zh
emerge --ask app-foo/bar
```

或放行整個 overlay（省事，但會一併引入更多測試包，自行取捨）：

```bash
echo "*/*::gentoo-zh ~amd64" >> /etc/portage/package.accept_keywords/gentoo-zh
```

看 overlay 提供了哪些包：`eix -RO gentoo-zh`。

## 參與貢獻

歡迎給 gentoo-zh 添磚加瓦：到 [GitHub 倉庫](https://github.com/gentoo-zh/overlay) 提 Pull Request，發現問題也歡迎提 issue。
