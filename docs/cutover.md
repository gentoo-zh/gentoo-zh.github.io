[English](cutover.en.md)

# 切换到新站

新站把 `dist/` 部署到现有 Workers 静态资源项目 `gentoozh-web`，继续使用 `gentoozh.org` 和 `web.gentoozh.org`。`gentoozh-status` 独立运行。以下命令在仓库根目录执行；环境和完整门禁见[工作流](workflow.md)。标有 **仅站点所有者** 的步骤会发布版本、改变线上服务或操作账号。

## 上线前

1. 固定候选提交，执行 `pnpm install --frozen-lockfile` 和 `CI=true pnpm check`。门禁已构建一次 `dist/`；确认三个 `404.html`、`_headers`、`_redirects`、Pagefind 和 feed 均在产物中。
2. 执行 `npx --yes wrangler@4.107.0 deploy --dry-run`。核对 Worker 名称、两个自定义域名和 `assets.directory`。`auto-trailing-slash` 与目录内的 `index.html` 对应；它对无尾斜杠地址使用 307，旧地址的 `_redirects` 规则使用 301。规则上限为 2,000 条静态重定向、100 条动态重定向、每行 1,000 字符；标头最多 100 条规则、每行 2,000 字符。[重定向规则](https://developers.cloudflare.com/workers/static-assets/redirects/)、[标头规则](https://developers.cloudflare.com/workers/static-assets/headers/)、[HTML 路由](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)。
3. **仅站点所有者：** 记录当前生产版本 ID、候选提交、回滚负责人及现有 DNS、Worker routes、重定向和标头规则。确认两个 GitHub secrets `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` 对应现有项目。核对 `gentoozh-status` 的 API、CORS 和 RSS 保留方案。
4. **仅站点所有者：** 为 `gentoozh-web` 启用并核对 Version URLs，再执行 `npx --yes wrangler@4.107.0 versions upload --preview-alias prelaunch`，记录返回的版本 ID 和预览 URL。配置的 `workers_dev: false` 默认不启用版本预览，不能假设上传后 URL 可访问；需要时在经审核的临时配置中设置 `preview_urls: true`，将 `assets.directory` 指向刚检查过的 `dist/` 绝对路径，并用 `--config <临时配置绝对路径>` 上传。上传版本用于预览，不把它部署到生产域名。[版本预览](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/)。
5. 在返回的预览 URL 上完成下表，保存状态码、`Location`、响应头及浏览器结果。`pnpm preview` 不模拟 Workers 的重定向和标头规则，不能代替这一步。

| 检查 | 通过条件 |
|---|---|
| 旧地址与 sitemap | `dist/_redirects` 中每条规则返回真实 301，`Location` 正确，目标可访问。`/zh-cn/sitemap.xml`、`/zh-tw/sitemap.xml`、`/en/sitemap.xml` 都转到 `/sitemap.xml`。用 `curl -sS -D - -o /dev/null <URL>` 查看首个响应，不只看跟随跳转后的 200。 |
| fragment 重定向 | 三语 `/gentoo-mirror-setup/` 的旧 fragment 在浏览器中到达对应新章节；这些页面保留客户端映射，不应被统一的边缘 301 抢先处理。 |
| 尾斜杠 | `/posts`、`/en/posts`、`/zh-tw/status` 返回 307 到带尾斜杠地址，最终 200，无循环。 |
| 404 | 在根目录、`/en/`、`/zh-tw/` 下请求不存在的浅层、嵌套及带扩展名路径，均返回 HTTP 404；分别启用和禁用 JS，检查 `html lang`、标题、导览、页脚、恢复文字和其他语言链接。 |
| 标头与缓存 | HTML 与静态资源有 `X-Content-Type-Options: nosniff`、`Strict-Transport-Security: max-age=31536000; includeSubDomains`、SAMEORIGIN 和既有 Referrer-Policy。只有带内容哈希的资源使用 immutable；HTML、feed、Pagefind 启动文件及可变 URL 的头像衍生图需重新验证缓存。 |
| 搜索、feed 与 SEO | 三语搜索能找到结果并打开本语言页面；`/feed.xml`、`/zh-tw/feed.xml` 和 `/en/feed.xml` 是 XML，文章链接、正文正常；`/sitemap.xml`、`/robots.txt` 正常，404 不进入 sitemap 或搜索索引。 |
| 状态后端 | 三语 `/status/` 和镜像健康信息成功读取 `https://status.gentoozh.org/api/status`，浏览器无 CORS 错误；`https://status.gentoozh.org/feed.rss` 仍返回 RSS。 |

预览域名不会覆盖生产域名的 DNS、区域级重定向或标头规则；切换后必须再检查生产域名。

## 切换

1. **仅站点所有者：** 切换当天，预览全部通过后合并 `p2-cutover-gate`，随新站合并到 `master`，以 URL、资源及历史锚点兼容检查替代逐字节检查，解锁文章新增和编辑；不要提前合并。确认旧 `hugo.yml` 已由 `deploy.yml` 替代，只有一个部署工作流。
2. **仅站点所有者：** 等待 GitHub Actions 完整门禁与部署成功，记录生产版本 ID。工作流只有在 `refs/heads/master` 上才执行部署；不要同时手动部署。
3. 在 `https://gentoozh.org` 与 `https://web.gentoozh.org` 重做上线前的检查，确认实际响应来自新版本；另查 canonical、跨语言链接和首页。任一阻断失败先停止后续操作并评估回滚。
4. **仅站点所有者：** 在独立的 `gentoozh-status` Worker 中将 UI 请求 301 到 `https://gentoozh.org/status/`。必须先保留 `/api/status` 与 `/feed.rss` 的路由、数据和 CORS，再处理 UI 重定向；不要把整个域名重定向。该修改不由本仓库部署，单独记录其版本与回滚方法。修改后重验 API、RSS 与主站状态页面。
5. **仅站点所有者：** 为已停用的 `iso.gentoozh.org` 与 `mirror.gentoozh.org` 添加代理的 DNS 记录，并用 Cloudflare 重定向规则把两者的所有请求 301 到 `https://gentoozh.org/iso/`，让站外的旧链接继续可用。验证两个域名都返回 301 且落到 ISO 页面。

## 回滚

**仅站点所有者：** 暂停后续部署，使用上线前记录的生产版本 ID，在本仓库根目录执行 `npx --yes wrangler@4.107.0 rollback <previous-version-id>`。确认 `gentoozh-web` 已重新部署该版本，再验证两个域名的首页、旧 URL、feed 和状态调用。回滚不会恢复 DNS、路由或其他 Worker 的修改；若已改变状态 UI，在 `gentoozh-status` 的维护流程中另行恢复。[回滚说明](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)。

## 上线后

1. **仅站点所有者：** 在已验证的搜索引擎站长账号提交 `https://gentoozh.org/sitemap.xml`，观察抓取、索引和旧 sitemap 重定向。
2. 监控 404、重定向循环、资源失败、搜索与状态 API 错误，记录实际用户性能；保留候选、预览、部署及回滚证据。
3. 确认新文章和正文修改可通过门禁，旧 URL、附件及历史锚点仍受保护；feed 必须包含当前全部文章。保留 `scripts/baseline/hugo.json`，不为新文章或正文修改重新生成。
