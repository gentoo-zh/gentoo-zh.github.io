[English](architecture.en.md)

# 架构

本站使用 Astro 7、React 19 和 Astryx 0.7.0 生成静态 HTML，交互区域单独加载客户端代码。`pnpm build` 依次执行 Astro 构建、`scripts/build-seo.mjs` 和 Pagefind 索引，产物位于 `dist/`。SEO 脚本生成封面与头像缩略图、补齐非首页图片尺寸，并从 canonical、hreflang 和 HTML 跳转生成 `sitemap.xml` 与 `_redirects`；404 和跳转页不进入 sitemap。构建时区固定为 UTC。

## 层次与数据流

| 位置 | 职责 |
|---|---|
| `src/content/` | 加载 `content/<locale>/` 下的 Markdown，查询文章、单页与贡献者，生成 feed 数据。 |
| `src/data/` | 解析、校验结构化数据，计算开销，整理镜像端点与排序。 |
| `src/markdown/` | Astryx Markdown 渲染、Hugo 标题锚点、行内 HTML、代码标题与提示符、构建期语法高亮、`callout`／`details` 短代码及共用正文样式。 |
| `src/ui/` | 页面、Astryx 组件组合与交互岛；`renderStatic.ts` 用 React `prerender` 等待渲染完成。 |
| `src/theme/` | 主题源文件与生成产物、尺寸常数及布局样式。 |
| `src/i18n/` | 三语消息、语言标记、路径生成及消息子集。 |
| `src/pages/`、`src/layouts/` | Astro 路由、构建期取数及页面外壳。 |

`src/content.config.ts` 定义 `posts`、`sections`、`pages`、`contributors`、`contributorsIndex` 及四个 YAML 数据集合。`src/data/loader.ts` 的 `yamlFile` 解析文件，schema 校验失败会中止构建；`src/data/entries.ts` 的 `loadData` 读取集合中唯一的同名条目。

| 输入 | 使用方式 |
|---|---|
| `data/gz_costs.yaml` | `costsSchema` 校验，`src/data/costs.ts` 计算付款、周期与累计开销。 |
| `data/gz_mirrors.yaml` | `mirrorsSchema` 校验，`src/data/mirrors.ts` 选择语言默认镜像并排序。 |
| `src/data/official-mirrors.json` | `officialMirrorsSchema` 校验；通过 source ID 引用 YAML 中的 distfiles、Git、rsync 端点，其余 distfiles 端点直接定义。官方镜像表、官方配置指南及安装介质选择器共用这些数据。 |
| `data/gz_channels.yaml` | `channelsSchema` 校验二进制包渠道。 |
| `data/gz_sponsors.yaml` | `sponsorsSchema` 校验；首页 `homeData.ts` 与致谢页均通过 `loadData('sponsors')` 读取。 |
| `src/data/overlay-stats.json` | 为首页提供提交数量。 |
| 贡献者 Markdown | `contributorsLoader.ts` 加载，`contributorOrder.ts` 分组排序；`scripts/update-contributors.py` 调用 `scripts/contributors/` 处理 GitHub 访问、头像和页面更新，保留手写正文。分组和页面生成共用 `data/contributor-roles.json` 中的标签、别名与顺序。 |

指南仍属于 `pages` 集合。`src/content/guides.ts` 的 `guideSchema` 按 slug 验证步骤、旧锚点、手动／快速内容及设置提示；集合加载和 `guidePaths()` 均执行校验。路由调用 `src/layouts/GuideLayout.ts` 的 `guideLayout()`，统一取得文章路径、镜像设置、插槽与 `GuidePage`，再交给 `SectionLayout.astro`。

`eslint.config.js` 限制跨层导入。正文不使用 MDX 或 Astro Markdown 渲染管线；React 静态渲染不依赖 Astro 的 React 集成。

## 路由与页面登记

