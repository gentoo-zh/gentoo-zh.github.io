[简体中文](cutover.md)

# Cut over to the new site

The new site deploys `dist/` to the existing Workers static-assets project `gentoozh-web`, keeping `gentoozh.org` and `web.gentoozh.org`. `gentoozh-status` remains a separate Worker. Run commands from the repository root; see [Workflow](workflow.en.md) for prerequisites and the full gate. Steps marked **Owner only** publish versions, change live services, or operate accounts.

## Pre-flight

1. Pin the candidate commit, then run `pnpm install --frozen-lockfile` and `CI=true pnpm check`. The gate builds `dist/` once; confirm all three `404.html` files, `_headers`, `_redirects`, Pagefind, and feeds are present.
2. Run `npx --yes wrangler@4.107.0 deploy --dry-run`. Check the Worker name, both custom domains, and `assets.directory`. `auto-trailing-slash` matches directory `index.html` output and redirects slashless URLs with 307; legacy `_redirects` rules use 301. Limits are 2,000 static redirects, 100 dynamic redirects, and 1,000 characters per redirect line; headers allow 100 rules and 2,000 characters per line. See [redirect rules](https://developers.cloudflare.com/workers/static-assets/redirects/), [header rules](https://developers.cloudflare.com/workers/static-assets/headers/), and [HTML routing](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
3. **Owner only:** Record the current production version ID, candidate commit, rollback owner, and existing DNS, Worker routes, redirects, and header rules. Confirm that GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` target the existing project. Confirm the plan to retain the `gentoozh-status` API, CORS, and RSS.
4. **Owner only:** Enable and verify Version URLs for `gentoozh-web`, then run `npx --yes wrangler@4.107.0 versions upload --preview-alias prelaunch`. Record the returned version ID and preview URL. With `workers_dev: false`, version previews are disabled by default; do not assume the URL is accessible after upload. If needed, use a reviewed temporary config with `preview_urls: true` and `assets.directory` set to the absolute path of the tested `dist/`, passing `--config <absolute-preview-config-path>` to upload. Uploading creates a preview version without deploying it to production domains. See [version previews](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/).
5. Run the checks below against the returned preview URL. Save status codes, `Location`, headers, and browser results. `pnpm preview` does not emulate Workers redirect or header rules and cannot replace this check.

| Check | Pass condition |
|---|---|
| Legacy URLs and sitemaps | Every rule in `dist/_redirects` returns a real 301 with the expected `Location` and a working destination. `/zh-cn/sitemap.xml`, `/zh-tw/sitemap.xml`, and `/en/sitemap.xml` redirect to `/sitemap.xml`. Use `curl -sS -D - -o /dev/null <URL>` to inspect the first response, not just the final 200. |
| Fragment redirects | In a browser, old fragments on `/gentoo-mirror-setup/` in all three locales reach their mapped new sections. These pages retain client-side mappings and must not be intercepted by a blanket edge 301. |
| Trailing slashes | `/posts`, `/en/posts`, and `/zh-tw/status` return 307 to their trailing-slash URLs, then 200, without loops. |
| 404 | Missing shallow, nested, and extension-bearing paths under `/`, `/en/`, and `/zh-tw/` return HTTP 404. With JS both enabled and disabled, check `html lang`, title, navigation, footer, recovery text, and links to other languages. |
| Headers and caching | HTML and static assets have `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, SAMEORIGIN, and the existing Referrer-Policy. Only content-hashed assets use immutable caching; HTML, feeds, Pagefind bootstrap files, and avatar derivatives with mutable URLs require cache revalidation. |
| Search, feeds, and SEO | Search returns results and opens local-language pages in all three locales. `/feed.xml`, `/zh-tw/feed.xml`, and `/en/feed.xml` return XML with correct article links and bodies. `/sitemap.xml` and `/robots.txt` work; 404 pages appear in neither the sitemap nor search index. |
| Status backend | Localized `/status/` pages and mirror health successfully fetch `https://status.gentoozh.org/api/status` without browser CORS errors. `https://status.gentoozh.org/feed.rss` still returns RSS. |

The preview hostname does not exercise production DNS, zone redirects, or header rules. Repeat these checks on production after switching.

## Switch

1. **Owner only:** On cutover day, after every preview check passes, merge `p2-cutover-gate` with the new site into `master`. This replaces byte parity with URL, asset, and historical-anchor compatibility checks and unlocks new and edited posts; do not merge it early. Confirm `deploy.yml` replaces the old `hugo.yml` and only one deployment workflow remains.
2. **Owner only:** Wait for the GitHub Actions gate and deployment to succeed, then record the production version ID. The workflow deploys only on `refs/heads/master`; do not run a concurrent manual deployment.
3. Repeat the pre-flight checks on both `https://gentoozh.org` and `https://web.gentoozh.org`, confirming responses come from the new version. Also check canonicals, cross-language links, and the home page. Stop subsequent steps and assess rollback if a blocking check fails.
4. **Owner only:** In the separate `gentoozh-status` Worker, redirect UI requests with 301 to `https://gentoozh.org/status/`. Preserve `/api/status` and `/feed.rss` routes, data, and CORS before handling the UI redirect; do not redirect the entire hostname. This repository does not deploy that change. Record its version and rollback procedure separately, then recheck the API, RSS, and main-site status pages.
5. **Owner only:** Add proxied DNS records for the retired `iso.gentoozh.org` and `mirror.gentoozh.org`, and use a Cloudflare redirect rule to send every request on both with 301 to `https://gentoozh.org/iso/`, so old links elsewhere keep working. Verify both hostnames return 301 and land on the ISO page.

## Roll back

**Owner only:** Pause further deployments. From this repository root, run `npx --yes wrangler@4.107.0 rollback <previous-version-id>` with the production version ID recorded before launch. Confirm `gentoozh-web` redeployed that version, then check both domains' home pages, legacy URLs, feeds, and status calls. Rollback does not restore DNS, routes, or changes to another Worker. If the status UI changed, restore it separately through the `gentoozh-status` maintenance process. See [rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

## After launch

1. **Owner only:** Submit `https://gentoozh.org/sitemap.xml` through verified search-engine webmaster accounts. Monitor crawling, indexing, and legacy sitemap redirects.
2. Monitor 404s, redirect loops, asset failures, search errors, and status API errors. Record field performance and retain candidate, preview, deployment, and rollback evidence.
3. Confirm new posts and text edits pass the gate while old URLs, attachments, and historical anchors remain protected. Feeds must contain all current posts. Retain `scripts/baseline/hugo.json`; do not regenerate it for new posts or text edits.
