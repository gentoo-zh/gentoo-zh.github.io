[English](workflow.en.md)

# 工作流

在仓库根目录执行命令。环境要求见 `package.json`：Node.js 至少 22.12.0，pnpm 11.15.1；依赖固定精确版本。开发文档以简体中文和英文成对维护，网站内容仍为三语。

## 命令

| 命令 | 结果 |
|---|---|
| `pnpm install --frozen-lockfile` | 按锁文件安装依赖。 |
| `pnpm dev` | 启动开发服务器。 |
| `pnpm build` | 构建 `dist/` 并生成 Pagefind 索引。 |
| `pnpm preview` | 预览构建产物。 |
| `pnpm theme` | 从主题源文件生成 `src/theme/built/`。 |
| `pnpm typecheck` | 同步 Astro 类型并执行 TypeScript 检查。 |
| `pnpm check:code` | 执行静态代码渲染回归检查，无需构建。 |
| `pnpm check` | 执行全部门禁，包含一次构建。 |

各项 `check:*` 的职责及构建前置条件见[架构](architecture.md#门禁与保留例外)。完整检查按工作里程碑执行，不按每次提交重复。

## 新增页面

1. 先执行 `pnpm exec astryx build "<idea>"` 选择模板，再执行 `pnpm exec astryx template <name> <path>` 生成；已有页面保留框架，在原有区域内修改。使用组件前执行 `pnpm exec astryx component <Name>` 查看属性，改框架前执行 `pnpm exec astryx docs layout`。
2. 在 `content/` 对应语言目录中添加单页目录及 `_index.md`，按现有单页填写 `title`、可选 `description` 和页面专用字段。三语正文分别编写。
3. 在 `src/ui/` 组合页面，在 `src/pages/[...locale]/` 添加路由。参考现有分类路由，用 `pagePaths` 取页面与译文，使用 `SectionLayout`、`SectionPage`；指南先在 `src/content/guides.ts` 的 `GUIDE_SLUGS` 和判别 schema 中登记 slug，再用 `guidePaths()`、`guideLayout()` 生成 `GuidePage`。
4. Markdown 与组件混排时使用独占一行的 `<!-- slot:name -->` 及 `slots`。组件中的标题另传 `PageSlot.outline`，保留旧链接依赖的 id。数据页设置 `isDataPage`，不扩大正文行宽。
5. 在 `src/ui/chrome/sections.ts` 登记条目。同步三语消息；新增分类时同步类型与 `scripts/check-i18n.mjs` 的覆盖。`scripts/lib/url-manifest.mjs` 中的 `PAGE_SLUGS` 同时用于当前页面覆盖和 Hugo URL 兼容检查；没有旧站地址的新页面也需登记。
6. 若增加脚本，在 `SCRIPT_OWNERS` 登记来源并评估 `scripts/lib/budgets.mjs`；不要通过放宽门禁掩盖无归属脚本或超预算。

## 新增文章

文章采用目录包：在 `content/` 下对应语言的 `posts/` 内新增目录及 `index.md`，图片放在同一目录并使用相对链接。用其他语言的同名目录关联译文，不机械转换简繁体。

必填 front matter 为 `title`、`description`、`date`；可选 `tags`、`authors`、`aliases`、`featured`、`summary`、`lastmod`、`image`、`cover`。`image` 与 `cover` 接受 URL 字符串或 `{src, alt?}` 对象；封面依次取 `cover`、`image` 或正文首张图片。作者字段为 `name`，可选 `image`、`link`；`locale` 与 `slug` 由加载器补充，未知字段会失败。标题可用 `{#id}` 固定锚点；短代码仅有 `callout`（`info`、`warning`、`error`）和 `details`。

切换当天合并 `p2-cutover-gate` 后，可直接新增文章、编辑正文或增加标题，再执行 `pnpm check`。保留旧文章 URL、附件和图片 URL，以及历史标题 ID；改写标题时用 `{#原有-id}` 保留锚点。`check:content-parity` 在构建后检查旧 URL 和资源，`check:urls` 检查历史锚点及当前文章的 feed 完整性、日期和顺序。`scripts/baseline/hugo.json` 是历史证据，不为新增或编辑文章重新生成。切换前继续保留原逐字节检查，不提前合并此分支。

## 新增界面消息

在 `src/i18n/zh-cn.json`、`src/i18n/zh-tw.json` 和 `src/i18n/en.json` 中添加相同的 `gz.<功能>.<名称>` 键，各自撰写译文，通过 `useMessage` 获取。参数用 ICU 格式；不要在 JSX 写可见字面文字。检查调用组件所属树的 `InternationalizationProvider`，并将岛需要的消息加入其消息子集。构建后执行 `pnpm check:i18n`，确认键集、使用情况及页面语言。

## 新增或更新贡献者

自动更新需要 Python、PyYAML、已认证的 GitHub CLI；下载头像还需要 `cwebp`。先检查 `scripts/contributors-config.yaml` 的组织、排除仓库、机器人和屏蔽名单，再执行 `python3 scripts/update-contributors.py --dry-run` 查看预期改动。

执行 `python3 scripts/update-contributors.py` 更新页面与头像。`--commits-only` 只更新已有页面的提交信息与权重，也会为新贡献者创建页面并下载头像。两种模式都会更新索引时间戳，并在安全检查允许时清理不再出现在统计名单中的自动生成页面。

离线验证使用 `--fixture <dir> --dry-run` 读取预先保存的 GitHub 响应，不写入页面或下载头像；用 `--cache <dir>` 将缓存位置指向仓库外的执行目录。CLI 入口仍为 `scripts/update-contributors.py`；`scripts/contributors/` 分别处理 GitHub 访问与重试（`github.py`）、头像转换（`avatars.py`）、页面生成与剪枝（`pages.py`）。

手写资料按现有贡献者目录，在 `content/<locale>/contributors/<login>/index.md` 为三种语言分别建立页面。填写 `title`、`description`、非空 `tags` 和 `externalUrl`，可附 `links`；字段以 `src/content.config.ts` 为准。URL 使用小写 slug。

无整数 `weight` 的手写页不由脚本更新提交数据；有整数权重的手写页保留正文，只更新权重和提交信息。角色标签、别名、显示顺序和匹配优先级统一在 `data/contributor-roles.json` 修改，由 `src/content/contributorOrder.ts` 和 `scripts/contributors/roles.py` 读取。`roles` 中第一个匹配的角色决定分组；同语言别名保持原样。`pnpm check:data` 校验 schema，`pnpm check:contributors` 检查两个消费者是否符合角色配置。

检查三语页面、头像和排序，执行 `pnpm check:contributors`。该检查使用固定的排序基准，新增人员或排序变化需由维护者审核并协调 `scripts/baseline/p3-contributors.json`，不能把旧基准失败当作可忽略项。

## 更新 overlay 统计

在仓库根目录执行 `node scripts/update-overlay-stats.mjs`，需要已登录的 GitHub CLI。脚本读取 overlay 提交 API 的末页 Link 标头，将提交数和 UTC 时间写入 `src/data/overlay-stats.json`。首页在构建期读取这份快照。部署工作流每天定时重建一次，重建前先执行这个脚本，所以提交数和运行天数每天更新，不需要手动提交。

## 部署

`wrangler.jsonc` 配置 `gentoozh-web` 静态资源 Worker、`dist/`、两个自定义域名、尾斜杠 HTML 路由和本地化 404。`.github/workflows/deploy.yml` 按锁文件安装依赖，并执行 `CI=true pnpm check`。工作流只在 `master` 上使用 Wrangler 4.107.0 部署，凭据为 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`。推送到 `master` 时部署，每天 UTC 02:30 定时重建一次；`update-contributors.yml` 每月更新贡献者，推送后主动触发部署，因为用 `GITHUB_TOKEN` 推送不会启动其他工作流。预览检查、生产切换、回滚及独立状态 Worker 的处理见[切换说明](cutover.md)。

## 升级 Astryx

单独处理依赖升级，同时更新 `@astryxdesign/core` 与 `@astryxdesign/cli` 的精确版本及锁文件。执行 `pnpm exec astryx upgrade --from <旧版本> --apply`，核对生成差异、复制组件及模板的变化，再执行 `pnpm theme` 和一次 `pnpm check`。检查三语、明暗主题、窄屏、键盘操作及脚本预算；同步两种语言的开发文档。

## 提交与分支

提交消息、分支名与 PR 正文使用英文。提交标题格式为 `<scope>: <imperative summary>`，例如 `docs: Refresh developer documentation`；正文说明 diff 无法直接表达的原因与影响。分支名按主题命名，不把旧阶段名称当作新工作的固定流程。

提交、索引、分支、远程和发布操作由任务授权决定；派工任务由协调者统一管理 Git 写入。没有授权时只保留工作树改动，报告文件和验证结果。

## 无人值守规则

- 先读仓库规则，限定文件范围；历史记录 `docs/plans/` 不随当前说明重写。
- `rm`、`mv`、`cp` 使用绝对路径；Git 命令使用明确的仓库路径。
- 日志、缓存和临时证据写入任务指定的仓库外运行目录，完成后清理临时垃圾；不轮询等待后台任务。
- 记录实际执行命令、退出码和日志路径；失败或未执行项不能报告为通过。
- 不擅自推送、合并、打标签、部署或修改线上环境；不得绕过门禁或把他人的工作树改动覆盖掉。