`src/i18n/routes.ts` 统一路径：简体中文位于根目录，繁体中文与英文使用 `/zh-tw/`、`/en/`。`src/pages/[...locale]/` 生成各语言路由；缺译文不回退，语言菜单只提供已有译文。Markdown 文章链接仅在目标译文存在时本地化，其他页面链接添加语言前缀，文件链接保持原样。

`src/ui/chrome/sections.ts` 登记五个分类、页面顺序、内部页面、自有路由、外部服务及旧卡片锚点，供顶栏、侧栏、分类入口、页脚和前后页导航使用。外部服务在新标签页打开。旧别名、分页、`/zh-cn/` 和文章附件保留原地址契约。`src/pages/[...locale]/404.astro` 渲染各语言的完整错误页；`build-seo.mjs` 将产物移到 `/404.html`、`/en/404.html` 和 `/zh-tw/404.html`。这些页面设置 noindex，无 JavaScript 时也提供本语言的返回链接。

## 页面外壳与正文

`Base.astro` 加载样式、字体、文档头与 `SiteShell`，独立渲染导航岛。`SectionLayout.astro` 添加分类侧栏、当前页面上下文、源码编辑链接与目录脚本。`PageHeader` 统一标题和可选描述；`SectionPage` 组合标题、Markdown、插槽、目录与页尾。

Markdown 中独占一行的 `<!-- slot:name -->` 插入组件，`<!-- steps -->` 等价于 `steps` 插槽；名称只允许小写英文字母。值可以是 React 节点，或含 `node` 与可选 `outline` 的 `PageSlot`。缺少被引用的插槽会使构建失败。`<!-- anchor:id -->` 保留旧片段地址。

正文 h2–h4、插槽目录及显式 `outline` 按顺序合并。普通页面的目录在桌面右侧显示，1024px 及以下改为正文中的原生折叠目录；`OutlineSpy.astro` 更新当前位置。`isDataPage` 加宽数据区域，保留随断点切换的目录；标题和 Markdown 保持正文宽度。`isFullWidthDataPage` 让状态仪表板提供自己的标题与全宽布局。`children` 仍可在正文后追加内容。

`GuidePage` 用 `GuideProcedure` 渲染编号步骤，并将步骤与正文标题加入目录。`SectionLanding` 与入口页的 `PageEntries` 共用 `LandingBlocks`：桌面三列、平板两列、手机单列。设计与样式归属见[设计语言](design-language.md)。

`StaticCodeBlock` 通过 `codeTokenizer.ts` 在构建期生成高亮 span，长代码块也在构建期处理。`CodeHighlight.css` 将 Astryx CodeBlock 的令牌样式适配到静态 HTML。Shell 的 `$ ` 与识别出的 `# ` 提示符使用独立令牌；`CopyCode.astro` 复制时移除提示符，并保留设置控件对显示命令的改写。

`build-seo.mjs` 调用 `scripts/lib/cover-thumbnails.mjs`，为标记的本地文章封面生成 1×／2× WebP，文件放在 `/_astro/` 且名称带内容哈希。`scripts/lib/avatar-thumbnails.mjs` 为贡献者头像生成 1×／2× 图片，URL 固定并与水合组件共用。头像衍生图不使用 immutable 缓存，原始附件继续保留。

## 客户端交互

