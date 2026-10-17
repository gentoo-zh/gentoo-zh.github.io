---
title: "Overlay 貢獻指南"
description: "提交 ebuild、儲存庫規則與自動版本更新"
---

## Gentoo-zh Overlay 貢獻指南

gentoo-zh 是疊加在官方 Gentoo 儲存庫之上的 ebuild 儲存庫（`masters = gentoo`），原始碼在 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。新增或更新套件透過 GitHub Pull Request 提交，問題提交到 [issue](https://github.com/gentoo-zh/overlay/issues)。社群維護者審核每個 PR，並指導貢獻者完成修改。

{{< callout type="warning" >}}
**唯一規則：別弄壞別人的系統（DO NOT BREAK PEOPLE'S SYSTEM）。**
{{< /callout >}}

{{< callout type="info" >}}
儲存庫已從 `microcai/gentoo-zh` 遷移到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)，舊網址會重新導向到新儲存庫。請在方便時把 fork 和本地 remote 改為新網址，詳見[遷移公告](/posts/2026-07-02-gentoo-zh-repo-migration/)。
{{< /callout >}}

### 準備工作

安裝提交與 QA 工具 `pkgdev`，它會一併安裝 `pkgcheck`：

```bash
# emerge --ask dev-util/pkgdev
```

在 GitHub 上 fork [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。複製時把目錄名稱指定為 `gentoo-zh`，與 `/var/db/repos/gentoo-zh` 一致，不要用預設的 `overlay`：

```bash
$ git clone https://github.com/<你的使用者名稱>/overlay.git gentoo-zh
```

使用 [GitHub CLI](https://cli.github.com/) 時可以一步完成 fork 與複製，`--` 之後的 `gentoo-zh` 是目錄名稱：

```bash
$ gh repo fork gentoo-zh/overlay --clone -- gentoo-zh
```

在本機啟用 overlay 的方法見 [Overlay 設定](/overlay/)。

### 撰寫 ebuild

本頁不講 ebuild 寫法。本儲存庫遵循 Gentoo 官方的 ebuild 儲存庫規範，寫法以官方文件為準：

- [Devmanual 快速入門](https://devmanual.gentoo.org/quickstart/)：ebuild 的基本結構與常見範例
- [Basic guide to write Gentoo Ebuilds](https://wiki.gentoo.org/wiki/Basic_guide_to_write_Gentoo_Ebuilds)：Gentoo Wiki 的入門指南（英文）
- [Devmanual](https://devmanual.gentoo.org/)：變數、相依性、eclass 與階段函式的權威手冊
- [EAPI 差異](https://devmanual.gentoo.org/ebuild-writing/eapi/)：各 EAPI 版本新增和移除的功能
- [metadata.xml](https://devmanual.gentoo.org/ebuild-writing/misc-files/metadata/) 與 [關鍵字](https://devmanual.gentoo.org/keywording/)
- [Ebuild 儲存庫](https://wiki.gentoo.org/wiki/Ebuild_repository)：儲存庫的目錄結構
- [pkgdev](https://pkgcore.github.io/pkgdev/) 與 [pkgcheck](https://pkgcore.github.io/pkgcheck/)：提交與 QA 工具的文件
- [GLEP 66](https://www.gentoo.org/glep/glep-0066.html)：Gentoo 的 git 工作流程與提交訊息規範

### 儲存庫規則 {#倉庫規則}

以下規則來自儲存庫的 [README](https://github.com/gentoo-zh/overlay/blob/master/README.zh-TW.md) 與 [PR 範本](https://github.com/gentoo-zh/overlay/blob/master/.github/pull_request_template.md)：

- `KEYWORDS` 只用測試關鍵字（`~amd64`、`~arm64` 等），不收穩定關鍵字。
- 每個套件都要有 `metadata.xml`，寫明維護者，並說明每個區域 USE 旗標的用途。
- 儲存庫使用 thin manifest：用 `pkgdev manifest` 產生 `Manifest`，它只記錄 distfile 的總和檢查碼。
- 提交前確認 ebuild 能編譯，並在宣告的每個關鍵字上實測。CI 在 amd64 與 arm64 上建置；問題出在你沒有的架構上且無法解決時，刪掉該關鍵字。
- `LICENSE` 必須與上游實際授權一致。`::gentoo` 沒有的授權條款，把全文放進 `licenses/`，加入 `profiles/license_groups` 中對應的群組，並依其再散布條款設定 `RESTRICT`。
- 每個套件都要在 `overlay.toml` 中登記，寫法見[自動版本更新](#autobump)一節。
- 一個提交包含它需要的全部改動，例如 ebuild 與它的 `Manifest` 放在同一個提交；一次貢獻的全部提交放在同一個 PR。
- 開 PR 前在本機執行 `pkgcheck scan --commits --net`，並勾選 PR 範本中的全部確認項，否則不會合併。
- PR 上的 `emerge-on-pr` 與 `pkgcheck` 檢查必須通過；依報告修正問題，QA 警告也要修。
- 使用 AI 輔助時必須遵循 [AGENTS.md](https://github.com/gentoo-zh/overlay/blob/master/AGENTS.md)。貢獻者對每個提交負責，提交者與提交作者必須是人。
- 持續維護你新增的套件。不再維護時，在 issue 中尋找新的維護者，或在 `profiles/package.mask` 中遮蔽，到期後刪除。

提交訊息用 `pkgdev commit` 產生。版本更新的格式：

```text
$category/$package: add $new_version, drop $old_version
```

其他改動的格式：

```text
$category/$package: 一句話簡述

說明修改原因；修正的 bug 有 GitHub issue 時附上連結。
```

### 如何避免自動鏡像某個套件的 distfile？ {#restrict-mirror}

ebuild 的 `RESTRICT` 中包含 `mirror` 或 `fetch` 時，會限制 distfiles 的自動鏡像。`bindist` 只限制二進位套件，不單獨決定 distfiles 是否鏡像。

### 自動版本更新（autobump） {#autobump}

[`.github/workflows/overlay.toml`](https://github.com/gentoo-zh/overlay/blob/master/.github/workflows/overlay.toml) 是 [nvchecker](https://github.com/lilydjwg/nvchecker) 的設定檔，每個套件一個條目，依 `category/package` 的字母順序排列。nvchecker 發現上游新版本時開一個 [issue](https://github.com/gentoo-zh/overlay/issues)，並通知條目中的 `github_account`。想參與但沒有目標時，可以認領一個版本更新 issue。

以 `net-proxy/mihomo` 的條目為例：

```toml
# .github/workflows/overlay.toml
["net-proxy/mihomo"]
source = "github"
github = "MetaCubeX/mihomo"
use_latest_release = true
prefix = "v"
github_account = ["zakkaus"]
autobump = true
```

- `source`、`github`：版本來源與上游儲存庫。
- `use_latest_release = true`：上游發布 release 時使用；上游只打 tag 時改用 `use_latest_tag = true`。
- `prefix = "v"`：上游 tag 帶 `v` 而 ebuild 版本不帶時使用。
- `github_account`：打包者的 GitHub 帳號，nvchecker 的 issue 會通知此人。
- `autobump = true`：開啟自動版本更新，刪除這一行即關閉。

無法追蹤版本的套件（例如只有 live ebuild）寫成註解條目 `#["category/package"]`，並註明原因；`acct-*`、`virtual` 與 `app-alternatives` 也寫成註解條目，不需要註明原因。

開啟 autobump 的套件，由 autobump 處理 nvchecker 的 issue：只需改版本號時，它複製 ebuild、重新產生 `Manifest`，在 CI 容器中執行一次真實的 `emerge`，通過後才開 PR。這個 PR 同樣要通過 `emerge-on-pr` 與 `pkgcheck`，並由維護者審核後合併。相依性、USE 或 patch 需要改動時，autobump 只在 issue 中記錄證據，交給人處理。

- 適合開啟：`-bin` 預編譯套件、沒有 vendor 相依的單一檔案原始碼套件、已用 `deps` 或 `bundle` 寫明相依套件包來源的 Go、Rust、npm 套件。
- 不適合開啟：相依性隨版本變化的套件、`files/` 中帶 patch 的套件、每個版本都要單獨產生相依套件包但條目沒寫明來源的套件（寫法見下方「相依套件包」）。

開啟 autobump 由打包者決定：在 PR 中給自己的條目加上 `autobump = true`。這個值同時決定 bump 後保留幾個版本：`true` 只刪除被取代的那個版本，數字 `N` 保留最近 N 個版本，`"all"` 全部保留。不確定是否適合時，維護者可以先用 [autobump-trial](https://github.com/gentoo-zh/overlay/actions/workflows/autobump-trial.yml) 做一次建置測試，它只回報結果，不開 PR。完整說明見 [autobump 使用說明](https://github.com/gentoo-zh/overlay/blob/master/scripts/autobump.zh.md)（簡體中文）。

**相依套件包（vendor bundle）**

ebuild 下載另外打包的相依套件（Go vendor、`node_modules`、crates 等）時，條目要用 `deps` 或 `bundle` 寫明相依套件包由誰產生，二擇一。autobump 等相依套件包發布後才開 PR；還沒有 release 時，它會觸發產生相依套件包的 workflow。

`deps`：由 [gentoo-deps](https://github.com/gentoo-zh/gentoo-deps) 產生，包名與 release tag 都是 `{P}`。

```toml
# .github/workflows/overlay.toml
["net-dns/ddns-go"]
source = "github"
github = "jeessy2/ddns-go"
use_latest_release = true
prefix = "v"
github_account = ["zakkaus"]
deps = { lang = "golang", vendordir = "{P}" }
```

- `lang`：`golang`、`javascript`、`javascript(pnpm)`、`rust`、`dart`。沒有其他設定時可寫成 `deps = "golang"`。
- `repo` 預設取 `github`，版本來源不是 GitHub 時必填；`tag` 預設是 `prefix` 加版本號，設定了 `from_pattern` 或 `to_pattern` 時必填。
- `modules = ["service", "core"]`：按目錄分別打包，不能與 `vendordir`、`workdir` 同用。

`bundle`：包名不是 `{P}`，或由儲存庫自己的 workflow 產生時使用，`repo` 須在 gentoo-zh 或 gentoo-zh-drafts 下。例如 `net-proxy/clash-verge-rev`：

```toml
bundle = [
  { id = "crates", repo = "gentoo-zh/gentoo-deps", workflow = "generator.yml", tag = "clash-verge-{PV}", inputs = { LANG = "rust", REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "clash-verge-{PV}" } },
  { id = "web", repo = "gentoo-zh-drafts/tauri-web-dist", workflow = "generator.yml", tag = "{P}", inputs = { REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "{P}" } },
]
```

- 必填 `id`、`repo`、`workflow`、`tag`；`inputs` 傳給 workflow；`producers` 列出要等待的 workflow，預設只有 `workflow`。
- 樣板變數：`{PN}`、`{PV}`、`{P}`、`{bundle_pv}`。
- 版本號寫法與 Gentoo 不同時，用 `bundle_pv = [["_rc", "-rc."]]` 改寫，並在樣板中引用 `{bundle_pv}`；`deps` 同樣適用。

在 gentoo-zh-drafts 建立儲存庫需要組織權限。沒有權限時交給 gentoo-deps：包名是 `{P}` 用 `deps`，否則用 `bundle` 指向它的 `generator.yml`。

drafts 儲存庫用 [golang-dist-mirror-action](https://github.com/projg2/golang-dist-mirror-action) 定時同步上游時，不用寫 `deps` 或 `bundle`。例如 `gentoo-zh-drafts/mihomo` 每小時同步一次，release 自帶 `-vendor.tar.xz` 與 `-deps.tar.xz`。

### 審核與求助

維護者會在 PR 中指出需要修改的地方，並協助你完成修改；看不懂 CI 報告時，直接在 PR 中提問。

overlay 相關的問題優先在 [GitHub Issues](https://github.com/gentoo-zh/overlay/issues) 提出，也可以在[論壇](https://forum.gentoozh.org/)或 Telegram 群組 [@gentoo_zh](https://t.me/gentoo_zh) 討論。
