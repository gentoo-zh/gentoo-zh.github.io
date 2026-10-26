---
title: "网站贡献指南"
description: "文章、翻译、开发环境与提交流程"
---

## 社区网站（文章 / 翻译 / 文档）贡献指南

网站源码在 [gentoo-zh/gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io)，用 [Astro](https://astro.build/) 与 Astryx 组件构建。文章、翻译与修正都通过 Pull Request 提交。

### 项目结构 {#项目结构}

`content/` 按语言存放内容，`src/pages/` 定义路由，`src/ui/` 存放页面组件，`src/markdown/` 渲染正文。

### 内容组织 {#内容组织}

文章位于 `content/<locale>/posts/`，栏目页面使用 `content/<locale>/<section>/_index.md`。文章图片与正文放在同一目录。

### 配置文件 {#配置文件}

`astro.config.ts` 配置构建，`src/content.config.ts` 校验 front matter，`src/i18n/` 定义界面文本与语言路由。

### 主题与资源 {#主题与资源}

组件由 Astryx 提供。主题源文件是 `src/theme/gentoo.ts`，修改后执行 `pnpm theme` 重新生成 `src/theme/built/`。固定地址的资源放在 `public/`。

<!-- steps -->

### 准备环境 {#setup}

<!-- anchor:环境准备 -->

需要 Node.js 22.12 或更新版本与 pnpm 11：

```bash
$ git clone https://github.com/<你的用户名>/gentoo-zh.github.io.git
$ cd gentoo-zh.github.io
$ pnpm install --frozen-lockfile
$ pnpm dev        # 本地预览
```

### 写文章 {#write}

<!-- anchor:1-提交新文章 -->

<!-- anchor:多语言支持 -->

- 新文章放在 `content/<语言>/posts/<日期>-<名称>/index.md`，图片放在同一目录，正文用相对路径引用。
- 简体（`zh-cn`）、正体（`zh-tw`）、英文（`en`）三个版本各自撰写，不做自动转换；没有译文的语言可以先缺。
- front matter 只接受 `title`、`description`、`date`、`lastmod`、`tags`、`authors`（`name`、`image`、`link`）、`aliases`、`featured`、`image`、`cover`、`summary`、`paged`，拼错字段时构建失败。
- 可用的短代码：`callout`（`type` 为 `info`、`warning` 或 `error`）与 `details`。

长篇教程可以分页：在 front matter 加 `paged`，每个 `## N.` 标题各成一页，`## 1.` 之前的内容留在总览页。三个语言版本的节号必须一致。不分组时写 `paged: true`；`groups` 把侧栏目录分组，`from` 是该组第一节的编号：

```yaml
paged:
  groups:
    - title: 安装
      from: 1
    - title: 安装后
      from: 8
```

首页显示最新的三篇文章。

### 检查并提交 {#submit}

```bash
$ pnpm check      # 类型检查、内容与界面门禁，含一次构建
```

全部通过后推送到你的 fork，再在 GitHub 上创建 Pull Request。提交信息用英文，格式为 `<范围>: <祈使句>`，例如 `docs: Fix the binhost URL`。

<!-- /steps -->

<!-- anchor:3-文章署名与头像 -->

### 署名与头像

在 front matter 的 `authors` 写明作者，署名处显示头像、姓名与链接；省略 `image` 时只显示姓名：

```yaml
authors:
  - name: 你的名字
    image: /contributors/<你的标识>/feature.webp
    link: https://github.com/yourname
```

<!-- anchor:4-改进现有内容--技术改进 -->

### 改进现有内容

错别字、过时信息、使用技巧、缺失的正体中文与英文翻译，看到了都欢迎提交修正；模板、样式、性能与功能方面的改进也欢迎。

[贡献者列表](/contributors/)由 `scripts/update-contributors.py` 每月更新，统计 gentoo-zh 组织下符合条件的仓库提交，排除 fork、已归档仓库、机器人及配置中的排除项，并按个人提交总数排序。请勿手动编辑 `content/*/contributors/`。

### 提交 Pull Request

```bash
$ git checkout -b your-feature-branch
$ git add .
$ git commit -m "描述你的更改"
$ git push origin your-feature-branch
# 然后在 GitHub 上创建 Pull Request
```

<!-- anchor:markdown-格式 -->

<!-- anchor:中文排版 -->

### 写作规范

- 中文与英文、数字之间加空格；使用全角中文标点；数字与英文用半角。
- 专有名词保持原文，如 Gentoo、Portage。
- 图片放在文章目录内，用相对路径引用。
- 命令、路径、包名用行内代码或代码块，代码块注明语言；`bash`、`ini`、`conf`、`diff`、`yaml`、`toml` 等会自动高亮。
- 命令行加提示符：普通用户执行的命令（包括 `sudo`）以 `$ ` 开头，在 root shell 中执行的以 `# ` 开头；输出与文件内容不加。复制按钮会自动去掉提示符。
- 标题层级从 `##` 开始，不跳级。

### 常见问题 {#常见问题}

维护网站时常遇到的问题。

### 更新主题 {#如何更新主题}

同时更新 `@astryxdesign/core` 与 `@astryxdesign/cli` 的版本，执行 `pnpm exec astryx upgrade --from <旧版本> --apply`，再执行 `pnpm theme` 与 `pnpm check`。完整步骤见仓库 `docs/workflow.md` 的“升级 Astryx”。

### 添加栏目页面 {#如何添加新的栏目页面}

在 `content/` 下添加各语言的 `_index.md`，然后在 `src/pages/` 与 `src/ui/chrome/sections.ts` 注册路由和导航入口。完整步骤见 `docs/workflow.md` 的“新增页面”，组件插槽的用法见 `docs/architecture.md`。

<!-- anchor:2-简繁转换 -->

### 保持语言版本一致 {#简繁内容不一致怎么办}

三种语言分别撰写，不使用自动简繁转换。修改一种语言时，同步检查另外两种的事实与链接。

## 网站求助

遇到问题或有建议？

- **Telegram 频道**：[@gentoocn](https://t.me/gentoocn)
- **Telegram 群组**：[@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**：<https://github.com/gentoo-zh/gentoo-zh.github.io/issues>
- **网站事宜联络邮箱**：<zakk@gentoozh.org>

更多频道见[交流渠道](/channels/)。

## 许可协议

本站内容采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可协议，除非另有说明。代码贡献遵循项目的 MIT 许可。