| 区域 | 边界 |
|---|---|
| 导航与侧栏 | `chrome/nav-client.tsx` 水合 `NavIslandRoot`；分类侧栏仅水合折叠分组，固定外框保持静态。 |
| 卡片 | `chrome/cardLinks.ts` 为静态卡片空白区域委托点击；跳过已处理事件、已挂载 Astryx 卡片、内嵌控件与文字选择。中键、修饰键和 `_blank` 打开新标签页，其余触发原链接。 |
| 设置切换器 | `guideSetupPage.ts` 在服务端按语言默认值改写代码并渲染 `GuideSetup`；`guide-setup-client.tsx` 水合控件，切换镜像、渠道和 sudo 时更新两个面板的代码。两端共用 `guideSetup.ts`；复制按钮读取当前显示内容。选择保存在 localStorage，官方镜像单独保存，面板不保存。 |
| 手动／快速面板 | HTML 包含两份内容；`GuideSetupScript.astro` 首绘前按 URL 片段或默认手动模式隐藏另一份，水合后处理标签及片段变化。禁用 JavaScript 时两份均显示。 |
| 搜索与贡献者 | 搜索打开时才加载 `SearchDialog` 和 Pagefind；只有贡献者列表水合，个人页静态渲染标题、元数据与仓库表。 |
| 状态 | `StatusScript.astro` 在 `/status/` 选择 `StatusDashboardScript.astro`，空闲加载 `StatusDashboard` 与图表；静态 HTML 保留未知状态。 |
| 数据与小型增强 | 软件包表格在进入视口并空闲后加载；镜像健康脚本更新 DOM。开销摘要使用水合岛；复制、文章筛选与旧锚点使用小型脚本，首页头像墙使用 CSS 动画。 |

客户端入口统一使用 kebab-case 的 `*-client.tsx` 文件名。`chrome/hydrateIsland.tsx` 共用导航、侧栏、贡献者、开销和指南的水合流程；`IslandMount.tsx` 定义 `ISLAND_ATTRIBUTE` 与 `IslandKind`。调用方保留各自组件与 identifier prefix；首绘脚本和取数后挂载的入口独立处理。

## 门禁与保留例外

在仓库根目录执行 `pnpm check`，依次完成类型、主题、数据、代码渲染、贡献者、UI 和转换工具检查，再构建并检查产物。下列产物检查单独执行前需要先运行 `pnpm build`。

| 检查 | 约束 |
|---|---|
| `typecheck`、`check:theme` | 类型与生成主题一致性。 |
| `check:content-parity` | 构建后检查 Hugo 历史 URL 和附件、图片等静态资源仍存在；不再比对内容字节。 |
| `check:data`、`check:contributors` | 数据 schema、开销与镜像回归、贡献者排序及更新脚本离线重放。 |
| `check:code` | 提示符识别、令牌范围、镜像与 sudo 改写、长代码块高亮及 HTML 转义；无需先构建。 |
| `check:ui`、`check:no-convert` | ESLint、Astro 结构、分层、样式、尺寸、界面文字与禁止简繁转换工具。 |
| `check:i18n`、`check:urls` | 三语消息与输出语言、旧 URL、跳转、附件、feed、历史片段、站内链接及重复 id。 |
| `check:seo` | 元数据、单个 h1、图片尺寸、字体预载、sitemap、301 映射及 404 的 noindex。 |
| `check:budget`、`check:search`、`check:headers` | 脚本归属与 Brotli 预算、各语言非空 Pagefind 索引及 512 KiB 上限、缓存与安全响应头。 |

切换后仍保留 Hugo 基准作为历史证据。`scripts/baseline/historical-assets.json` 记录固定提交的公共资源和文章附件 URL，不含托管配置（`CNAME`、`_headers`）。`check:urls` 按当前文章目录验证 feed，允许新增标题，但保留历史 ID。`check:data` 用 `scripts/fixtures/cost-corrections.json` 逐字段覆盖旧开销基准，待 master 纳入修正并重建基准后移除覆盖。历史片段由 `scripts/baseline/historical-fragments.json` 全量检查，贡献者 URL 也参与检查。

`scripts/lib/ui-rules.mjs` 登记原生文档头、图片、SVG、带 `stylex.props` 的布局容器、`IslandMount.tsx` 的 HTML 注入、正文 CSS 模块及静态 `CodeHighlight.css` 例外。客户端脚本必须登记在 `SCRIPT_OWNERS`；`scripts/lib/budgets.mjs` 按首个路由匹配规则，沿导入闭包去重计算 Brotli 字节。空闲加载计入初始预算，只有登记为 `onDemand` 且仅经按需路径到达的脚本单独计费。
