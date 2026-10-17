# 改造计划书：gentoozh.org 迁到 Astro + React + Astryx（试点：文章区）

体量：大。写与审分头脑；计划先交 GPT-6.1 sol 主审、Haiku 交叉复核，结论经核实再改。
状态：试点阶段（P1），无人值守执行，只在本地，不推送、不合并、不发布。

## 一页简报

**背景**
- 两个站，两套技术：gentoozh.org 是 Hugo + Hextra + 补丁主题（326 行覆写 CSS）；distfiles.gentoozh.org 是 19 个手写 HTML，靠 nginx 提供，i18n 写在每页的内嵌字典里。
- 同一份东西两边各写一遍：品牌图、致谢、镜像、FAQ、关于、标志页、复制按钮、sudo 开关、换源器。
- 视觉上，框套框、强调色铺满、字级 23 种、圆角 8 种、三套灰，读起来像 AI 模板。
- 维护者熟 React，不熟 Go template。

**目标**
1. 一个 Astro + React 代码库，界面只用 Astryx 组件与模板组合，不自写组件库。
2. 内容零改动：`content/` 原样复制，贡献者仍只写 Markdown。
3. 规则可检查：每条规则配一个会变红的门禁。
4. 照抄 Astryx 官网的外壳与页面；外壳（导航岛与两段内联脚本）有固定的脚本预算，内容在没有脚本时完整可读；文章页另带复制按钮的委托脚本。

**非目标**
- 不在本阶段迁 distfiles 站。它的动态部分（`_ls`、`packages.json`、`status.json`、rsync）留在 nginx，以后只迁静态页。
- 不重写文章，不把 `.md` 改成 MDX，不做简繁转换。
- 不自写设计系统、不加 Tailwind、不做运行时主题编辑。

**备选方案**

| 方案 | 结论 |
|---|---|
| 留 Hextra，只收 token | 覆写关系不变，升级仍会坏，驳回 |
| 自写 Hugo 主题 | 仍是 Go template，维护者不顺手；两站合并难，驳回 |
| Next.js 静态导出 | 内容站用不到 App Router，构建与依赖更重，驳回 |
| **Astro + React + Astryx** | 内容集合与路由式 i18n 内建，默认零 JS，React 只在构建期渲染；采用 |

**风险**
- Astryx 是 Beta，0.x 版本约一周一两版，49 版中 21 版有破坏性变更，所以版本钉死，升级单独开分支。
- Astryx 缺页脚、语言切换、主题切换，由下文「缺口」一节逐项定法。
- 整篇正文水合要 174 KB（brotli，spike 实测），所以正文不水合；P2 只把顶栏做成导航岛（约 135 KB），用预算门禁封顶。

## 不变量（破坏时会发生什么）

