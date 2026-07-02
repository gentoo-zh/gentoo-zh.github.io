---
title: "贡献指南"
description: "如何为 gentoo-zh Overlay 与 Gentoo 中文社区网站做出贡献"
---

欢迎参与 Gentoo 中文社区！贡献分两条线，入口和登上[贡献者墙](/contributors/)的方式都不一样，先看你想做哪种：

- **为 gentoo-zh Overlay 贡献**（软件包 / ebuild）——社区主线，也是[贡献者墙](/contributors/)的来源（脚本每月抓取 [Gentoo-zh/gentoo-zh](https://github.com/Gentoo-zh/gentoo-zh) 提交 5 次以上者）。详见下方「为 gentoo-zh Overlay 贡献」。
- **为社区网站贡献**（文章 / 翻译 / 修正）——在 [gentoo-zh.github.io](https://github.com/Gentoo-zh/gentoo-zh.github.io) 仓库，详见本页后半「为社区网站贡献」。
- **为官方 Gentoo Wiki 翻译**（中文译者）——见[如何参与 Gentoo Wiki 的翻译工作](/posts/2026-06-30-gentoo-wiki-translation/)。

## 为 gentoo-zh Overlay 贡献

gentoo-zh 是一个 `masters = gentoo` 的 Gentoo overlay（叠加在官方 Portage 树之上），收录 450 多个包，源码在 [microcai/gentoo-zh](https://github.com/microcai/gentoo-zh)。新增或更新 ebuild、修 bug、跟进新版本，都通过 GitHub Pull Request 提交；发现问题也欢迎提 [issue](https://github.com/microcai/gentoo-zh/issues)。

{{< callout type="warning" >}}
overlay 仓库即将迁移到组织仓库 `Gentoo-zh/gentoo-zh`，见[公告与执行方案](/posts/2026-07-02-gentoo-zh-repo-migration/)。贡献者墙的自动统计已提前指向新仓库（下次自动更新在 8 月，届时迁移已完成）；本页 fork、issue 等教学链接仍指向 `microcai/gentoo-zh`，迁移完成后同步更新，旧地址届时会自动跳转。
{{< /callout >}}

{{< callout type="info" >}}
首页[贡献者墙](/contributors/)统计的就是这种贡献——脚本每月抓取本仓库提交 5 次以上者。
{{< /callout >}}

### 准备

```bash
# 提交/QA 工具：pkgdev 生成提交信息与 Manifest，pkgcheck 做检查
# （二者已取代旧的 repoman，是现行官方工具）
emerge --ask dev-util/pkgdev   # 连带装上 pkgcheck
```

到 [GitHub](https://github.com/microcai/gentoo-zh) fork 仓库、clone 你的 fork、新建分支；本地启用 overlay 方便测试（见 [Overlay 页](/overlay/)）。

### 提交一个 ebuild 的标准流程

本仓库遵循官方 Gentoo ebuild 仓库规范，写法权威参考是 [Devmanual](https://devmanual.gentoo.org/)：

1. **放对位置**：`<category>/<package>/<package>-<version>.ebuild`。`category` 取官方分类（继承自 `::gentoo` 的 `profiles/categories`，如 `app-misc`、`dev-libs`、`net-im`），目录名、文件名、版本号按官方命名规则。
2. **写 ebuild**：用现行的 **`EAPI=9`**（EAPI=8 是上一代，树里老包多数还是 8，但新包请直接上 9；与 8 的差异见下方折叠）。标准两行版权头用范围式年份，与官方树一致：`# Copyright 1999-2026 Gentoo Authors` + GPL-2 声明。填好 `DESCRIPTION`、`HOMEPAGE`、`SRC_URI`、`LICENSE`、`SLOT`、`IUSE`，并按用途分清依赖：`DEPEND`（编译期头文件 / 库）、`RDEPEND`（运行期）、`BDEPEND`（在**构建主机**上跑的工具，如 pkgconfig、gettext）、`IDEPEND`（仅安装阶段 `pkg_*` 用到的工具）。
3. **KEYWORDS 只用测试关键字**（`~amd64`、`~arm64` 等）——**本仓库不收 stable 关键字**；只支持特定架构的包用 `-* ~amd64` 这种写法排除其余。
4. **写 `metadata.xml`**：每个包都要有，声明维护者，并给每个**局部 USE 标志**写用途说明（全局标志已在中央 `use.desc` 描述、无需重复；官方规范要求，`pkgcheck` 会查）。
5. **生成 Manifest**：`pkgdev manifest`。本仓库用 thin manifest（`thin-manifests = true`），`Manifest` 只记 distfile 校验（BLAKE2B/SHA512），ebuild 完整性交给 git。
6. **本地测试构建**：`ebuild <文件> clean install` 或 `emerge`，并在它 `KEYWORDS` 声明的**每个架构上都实测**——没测过就别声明支持。
7. **QA 自查**：`pkgcheck scan --commits --net`（`--commits` 只查你这几个提交改动的内容，`--net` 允许联网检查如 `SRC_URI` 是否还能下；CI 也会另跑 `pkgcheck`）。
8. **提交**：用 `pkgdev commit` 生成规范提交信息（格式见下），ebuild、`metadata.xml`、`Manifest` 一起提；一个贡献的全部提交放进**同一个 PR**，别拆成两个。
9. **开 PR 并盯 CI**：CI 会自动 `emerge` 该包并跑 `pkgcheck`——到 PR 的 **Checks**（或你 fork 的 **Actions**）看状态，红了按日志修；PR 模板里有一个必勾项——确认你已在本地跑过 `pkgcheck scan --commits --net`。全绿 + 勾选齐才会合并。

{{% details title="完整范例:app-misc/foo（ebuild + metadata.xml）" %}}

`app-misc/foo/foo-1.2.3.ebuild`：

```bash
# Copyright 1999-2026 Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=9

inherit toolchain-funcs

DESCRIPTION="示例：一个打印问候语的小工具（教学用）"
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
	# 普通 Makefile（无 ./configure）；autotools 包通常在 src_configure 用 econf，其余用默认实现。
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

`app-misc/foo/metadata.xml`（`nls` 是全局标志不必写，`examples` 是局部标志必须写说明）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE pkgmetadata SYSTEM "https://www.gentoo.org/dtd/metadata.dtd">
<pkgmetadata>
	<maintainer type="person">
		<email>you@example.com</email>
		<name>你的名字</name>
	</maintainer>
	<use>
		<flag name="examples">安装示例文件到文档目录</flag>
	</use>
	<upstream>
		<remote-id type="github">gentoo-zh/foo</remote-id>
		<bugs-to>https://github.com/gentoo-zh/foo/issues</bugs-to>
	</upstream>
</pkgmetadata>
```

写好这两个文件后，在包目录里把整条流程跑完：

```bash
cd app-misc/foo
pkgdev manifest                          # ① 生成 Manifest(下载 distfile + 记 BLAKE2B/SHA512)
ebuild foo-1.2.3.ebuild clean install    # ② 本地构建测试;或 emerge -av app-misc/foo。每个 KEYWORDS 架构都要测
pkgcheck scan --commits --net            # ③ QA 自查,清掉所有 error / warning
pkgdev commit                            # ④ 生成规范提交信息(ebuild + metadata.xml + Manifest 一起提)
git push                                 # ⑤ 推到你的 fork,再到 GitHub 开 PR
```

⑥ 开 PR 后**盯 CI 状态**：到 PR 页面的 **Checks**（或你 fork 的 **Actions** 标签）看 `emerge-on-pr` 与 `pkgcheck` 两条流水线——红了就点进日志按提示修，`git push --force-with-lease` 更新分支会自动重跑；**全绿 + PR 模板勾选齐**才会合并。

{{% /details %}}

{{% details title="EAPI 9 相对 8 的变化(从 8 过来看这个)" %}}

- **`assert` 被移除** → 用 **`pipestatus`**（检查上一条管道里**每个**命令的退出码：`foo | bar; pipestatus || die`）。
- **`domo` 被移除** → 用 `insinto` + `newins`。
- 新增 **`ver_replacing`**（拿版本和 `REPLACING_VERSIONS` 比，适合在 `pkg_postinst` 里按升级路径给提示）、**`edo`**（先打印再执行一条命令，失败即 die，省去手写 `echo` + `|| die`）。
- **一批变量不再导出到环境**：`ROOT`、`EROOT`、`USE`、`FILESDIR`、`DISTDIR`、`WORKDIR`、`S` 等现在只是 ebuild 内可用的 shell 变量，不再 export 给子进程（例外：`SYSROOT`、`ESYSROOT`、`BROOT`、`TMPDIR`、`HOME` 仍始终导出）。若你调用的外部程序靠环境变量读这些，要自己 `export`。
- bash 升到 5.3；合并 `D` 到 `ROOT` 时绝对符号链接按原样合并。

完整清单见 [Devmanual 的 EAPI 差异表](https://devmanual.gentoo.org/ebuild-writing/eapi/)。

{{% /details %}}

{{< callout type="warning" >}}
**唯一规则：别弄坏别人的系统（DO NOT BREAK PEOPLE'S SYSTEM）。**
{{< /callout >}}

*本节（提交 ebuild 流程）经 Chris🦈 Su（脆脆）审阅、补充，特此致谢。*

### 提交信息规范

推荐用 `pkgdev commit` 自动生成符合规范的提交信息。

{{% details title="提交信息格式示例" %}}

普通（非版本更新）改动：

```text
$category/$package: 一句话简述

多行说明改动的原因；若是修 bug 且 GitHub 上有对应 issue，把链接附在这里。
```

版本更新（bump）：

```text
$category/$package: add $new_version, drop $old_version
```

{{% /details %}}

### 跟进上游新版本（nvchecker）

仓库用 [nvchecker](https://github.com/lilydjwg/nvchecker) 每天自动比对各包的上游版本（配置在 `.github/workflows/overlay.toml`），有新版本就自动开/更新对应的 [GitHub issue](https://github.com/microcai/gentoo-zh/issues)——**不知道从哪下手，挑一个版本更新（bump）issue 来做最省心**。新增包时，记得也在 `overlay.toml` 中加一条 nvchecker 规则（写明上游版本来源），让它一并纳入版本追踪。

### git 配置、签名与 rebase

PR 的细节以官方文档为准（见下方「官方规范与参考」）；这里是几条最常用的：

- **身份**：先配好真实姓名与邮箱，提交署名都用它：

  ```bash
  git config user.name  "Your Name"
  git config user.email "you@example.com"
  ```

- **GPG 签名（可选）**：本 overlay **不强制**签名（`layout.conf` 写明无签名政策，现有提交也多未签名），但官方主树要求每个提交都 OpenPGP 签名（见 [Gentoo git 工作流](https://wiki.gentoo.org/wiki/Gentoo_git_workflow)，密钥政策见 [GLEP 63](https://www.gentoo.org/glep/glep-0063.html)），愿意遵循是好习惯。按 [Gentoo 的 GnuPG 密钥指南](https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys)生成密钥后启用：

  ```bash
  git config user.signingkey <你的密钥ID>
  git config commit.gpgsign true
  ```

  官方惯例（[GLEP 76](https://www.gentoo.org/glep/glep-0076.html)）还要求提交带 `Signed-off-by`（开发者原创声明）；`pkgdev commit` 会自动加，手写 `git commit` 用 `-s`。

- **rebase 保持历史干净**：开 / 更新 PR 前先把分支 rebase 到最新 master，别用 merge 提交搅乱历史；把零碎的修补提交合进对应的逻辑提交：

  ```bash
  git pull --rebase origin master   # 跟上游对齐
  git rebase -i origin/master       # 整理 / 合并自己的提交
  git push --force-with-lease        # 更新已开的 PR 分支
  ```

  `--force-with-lease` 只用于**你自己 fork 上的 PR 分支**（rebase 后更新 PR 的常规操作）；**切勿**对共享的上游 master 重写历史或 force——官方规定 master 只允许快进推送。一个贡献的全部提交放进同一个 PR（README 铁规矩），别拆成两个。

### 官方规范与参考

写法与流程一律**以官方文档为准**，本页只是导引：

- [Gentoo Devmanual](https://devmanual.gentoo.org/)——写 ebuild 的权威手册（EAPI、变量、依赖、`metadata.xml` 等）
- [Ebuild 仓库格式](https://wiki.gentoo.org/wiki/Repository_format)与 [Overlay 项目](https://wiki.gentoo.org/wiki/Project:Overlays)
- [Gentoo git 工作流](https://wiki.gentoo.org/wiki/Gentoo_git_workflow)、[GLEP 76](https://www.gentoo.org/glep/glep-0076.html)（版权与 `Signed-off-by`）、[GLEP 63](https://www.gentoo.org/glep/glep-0063.html)（OpenPGP 密钥）
- `pkgdev` / `pkgcheck`（`dev-util`）——现行的提交与 QA 工具
- 本仓库 [README](https://github.com/microcai/gentoo-zh#readme) 与[依赖关系表](https://github.com/microcai/gentoo-zh/blob/deps-table/relation.md)

---

以下是**为社区网站（文章 / 翻译 / 文档）贡献**的指南。

## 项目概况

本网站使用 [Hugo](https://gohugo.io/) 静态网站生成器构建，由 GitHub Actions 构建后部署到 Cloudflare Workers（静态资源托管）。表现层（主题）是 [Hextra](https://imfing.github.io/hextra/) 再加上本站的补丁包 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)——后者通过 [Hugo Modules](https://gohugo.io/hugo-modules/) 引入并在 Hextra 之上叠加覆盖，依赖链为 **站点 → gentoozh-theme → Hextra**。所以本仓库只放内容与配置，模板/样式源码都在补丁包里。

**项目仓库**：内容/配置 <https://github.com/Gentoo-zh/gentoo-zh.github.io>；主题补丁包 <https://github.com/Gentoo-zh/gentoozh-theme>

## 项目结构

### 内容组织

内容按语言分目录存放，简体中文在 `content/zh-cn/`，正体中文在 `content/zh-tw/`，两者目录结构完全一致：

- `download/` — 下载页面（镜像源和安装介质）
- `overlay/` — gentoo-zh Overlay 说明
- `mirrorlist/` — 镜像列表（Portage 树和 Distfiles 配置）
- `about/` — 关于页面（项目历史、社区频道、网站语言说明）
- `contributors/` — 贡献者页面（**自动更新，无需手动编辑**）
- `contributing/` — 贡献指南（本页面）
- `changelog/` — 更新记录
- `posts/` — 新闻文章和教程

> 同一篇内容的简体版放在 `content/zh-cn/...`、正体版放在对应的 `content/zh-tw/...`，文件名都是 `index.md` / `_index.md`（**不再**使用 `index.zh-cn.md` 这种语言后缀）。

### 配置文件

主要配置位于 `config/_default/` 目录：

- `hugo.toml` — Hugo 主配置（站点信息、分类法、Markdown 渲染、输出格式等）
- `languages.toml` — 语言配置（简繁双语，单文件内分 `[zh-cn]` / `[zh-tw]`）
- `menus.zh-cn.toml` / `menus.zh-tw.toml` — 各语言导航菜单
- `params.toml` — 主题参数（外观、功能开关）

### 多语言支持

- 界面字串翻译主要在 **gentoozh-theme 补丁包**的 `i18n/` 里（表现层）；本仓库的 `i18n/` 只放少量站点专属字串（如贡献者角色名）
- 默认语言为简体中文，位于站点根路径 `/`；正体中文位于 `/zh-tw/`
- 简繁转换由仓库内的 `sync_to_tw.sh` 脚本完成（见下文）

### 主题与资源

表现层拆成了独立的补丁包模块 **[gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)**（在 Hextra 之上叠加，仍跟随上游更新），本仓库不再放模板/样式源码：

- 模板（`layouts/`，含首页 `home-bento`、贡献者页等）、站点样式（`assets/css/custom.css`，Gentoo 品牌紫等）、界面字串（`i18n/`）都在 gentoozh-theme 里
- 站点通过 `config/_default/hugo.toml` 的 `[[module.imports]]` 引入它，并在 `go.mod` pin 版本
- `static/`（`CNAME`、favicon、logo、og 图等）仍在本仓库
- **改模板 / 样式 → 去 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme) 仓库；改内容 → 在本仓库**

## 环境准备

主题用 SCSS（经 Hugo Modules 引入），所以必须用 **Hugo extended**——即 `www-apps/hugo` 的 **`extended` USE**（提供 SASS/SCSS 支持；该 USE 默认开启，但请确认你没把它关掉）。另需 **Go** 工具链拉取主题模块。

```bash
# Gentoo：确保 hugo 带 extended USE（Hextra 的 SCSS 必需）
echo "www-apps/hugo extended" >> /etc/portage/package.use/hugo
emerge --ask www-apps/hugo dev-lang/go

# macOS（Homebrew 的 hugo 已是 extended 版）
brew install hugo go
```

> 注：Hugo 内置的 SCSS 转译器（LibSass）自 v0.153.0 起已弃用、未来会移除；届时需改用外部 [Dart Sass](https://gohugo.io/functions/css/sass/)（与 edition 无关、标准版也能用）。目前 extended 的内置转译器仍可用。

Fork 并 clone 仓库（**无需** `git submodule`，模块会在构建时自动拉取）：

```bash
git clone https://github.com/你的用户名/gentoo-zh.github.io.git
cd gentoo-zh.github.io
```

本地预览：

```bash
hugo server -D
# 访问 http://localhost:1313 预览
```

## 如何为网站贡献

### 1. 提交新文章

文章用 [page bundle](https://gohugo.io/content-management/page-bundles/) 形式（一篇一个目录、正文是 `index.md`，方便随文放图）。默认语言是简体中文，直接用 `hugo new` 脚手架即可（会自动建到默认语言的 `content/zh-cn/` 下）：

```bash
hugo new posts/2026-05-29-my-article/index.md
# 生成 content/zh-cn/posts/2026-05-29-my-article/index.md
```

`hugo new` 按 `archetypes/default.md` 生成的 front matter 带 `draft: true`，写好后记得**去掉 `draft`**（否则正式构建不会收录），并补上 `tags`、`authors`（见第 3 节）。最终 front matter 示例：

```yaml
---
title: "文章标题"
date: 2026-05-29
tags: ["tutorial"]
---

文章正文……（作者署名见下方第 3 节）
```

可选的标签（`tags`，显示在文章列表与文章页的 `#标签`、链接到 `/tags/` 聚合页，首页文章卡片也会显示首个标签）：`tutorial`（教程）、`news`（新闻）、`announcement`（公告）、`website`（站务）。

首页「最新文章」默认让教程类排前、公告类靠后；重大公告可在 front matter 加 `featured: true` 置顶到首页最前，事件过去后删掉即可。

写完简体版后，用脚本生成正体中文版（见下一节），正体版放在对应的 `content/zh-tw/posts/.../index.md`。

### 2. 简繁转换

`sync_to_tw.sh` 封装了 OpenCC（`s2twp`）+ 针对本站术语的修正与已知误转清理。传入简体源文件即可，正体目标路径自动推导：

```bash
# 先安装 OpenCC
emerge --ask app-i18n/opencc   # Gentoo
brew install opencc            # macOS
sudo apt install opencc        # Debian/Ubuntu

# 简体 → 正体（目标自动生成到 content/zh-tw/ 对应位置）
./sync_to_tw.sh content/zh-cn/posts/2026-05-29-my-article/index.md

# 不带参数：同步所有相对 git HEAD 改动过的简体文件
./sync_to_tw.sh

# 只检查不写：报告哪些正体版落后于简体版（提交前跑一下）
./sync_to_tw.sh --check
```

转换后建议人工检查台湾用语差异。

### 3. 文章署名与头像

在文章 front matter 的 `authors` 用「映射」形式写明作者，Hextra 会在署名处显示头像 + 姓名 + 链接：

```yaml
authors:
  - name: 你的名字
    image: /contributors/<你的标识>/feature.webp
    link: https://github.com/yourname
```

`image` 可指向贡献者页里的头像；省略 `image` 则只显示姓名。

### 4. 改进现有内容 / 技术改进

错别字、过时信息、使用技巧、缺失的正体中文翻译，看到了都欢迎随手修正。模板、样式、性能、功能等技术层面，也欢迎提改进。

> **贡献者列表（`content/*/contributors/`）由脚本自动维护**，抓取 [gentoo-zh Overlay](https://github.com/Gentoo-zh/gentoo-zh) 中提交 5 次以上者，显示提交次数并按提交量排序，每月自动更新（`scripts/update-contributors.py` + GitHub Actions）。**请勿手动编辑该目录**；首页贡献者展示也随之自动更新。

## 提交 Pull Request

```bash
git checkout -b your-feature-branch
git add .
git commit -m "描述你的更改"
git push origin your-feature-branch
# 然后在 GitHub 上创建 Pull Request
```

## 写作规范

### Markdown 格式

- 使用标准 Markdown 语法
- 代码块标注语言（如 ` ```bash `）
- 图片放在文章目录内并使用相对路径
- 链接使用 Markdown 格式

### 中文排版

- 中英文之间留一个空格
- 使用全角中文标点
- 数字、英文用半角
- 专有名词保持原文（如 Gentoo、Hugo、Hextra、Portage）

## 常见问题

### 如何更新主题？

主题层是独立的 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme) 补丁包模块，**升级 Hextra 在那个仓库里做**：

```bash
# 在 gentoozh-theme 仓库
hugo mod get -u github.com/imfing/hextra
hugo mod tidy
git commit -am "bump hextra"
git tag vX.Y.Z          # 打个新版本
```

然后回到**本站**仓库，把补丁包 pin 到新版本：

```bash
hugo mod get github.com/Gentoo-zh/gentoozh-theme@vX.Y.Z
git commit -am "bump gentoozh-theme"
```

### 如何添加新的栏目页面？

在 `content/zh-cn/<栏目>/` 下建 `_index.md`，用脚本生成 `content/zh-tw/<栏目>/_index.md`；若要进入顶部导航，再到 `config/_default/menus.zh-cn.toml` 和 `menus.zh-tw.toml` 各加一条 `[[main]]`。

### 简繁内容不一致怎么办？

以简体版为源，重新运行 `sync_to_tw.sh`（用法见上）覆盖生成正体版，再人工校对。请勿手动维护两份正文导致内容漂移。

## 社区交流

遇到问题或有建议？

- **Telegram 频道**：[@gentoocn](https://t.me/gentoocn)
- **Telegram 群组**：[@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**：<https://github.com/Gentoo-zh/gentoo-zh.github.io/issues>
- **网站事宜联络邮箱**：<zakk@gentoozh.org>

更多频道（IRC / Matrix / 闲聊群等）见[关于页面](/about/)。

## 许可协议

本站内容采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可协议，除非另有说明。代码贡献遵循项目的 MIT 许可。

---

改一个错字、补一句翻译、提个 PR，都算数。Gentoo 中文社区就是这么一点点攒起来的。
