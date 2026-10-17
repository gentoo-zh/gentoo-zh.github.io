---
title: "Overlay 贡献指南"
description: "提交 ebuild、仓库规则与自动版本更新"
---

## Gentoo-zh Overlay 贡献指南

gentoo-zh 是叠加在官方 Gentoo 仓库之上的 ebuild 仓库（`masters = gentoo`），源码在 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。新增或更新软件包通过 GitHub Pull Request 提交，问题提交到 [issue](https://github.com/gentoo-zh/overlay/issues)。社区维护者审核每个 PR，并指导贡献者完成修改。

{{< callout type="warning" >}}
**唯一规则：别弄坏别人的系统（DO NOT BREAK PEOPLE'S SYSTEM）。**
{{< /callout >}}

{{< callout type="info" >}}
仓库已从 `microcai/gentoo-zh` 迁移到 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)，旧地址会重定向到新仓库。请在方便时把 fork 和本地 remote 改为新地址，详见[迁移公告](/posts/2026-07-02-gentoo-zh-repo-migration/)。
{{< /callout >}}

### 准备工作

安装提交与 QA 工具 `pkgdev`，它会一并安装 `pkgcheck`：

```bash
# emerge --ask dev-util/pkgdev
```

在 GitHub 上 fork [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。克隆时把目录名指定为 `gentoo-zh`，与 `/var/db/repos/gentoo-zh` 一致，不要用默认的 `overlay`：

```bash
$ git clone https://github.com/<你的用户名>/overlay.git gentoo-zh
```

使用 [GitHub CLI](https://cli.github.com/) 时可以一步完成 fork 与克隆，`--` 之后的 `gentoo-zh` 是目录名：

```bash
$ gh repo fork gentoo-zh/overlay --clone -- gentoo-zh
```

本地启用 overlay 的方法见 [Overlay 配置](/overlay/)。

### 编写 ebuild

本页不讲 ebuild 写法。本仓库遵循 Gentoo 官方的 ebuild 仓库规范，写法以官方文档为准：

- [Devmanual 快速入门](https://devmanual.gentoo.org/quickstart/)：ebuild 的基本结构与常见示例
- [Basic guide to write Gentoo Ebuilds](https://wiki.gentoo.org/wiki/Basic_guide_to_write_Gentoo_Ebuilds/zh-cn)：Gentoo Wiki 的入门指南，有简体中文译本
- [Devmanual](https://devmanual.gentoo.org/)：变量、依赖、eclass 与阶段函数的权威手册
- [EAPI 差异](https://devmanual.gentoo.org/ebuild-writing/eapi/)：各 EAPI 版本新增和移除的功能
- [metadata.xml](https://devmanual.gentoo.org/ebuild-writing/misc-files/metadata/) 与 [关键字](https://devmanual.gentoo.org/keywording/)
- [Ebuild 仓库](https://wiki.gentoo.org/wiki/Ebuild_repository)：仓库的目录结构
- [pkgdev](https://pkgcore.github.io/pkgdev/) 与 [pkgcheck](https://pkgcore.github.io/pkgcheck/)：提交与 QA 工具的文档
- [GLEP 66](https://www.gentoo.org/glep/glep-0066.html)：Gentoo 的 git 工作流与提交信息规范

### 仓库规则

以下规则来自仓库的 [README](https://github.com/gentoo-zh/overlay#readme) 与 [PR 模板](https://github.com/gentoo-zh/overlay/blob/master/.github/pull_request_template.md)：

- `KEYWORDS` 只用测试关键字（`~amd64`、`~arm64` 等），不收稳定关键字。
- 每个软件包都要有 `metadata.xml`，写明维护者，并说明每个局部 USE 标志的用途。
- 仓库使用 thin manifest：用 `pkgdev manifest` 生成 `Manifest`，它只记录 distfile 的校验和。
- 提交前确认 ebuild 能编译，并在声明的每个关键字上实测。CI 在 amd64 与 arm64 上构建；问题出在你没有的架构上且无法解决时，删掉该关键字。
- `LICENSE` 必须与上游实际授权一致。`::gentoo` 没有的许可证，把全文放进 `licenses/`，加入 `profiles/license_groups` 中对应的组，并按其再分发条款设置 `RESTRICT`。
- 每个软件包都要在 `overlay.toml` 中登记，写法见[自动版本更新](#autobump)一节。
- 一个提交包含它需要的全部改动，例如 ebuild 与它的 `Manifest` 放在同一个提交；一次贡献的全部提交放在同一个 PR。
- 开 PR 前在本地执行 `pkgcheck scan --commits --net`，并勾选 PR 模板中的全部确认项，否则不会合并。
- PR 上的 `emerge-on-pr` 与 `pkgcheck` 检查必须通过；按报告修复问题，QA 警告也要修。
- 使用 AI 辅助时必须遵循 [AGENTS.md](https://github.com/gentoo-zh/overlay/blob/master/AGENTS.md)。贡献者对每个提交负责，提交者与提交作者必须是人。
- 持续维护你添加的软件包。不再维护时，在 issue 中寻找新的维护者，或在 `profiles/package.mask` 中屏蔽，到期后删除。

提交信息用 `pkgdev commit` 生成。版本更新的格式：

```text
$category/$package: add $new_version, drop $old_version
```

其他改动的格式：

```text
$category/$package: 一句话简述

说明修改原因；修复的 bug 有 GitHub issue 时附上链接。
```

### 如何避免自动镜像某个软件包的 distfile？ {#restrict-mirror}

ebuild 的 `RESTRICT` 中包含 `mirror` 或 `fetch` 时，会限制 distfiles 的自动镜像。`bindist` 只限制二进制包，不单独决定 distfiles 是否镜像。

### 自动版本更新（autobump） {#autobump}

[`.github/workflows/overlay.toml`](https://github.com/gentoo-zh/overlay/blob/master/.github/workflows/overlay.toml) 是 [nvchecker](https://github.com/lilydjwg/nvchecker) 的配置文件，每个软件包一个条目，按 `category/package` 的字母顺序排列。nvchecker 发现上游新版本时开一个 [issue](https://github.com/gentoo-zh/overlay/issues)，并通知条目中的 `github_account`。想参与但没有目标时，可以认领一个版本更新 issue。

以 `net-proxy/mihomo` 的条目为例：

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

- `source`、`github`：版本来源与上游仓库。
- `use_latest_release = true`：上游发布 release 时使用；上游只打 tag 时改用 `use_latest_tag = true`。
- `prefix = "v"`：上游 tag 带 `v` 而 ebuild 版本不带时使用。
- `github_account`：打包者的 GitHub 账号，nvchecker 的 issue 会通知此人。
- `autobump = true`：开启自动版本更新，删除这一行即关闭。

无法跟踪版本的软件包（例如只有 live ebuild）写成注释条目 `#["category/package"]`，并注明原因；`acct-*`、`virtual` 与 `app-alternatives` 也写成注释条目，不需要注明原因。

开启 autobump 的软件包，由 autobump 处理 nvchecker 的 issue：只需改版本号时，它复制 ebuild、重新生成 `Manifest`，在 CI 容器中执行一次真实的 `emerge`，通过后才开 PR。这个 PR 同样要通过 `emerge-on-pr` 与 `pkgcheck`，并由维护者审核后合并。依赖、USE 或 patch 需要改动时，autobump 只在 issue 中记录证据，交给人处理。

- 适合开启：`-bin` 预编译包、没有 vendor 依赖的单文件源码包、已用 `deps` 或 `bundle` 写明依赖包来源的 Go、Rust、npm 包。
- 不适合开启：依赖随版本变化的包、`files/` 中带 patch 的包、每个版本都要单独生成依赖包但条目没写明来源的包（写法见下方“依赖包”）。

开启 autobump 由打包者决定：在 PR 中给自己的条目加上 `autobump = true`。这个值同时决定 bump 后保留几个版本：`true` 只删除被取代的那个版本，数字 `N` 保留最近 N 个版本，`"all"` 全部保留。不确定是否适合时，维护者可以先用 [autobump-trial](https://github.com/gentoo-zh/overlay/actions/workflows/autobump-trial.yml) 做一次构建测试，它只汇报结果，不开 PR。完整说明见 [autobump 使用说明](https://github.com/gentoo-zh/overlay/blob/master/scripts/autobump.zh.md)。

**依赖包（vendor bundle）**

ebuild 下载单独打包的依赖（Go vendor、`node_modules`、crates 等）时，条目要用 `deps` 或 `bundle` 写明依赖包由谁生成，二选一。autobump 等依赖包发布后才开 PR；还没有 release 时，它会触发生成依赖包的 workflow。

`deps`：由 [gentoo-deps](https://github.com/gentoo-zh/gentoo-deps) 生成，包名与 release tag 都是 `{P}`。

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

- `lang`：`golang`、`javascript`、`javascript(pnpm)`、`rust`、`dart`。没有其他设置时可写成 `deps = "golang"`。
- `repo` 默认取 `github`，版本来源不是 GitHub 时必填；`tag` 默认是 `prefix` 加版本号，设置了 `from_pattern` 或 `to_pattern` 时必填。
- `modules = ["service", "core"]`：按目录分别打包，不能与 `vendordir`、`workdir` 同用。

`bundle`：包名不是 `{P}`，或由仓库自己的 workflow 生成时使用，`repo` 须在 gentoo-zh 或 gentoo-zh-drafts 下。例如 `net-proxy/clash-verge-rev`：

```toml
bundle = [
  { id = "crates", repo = "gentoo-zh/gentoo-deps", workflow = "generator.yml", tag = "clash-verge-{PV}", inputs = { LANG = "rust", REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "clash-verge-{PV}" } },
  { id = "web", repo = "gentoo-zh-drafts/tauri-web-dist", workflow = "generator.yml", tag = "{P}", inputs = { REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "{P}" } },
]
```

- 必填 `id`、`repo`、`workflow`、`tag`；`inputs` 传给 workflow；`producers` 列出要等待的 workflow，默认只有 `workflow`。
- 模板变量：`{PN}`、`{PV}`、`{P}`、`{bundle_pv}`。
- 版本号写法与 Gentoo 不同时，用 `bundle_pv = [["_rc", "-rc."]]` 改写，并在模板中引用 `{bundle_pv}`；`deps` 同样适用。

在 gentoo-zh-drafts 建仓库需要组织权限。没有权限时交给 gentoo-deps：包名是 `{P}` 用 `deps`，否则用 `bundle` 指向它的 `generator.yml`。

drafts 仓库用 [golang-dist-mirror-action](https://github.com/projg2/golang-dist-mirror-action) 定时同步上游时，不用写 `deps` 或 `bundle`。例如 `gentoo-zh-drafts/mihomo` 每小时同步一次，release 自带 `-vendor.tar.xz` 与 `-deps.tar.xz`。

### 审核与求助

维护者会在 PR 中指出需要修改的地方，并协助你完成修改；看不懂 CI 报告时，直接在 PR 中提问。

overlay 相关的问题优先在 [GitHub Issues](https://github.com/gentoo-zh/overlay/issues) 提出，也可以在[论坛](https://forum.gentoozh.org/)或 Telegram 群组 [@gentoo_zh](https://t.me/gentoo_zh) 讨论。