| # | 不变量 | 破坏时 | 检查 |
|---|---|---|---|
| I1 | `content/*/posts/**` 与 master 逐字节相同 | 迁移悄悄改了文章，作者不知情 | `check:content-parity`：对比 master 的 blob 哈希 |
| I2 | 当前阶段清单里的 URL 全部保留：zh-cn 在根、`/zh-tw/`、`/en/`、`/posts/<目录名>/`、三语各一个 `feed.xml`、6 个旧 `aliases`（原样照抄，不由日期推算） | 外链、书签、RSS 订阅失效 | `check:urls`：基准是用钉死 SHA 构建出的 Hugo 输出树，按阶段清单逐条比对；feed 比对条目，且每条带全文（文章的标题锚点齐全、地址为绝对地址）；跳转比对目标；不开语言回退 |
| I3 | 界面元素只来自 Astryx 组件；`src/ui/` 只放组合；仓库里没有手写 CSS | 又长出一套自写组件库 | `check:ui`：ESLint（AST）只放行白名单里的原生元素，`createElement` 不许传标签名；`.astro` 由 Astro 编译器解析，页面只放导入、数据与组件；`src/` 里不允许出现 `.css`（主题构建产物除外） |
| I4 | 颜色、字级、间距、圆角只在 gentoo 主题源文件里定义 | 23 种字级卷土重来 | 主题源文件之外禁止 hex/rgb/px 字面量（由 I3 的 ESLint 规则与「无手写 CSS」共同覆盖） |
| I5 | 界面字符串全部出自 i18n 目录，三语 key 集合一致；每棵 React 树都包 Astryx 的 `InternationalizationProvider` | 硬编码、漏译；Astryx 内置文案退回英文 | `check:ui` 扫 JSX 子节点与可见属性里的字符串和模板字面量，`.astro` 不许有文字节点；`check:i18n` 比对 key 集合、检查 ICU 语法，并逐页（列表、文章、标签索引、标签页）检查 `<html lang>` 与 Astryx 文案的语言 |
| I6 | 每条路由的客户端 JS 有预算，脚本归属明确 | React 慢慢渗进内容页 | `check:budget`：对每个 HTML 沿静态与动态 `import` 求脚本闭包（含内联与 modulepreload），去重后逐个 brotli 求和；P1 列表与标签页 0、文章页不超过 1 KB，P2 起带外壳的页面为 `CHROME`、文章页另加 1 KB（`scripts/lib/budgets.mjs`）；归属来自登记表（内联脚本的 `data-owner`、打包模块的去哈希文件名）；导航岛以外不得有 `aria-expanded` 控件 |
| I7 | 三语直接写，仓库里没有任何简繁转换 | 机械转换产生错词，并覆盖各语言的差异 | `check:no-convert`：禁止出现 opencc 与 `sync_to_tw` |
| I8 | 提示级别只有 info / warning / error，对应 Astryx Banner | 级别各写各的 | `check:ui` 校验 callout 的 type 白名单 |

验收句：**把 `content/` 从 master 复制进来，`git diff master -- content/*/posts` 为空，三语每篇文章都能渲染；每种语言至少一篇文章与 Hugo 输出做渲染对照（标题 id、原生 HTML、短代码、代码块、图片），差异逐条登记。**

## 架构

```
next 分支（孤儿分支，不带 Hugo 历史与文件）
├─ astro.config.ts        i18n：defaultLocale zh-cn、prefixDefaultLocale false
├─ content/               与 master 同路径同内容（P1 只带 posts）
├─ src/
│  ├─ content.config.ts   集合与 Zod schema（title/date/tags/authors/description/featured/aliases/location/summary）
│  ├─ i18n/               zh-cn.json zh-tw.json en.json，ICU 消息，键名有类型
│  ├─ theme/              gentoo 主题源文件，由 `astryx theme build` 生成静态 CSS
│  ├─ markdown/           remark 插件：把 {{< callout >}}、{{% details %}} 解析成组件节点
│  ├─ ui/                 只做组合：SiteShell、PostList、PostMeta（用 Astryx 的 TopNav、Banner 等拼）
│  └─ pages/[...locale]/  路由：posts 列表、文章页、feed.xml、旧地址跳转
├─ scripts/check-*.mjs    门禁（见不变量）
└─ docs/                  设计语言、架构、工作流三份，以及本计划
```

- **数据流**：Markdown → 内容集合（Zod 校验）→ remark 插件把短代码转成节点 → 由 Astryx 组件渲染 → 静态 HTML。
- **部署**：P1 只做本地构建与预览，不碰 Cloudflare。

### 正文渲染（经核实后定）

不用 Astro 的 Markdown 管线（Astro 7 默认是 Sätteri，不执行 React 组件节点）。内容集合只读原文，正文交给 Astryx `Markdown` 组件在 SSR 时渲染：

- Hugo 短代码由 Astryx `Markdown` 的插件协议解析（`plugins` 把文本模式转成 React 元素，见 `dist/Markdown/Markdown.d.ts`）：
  - `{{< callout type=info|warning >}}` 转成 `Banner collapsible={false}`，标题从 i18n 取。
  - `{{% details title=… %}}` 转成带标题的 `CodeBlock`，展开、不可折叠；普通代码块经 `components.code` 同样关掉折叠。
