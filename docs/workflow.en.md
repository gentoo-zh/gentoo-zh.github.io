[简体中文](workflow.md)

# Workflow

Run commands from the repository root. `package.json` requires Node.js 22.12.0 or later and pnpm 11.15.1; dependencies use exact versions. Maintain developer docs as Simplified Chinese/English pairs; site content remains trilingual.

## Commands

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Install dependencies from the lockfile. |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Build `dist/` and generate the Pagefind index. |
| `pnpm preview` | Preview build output. |
| `pnpm theme` | Generate `src/theme/built/` from the theme source. |
| `pnpm typecheck` | Sync Astro types and run TypeScript checks. |
| `pnpm check:code` | Run static code-rendering regressions without a build. |
| `pnpm check` | Run all gates, including one build. |

See [Architecture](architecture.en.md#checks-and-retained-exceptions) for each `check:*` command and its build prerequisites. Run the full checks at work milestones, not repeatedly for every commit.

## Add a page

1. Run `pnpm exec astryx build "<idea>"` to select a template, then `pnpm exec astryx template <name> <path>` to scaffold it. Keep an existing page's frame and modify its sections. Read component props with `pnpm exec astryx component <Name>` before use, and run `pnpm exec astryx docs layout` before changing a frame.
2. Add a page directory and `_index.md` under each corresponding locale in `content/`. Follow existing pages for `title`, optional `description`, and page-specific fields. Write each locale's body independently.
3. Compose the page in `src/ui/` and add a route under `src/pages/[...locale]/`. Follow existing category routes: use `pagePaths` for pages and translations, with `SectionLayout` and `SectionPage`. For guides, register the slug in `GUIDE_SLUGS` and the discriminated schema in `src/content/guides.ts`, then use `guidePaths()` and `guideLayout()` to supply `GuidePage`.
4. Mix Markdown and components through standalone `<!-- slot:name -->` lines and `slots`. Supply component headings through `PageSlot.outline`, preserving IDs required by old links. Set `isDataPage` for data pages without widening prose.
5. Register the entry in `src/ui/chrome/sections.ts`. Update all three message catalogs; for a new category, update types and coverage in `scripts/check-i18n.mjs`. `PAGE_SLUGS` in `scripts/lib/url-manifest.mjs` feeds both current-page coverage and Hugo URL compatibility checks; add new page slugs even when no old address exists.
6. For new scripts, register sources in `SCRIPT_OWNERS` and assess `scripts/lib/budgets.mjs`. Do not relax gates to hide unowned scripts or budget overruns.

## Add a post

Posts are directory bundles: add a directory with `index.md` under the locale's `posts/` in `content/`, keeping images alongside it and using relative links. Matching directory names associate translations. Do not mechanically convert Simplified and Traditional Chinese.

Required front matter is `title`, `description`, and `date`; optional fields are `tags`, `authors`, `aliases`, `featured`, `summary`, `lastmod`, `image`, and `cover`. `image` and `cover` accept a URL string or `{src, alt?}` object; `cover` takes precedence, followed by `image` and the first body image. Authors have `name` and optional `image` and `link`; the loader supplies `locale` and `slug`. Unknown fields fail validation. Use `{#id}` to fix heading anchors. The only shortcodes are `callout` (`info`, `warning`, `error`) and `details`.

After merging `p2-cutover-gate` on cutover day, add posts, edit text, or add headings directly, then run `pnpm check`. Keep old post, attachment, and image URLs and historical heading IDs; use `{#original-id}` when rewriting a heading. After the build, `check:content-parity` checks old URLs and assets, while `check:urls` checks historical anchors and current feed coverage, dates, and order. Keep `scripts/baseline/hugo.json` as historical evidence; do not regenerate it for new or edited posts. Before cutover, retain the byte-parity gate and leave this branch unmerged.

## Add a UI message

Add the same `gz.<feature>.<name>` key to `src/i18n/zh-cn.json`, `src/i18n/zh-tw.json`, and `src/i18n/en.json`. Write each translation independently and access messages with `useMessage`. Use ICU parameters; do not put visible literal text in JSX. Check the calling component's `InternationalizationProvider` and include required messages in its island's subset. After building, run `pnpm check:i18n` to verify key sets, usage, and page language.

## Add or update a contributor

Automatic updates require Python, PyYAML, and an authenticated GitHub CLI; avatar downloads also require `cwebp`. Review the organization, excluded repositories, bots, and blocklist in `scripts/contributors-config.yaml`, then run `python3 scripts/update-contributors.py --dry-run` to inspect expected changes.

Run `python3 scripts/update-contributors.py` to update pages and avatars. `--commits-only` updates only commit information and weights on existing pages, but also creates pages and downloads avatars for new contributors. Both modes update index timestamps and prune generated pages for contributors absent from the statistics when safety checks permit.

For offline validation, use `--fixture <dir> --dry-run` to read saved GitHub responses without writing pages or downloading avatars. Point `--cache <dir>` at a run directory outside the repository. The CLI remains `scripts/update-contributors.py`; `scripts/contributors/` contains GitHub access and retries (`github.py`), avatar conversion (`avatars.py`), and page generation and pruning (`pages.py`).

For handwritten profiles, follow existing contributor directories and create `content/<locale>/contributors/<login>/index.md` for each of the three locales. Supply `title`, `description`, nonempty `tags`, and `externalUrl`, with optional `links`; `src/content.config.ts` defines the fields. URLs use lowercase slugs.

Handwritten pages without integer `weight` do not receive scripted commit updates. Those with integer weights retain their bodies while weight and commit information update. Edit role labels, aliases, display order, and matching precedence in `data/contributor-roles.json`, shared by `src/content/contributorOrder.ts` and `scripts/contributors/roles.py`. The first matching role in `roles` wins; same-locale aliases remain unchanged. `pnpm check:data` validates the schema, and `pnpm check:contributors` checks both consumers against the policy.

Check pages in all three locales, avatars, and sorting, then run `pnpm check:contributors`. This check uses a fixed order baseline. New contributors or order changes require maintainer review and coordination of `scripts/baseline/p3-contributors.json`; a stale-baseline failure is not safe to ignore.

## Update overlay statistics

From the repository root, run `node scripts/update-overlay-stats.mjs` with an authenticated GitHub CLI. It reads the last-page Link header from the overlay commits API and writes the commit count and UTC timestamp to `src/data/overlay-stats.json`. The homepage reads this snapshot at build time. The deploy workflow rebuilds daily and runs this script first, so the commit count and days running refresh every day without a manual commit.

## Deployment

`wrangler.jsonc` configures the `gentoozh-web` static-assets Worker, `dist/`, both custom domains, trailing-slash HTML routing, and localized 404 handling. `.github/workflows/deploy.yml` installs locked dependencies and runs `CI=true pnpm check`. It deploys with Wrangler 4.107.0 only on `master`, using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. It deploys on pushes to `master` and rebuilds daily at 02:30 UTC; `update-contributors.yml` updates contributors monthly and dispatches a deploy after pushing, because pushes made with `GITHUB_TOKEN` do not start other workflows. See [Cutover](cutover.en.md) for preview checks, production switching, rollback, and the separate status Worker.

## Upgrade Astryx

Handle dependency upgrades separately, updating exact versions of both `@astryxdesign/core` and `@astryxdesign/cli` and the lockfile. Run `pnpm exec astryx upgrade --from <old-version> --apply`, review generated changes and updates to copied components and templates, then run `pnpm theme` and one `pnpm check`. Inspect all three locales, light and dark themes, narrow screens, keyboard interaction, and script budgets. Update both developer-doc languages.

## Commits and branches

Use English for commit messages, branch names, and PR text. Commit subjects follow `<scope>: <imperative summary>`, for example `docs: Refresh developer documentation`. Use the body for reasons and effects that the diff does not explain. Name branches by topic rather than treating old phase names as a fixed workflow for new work.

Task authorization determines commit, index, branch, remote, and release operations. The coordinator owns Git writes for delegated work. Without authorization, leave changes in the working tree and report files and verification results.

## Unattended-agent rules

- Read repository rules and establish the file scope first. Do not rewrite historical `docs/plans/` while refreshing current guidance.
- Use absolute paths for `rm`, `mv`, and `cp`, and explicit repository paths for Git commands.
- Store logs, caches, and temporary evidence in the assigned run directory outside the repository; clean up temporary debris when done. Do not poll background tasks.
- Record executed commands, exit codes, and log paths. Never report failed or unexecuted checks as passing.
- Do not push, merge, tag, deploy, or change production without authorization. Do not bypass gates or overwrite others' working-tree changes.
