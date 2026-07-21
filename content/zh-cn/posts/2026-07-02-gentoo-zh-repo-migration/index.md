---
title: "gentoo-zh 仓库迁移公告与执行记录"
description: "gentoo-zh overlay 的正式维护仓库迁移到 GitHub 组织仓库"
date: 2026-07-02
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk（修订/更新）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/Zakkaus
  - name: Locez（草案）
    image: /authors/locez.webp
    link: https://github.com/locez
  - name: Clover（审校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
  - name: Mame（审校）
    image: /contributors/yangmame/feature.webp
    link: https://github.com/YangMame
---

{{< callout type="info" >}}
仓库现在的正式地址是 **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**；切换请用新地址，改名的来龙去脉见下面的[社区投票、改名](#rename-to-overlay)一步。
{{< /callout >}}

gentoo-zh overlay 的正式维护仓库迁移到了 GitHub 组织仓库：

- 现仓库：https://github.com/gentoo-zh/overlay
- 原仓库：https://github.com/microcai/gentoo-zh

本次迁移由原仓库 owner 发起 GitHub repository transfer 完成，仓库先落在 `gentoo-zh/gentoo-zh`（transfer 会保留原仓库名），随后经社区投票改名为现在的 `gentoo-zh/overlay`。下面按时间顺序完整记录整个过程。

## 迁移背景

把 gentoo-zh overlay 迁到 GitHub 组织仓库，是想让维护权限、CI、issue/PR 和发布流程都归社区维护团队打理，不再让整个 overlay 长期系在某一个人的账号上。

本次迁移采用 GitHub 官方 repository transfer。迁移结果如下：

- 保留完整 Git commit 历史
- 保留 branches 和 tags
- 保留 releases
- 保留 GitHub issues
- 保留 GitHub pull requests
- 保留 GitHub stars 和 watchers
- 保留 fork network
- 保留原仓库 Git URL 的 redirect
- 保留原有 commit SHA

迁移完成后，访问 `microcai/gentoo-zh` 会跳转到 `gentoo-zh/gentoo-zh`。旧的 Git remote URL 继续可用；建议用户和贡献者在方便时更新到新 URL。

为避免破坏用户现有配置，迁移完成后旧路径 `microcai/gentoo-zh` 保持空置。GitHub 的旧地址跳转依赖旧路径未被重新占用；如果该路径被同名仓库或同名 fork 占用，旧 URL 将不再跳转到新仓库，仍在使用旧 URL 的用户会受到影响。原 owner 不在 `microcai` 账号下重新创建或 fork 名为 `gentoo-zh` 的仓库；如需保留个人 fork，应避免使用会占用旧路径的同名仓库。

## 用户切换操作

gentoo-zh 已在 Gentoo 官方仓库列表里（地址已是新的 overlay），直接重新启用即可：

```bash
sudo eselect repository remove gentoo-zh
sudo eselect repository enable gentoo-zh
sudo emaint sync -r gentoo-zh
```

或在 `/etc/portage/repos.conf/` 下编辑含 `[gentoo-zh]` 段的那个配置文件（用 eselect 加的在 `eselect-repo.conf`，手动加的可能是 `gentoo-zh.conf` 或你自己起的名字），把 `sync-uri` 改成新地址：

```ini
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

然后 `emerge --sync gentoo-zh`。

## 贡献者切换操作

新的 issue、pull request 和维护讨论统一提交到：

```text
https://github.com/gentoo-zh/overlay
```

已有本地工作副本的贡献者更新 upstream：

```bash
git remote set-url upstream https://github.com/gentoo-zh/overlay.git
git fetch upstream
```

新的工作分支从新仓库默认分支创建：

```bash
git checkout master
git pull upstream master
git checkout -b topic/name
```

## 迁移执行步骤

### 1. 迁移前准备

`gentoo-zh/gentoo-zh` 当前作为 `microcai/gentoo-zh` 的 fork 存在。执行 repository transfer 前释放目标仓库名称。

执行操作：

1. 删除现有 `gentoo-zh/gentoo-zh`
2. 确认 `gentoo-zh/gentoo-zh` 名称已释放
3. 确认 `gentoo-zh` 组织 owner 已准备接受 transfer
4. 确认原 owner 知悉迁移完成后不再占用 `microcai/gentoo-zh` 旧路径，不在 `microcai` 账号下重新创建或 fork 名为 `gentoo-zh` 的仓库，以免破坏旧 URL 到新仓库的跳转

### 2. 原 owner 发起 repository transfer

由 `microcai/gentoo-zh` 的 owner 在 GitHub 仓库设置中发起 transfer：

```text
Settings -> General -> Danger Zone -> Transfer ownership
```

目标 owner 填写：

```text
gentoo-zh
```

目标仓库名保持：

```text
gentoo-zh
```

### 3. gentoo-zh 组织接受迁移

`gentoo-zh` 组织 owner 接受 GitHub transfer 邀请。

接受完成后，仓库地址变为：

```text
https://github.com/gentoo-zh/gentoo-zh
```

### 4. 验证 transfer 结果

迁移完成后确认以下内容：

- 仓库位于 `gentoo-zh/gentoo-zh`
- 默认分支为 `master`
- issues 已迁移
- pull requests 已迁移
- stars 和 watchers 已保留
- fork network 已保留
- 旧地址 `https://github.com/microcai/gentoo-zh` 跳转到新地址
- `git clone https://github.com/microcai/gentoo-zh.git` 跳转到新仓库
- `git clone https://github.com/gentoo-zh/gentoo-zh.git` 正常工作
- `microcai/gentoo-zh` 旧路径未被重新创建为仓库或同名 fork

### 5. 确认改名不破坏跳转（301 单跳）

改名前先确认 GitHub 的 301 跳转在 transfer 加 rename 之后仍然可靠：网页和 git 都会保留。这里拿同样经历过「transfer + rename」的 Homebrew 实测：[`mxcl/homebrew`](https://github.com/mxcl/homebrew)（最初）和 [`Homebrew/homebrew`](https://github.com/Homebrew/homebrew)（中间名）都是一跳 301 直达最终的 [`Homebrew/legacy-homebrew`](https://github.com/Homebrew/legacy-homebrew)，不是二次跳转；`git ls-remote` 也照常工作。自己也能测：

```bash
UA="Mozilla/5.0"
curl -sIL -A "$UA" https://github.com/mxcl/homebrew     | grep -iE '^HTTP/|^location:'
curl -sIL -A "$UA" https://github.com/Homebrew/homebrew | grep -iE '^HTTP/|^location:'
```

![以 Homebrew 实测 GitHub 的 301 单跳：mxcl/homebrew 与 Homebrew/homebrew 都一跳直达 Homebrew/legacy-homebrew，git ls-remote 正常](/img/gentoo-zh-overlay-301-homebrew.png)

所以把 `gentoo-zh/gentoo-zh` 改名为 `gentoo-zh/overlay` 之后，`microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 两个旧地址同样会一跳直达 `gentoo-zh/overlay`（网页和 git 都是），配过旧地址的用户不会断。

### 6. 社区投票，最终定名 gentoo-zh/overlay {#rename-to-overlay}

transfer 完成后仓库落在 `gentoo-zh/gentoo-zh`（GitHub transfer 会保留原仓库名）。社区就正式仓库名做了一次投票，`gentoo-zh/overlay` 以 21 票比 9 票胜出（见 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829)），最终定名为 `gentoo-zh/overlay`。

### 7. 在 GitHub 上执行 rename

在组织仓库设置里把 `Gentoo-zh/gentoo-zh` 重命名为 **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**：

```text
Settings -> General -> Repository name -> overlay
```

### 8. 更新仓库内维护入口（[PR #10744](https://github.com/gentoo-zh/overlay/pull/10744)）

改名后在一个 PR 里把仓库内所有指向旧地址的入口统一更新到 `gentoo-zh/overlay`，共 7 个文件：

- `.github/workflows/nvchecker.yml`：仓库名判断从 `'Gentoo-zh/gentoo-zh'` 改为 `'gentoo-zh/overlay'`
- `repo.xml`：更新 source、homepage 与 owner email
- `README.md`：迁移 NOTE 指向 `https://github.com/gentoo-zh/overlay`，dependencies table 链接改到 `gentoo-zh/overlay`
- `sys-kernel/cachyos-sources/cachyos-sources-6.18.6.ebuild`：支持入口改为 `gentoo-zh/overlay`
- `MIGRATION.md`：新增
- `metadata/news/2026-07-05-repo-moved-to-overlay/`：新增 repository news（见第 9 步）

ebuild 注释中指向原仓库 issue 的历史链接保留不变。旧 issue 链接会自动跳转，不需要批量替换历史 issue URL。

这几处改动的具体内容（点开展开）：

{{% details title="repo.xml 改动" %}}
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
# gentoo-zh repository migration / gentoo-zh 仓库迁移说明

## 中文

gentoo-zh overlay 已通过 GitHub repository transfer 从个人仓库迁移到社区组织仓库：

- 原仓库：https://github.com/microcai/gentoo-zh
- 当前仓库：https://github.com/gentoo-zh/overlay

该仓库先从 microcai 个人账号 transfer 到 gentoo-zh 组织（当时为 `gentoo-zh/gentoo-zh`），随后经社区投票（21:9）定名并重命名为 `gentoo-zh/overlay`；`microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 两个旧地址都会一跳 301 直达新仓库（网页和 git 均可），现有用户不受影响。相关更新也已提交到 Gentoo 官方 overlay 登记（gentoo/api-gentoo-org#829）。

迁移完成后，`gentoo-zh/overlay` 是 gentoo-zh overlay 的正式维护入口。

过去所有维护者和用户对 gentoo-zh 的贡献会随仓库迁移一并保留。后续维护在 `gentoo-zh/overlay` 继续进行。

为了让仓库地址与当前维护入口保持一致，建议在方便时将本地 remote 更新为：

```bash
git remote set-url origin https://github.com/gentoo-zh/overlay.git
```

后续 issue、pull request 和维护讨论请使用当前仓库。

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

{{% details title="README 迁移小节" %}}
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

### 9. 添加 Gentoo repository news

在 `metadata/news/` 中添加一个符合 GLEP 42 的 repository news item，标题「gentoo-zh overlay moved to gentoo-zh/overlay」，同时提供 `.en.txt` 和 `.zh.txt` 两个文件。用户同步 overlay 后可通过 `eselect news read` 读取。

news item 目录：

```text
metadata/news/2026-07-05-repo-moved-to-overlay/
```

两个 news 文件：

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

gentoo-zh overlay 已通过 GitHub repository transfer 从个人账号：

https://github.com/microcai/gentoo-zh

迁移到 gentoo-zh 组织，随后重命名为当前地址：

https://github.com/gentoo-zh/overlay

两个旧地址（microcai/gentoo-zh 和 gentoo-zh/gentoo-zh）都会一跳 301 直达新仓库
（网页和 git 均可），现有配置不受影响。新仓库是 gentoo-zh overlay 后续维护的
正式入口。

后续 issue、pull request 和维护讨论请使用新仓库。

更多细节请见仓库根目录的 MIGRATION.md。

手动配置过 gentoo-zh overlay 的用户，建议在方便时更新到新地址。

重新添加 overlay：

sudo eselect repository remove gentoo-zh
sudo eselect repository add gentoo-zh git https://github.com/gentoo-zh/overlay.git
sudo emaint sync -r gentoo-zh

或编辑 /etc/portage/repos.conf/ 下含 [gentoo-zh] 段的那个配置文件（用 eselect
添加的在 eselect-repo.conf），把该段的 sync-uri 改成新地址：

[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes

然后 emerge --sync gentoo-zh。
```
{{% /details %}}

### 10. 同步 Gentoo 官方仓库登记

`gentoo/api-gentoo-org` 中的 overlay registry 通过 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) 提交，投票定名后合并为 commit [`0f28fd9`](https://github.com/gentoo/api-gentoo-org/commit/0f28fd9d830936d17247274b390658a74f69cf9e)。`files/overlays/repositories.xml` 里 gentoo-zh 条目的改动（点开看）：

{{% details title="repositories.xml 改动" %}}
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

## 收尾与确认

overlay 内部元数据、README 与安装说明在 [PR #10744](https://github.com/gentoo-zh/overlay/pull/10744) 更新（第 8 步）；Gentoo 官方 registry 在 [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) 合并（第 10 步）。

模拟用户实操了一遍：从 Gentoo 官方仓库列表直接 `enable` gentoo-zh，`emerge --sync` 会从新的 overlay 地址拉取（看最后一行）：

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

301 跳转确认：改名后 `microcai/gentoo-zh` 和 `gentoo-zh/gentoo-zh` 两个旧地址都一跳 301 直达 `gentoo-zh/overlay`（网页和 git 都是），老用户不受影响。实测输出：

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

迁移 news 已生效，同步 overlay 后用 `eselect news` 读：

```bash
eselect news list     # 列表里能看到 2026-07-05-repo-moved-to-overlay
eselect news read     # 读未读的 news（也可 eselect news read 1 按编号读某条）
```

这条 news 会跟随系统语言显示：系统语言是 `zh`（`zh_CN`、`zh_TW`、`zh_HK` 等）读到中文版，其它读到英文版。要是没自动切过来，直接 `cat` 同步下来的 news 文件也行，比如中文版：

```bash
cat /var/db/repos/gentoo-zh/metadata/news/2026-07-05-repo-moved-to-overlay/*.zh.txt
```

完整内容见上面第 9 步。

## 补记：官网侧进度（zakkaus）

官网[贡献者墙](/contributors/)的自动统计（`update-contributors.py`）与相关页面说明已指向 `Gentoo-zh/overlay`，每月 1 日将会自动更新。迁移生效后，[Overlay 页](/overlay/)与[贡献指南](/contributing/)里 fork、issue 等教学链接也已全部更新到新仓库；官网、Telegram、Matrix、[论坛](https://forum.gentoozh.org/)等社区各处凡是提到 overlay 仓库的地方，也都改成了新地址。旧的 `microcai/gentoo-zh` 个人仓库会 301 到新仓库，本地配置过旧地址的建议在方便时更新到新 URL。