- `{#id}` 标题锚点由插件剥离并写回 id；自动 id 与 Hugo 的生成规则对齐（CJK 保留原字），用片段链接检查覆盖。
- 代码高亮用 Astryx 自带的分词器，它支持 bash、sh、zsh、shell（`CodeBlock/tokenizer.ts`），不引入 Shiki。
- 原生 HTML（`<del>`、`<small>`）照常渲染，用渲染对照检查覆盖。

**无 JS 时内容必须完整可读。** 折叠与复制按钮的交互由 P1 第一步的 spike 二选一：
1. 静态输出，加一段事件委托的小脚本，只调用 Astryx 输出的 DOM 与 aria 状态，不另写组件。
2. 整篇正文做成一个岛并水合。

哪条路能让每条路由的完整依赖闭包更小、门禁更少例外，就用哪条。spike 结果是第 1 条，数据见架构文档。

### 缺口与定法

| 缺口 | 定法 |
|---|---|
| 页脚 | 用 Astryx `Stack`、`Link`、`Text` 组合，放在 `src/ui/SiteFooter`，不自带样式；AppShell 0.7.0 没有页脚槽，页脚暂在 `main` 里，见架构文档的已知缺口 |
| 语言切换 | P2 起是一个图标按钮，菜单列三种语言全称，带 `lang` 与 `hreflang`，缺译的置灰；没有脚本时按钮链到下一个有译文的语言 |
| 主题切换 | P2 按官网的做法：`<html data-theme>` 记录手动选择，首绘前由内联脚本从 `localStorage` 恢复，导航岛的按钮切换并写入；静态树不包 `<Theme>`，见架构文档 |
| 折叠 | 不折叠：页面不水合，折叠控件不会响应，所以 details 与代码块全部展开 |
| 代码高亮 | Astryx 分词器，已支持 bash |
| 手机菜单与下拉 | P2 在导航岛里用 `MobileNav` 与 `DropdownMenu`；没有脚本时按钮链到页脚的站点地图 |

## 基准与照抄清单

基准是同一作者的两个 Astryx 项目（其中一个是私有项目）。

- **必抄**
  - Astryx CLI 生成的 AGENTS 规则（重新生成）。
  - i18n 的类型化目录与 ICU 校验思路：`generate-i18n`、`i18n-catalog-check`。
  - CJK 字体栈。
  - reduced motion 与缓动 token。
  - stylelint 禁硬编码。
  - pnpm 加 engines 钉 Node。
- **改写后抄**
  - `check-i18n`：去掉债务与 git 逻辑，补上 `.astro`。
  - `check-imports`：改成本站的层次边界。
  - 门禁自测：往沙箱注入违规，确认门禁会变红。
  - e2e 的 `run.mjs`。
  - `PageFrame` 与 `docs/Article` 的结构（`documentation-technical` 模板）。
- **不抄**
  - 产品页面、`api`、`domain`。
  - i18n 债务表。
  - 产品路由的 e2e。
  - 运行时语言状态。
  - 装饰性副主题。
- **清除**
  - 私有项目的全部标识：包名前缀、公司名与地址、演示 IP 与域名、文档路径。名单不入库，复制时逐项核对。
  - 原 git 历史。

## 阶段

