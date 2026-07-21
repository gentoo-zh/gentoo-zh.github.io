---
title: "gentoo-zh 倉庫遷移公告與執行記錄"
description: "gentoo-zh overlay 的正式維護倉庫遷移到 GitHub 組織倉庫"
date: 2026-07-02
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk（修訂/更新）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/Zakkaus
  - name: Locez（草案）
    image: /authors/locez.webp
    link: https://github.com/locez
  - name: Clover（審校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
  - name: Mame（審校）
    image: /contributors/yangmame/feature.webp
    link: https://github.com/YangMame
---

{{< callout type="info" >}}
倉庫現在的正式網址是 **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**；切換請用新網址，改名的來龍去脈見下面的[社群投票、改名](#rename-to-overlay)一步。
{{< /callout >}}

gentoo-zh overlay 的正式維護倉庫遷移到了 GitHub 組織倉庫：

- 現倉庫：https://github.com/gentoo-zh/overlay
- 原倉庫：https://github.com/microcai/gentoo-zh

本次遷移由原倉庫 owner 發起 GitHub repository transfer 完成，倉庫先落在 `gentoo-zh/gentoo-zh`（transfer 會保留原倉庫名），隨後經社群投票改名為現在的 `gentoo-zh/overlay`。下面按時間順序完整記錄整個過程。

## 遷移背景

把 gentoo-zh overlay 遷到 GitHub 組織倉庫，是想讓維護權限、CI、issue/PR 和釋出流程都歸社群維護團隊打理，不再讓整個 overlay 長期系在某一個人的帳號上。

本次遷移採用 GitHub 官方 repository transfer。遷移結果如下：

- 保留完整 Git commit 歷史
- 保留 branches 和 tags
- 保留 releases
- 保留 GitHub issues
- 保留 GitHub pull requests
- 保留 GitHub stars 和 watchers
- 保留 fork network
- 保留原倉庫 Git URL 的 redirect
- 保留原有 commit SHA

遷移完成後，造訪 `microcai/gentoo-zh` 會轉址到 `gentoo-zh/gentoo-zh`。舊的 Git remote URL 繼續可用；建議使用者和貢獻者在方便時更新到新 URL。

為避免破壞使用者現有設定，遷移完成後舊路徑 `microcai/gentoo-zh` 保持空置。GitHub 的舊網址轉址依賴舊路徑未被重新佔用；如果該路徑被同名倉庫或同名 fork 佔用，舊 URL 將不再轉址到新倉庫，仍在使用舊 URL 的使用者會受到影響。原 owner 不在 `microcai` 帳號下重新建立或 fork 名為 `gentoo-zh` 的倉庫；如需保留個人 fork，應避免使用會佔用舊路徑的同名倉庫。

## 使用者切換操作

gentoo-zh 已在 Gentoo 官方倉庫列表裡（網址已是新的 overlay），直接重新啟用即可：

```bash
sudo eselect repository remove gentoo-zh
sudo eselect repository enable gentoo-zh
sudo emaint sync -r gentoo-zh
```

或在 `/etc/portage/repos.conf/` 下編輯含 `[gentoo-zh]` 段的那個設定檔（用 eselect 加的在 `eselect-repo.conf`，手動加的可能是 `gentoo-zh.conf` 或你自己取的名字），把 `sync-uri` 改成新網址：

```ini
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

然後 `emerge --sync gentoo-zh`。

## 貢獻者切換操作

新的 issue、pull request 和維護討論統一提交到：

```text
https://github.com/gentoo-zh/overlay
```

已有本地工作副本的貢獻者更新 upstream：

```bash
git remote set-url upstream https://github.com/gentoo-zh/overlay.git
git fetch upstream
```

新的工作分支從新倉庫預設分支建立：

```bash
git checkout master
git pull upstream master
git checkout -b topic/name
```

## 遷移執行步驟

### 1. 遷移前準備

`gentoo-zh/gentoo-zh` 當前作為 `microcai/gentoo-zh` 的 fork 存在。執行 repository transfer 前釋放目標倉庫名稱。

執行操作：

1. 刪除現有 `gentoo-zh/gentoo-zh`
2. 確認 `gentoo-zh/gentoo-zh` 名稱已釋放
3. 確認 `gentoo-zh` 組織 owner 已準備接受 transfer
4. 確認原 owner 知悉遷移完成後不再佔用 `microcai/gentoo-zh` 舊路徑，不在 `microcai` 帳號下重新建立或 fork 名為 `gentoo-zh` 的倉庫，以免破壞舊 URL 到新倉庫的轉址

### 2. 原 owner 發起 repository transfer

由 `microcai/gentoo-zh` 的 owner 在 GitHub 倉庫設定中發起 transfer：

```text
Settings -> General -> Danger Zone -> Transfer ownership
```

目標 owner 填寫：

```text
gentoo-zh
```

目標倉庫名保持：

```text
gentoo-zh
```

### 3. gentoo-zh 組織接受遷移

`gentoo-zh` 組織 owner 接受 GitHub transfer 邀請。

接受完成後，倉庫網址變為：

```text
https://github.com/gentoo-zh/gentoo-zh
```

### 4. 驗證 transfer 結果

遷移完成後確認以下內容：

- 倉庫位於 `gentoo-zh/gentoo-zh`
- 預設分支為 `master`
- issues 已遷移
- pull requests 已遷移
- stars 和 watchers 已保留
- fork network 已保留
- 舊網址 `https://github.com/microcai/gentoo-zh` 轉址到新網址
- `git clone https://github.com/microcai/gentoo-zh.git` 轉址到新倉庫
- `git clone https://github.com/gentoo-zh/gentoo-zh.git` 正常工作
- `microcai/gentoo-zh` 舊路徑未被重新建立為倉庫或同名 fork

### 5. 確認改名不破壞轉址（301 單跳）

改名前先確認 GitHub 的 301 轉址在 transfer 加 rename 之後仍然可靠：網頁和 git 都會保留。這裡拿同樣經歷過「transfer + rename」的 Homebrew 實測：[`mxcl/homebrew`](https://github.com/mxcl/homebrew)（最初）和 [`Homebrew/homebrew`](https://github.com/Homebrew/homebrew)（中間名）都是一跳 301 直達最終的 [`Homebrew/legacy-homebrew`](https://github.com/Homebrew/legacy-homebrew)，不是二次轉址；`git ls-remote` 也照常工作。自己也能測：

```bash
UA="Mozilla/5.0"
curl -sIL -A "$UA" https://github.com/mxcl/homebrew     | grep -iE '^HTTP/|^location:'
curl -sIL -A "$UA" https://github.com/Homebrew/homebrew | grep -iE '^HTTP/|^location:'
```

![以 Homebrew 實測 GitHub 的 301 單跳：mxcl/homebrew 與 Homebrew/homebrew 都一跳直達 Homebrew/legacy-homebrew，git ls-remote 正常](/img/gentoo-zh-overlay-301-homebrew.png)

所以把 `gentoo-zh/gentoo-zh` 改名為 `gentoo-zh/overlay` 之後，`microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 兩個舊網址同樣會一跳直達 `gentoo-zh/overlay`（網頁和 git 都是），配過舊網址的使用者不會斷。

### 6. 社群投票，最終定名 gentoo-zh/overlay {#rename-to-overlay}

transfer 完成後倉庫落在 `gentoo-zh/gentoo-zh`（GitHub transfer 會保留原倉庫名）。社群就正式倉庫名做了一次投票，`gentoo-zh/overlay` 以 21 票比 9 票勝出（見 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829)），最終定名為 `gentoo-zh/overlay`。

### 7. 在 GitHub 上執行 rename

在組織倉庫設定裡把 `Gentoo-zh/gentoo-zh` 重新命名為 **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**：

```text
Settings -> General -> Repository name -> overlay
```

### 8. 更新倉庫內維護入口（[PR #10744](https://github.com/gentoo-zh/overlay/pull/10744)）

改名後在一個 PR 裡把倉庫內所有指向舊網址的入口統一更新到 `gentoo-zh/overlay`，共 7 個檔案：

- `.github/workflows/nvchecker.yml`：倉庫名判斷從 `'Gentoo-zh/gentoo-zh'` 改為 `'gentoo-zh/overlay'`
- `repo.xml`：更新 source、homepage 與 owner email
- `README.md`：遷移 NOTE 指向 `https://github.com/gentoo-zh/overlay`，dependencies table 連結改到 `gentoo-zh/overlay`
- `sys-kernel/cachyos-sources/cachyos-sources-6.18.6.ebuild`：支援入口改為 `gentoo-zh/overlay`
- `MIGRATION.md`：新增
- `metadata/news/2026-07-05-repo-moved-to-overlay/`：新增 repository news（見第 9 步）

ebuild 註釋中指向原倉庫 issue 的歷史連結保留不變。舊 issue 連結會自動轉址，不需要批次替換歷史 issue URL。

這幾處改動的具體內容（點開展開）：

{{% details title="repo.xml 改動" %}}
```diff
   <repo quality="experimental" status="unofficial">
     <name>gentoo-zh</name>
     <description>merged overlay of Gentoo-{China,Taiwan}</description>
-    <homepage>http://gentoo-zh.googlecode.com/</homepage>
+    <homepage>https://gentoozh.org</homepage>
     <owner type="project">
-      <email>microcaicai@gmail.com, robert.zhangle@gmail.com</email>
+      <email>overlay@gentoozh.org</email>
       <name>gentoo-zh</name>
     </owner>
-    <source type="git">https://github.com/Gentoo-zh/gentoo-zh.git</source>
+    <source type="git">https://github.com/gentoo-zh/overlay.git</source>
   </repo>
 </repositories>
```
{{% /details %}}

{{% details title="MIGRATION.md（新增）" %}}
````md
# gentoo-zh repository migration / gentoo-zh 倉庫遷移說明

## 中文

gentoo-zh overlay 已透過 GitHub repository transfer 從個人倉庫遷移到社群組織倉庫：

- 原倉庫：https://github.com/microcai/gentoo-zh
- 當前倉庫：https://github.com/gentoo-zh/overlay

該倉庫先從 microcai 個人帳號 transfer 到 gentoo-zh 組織（當時為 `gentoo-zh/gentoo-zh`），隨後經社群投票（21:9）定名並重命名為 `gentoo-zh/overlay`；`microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 兩個舊地址都會一跳 301 直達新倉庫（網頁和 git 均可），現有使用者不受影響。相關更新也已提交到 Gentoo 官方 overlay 登記（gentoo/api-gentoo-org#829）。

遷移完成後，`gentoo-zh/overlay` 是 gentoo-zh overlay 的正式維護入口。

過去所有維護者和使用者對 gentoo-zh 的貢獻會隨倉庫遷移一併保留。後續維護在 `gentoo-zh/overlay` 繼續進行。

為了讓倉庫地址與當前維護入口保持一致，建議在方便時將本地 remote 更新為：

```bash
git remote set-url origin https://github.com/gentoo-zh/overlay.git
```

後續 issue、pull request 和維護討論請使用當前倉庫。

## English

The gentoo-zh overlay has been transferred from the personal repository to the community organization through GitHub repository transfer:

- Previous repository: https://github.com/microcai/gentoo-zh
- Current repository: https://github.com/gentoo-zh/overlay

The repository was first transferred from microcai's personal account to the gentoo-zh organization (then `gentoo-zh/gentoo-zh`), and later renamed to `gentoo-zh/overlay` following a community poll (21 vs 9); both `microcai/gentoo-zh` and `gentoo-zh/gentoo-zh` 301-redirect to the new repository in a single hop (web and git), so existing users are not affected. A corresponding update has been submitted to the Gentoo overlay registry (gentoo/api-gentoo-org#829).

After the transfer, `gentoo-zh/overlay` is the main repository for the gentoo-zh overlay.

Contributions from past maintainers and users are preserved as part of this repository transfer. Future maintenance continues at `gentoo-zh/overlay`.

To keep local remotes aligned with the current maintenance location, update them when convenient:

```bash
git remote set-url origin https://github.com/gentoo-zh/overlay.git
```

Please use the current repository for future issues, pull requests, and maintenance discussions.
````
{{% /details %}}

{{% details title="README 遷移小節" %}}
````md
> [!NOTE]
> gentoo-zh overlay has moved to https://github.com/gentoo-zh/overlay. Old GitHub URLs continue to redirect. If you manually configured a remote, update it when convenient.

## Repository migration

This repository was transferred from `microcai/gentoo-zh` to the `gentoo-zh` organization through GitHub repository transfer, and later renamed to `gentoo-zh/overlay`.

The current repository is:

https://github.com/gentoo-zh/overlay

See [MIGRATION.md](./MIGRATION.md) for details.
````
{{% /details %}}

### 9. 新增 Gentoo repository news

在 `metadata/news/` 中新增一個符合 GLEP 42 的 repository news item，標題「gentoo-zh overlay moved to gentoo-zh/overlay」，同時提供 `.en.txt` 和 `.zh.txt` 兩個檔案。使用者同步 overlay 後可透過 `eselect news read` 讀取。

news item 目錄：

```text
metadata/news/2026-07-05-repo-moved-to-overlay/
```

兩個 news 檔案：

```text
metadata/news/2026-07-05-repo-moved-to-overlay/2026-07-05-repo-moved-to-overlay.en.txt
metadata/news/2026-07-05-repo-moved-to-overlay/2026-07-05-repo-moved-to-overlay.zh.txt
```

{{% details title="news 全文（.en.txt，英文）" %}}
```text
Title: gentoo-zh overlay moved to gentoo-zh/overlay
Author: zakkaus <zakk@gentoozh.org>
Content-Type: text/plain
Posted: 2026-07-05
Revision: 1
News-Item-Format: 1.0

The gentoo-zh overlay was transferred from the personal account:

https://github.com/microcai/gentoo-zh

to the gentoo-zh organization through GitHub repository transfer, and
then renamed to its current location:

https://github.com/gentoo-zh/overlay

Both old addresses (microcai/gentoo-zh and gentoo-zh/gentoo-zh)
301-redirect to the new repository in a single hop, for both the web and
Git, so existing setups keep working. The gentoo-zh overlay is now
maintained in the new repository.

Please use the new repository for future issues, pull requests, and
maintenance discussions.

For more details, see MIGRATION.md in the repository.

Users who configured the gentoo-zh overlay manually can update to the new
address when convenient.

Re-add the overlay:

sudo eselect repository remove gentoo-zh
sudo eselect repository add gentoo-zh git https://github.com/gentoo-zh/overlay.git
sudo emaint sync -r gentoo-zh

Or edit whichever file under /etc/portage/repos.conf/ contains the [gentoo-zh]
section (eselect-repo.conf if you added it with eselect) and set its sync-uri to
the new address:

[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes

Then run emerge --sync gentoo-zh.
```

{{% /details %}}

{{% details title="news 全文（.zh.txt，中文）" %}}

```text
Title: gentoo-zh overlay moved to gentoo-zh/overlay
Author: zakkaus <zakk@gentoozh.org>
Content-Type: text/plain
Posted: 2026-07-05
Revision: 1
News-Item-Format: 1.0

gentoo-zh overlay 已透過 GitHub repository transfer 從個人帳號：

https://github.com/microcai/gentoo-zh

遷移到 gentoo-zh 組織，隨後重新命名為當前地址：

https://github.com/gentoo-zh/overlay

兩個舊地址（microcai/gentoo-zh 和 gentoo-zh/gentoo-zh）都會一跳 301 直達新倉庫
（網頁和 git 均可），現有配置不受影響。新倉庫是 gentoo-zh overlay 後續維護的
正式入口。

後續 issue、pull request 和維護討論請使用新倉庫。

更多細節請見倉庫根目錄的 MIGRATION.md。

手動配置過 gentoo-zh overlay 的使用者，建議在方便時更新到新地址。

重新增 overlay：

sudo eselect repository remove gentoo-zh
sudo eselect repository add gentoo-zh git https://github.com/gentoo-zh/overlay.git
sudo emaint sync -r gentoo-zh

或編輯 /etc/portage/repos.conf/ 下含 [gentoo-zh] 段的那個配置檔案（用 eselect
新增的在 eselect-repo.conf），把該段的 sync-uri 改成新地址：

[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes

然後 emerge --sync gentoo-zh。
```
{{% /details %}}

### 10. 同步 Gentoo 官方倉庫登記

`gentoo/api-gentoo-org` 中的 overlay registry 透過 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) 提交，投票定名後合併為 commit [`0f28fd9`](https://github.com/gentoo/api-gentoo-org/commit/0f28fd9d830936d17247274b390658a74f69cf9e)。`files/overlays/repositories.xml` 裡 gentoo-zh 條目的改動（點開看）：

{{% details title="repositories.xml 改動" %}}
```diff
   <name>gentoo-zh</name>
   <description>To provide programs useful to Chinese speaking users (merged
     from gentoo-china and gentoo-taiwan).</description>
-  <homepage>https://github.com/microcai/gentoo-zh</homepage>
-  <owner type="person">
-    <email>microcai@fedoraproject.org</email>
+  <homepage>https://github.com/gentoo-zh/overlay</homepage>
+  <owner type="project">
+    <email>overlay@gentoozh.org</email>
   </owner>
-  <source type="git">https://github.com/microcai/gentoo-zh.git</source>
-  <source type="git">git+ssh://git@github.com/microcai/gentoo-zh.git</source>
-  <feed>https://github.com/microcai/gentoo-zh/commits/master.atom</feed>
+  <source type="git">https://github.com/gentoo-zh/overlay.git</source>
+  <source type="git">git+ssh://git@github.com/gentoo-zh/overlay.git</source>
+  <feed>https://github.com/gentoo-zh/overlay/commits/master.atom</feed>
   </repo>
```
{{% /details %}}

## 收尾與確認

overlay 內部後設資料、README 與安裝說明在 [PR #10744](https://github.com/gentoo-zh/overlay/pull/10744) 更新（第 8 步）；Gentoo 官方 registry 在 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) 合併（第 10 步）。

模擬使用者實操了一遍：從 Gentoo 官方倉庫列表直接 `enable` gentoo-zh，`emerge --sync` 會從新的 overlay 網址拉取（看最後一行）：

```console
$ sudo eselect repository remove gentoo-zh
Removing /var/db/repos/gentoo-zh ...
Updating repos.conf ...
1 repositories removed
$ sudo eselect repository enable gentoo-zh
Adding gentoo-zh to /etc/portage/repos.conf/eselect-repo.conf ...
1 repositories enabled
$ sudo emaint sync -r gentoo-zh
>>> Syncing repository 'gentoo-zh' into '/var/db/repos/gentoo-zh'...
/usr/sbin/git clone --depth 1 https://github.com/gentoo-zh/overlay.git .
```

301 轉址確認：改名後 `microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 兩個舊網址都一跳 301 直達 `gentoo-zh/overlay`（網頁和 git 都是），老使用者不受影響。實測輸出：

```console
$ UA="Mozilla/5.0"
$ curl -sIL -A "$UA" https://github.com/microcai/gentoo-zh  | grep -iE '^HTTP/|^location:'
HTTP/2 301
location: https://github.com/Gentoo-zh/overlay
HTTP/2 200
$ curl -sIL -A "$UA" https://github.com/gentoo-zh/gentoo-zh | grep -iE '^HTTP/|^location:'
HTTP/2 301
location: https://github.com/Gentoo-zh/overlay
HTTP/2 200
```

遷移 news 已生效，同步 overlay 後用 `eselect news` 讀：

```bash
eselect news list     # 列表裡能看到 2026-07-05-repo-moved-to-overlay
eselect news read     # 讀未讀的 news（也可 eselect news read 1 按編號讀某條）
```

這條 news 會跟隨系統語言顯示：系統語言是 `zh`（`zh_CN`、`zh_TW`、`zh_HK` 等）讀到中文版，其他讀到英文版。要是沒自動切過來，直接 `cat` 同步下來的 news 檔案也行，比如中文版：

```bash
cat /var/db/repos/gentoo-zh/metadata/news/2026-07-05-repo-moved-to-overlay/*.zh.txt
```

完整內容見上面第 9 步。

## 補記：官網側進度（zakkaus）

官網[貢獻者牆](/contributors/)的自動統計（`update-contributors.py`）與相關頁面說明已指向 `Gentoo-zh/overlay`，每月 1 日將會自動更新。遷移生效後，[Overlay 頁](/overlay/)與[貢獻指南](/contributing/)裡 fork、issue 等教學連結也已全部更新到新倉庫；官網、Telegram、Matrix、[論壇](https://forum.gentoozh.org/)等社群各處凡是提到 overlay 倉庫的地方，也都改成了新網址。舊的 `microcai/gentoo-zh` 個人倉庫會 301 到新倉庫，本地設定過舊網址的建議在方便時更新到新 URL。
