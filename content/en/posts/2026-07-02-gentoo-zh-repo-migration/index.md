---
title: "gentoo-zh Repository Migration: Announcement and Execution Record"
description: "The canonical maintenance repository for the gentoo-zh overlay has moved to a GitHub organization repo."
date: 2026-07-02
featured: true
tags: ["announcement", "overlay"]
authors:
  - name: Zakk (revised)
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/Zakkaus
  - name: Locez (draft)
    image: /authors/locez.webp
    link: https://github.com/locez
  - name: Clover (review)
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
  - name: Mame (review)
    image: /contributors/yangmame/feature.webp
    link: https://github.com/YangMame
---

{{< callout type="info" >}}
The current canonical address of the repository is **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**; use the new address when you switch. For the background on the rename, see the [Community vote and rename](#rename-to-overlay) step below.
{{< /callout >}}

The canonical maintenance repository for the gentoo-zh overlay has moved to a GitHub organization repo:

- New repository: https://github.com/gentoo-zh/overlay
- Original repository: https://github.com/microcai/gentoo-zh

The original repository owner carried out this migration via a GitHub repository transfer. The repository first landed at `gentoo-zh/gentoo-zh` (a transfer keeps the original repository name), and was later renamed to the current `gentoo-zh/overlay` after a community vote. The full process is documented step by step below.

## Background

Moving the gentoo-zh overlay to a GitHub organization repo lets the community maintenance team manage maintenance permissions, CI configuration, issue/PR management, and the release process in one place, and makes long-term maintenance less dependent on any single account.

The migration used GitHub's official repository transfer. The results:

- Full Git commit history preserved
- Branches and tags preserved
- Releases preserved
- GitHub issues preserved
- GitHub pull requests preserved
- GitHub stars and watchers preserved
- Fork network preserved
- Redirects from the original repository Git URL preserved
- Original commit SHAs preserved

After the transfer, `microcai/gentoo-zh` redirects to `gentoo-zh/gentoo-zh`. Old Git remote URLs keep working. Users and contributors should update to the new URL when convenient.

To avoid breaking existing user configurations, the old path `microcai/gentoo-zh` is left empty after the transfer. GitHub's redirect from the old address depends on the old path not being taken again. If that path is occupied by a repository or fork of the same name, the old URL no longer redirects to the new repository, and users still on the old URL are affected. The original owner does not recreate or fork a repository named `gentoo-zh` under the `microcai` account. Anyone who wants to keep a personal fork should avoid a same-named repository that would occupy the old path.

## For Users

gentoo-zh is now in Gentoo's official repository list (already pointing at the new overlay URL), so just re-enable it:

```bash
sudo eselect repository remove gentoo-zh
sudo eselect repository enable gentoo-zh
sudo emaint sync -r gentoo-zh
```

Or edit whichever file under `/etc/portage/repos.conf/` contains the `[gentoo-zh]` section (`eselect-repo.conf` if you added it with eselect; a manual one might be `gentoo-zh.conf` or a name you chose) and change `sync-uri` to the new address:

```ini
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

Then run `emerge --sync gentoo-zh`.

## For Contributors

Submit new issues, pull requests, and maintenance discussions to:

```text
https://github.com/gentoo-zh/overlay
```

Contributors with an existing local working copy should update upstream:

```bash
git remote set-url upstream https://github.com/gentoo-zh/overlay.git
git fetch upstream
```

Create new working branches from the new repository's default branch:

```bash
git checkout master
git pull upstream master
git checkout -b topic/name
```

## Migration Steps

### 1. Preparation

`gentoo-zh/gentoo-zh` currently exists as a fork of `microcai/gentoo-zh`. Free up the target repository name before running the repository transfer.

Steps:

1. Delete the existing `gentoo-zh/gentoo-zh`
2. Confirm the `gentoo-zh/gentoo-zh` name is free
3. Confirm the `gentoo-zh` organization owner is ready to accept the transfer
4. Confirm the original owner understands that after the transfer the old `microcai/gentoo-zh` path stays unoccupied, with no repository named `gentoo-zh` recreated or forked under the `microcai` account, so the redirect from old URLs to the new repository is not broken

### 2. Original owner initiates the repository transfer

The owner of `microcai/gentoo-zh` initiates the transfer in the GitHub repository settings:

```text
Settings -> General -> Danger Zone -> Transfer ownership
```

Target owner:

```text
gentoo-zh
```

Keep the target repository name as:

```text
gentoo-zh
```

### 3. The gentoo-zh organization accepts the transfer

The `gentoo-zh` organization owner accepts the GitHub transfer invitation.

After acceptance, the repository address becomes:

```text
https://github.com/gentoo-zh/gentoo-zh
```

### 4. Verify the transfer

After the transfer, confirm the following:

- The repository is at `gentoo-zh/gentoo-zh`
- The default branch is `master`
- Issues migrated
- Pull requests migrated
- Stars and watchers preserved
- Fork network preserved
- The old address `https://github.com/microcai/gentoo-zh` redirects to the new one
- `git clone https://github.com/microcai/gentoo-zh.git` redirects to the new repository
- `git clone https://github.com/gentoo-zh/gentoo-zh.git` works
- The old `microcai/gentoo-zh` path has not been recreated as a repository or same-named fork

### 5. Confirm the rename won't break redirects (single-hop 301)

Before renaming, confirm that GitHub's 301 redirect stays reliable after a transfer plus a rename: both the web and git keep working. Here is a real test with Homebrew, which went through the same transfer plus rename: [`mxcl/homebrew`](https://github.com/mxcl/homebrew) (the original) and [`Homebrew/homebrew`](https://github.com/Homebrew/homebrew) (the middle name) both 301-redirect in a single hop straight to the final [`Homebrew/legacy-homebrew`](https://github.com/Homebrew/legacy-homebrew), not a second hop; `git ls-remote` works as usual too. You can test it yourself:

```bash
UA="Mozilla/5.0"
curl -sIL -A "$UA" https://github.com/mxcl/homebrew     | grep -iE '^HTTP/|^location:'
curl -sIL -A "$UA" https://github.com/Homebrew/homebrew | grep -iE '^HTTP/|^location:'
```

![Testing GitHub's single-hop 301 with Homebrew: both mxcl/homebrew and Homebrew/homebrew redirect in a single hop straight to Homebrew/legacy-homebrew, and git ls-remote works](/img/gentoo-zh-overlay-301-homebrew.png)

So after renaming `gentoo-zh/gentoo-zh` to `gentoo-zh/overlay`, both old addresses `microcai/gentoo-zh` and `gentoo-zh/gentoo-zh` also redirect in a single hop straight to `gentoo-zh/overlay` (both web and git), so users who configured an old address won't be cut off.

### 6. Community vote, final name gentoo-zh/overlay {#rename-to-overlay}

After the transfer, the repository landed at `gentoo-zh/gentoo-zh` (a GitHub transfer keeps the original repository name). The community held a vote on the canonical repository name, and `gentoo-zh/overlay` won 21 votes to 9 (see [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829)), finally settling on `gentoo-zh/overlay`.

### 7. Rename on GitHub

In the organization repository settings, rename `Gentoo-zh/gentoo-zh` to **[`Gentoo-zh/overlay`](https://github.com/gentoo-zh/overlay)**:

```text
Settings -> General -> Repository name -> overlay
```

### 8. Update in-repo maintenance entry points ([PR #10744](https://github.com/gentoo-zh/overlay/pull/10744))

After the rename, one PR updated every in-repo entry point that pointed at an old address to `gentoo-zh/overlay`, across 7 files:

- `.github/workflows/nvchecker.yml`: the repository-name check changed from `'Gentoo-zh/gentoo-zh'` to `'gentoo-zh/overlay'`
- `repo.xml`: source, homepage, and owner email updated
- `README.md`: the migration NOTE points to `https://github.com/gentoo-zh/overlay`, and the dependencies table link changed to `gentoo-zh/overlay`
- `sys-kernel/cachyos-sources/cachyos-sources-6.18.6.ebuild`: support link changed to `gentoo-zh/overlay`
- `MIGRATION.md`: added
- `metadata/news/2026-07-05-repo-moved-to-overlay/`: new repository news (see step 9)

Historical links in ebuild comments that point to issues in the original repository stay unchanged. Old issue links redirect automatically, so there is no need to bulk-replace historical issue URLs.

The exact changes (click to expand):

{{% details title="repo.xml changes" %}}
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

{{% details title="MIGRATION.md (added)" %}}
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

{{% details title="README migration section" %}}
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

### 9. Add Gentoo repository news

Add a GLEP 42 repository news item under `metadata/news/`, titled "gentoo-zh overlay moved to gentoo-zh/overlay", with both an `.en.txt` and a `.zh.txt` file. After users sync the overlay, they can read it with `eselect news read`.

News item directory:

```text
metadata/news/2026-07-05-repo-moved-to-overlay/
```

The two news files:

```text
metadata/news/2026-07-05-repo-moved-to-overlay/2026-07-05-repo-moved-to-overlay.en.txt
metadata/news/2026-07-05-repo-moved-to-overlay/2026-07-05-repo-moved-to-overlay.zh.txt
```

{{% details title="news full text (.en.txt, English)" %}}
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

{{% details title="news full text (.zh.txt, Chinese)" %}}

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

### 10. Sync the official Gentoo registry

The overlay registry in `gentoo/api-gentoo-org` was submitted through [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) and, after the vote settled the name, merged as commit [`0f28fd9`](https://github.com/gentoo/api-gentoo-org/commit/0f28fd9d830936d17247274b390658a74f69cf9e). The changes to the gentoo-zh entry in `files/overlays/repositories.xml` (expand to view):

{{% details title="repositories.xml changes" %}}
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

## Wrap-up and confirmation

The overlay's internal metadata, README, and installation notes were updated in [PR #10744](https://github.com/gentoo-zh/overlay/pull/10744) (step 8); the official Gentoo registry was merged in [api-gentoo-org#829](https://github.com/gentoo/api-gentoo-org/pull/829) (step 10).

Simulating the user switch hands-on: with `gentoo-zh` enabled straight from Gentoo's official repository list, `emerge --sync` pulls from the new overlay address (see the last line):

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

301 redirect confirmation: after the rename, both old addresses `microcai/gentoo-zh` and `gentoo-zh/gentoo-zh` redirect in a single hop straight to `gentoo-zh/overlay` (both web and git), so existing users aren't affected. Actual output:

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

The migration news is live; after syncing the overlay, read it with `eselect news`:

```bash
eselect news list     # 2026-07-05-repo-moved-to-overlay shows up in the list
eselect news read     # read the unread news (or 'eselect news read 1' to read a specific item by number)
```

This news item follows the system language: if the system language is `zh` (`zh_CN`, `zh_TW`, `zh_HK`, and so on) you get the Chinese version, otherwise the English version. If it doesn't switch automatically, you can just `cat` the synced news file, for example the Chinese version:

```bash
cat /var/db/repos/gentoo-zh/metadata/news/2026-07-05-repo-moved-to-overlay/*.zh.txt
```

The full contents are in step 9 above.

## Postscript: website-side progress (zakkaus)

The auto-stats behind the website's [contributor wall](/contributors/) (`update-contributors.py`) and the related page notes now point to `Gentoo-zh/overlay`, and they refresh automatically on the 1st of each month. Now that the migration is in effect, the fork, issue, and other how-to links on the [Overlay page](/overlay/) and in the [contributing guide](/contributing/) have all been updated to the new repository. The website, Telegram, Matrix, and the [forum](https://forum.gentoozh.org/) have all been updated too, everywhere they mention the overlay repo. The old personal repository `microcai/gentoo-zh` 301-redirects to the new one; if you configured the old address locally, update it to the new URL when convenient.