| 阶段 | 分支 | 内容 | 验收 | 不做 |
|---|---|---|---|---|
| **P1（本次）** | `next` | 骨架、gentoo 主题、单一路由模型（`src/i18n/routes.ts` 生成三语路径）、TopNav 与页脚、文章列表、文章页、标签、三语 feed.xml、6 个旧地址跳转、文章引用的 `static/img` 与页面包图片、门禁、三份文档 | P1 清单（文章、列表、标签、feed、跳转）的 URL 全部存在；全部 `pnpm check` 绿；I1–I8 各驱红一次再改回绿；本地预览三语、明暗、390px 截图无回归；完成报告 | 首页、其他单页、贡献者、手动主题切换、distfiles、部署；文章里指向后续阶段页面的链接登记为已知缺口 |
| P2 | `next-p2` | 先做地基：照抄官网的外壳（服务栏、五个分类的顶栏、语言菜单、主题切换、手机菜单、页脚站点地图、导航岛）、IA v3 的分类配置与落地页、`SectionLayout`、首页、文章区改版、短代码登记表、脚本预算与 StyleX 门禁；再由页面阶段逐页改写 about、faq、costs、thanks、logo、mirrorlist、changelog、contributing、paste 与 distfiles 迁入的页面 | 地基：`pnpm check` 绿，新门禁各驱红一次；页面：各页进入 `PAGE_SLUGS` 并通过 `check:urls` | 贡献者、部署 |
| P3 | `next-p3` | 贡献者页（月度脚本改为写数据，不写 content）、搜索（Pagefind）、每页 `index.md` 输出、`_headers`、Cloudflare 部署预览 | 基准输出树的全部 URL 存在，预览环境与线上逐页对照 | distfiles |
| P4 | 另议 | distfiles 静态页迁入，产物交给现有 `publish-site.sh` | 由维护者定 | 动态端点 |

上一阶段合入并经维护者确认之前，不开始下一阶段。

## 版本（P1 钉精确版本，安装时以 registry 实际最新稳定版为准）

Astro 7.3.x、React 19.x（由 `react-dom/static` 在构建期渲染，不装 @astrojs/react）、TypeScript strict、@astryxdesign/core 与 cli 0.7.0（精确版本）。pnpm 写进 `packageManager`，用本机实测的版本；Node `>=22.12.0`，这是 Astro 7 的下限。依赖与工具链的实测矩阵写进架构文档。

## 工作流（无人值守）

- 单人、单分支、单 worktree：`/scratch/ssd/gentoozh-next`。因为 node_modules 不能放在有快照的家目录，所以 worktree 放在 scratch；提交即持久化，进主仓库的 `.git`。
- 门禁在里程碑执行：骨架完成一次，文章区完成一次，收工前做完整一遍。不是每次提交都跑。
- 代码由 Opus 写；审查由 GPT-6.1 sol 主审、Haiku 复核，结论先核实再动手。
- 收工时清理：删 PoC 与临时截图；worktree 保留，等维护者看完再删。
- 新增依赖是本次授权的例外，依据是维护者 2026-10-15 的「试试看做完本地我先看看」。

## 要谁定

1. P1 验收后，`next` 分支是否推上 GitHub。
2. distfiles 是否按 P4 迁入。
3. 正文渲染走 spike 的哪条路，由数据决定，报告里说明。（已定：静态输出加委托脚本。）

## 修订表（第一轮：GPT-6.1 sol 主审，Haiku 复核；均已核实）

| 来源 | 发现 | 处理 |
|---|---|---|
| sol 1、3 | 渲染桥接未定；退路的 prose 样式表违背「不自写」 | 采纳。已核实 Astryx `Markdown` 有插件协议，改由它渲染并解析短代码，删掉退路 |
| sol 2 | Astryx 分词器其实支持 bash | 采纳。已在 `CodeBlock/tokenizer.ts` 核实，不引入 Shiki |
| sol 4 | Banner 默认可折叠，会把内容收起来 | 采纳。已在 `Banner.js` 注释核实，改用 `collapsible={false}`，标题走 i18n |
| sol 5、Haiku | sitemap 不能当兼容基准；feed 有三个；aliases 要原样照抄 | 采纳。改用钉死 SHA 构建出的 Hugo 输出树 |
| sol 6 | i18n 配置不会生成路由 | 采纳。新增单一路由模型 |
| sol 7 | 阶段验收与范围冲突 | 采纳。改为按阶段的 URL 清单，补上 contributing、paste、overlay |
| sol 8、Haiku | `{#id}`、静态图片、原生 HTML 会丢 | 采纳。插件处理 `{#id}`，P1 带上文章引用的图片，加渲染对照 |
| sol 9 | Astryx 没有 Provider 时退回英文 | 采纳。并入 I5 |
| sol 10 | 手动主题切换的契约不一致 | 采纳。P1 只跟随系统，手动切换移到 P2 |
| sol 11 | 门禁有洞 | 采纳。改用 ESLint AST 规则、禁止手写 CSS、按路由计算依赖闭包 |
| sol 12 | Node 下限是 22.12.0 | 采纳。pnpm 用本机实测的版本，不追 registry 的最新版 |
| Haiku 3 | 语言回退会悄悄改变 URL 集合 | 采纳。不开回退，英文缺的两篇不生成 |

