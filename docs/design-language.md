[English](design-language.en.md)

# 设计语言

本站使用 Astryx docsite 的主题与文章外壳，再按内容组合图库、表格、指南和仪表板。当前组件与主题代码是实现依据；模板名称只说明结构来源。

## 主题与样式归属

`src/theme/gentoo.ts` 使用中性黑白背景、半粗标题、加大圆角和胶囊按钮。`--color-accent` 使用 Gentoo 紫，`--color-accent-muted` 使用淡紫色；文字和图标的强调色令牌使用中性墨色。

`Base.astro` 加载 Astryx reset、组件样式和生成主题，自托管 Figtree 400、600 拉丁子集；中文使用系统字体。默认跟随系统主题，`ThemeScript.astro` 在首绘前读取 `gz-theme`，导航保存用户选择。

| 位置 | 职责 |
|---|---|
| `src/theme/gentoo.ts`、`src/theme/built/` | 主题源文件与生成的 CSS、JavaScript、类型；修改源文件后执行 `pnpm theme`，不手改产物。 |
| `src/theme/scale.ts` | 间距、按钮、图标、头像、网格、卡片、表格与模板尺寸。 |
| `src/theme/layout.stylex.ts` | 正文与数据宽度、目录、侧栏字体、网格列及媒体／容器断点。 |
| `src/theme/home.stylex.ts`、`src/ui/home/home.styles.ts` | 首页布局、局部圆角和头像墙动画。 |
| `src/markdown/MarkdownBody.module.css` | `SectionPage` 与 `BlogArticle` 共用的正文排版，源自 docsite；这是唯一登记的正文 CSS 模块。 |
| `src/markdown/CodeHighlight.css`、`codeTokenizer.ts` | 构建期语法高亮与 Shell 提示符样式，适配自 Astryx CodeBlock。 |
| `src/markdown/PostMarkdown.tsx`、`StaticCodeBlock.tsx` | 标题、永久链接、行内代码与静态代码块；Markdown 插件同在 `src/markdown/`。 |

组件属性优先；自定义样式使用 `stylex.create()`、`xstyle` 和语义令牌。`astro.config.ts` 通过 `@stylexjs/unplugin` 编译 StyleX，不注入运行时样式。颜色在主题定义，尺寸在 `scale.ts` 或 `layout.stylex.ts` 定义，不在页面重复硬编码。不引入 Tailwind 或额外全局 CSS；原生元素与 CSS 例外以 `scripts/lib/ui-rules.mjs` 为准。

## 页面结构

`Base.astro` 与 `SiteShell` 提供站点外壳，`SectionLayout.astro` 添加分类侧栏。`PageHeader` 统一页面标题和描述；`SectionPage` 提供正文、组件插槽、目录及前后页。数据页可加宽数据区域，状态页使用 `isFullWidthDataPage` 提供自己的标题与布局。

| 页面 | 结构来源与当前组件 |
|---|---|
| 首页 | `HomePage` 改编自 Astryx docsite 首页：分栏首屏与 CSS 动画贡献者头像墙、六个功能入口、社区列表、文章和赞助标志。 |
| 五个分类与主题入口页 | Product Gallery 的等高卡片；`SectionLanding` 与 `PageEntries` 共用 `LandingBlocks`，桌面三列、平板两列、手机单列，保留旧卡片锚点。 |
| 技术指南与 ISO | `documentation-technical` 的编号步骤；`GuidePage`／`GuideProcedure` 放入 `SectionPage`，`IsoPage` 组合下载列表与写入步骤。 |
| FAQ、Paste、参与及说明页面 | docsite `DocPageLayout`；各页面直接组合 `SectionPage` 插槽，Paste 提供网页与命令行入口。 |
| 镜像与软件包 | `table-page`；`MirrorTable`、`OfficialMirrorTable`、`PackagesTable` 使用宽数据区域。 |
| 状态 | `dashboard-alert-rail` 与 `TableRowStatusTable`；`StatusDashboard` 显示服务摘要、历史图表与状态表；首页提供状态页链接。 |
| 文章列表与详情 | `BlogIndex` 使用搜索、标签筛选和分隔行；`BlogArticle` 使用 docsite 文章布局与共用 Markdown 正文。封面只取 front matter 或正文首张图片。 |
| 标签 | `TagsPage` 使用分隔行与计数。 |
| 贡献者 | `library` 的 `ContributorsLibrary` 提供搜索、筛选、排序和头像卡片；`ContributorProfile` 静态渲染标题、元数据和仓库表。 |
| 开销 | `table-collapsible`；`CostsPage` 使用汇总数字、独立分组表格、紧凑行与分组总计。 |
| 致谢、标志与频道 | `ThanksPage` 展示赞助，`LogoPage` 使用图片下载块，`ChannelsPage` 使用分组频道表格。 |
| 404 与跳转 | `NotFoundPage` 提供返回入口，`RedirectPage` 提供跳转目标。 |

文件浏览链接到外部下载站；feed 与附件不使用页面外壳。导航分类、顺序、链接和历史卡片锚点统一登记在 `src/ui/chrome/sections.ts`。

## 组件、图标与交互

密集的软件包、镜像、服务状态和账目使用 `Table` 或分隔行。`Card` 用于统计、图库和身份预览，`ClickableCard` 用于目的地入口，沿用组件库的悬停行为。`Badge` 只表示数量，`Token` 表示分类或默认项，`StatusDot` 配合可见状态文字；提示使用 `info`、`warning`、`error` 级别的 `Banner`。

`src/ui/chrome/icons.tsx` 集中保存 Lucide SVG 快照、`SvgProps` 与 `Lucide` 包装，默认隐藏装饰性图标的辅助技术语义。图形取自 lucide-react，`Hash` 为 0.468.0，文件保留许可证。`download/PackagesIcons.tsx` 只重新导出，`section/entryIcons.tsx` 按页面 ID 映射图标；GitHub 与频道品牌标志各自保留独立模块。

静态卡片的空白区域点击由 `src/ui/chrome/cardLinks.ts` 委托，已挂载的 Astryx 卡片使用自己的处理器。内嵌链接、按钮、输入控件与文字选择保留原行为；实现细节见[架构](architecture.md#客户端交互)。

设置指南使用 `GuideSetup` 的镜像选择器、渠道切换、sudo 开关和可选手动／快速标签。代码在服务端与客户端共用改写规则，复制内容与显示内容一致。无 JavaScript 时默认命令仍可读，两个面板均显示。

## 动效与文案

菜单、抽屉和对话框沿用 Astryx 动效。自定义过渡使用 duration 与 easing 令牌；`PostMarkdown` 标题链接和首页自定义动效遵守 `prefers-reduced-motion`。目录使用普通锚点。

界面消息在 `src/i18n/{zh-cn,zh-tw,en}.json`，使用 `gz.` 前缀及 ICU 参数。三语分别撰写，不做简繁转换。开发文档提供内容对应的简体中文与英文版本。
