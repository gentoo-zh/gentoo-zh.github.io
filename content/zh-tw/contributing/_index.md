---
title: "貢獻指南"
description: "如何為 Gentoo-zh Overlay 與 Gentoo 中文社群網站做出貢獻"
---

歡迎參與 Gentoo 中文社群！
貢獻分為：

- **Gentoo-zh Overlay 貢獻**（軟體套件 / ebuild）——社群主線，也是[貢獻者牆](https://gentoozh.org/contributors/)的來源（指令碼每月抓取 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay) 提交 5 次以上者）。詳見下方「Gentoo-zh Overlay 貢獻指南」
- **社群網站貢獻**（文章 / 翻譯 / 修正）——在 [gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io) 倉庫，詳見本頁後半「社群網站貢獻指南」
- **官方 Gentoo Wiki 翻譯**（中文譯者）——見[如何參與 Gentoo Wiki 的翻譯工作](https://gentoozh.org/posts/2026-06-30-gentoo-wiki-translation/)

## Gentoo-zh Overlay 貢獻指南

gentoo-zh 是一個 `masters = gentoo` 的 Gentoo Overlay（疊加在官方 Portage 樹之上），收錄 450 多個包，原始碼在 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。新增或更新 ebuild、修 Bug、跟進新版本，都透過 GitHub Pull Request 提交；發現問題也歡迎提 [issue](https://github.com/gentoo-zh/overlay/issues)。

{{< callout type="info" >}}
overlay 倉庫已遷移到組織倉庫 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)，本頁連結均已更新。舊的 `microcai/gentoo-zh` 個人倉庫會 301 到新倉庫，fork、本地 remote 建議在方便時更新到新 URL，詳見[公告與執行記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)。
{{< /callout >}}

{{< callout type="info" >}}
首頁[貢獻者牆](/contributors/)統計的就是這種貢獻——指令碼每月抓取本倉庫提交 5 次以上者。
{{< /callout >}}

### 準備工作

```bash
# 提交/QA 工具：pkgdev 生成提交資訊與 Manifest，pkgcheck 做檢查
# （二者已取代舊的 repoman，是現行官方工具）
emerge --ask dev-util/pkgdev   # 連帶裝上 pkgcheck
```

到 [GitHub](https://github.com/gentoo-zh/overlay) fork 倉庫、clone 你的 fork、新建分支；本地啟用 overlay 方便測試（見 [Overlay 頁](/overlay/)）。

倉庫現名 [`overlay`](https://github.com/gentoo-zh/overlay)，`git clone` 預設會克隆成 `overlay/` 目錄。**記得把目錄名指定成 `gentoo-zh`**（與 `/var/db/repos/gentoo-zh` 對應，別用預設的 `overlay`）：

```bash
# 已在 GitHub 上 fork 後，克隆你自己的 fork
git clone https://github.com/<你的使用者名稱>/overlay.git gentoo-zh
cd gentoo-zh
```

或用 [GitHub CLI](https://cli.github.com/) 一步 fork + clone（`--` 後面的 `gentoo-zh` 就是克隆的目錄名）：

```bash
gh repo fork gentoo-zh/overlay --clone -- gentoo-zh
cd gentoo-zh
```

### 提交一個 ebuild 的標準流程

本倉庫遵循官方 Gentoo ebuild 倉庫規範，寫法權威參考是 [Devmanual](https://devmanual.gentoo.org/)：

1. **放對位置**：`<category>/<package>/<package>-<version>.ebuild`。`category` 取官方分類（繼承自 `::gentoo` 的 `profiles/categories`，如 `app-misc`、`dev-libs`、`net-im`），目錄名、檔名、版本號按官方命名規則。
2. **寫 ebuild**：用現行的 **`EAPI=9`**（EAPI=8 是上一代，樹裡老包多數還是 8，但新包請直接上 9；與 8 的差異見下方摺疊）。標準兩行版權頭用範圍式年份，與官方樹一致：`# Copyright 1999-2026 Gentoo Authors` + GPL-2 宣告。填好 `DESCRIPTION`、`HOMEPAGE`、`SRC_URI`、`LICENSE`、`SLOT`、`IUSE`，並按用途分清依賴：`DEPEND`（編譯期標頭檔案 / 庫）、`RDEPEND`（執行期）、`BDEPEND`（在**建置主機**上跑的工具，如 pkgconfig、gettext）、`IDEPEND`（僅安裝階段 `pkg_*` 用到的工具）。
3. **KEYWORDS 只用測試關鍵字**（`~amd64`、`~arm64` 等）——**本倉庫不收 stable 關鍵字**；只支援特定架構的包用 `-* ~amd64` 這種寫法排除其餘。
4. **寫 `metadata.xml`**：每個包都要有，宣告維護者，並給每個**區域性 USE 旗標**寫用途說明（全域性旗標已在中央 `use.desc` 描述、無需重複；官方規範要求，`pkgcheck` 會查）。
5. **生成 Manifest**：`pkgdev manifest`。本倉庫用 thin manifest（`thin-manifests = true`），`Manifest` 只記 distfile 校驗（BLAKE2B/SHA512），ebuild 完整性交給 git。
6. **本地測試建置**：`ebuild <檔案> clean install` 或 `emerge`，並在它 `KEYWORDS` 宣告的**每個架構上都實測**——沒測過就別宣告支援。
7. **QA 自查**：`pkgcheck scan --commits --net`（`--commits` 只查你這幾個提交改動的內容，`--net` 允許聯網檢查如 `SRC_URI` 是否還能下；CI 也會另跑 `pkgcheck`）。
8. **提交**：用 `pkgdev commit` 生成規範提交資訊（格式見下），ebuild、`metadata.xml`、`Manifest` 一起提；一個貢獻的全部提交放進**同一個 PR**，別拆成兩個。
9. **開 PR 並盯 CI**：CI 會自動 `emerge` 該包並跑 `pkgcheck`——到 PR 的 **Checks**（或你 fork 的 **Actions**）看狀態，紅了按日誌修；PR 模板裡有一個必勾項——確認你已在本地跑過 `pkgcheck scan --commits --net`。全綠 + 勾選齊才會合併。

{{% details title="完整範例:app-misc/foo（ebuild + metadata.xml）" %}}

`app-misc/foo/foo-1.2.3.ebuild`：

```bash
# Copyright 1999-2026 Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=9

inherit toolchain-funcs

DESCRIPTION="範例：一個列印問候語的小工具（教學用）"
HOMEPAGE="https://github.com/gentoo-zh/foo"
SRC_URI="https://github.com/gentoo-zh/foo/archive/refs/tags/v${PV}.tar.gz -> ${P}.tar.gz"

LICENSE="MIT"
SLOT="0"
KEYWORDS="~amd64 ~arm64"
IUSE="examples nls"

RDEPEND="
	sys-libs/zlib
	nls? ( virtual/libintl )
"
DEPEND="${RDEPEND}"
BDEPEND="
	virtual/pkgconfig
	nls? ( sys-devel/gettext )
"

src_compile() {
	# 普通 Makefile（無 ./configure）；autotools 包通常在 src_configure 用 econf，其餘用預設實作。
	emake CC="$(tc-getCC)" PREFIX="${EPREFIX}/usr" NLS="$(usex nls 1 0)"
}

src_install() {
	emake CC="$(tc-getCC)" PREFIX="${EPREFIX}/usr" DESTDIR="${D}" install
	einstalldocs

	if use examples; then
		docinto examples
		dodoc -r examples/.
	fi
}
```

`app-misc/foo/metadata.xml`（`nls` 是全域性旗標不必寫，`examples` 是區域性旗標必須寫說明）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE pkgmetadata SYSTEM "https://www.gentoo.org/dtd/metadata.dtd">
<pkgmetadata>
	<maintainer type="person">
		<email>you@example.com</email>
		<name>你的名字</name>
	</maintainer>
	<use>
		<flag name="examples">安裝範例檔案到文件目錄</flag>
	</use>
	<upstream>
		<remote-id type="github">gentoo-zh/foo</remote-id>
		<bugs-to>https://github.com/gentoo-zh/foo/issues</bugs-to>
	</upstream>
</pkgmetadata>
```

寫好這兩個檔案後，在包目錄裡把整條流程跑完：

```bash
cd app-misc/foo
pkgdev manifest                          # ① 生成 Manifest(下載 distfile + 記 BLAKE2B/SHA512)
ebuild foo-1.2.3.ebuild clean install    # ② 本地建置測試;或 emerge -av app-misc/foo。每個 KEYWORDS 架構都要測
pkgcheck scan --commits --net            # ③ QA 自查,清掉所有 error / warning
pkgdev commit                            # ④ 生成規範提交資訊(ebuild + metadata.xml + Manifest 一起提)
git push                                 # ⑤ 推到你的 fork,再到 GitHub 開 PR
```

⑥ 開 PR 後**盯 CI 狀態**：到 PR 頁面的 **Checks**（或你 fork 的 **Actions** 標籤）看 `emerge-on-pr` 與 `pkgcheck` 兩條流水線——紅了就點進日誌按提示修，`git push --force-with-lease` 更新分支會自動重跑；**全綠 + PR 模板勾選齊**才會合併。

{{% /details %}}

{{% details title="EAPI 9 相對 8 的變化(從 8 過來看這個)" %}}

- **`assert` 被移除** → 用 **`pipestatus`**（檢查上一條管道裡**每個**指令的退出碼：`foo | bar; pipestatus || die`）。
- **`domo` 被移除** → 用 `insinto` + `newins`。
- 新增 **`ver_replacing`**（拿版本和 `REPLACING_VERSIONS` 比，適合在 `pkg_postinst` 裡按升級路徑給提示）、**`edo`**（先列印再執行一條指令，失敗即 die，省去手寫 `echo` + `|| die`）。
- **一批變數不再匯出到環境**：`ROOT`、`EROOT`、`USE`、`FILESDIR`、`DISTDIR`、`WORKDIR`、`S` 等現在只是 ebuild 內可用的 shell 變數，不再 export 給子程序（例外：`SYSROOT`、`ESYSROOT`、`BROOT`、`TMPDIR`、`HOME` 仍始終匯出）。若你呼叫的外部程式靠環境變數讀這些，要自己 `export`。
- bash 升到 5.3；合併 `D` 到 `ROOT` 時絕對符號連結按原樣合併。

完整清單見 [Devmanual 的 EAPI 差異表](https://devmanual.gentoo.org/ebuild-writing/eapi/)。

{{% /details %}}

{{< callout type="warning" >}}
**唯一規則：別弄壞別人的系統（DO NOT BREAK PEOPLE'S SYSTEM）。**
{{< /callout >}}

*本節（提交 ebuild 流程）經 Chris🦈 Su（脆脆）審閱、補充，特此致謝。*

### 提交資訊規範

推薦用 `pkgdev commit` 自動生成符合規範的提交資訊。

{{% details title="提交資訊格式範例" %}}

普通（非版本更新）改動：

```text
$category/$package: 一句話簡述

多行說明改動的原因；若是修 bug 且 GitHub 上有對應 issue，把連結附在這裡。
```

版本更新（bump）：

```text
$category/$package: add $new_version, drop $old_version
```

{{% /details %}}

### 跟進上游新版本（nvchecker）

倉庫用 [nvchecker](https://github.com/lilydjwg/nvchecker) 每天自動比對各包的上游版本（配置在 `.github/workflows/overlay.toml`），有新版本就自動開/更新對應的 [GitHub issue](https://github.com/gentoo-zh/overlay/issues)——**如果不知道該如何下手，那麼建議挑一個版本更新（bump）issue 來做**。新增包時，記得也在 `overlay.toml` 中加一條 nvchecker 規則（寫明上游版本來源），讓它一併納入版本追蹤。

### git 配置、簽名與 rebase

PR 的細節以官方文件為準（見下方「官方規範與參考」）；這裡列出幾條最常用的：

- **身份**：先配好真實姓名與信箱，提交署名時需要使用：

  ```bash
  git config user.name  "Your Name"
  git config user.email "you@example.com"
  ```

- **GPG 簽名（可選）**：本 overlay **不強制**簽名（`layout.conf` 寫明無簽名政策，現有提交也多未簽名），但官方主樹要求每個提交都 OpenPGP 簽名（見 [Gentoo git 工作流](https://wiki.gentoo.org/wiki/Gentoo_git_workflow)，金鑰政策見 [GLEP 63](https://www.gentoo.org/glep/glep-0063.html)），願意遵循是好習慣。可參照 [Gentoo 的 GnuPG 金鑰指南](https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys)生成金鑰後啟用：

  ```bash
  git config user.signingkey <你的金鑰ID>
  git config commit.gpgsign true
  ```

  官方慣例（[GLEP 76](https://www.gentoo.org/glep/glep-0076.html)）還要求提交帶 `Signed-off-by`（開發者原創聲明）；`pkgdev commit` 會自動加，手寫 `git commit` 用 `-s`。

- **rebase 保持歷史乾淨**：開 / 更新 PR 前先把分支 rebase 到最新 master，別用 merge 提交攪亂歷史；把零碎的修補提交合進對應的邏輯提交：

  ```bash
  git pull --rebase origin master   # 跟上游對齊
  git rebase -i origin/master       # 整理 / 合併自己的提交
  git push --force-with-lease        # 更新已開的 PR 分支
  ```

  `--force-with-lease` 只用於**你自己 fork 上的 PR 分支**（rebase 後更新 PR 的常規操作）；**切勿**對共享的上游 master 重寫歷史或 force——官方規定 master 只允許快進推送。一個貢獻的全部提交放進同一個 PR（README 鐵規矩），別拆成兩個。

### 官方規範與參考

寫法與流程一律**以官方文件為準**，本頁只是導引：

- [Gentoo Devmanual](https://devmanual.gentoo.org/)——寫 ebuild 的權威手冊（EAPI、變數、依賴、`metadata.xml` 等）
- [Ebuild 倉庫格式](https://wiki.gentoo.org/wiki/Repository_format)與 [Overlay 專案](https://wiki.gentoo.org/wiki/Project:Overlays)
- [Gentoo git 工作流](https://wiki.gentoo.org/wiki/Gentoo_git_workflow)、[GLEP 76](https://www.gentoo.org/glep/glep-0076.html)（版權與 `Signed-off-by`）、[GLEP 63](https://www.gentoo.org/glep/glep-0063.html)（OpenPGP 金鑰）
- `pkgdev` / `pkgcheck`（`dev-util`）——現行的提交與 QA 工具
- 本倉庫 [README](https://github.com/gentoo-zh/overlay#readme) 與[依賴關係表](https://github.com/gentoo-zh/overlay/blob/deps-table/relation.md)

---

## 社群網站（文章 / 翻譯 / 文件）貢獻指南

## 專案概況

本網站使用 [Hugo](https://gohugo.io/) 靜態網站生成器建置，由 GitHub Actions 建置後部署到 Cloudflare Workers（靜態資源託管）。表現層（主題）是 [Hextra](https://imfing.github.io/hextra/) 再加上本站的修補包 [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme)——後者透過 [Hugo Modules](https://gohugo.io/hugo-modules/) 引入並在 Hextra 之上疊加覆蓋，依賴鏈為 **網站 → gentoozh-theme → Hextra**。所以本倉庫只放內容與配置，模板/樣式原始碼都在修補包裡。

**專案倉庫**：內容/配置 <https://github.com/gentoo-zh/gentoo-zh.github.io>；主題修補包 <https://github.com/gentoo-zh/gentoozh-theme>

## 專案結構

### 內容組織

內容按語言分目錄存放，簡體中文在 `content/zh-cn/`，正體中文在 `content/zh-tw/`，英文在 `content/en/` 三者目錄結構完全一致：

- `download/` — 下載頁面（鏡像源和安裝媒體）
- `overlay/` — Gentoo-zh Overlay 說明
- `mirrorlist/` — 鏡像列表（Portage 樹和 Distfiles 配置）
- `about/` — 關於頁面（專案歷史、社群頻道、網站語言說明）
- `contributors/` — 貢獻者頁面（**自動更新，無需手動編輯**）
- `contributing/` — 貢獻指南（本頁面）
- `changelog/` — 更新記錄
- `posts/` — 新聞文章和教學

> 同一篇內容的簡體版放在 `content/zh-cn/...`、正體版放在對應的 `content/zh-tw/...`、英文版放在對應的 `content/en/...`，檔名都是 `index.md` / `_index.md`（**不再**使用 `index.zh-cn.md` 這種語言字尾）。

### 配置檔案

主要配置位於 `config/_default/` 目錄：

- `hugo.toml` — Hugo 主配置（網站資訊、分類法、Markdown 渲染、輸出格式等）
- `languages.toml` — 語言配置（簡繁英三語，單檔案內分 `[zh-cn]` / `[zh-tw]` / `[en]`）
- `menus.zh-cn.toml` / `menus.zh-tw.toml` / `menus.en.toml` — 各語言導覽選單
- `params.toml` — 主題參數（外觀、功能開關）

### 多語言支援

- 介面字串翻譯主要在 **gentoozh-theme 修補包**的 `i18n/` 裡（表現層）；本倉庫的 `i18n/` 只放少量網站專屬字串（如貢獻者角色名）
- 預設語言為簡體中文，位於網站根路徑 `/`；正體中文位於 `/zh-tw/`；英文位於 `/en/`
- 簡繁轉換由倉庫內的 `sync_to_tw.sh` 指令碼完成（見下文）

### 主題與資源

表現層拆成了獨立的修補包模組 **[gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)**（在 Hextra 之上疊加，仍跟隨上游更新），本倉庫不再放模板/樣式原始碼：

- 模板（`layouts/`，含首頁 `home-bento`、貢獻者頁等）、網站樣式（`assets/css/custom.css`，Gentoo 品牌紫等）、介面字串（`i18n/`）都在 gentoozh-theme 裡
- 網站透過 `config/_default/hugo.toml` 的 `[[module.imports]]` 引入它，並在 `go.mod` pin 版本
- `static/`（`CNAME`、favicon、logo、og 圖等）仍在本倉庫
- **改模板 / 樣式 → 去 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme) 倉庫；改內容 → 在本倉庫**

## 環境準備

主題用 SCSS（經 Hugo Modules 引入），所以必須用 **Hugo extended**——即 `www-apps/hugo` 的 **`extended` USE**（提供 SASS/SCSS 支援；該 USE 預設開啟，但請確認你沒將其關閉）。另需 **Go** 工具鏈拉取主題模組。

```bash
# Gentoo：確保 hugo 帶 extended USE（Hextra 的 SCSS 必需）
echo "www-apps/hugo extended" >> /etc/portage/package.use/hugo
emerge --ask www-apps/hugo dev-lang/go

# macOS（Homebrew 的 hugo 已是 extended 版）
brew install hugo go
```

> 注：Hugo 內建的 SCSS 轉譯器（LibSass）自 v0.153.0 起已棄用、未來會移除；屆時需改用外部 [Dart Sass](https://gohugo.io/functions/css/sass/)（與 edition 無關、標準版也能用）。目前 extended 的內建轉譯器仍可用。

Fork 並 clone 倉庫（**無需** `git submodule`，模組會在建置時自動拉取）：

```bash
git clone https://github.com/你的使用者名稱/gentoo-zh.github.io.git
cd gentoo-zh.github.io
```

本地預覽：

```bash
hugo server -D
# 訪問 http://localhost:1313 預覽
```

## 如何為網站貢獻

### 1. 提交新文章

文章用 [page bundle](https://gohugo.io/content-management/page-bundles/) 形式（一篇一個目錄、正文是 `index.md`，方便隨文放圖）。預設語言是簡體中文，直接用 `hugo new` 腳手架即可（會自動建到預設語言的 `content/zh-cn/` 下）：

```bash
hugo new posts/2026-05-29-my-article/index.md
# 生成 content/zh-cn/posts/2026-05-29-my-article/index.md
```

`hugo new` 按 `archetypes/default.md` 生成的 front matter 帶 `draft: true`，寫好後記得**去掉 `draft`**（否則正式建置不會收錄），並補上 `tags`、`authors`（見第 3 節）。最終 front matter 範例：

```yaml
---
title: "文章標題"
date: 2026-05-29
tags: ["tutorial"]
---

文章正文……（作者署名見下方第 3 節）
```

可選的標籤（`tags`，顯示在文章列表與文章頁的 `#標籤`、連結到 `/tags/` 聚合頁，首頁文章卡片也會顯示首個標籤）：`tutorial`（教學）、`news`（新聞）、`announcement`（公告）、`website`（站務）。

首頁「最新文章」預設讓教學類排前、公告類靠後；重大公告可在 front matter 加 `featured: true` 置頂到首頁最前，事件過去後刪掉即可。

寫完簡體版後，用指令碼生成正體中文版（見下一節），正體版放在對應的 `content/zh-tw/posts/.../index.md`。

### 2. 簡繁轉換

`sync_to_tw.sh` 封裝了 OpenCC（`s2twp`）+ 針對本站術語的修正與已知誤轉清理。傳入簡體原始檔即可，正體目標路徑自動推導：

```bash
# 先安裝 OpenCC
emerge --ask app-i18n/opencc   # Gentoo
brew install opencc            # macOS
sudo apt install opencc        # Debian/Ubuntu

# 簡體 → 正體（目標自動生成到 content/zh-tw/ 對應位置）
./sync_to_tw.sh content/zh-cn/posts/2026-05-29-my-article/index.md

# 不帶引數：同步所有相對 git HEAD 改動過的簡體檔案
./sync_to_tw.sh

# 只檢查不寫：報告哪些正體版落後於簡體版（提交前跑一下）
./sync_to_tw.sh --check
```

轉換後建議人工檢查臺灣用語差異。

### 3. 文章署名與頭像

在文章 front matter 的 `authors` 用「對映」形式寫明作者，Hextra 會在署名處顯示頭像 + 姓名 + 連結：

```yaml
authors:
  - name: 你的名字
    image: /contributors/<你的標識>/feature.webp
    link: https://github.com/yourname
```

`image` 可指向貢獻者頁裡的頭像；省略 `image` 則只顯示姓名。

### 4. 改進現有內容 / 技術改進

錯別字、過時資訊、使用技巧、缺失的正體中文、英文翻譯，看到了都歡迎隨手修正。模板、樣式、效能、功能等技術層面，也歡迎提改進。

> **貢獻者列表（`content/*/contributors/`）由指令碼自動維護**，抓取 [Gentoo-zh Overlay](https://github.com/gentoo-zh/overlay) 中提交 5 次以上者，顯示提交次數並按提交量排序，每月自動更新（`scripts/update-contributors.py` + GitHub Actions）。**請勿手動編輯該目錄**；首頁貢獻者展示也隨之自動更新。

## 提交 Pull Request

```bash
git checkout -b your-feature-branch
git add .
git commit -m "描述你的更改"
git push origin your-feature-branch
# 然後在 GitHub 上建立 Pull Request
```

## 寫作規範

### Markdown 格式

- 使用標準 Markdown 語法
- 程式碼塊標註語言（如 ` ```bash `）
- 圖片放在文章目錄內並使用相對路徑
- 連結使用 Markdown 格式

### 中文排版

- 中英文之間留一個空格
- 使用全形中文標點
- 數字、英文用半形
- 專有名詞保持原文（如 Gentoo、Hugo、Hextra、Portage）

## 常見問題

### 如何更新主題？

主題層是獨立的 [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme) 修補包模組，**升級 Hextra 在那個倉庫裡做**：

```bash
# 在 gentoozh-theme 倉庫
hugo mod get -u github.com/imfing/hextra
hugo mod tidy
git commit -am "bump hextra"
git tag vX.Y.Z          # 打個新版本
```

然後回到**本站**倉庫，把修補包 pin 到新版本：

```bash
hugo mod get github.com/gentoo-zh/gentoozh-theme@vX.Y.Z
git commit -am "bump gentoozh-theme"
```

### 如何新增新的欄目頁面？

在 `content/zh-cn/<欄目>/` 下建 `_index.md`，用指令碼生成 `content/zh-tw/<欄目>/_index.md`；若要進入頂部導覽，再到 `config/_default/menus.zh-cn.toml` 和 `menus.zh-tw.toml` 各加一條 `[[main]]`。

### 簡繁內容不一致怎麼辦？

以簡體版為源，重新執行 `sync_to_tw.sh`（用法見上）覆蓋生成正體版，再人工校對。請勿手動維護兩份正文導致內容漂移。

## 社群交流

遇到問題或有建議？

- **Telegram 頻道**：[@gentoocn](https://t.me/gentoocn)
- **Telegram 群組**：[@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**：<https://github.com/gentoo-zh/gentoo-zh.github.io/issues>
- **網站事宜聯絡信箱**：<zakk@gentoozh.org>

更多頻道（IRC / Matrix / 閒聊群等）見[關於頁面](/about/)。

## 授權條款

本站內容採用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授權條款，除非另有說明。程式碼貢獻遵循專案的 MIT 授權。

---

改一個錯字、補一句翻譯、提個 PR，都算數。Gentoo 中文社群就是這麼一點點累積起來的。