## 修订表（第二轮：P1 实现复审，两位审查者交叉核实）

| 编号 | 发现 | 处理 |
|---|---|---|
| 1 | 分层规则覆盖了共享的 StyleX、CSS 导入禁令 | 每层规则都并入共享清单 |
| 2 | 原生元素只禁了几种标签 | 改为白名单（`title`、`meta`、`link`、`img`），`createElement` 不许传标签名 |
| 3 | `{"文字"}`、`aria-label={"x"}`、模板字面量能绕过 I5 | 扫 JSX 子表达式与可见属性里的字符串、模板字面量及 `?:`、`&&` 分支 |
| 4 | `.astro` 几乎不受检查 | 用 `@astrojs/compiler-rs` 解析：页面只放导入、数据与组件，文档骨架只在登记的布局里，脚本只在登记的归属文件里 |
| 5 | 语言切换读作「简、繁、EN」 | 加完整语言名的 `aria-label` 与目标语言的 `lang` |
| 6 | 预算只算 HTML 直接引用的脚本，归属靠子串 | 按页求 import 闭包，归属改用登记表 |
| 7 | 长代码块的折叠控件没有处理程序 | 代码块全部经 `CodeBlock isCollapsible={false}` 渲染；`check:budget` 拦 `aria-expanded` |
| 8 | feed 只有摘要 | 与 Hugo 一样放全文，复用文章页的渲染，地址改为绝对地址 |
| 9 | 页脚在 `main` 里 | 属实；AppShell 没有页脚槽，移出会落在 `100dvh` 外壳下方且背景不同，暂缓，列入已知缺口 |
| 10 | 主题产物无人核对 | 产物移到 `src/theme/built/`，`pnpm check` 先跑 `check:theme` |
| 11 | 日期随构建机时区偏移一天 | 构建固定在 UTC |
| 12–17 | 标签大小写、空标题锚点、缺 pubDate 抛异常、死代码、复制失败无提示、i18n 只查列表页 | 逐条修复 |

## 修订表（第三轮：P2 改向，维护者确认）

| 编号 | 决定 | 原因与影响 |
|---|---|---|
| 1 | 照抄 Astryx 官网（SharedTopNav、SiteFooter、DocsShell、首页、博客组件、useThemeMode），注明 MIT 出处 | 官网是 Astryx 用法的权威样例；自己拼模板做不出同样的完成度 |
| 2 | 允许外壳带脚本：顶栏是唯一的导航岛，预算按实测定（`CHROME` 140 KB，brotli） | 语言菜单、手机菜单与主题切换都要脚本；正文仍是静态 HTML，没有脚本时可读 |
| 3 | 用官方插件编译 StyleX；I3/I4 改为「样式只经 StyleX（取 Astryx 令牌）或登记的上游 CSS 模块，主题以外没有十六进制与 px」 | 照抄的组件用 StyleX 写样式 |
| 4 | 统一尺度 `src/theme/scale.ts`，门禁拒绝间距与尺寸字面量 | 各页间距与按钮尺寸一致 |
| 5 | 页面是重新设计，不仿制 Hugo 的页面短代码；文章的 callout、details 保留 | 文章逐字节不变；页面 Markdown 会改写，所以 I1 只管文章与 `public/` |
| 6 | 信息架构第三版：服务栏、五个分类、落地页、左侧栏、首页结构；`src/ui/chrome/sections.ts` 是唯一配置 | 所有服务从主站一个入口进入；加一页只需一条配置与一个内容文件 |
| 7 | 旧地址照常可用：`/download/` 成为分类落地页，文章里指向它的锚点落到对应卡片 | 文章与外链不失效 |

