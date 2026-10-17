[简体中文](architecture.md)

# Architecture

The site uses Astro 7, React 19, and Astryx 0.7.0 to generate static HTML, with separate client entries for interactive regions. `pnpm build` runs Astro, `scripts/build-seo.mjs`, and Pagefind indexing in order, writing to `dist/`. The SEO script generates cover and avatar thumbnails, fills non-home image dimensions, and generates `sitemap.xml` and `_redirects` from canonicals, hreflang links, and HTML redirects. Error and redirect pages stay out of the sitemap. Builds use UTC.

## Layers and data flow

| Location | Responsibility |
|---|---|
| `src/content/` | Load Markdown from `content/<locale>/`, query posts, pages, and contributors, and prepare feeds. |
| `src/data/` | Parse and validate structured data, calculate costs, and resolve and order mirror endpoints. |
| `src/markdown/` | Astryx Markdown rendering, Hugo heading anchors, inline HTML, code titles and prompts, build-time syntax highlighting, `callout`/`details` shortcodes, and shared prose styles. |
| `src/ui/` | Pages, Astryx compositions, and interactive islands; `renderStatic.ts` waits for React `prerender` to finish. |
| `src/theme/` | Theme source and generated output, size constants, and layout styles. |
| `src/i18n/` | Three message catalogs, language tags, route helpers, and message subsets. |
| `src/pages/`, `src/layouts/` | Astro routes, build-time queries, and page shells. |

`src/content.config.ts` defines `posts`, `sections`, `pages`, `contributors`, `contributorsIndex`, and four YAML data collections. `yamlFile` in `src/data/loader.ts` parses files; schema failures stop the build. `loadData` in `src/data/entries.ts` reads each data collection's single entry with the same name.

| Input | Use |
|---|---|
| `data/gz_costs.yaml` | Validated by `costsSchema`; `src/data/costs.ts` calculates payments, periods, and accumulated costs. |
| `data/gz_mirrors.yaml` | Validated by `mirrorsSchema`; `src/data/mirrors.ts` selects language defaults and orders mirrors. |
| `src/data/official-mirrors.json` | `officialMirrorsSchema` validates this data; source IDs reference YAML distfiles, Git, and rsync endpoints, while other distfiles endpoints are defined directly. The official mirror table, setup guides, and installation-media picker share this data. |
| `data/gz_channels.yaml` | Binary package channels validated by `channelsSchema`. |
| `data/gz_sponsors.yaml` | Validated by `sponsorsSchema`; both home `homeData.ts` and the thanks page read it through `loadData('sponsors')`. |
| `src/data/overlay-stats.json` | Supplies the home page commit count. |
| Contributor Markdown | Loaded by `contributorsLoader.ts` and grouped by `contributorOrder.ts`; `scripts/update-contributors.py` delegates GitHub access, avatars, and page updates to `scripts/contributors/`, preserving handwritten prose. Grouping and generation share labels, aliases, and order from `data/contributor-roles.json`. |

Guides belong to the `pages` collection. `guideSchema` in `src/content/guides.ts` validates steps, legacy anchors, manual/quick content, and setup hints by slug. Collection loading and `guidePaths()` both validate guides. Routes call `guideLayout()` in `src/layouts/GuideLayout.ts` to assemble post paths, mirror settings, slots, and `GuidePage` before passing the result to `SectionLayout.astro`.

`eslint.config.js` restricts imports across layers. Prose uses neither MDX nor Astro's Markdown pipeline; static React rendering does not require Astro's React integration.

## Routes and page registry

`src/i18n/routes.ts` centralizes paths: Simplified Chinese uses the root, Traditional Chinese and English use `/zh-tw/` and `/en/`. `src/pages/[...locale]/` generates localized routes. Missing translations do not fall back; the language menu offers existing translations only. Markdown post links localize only when the target translation exists, other page links receive the locale prefix, and file links stay unchanged.

`src/ui/chrome/sections.ts` registers five categories, page order, internal pages, dedicated routes, external services, and legacy card anchors. The top navigation, sidebar, category entries, footer, and previous/next links consume it. External services open in a new tab. Old aliases, pagination, `/zh-cn/`, and post attachments retain their URL contracts. `src/pages/[...locale]/404.astro` renders each language’s full error page. `build-seo.mjs` moves the output to `/404.html`, `/en/404.html`, and `/zh-tw/404.html`; these pages are noindex and provide localized recovery links without JavaScript.

## Page shells and prose

`Base.astro` loads styles, fonts, the document head, and `SiteShell`, rendering the navigation island separately. `SectionLayout.astro` adds the category sidebar, current-page context, source edit link, and outline scripts. `PageHeader` provides the shared title and optional description; `SectionPage` combines it with Markdown, slots, an outline, and a footer.

A standalone `<!-- slot:name -->` line inserts a component; `<!-- steps -->` names the `steps` slot. Names contain lowercase English letters only. Values are React nodes or `PageSlot` objects with `node` and optional `outline`. A referenced slot without a value fails the build. `<!-- anchor:id -->` preserves a legacy fragment.

Body h2–h4 headings, slot outlines, and explicit `outline` entries merge in order. Ordinary pages show a desktop outline rail and a native disclosure within the article at 1024px and below; `OutlineSpy.astro` tracks the current heading. `isDataPage` widens data regions while retaining the responsive outline rail and keeping titles and Markdown at prose width. `isFullWidthDataPage` lets the status dashboard provide its own header and full-width frame. `children` can still append content after the body.

`GuidePage` renders numbered steps through `GuideProcedure`, adding steps and their headings to the outline. `SectionLanding` and hub `PageEntries` share `LandingBlocks`: three columns on desktop, two on tablets, and one on phones. See [design language](design-language.en.md) for design and style ownership.

`StaticCodeBlock` uses `codeTokenizer.ts` to emit highlighted spans at build time, including long blocks. `CodeHighlight.css` adapts Astryx CodeBlock token styles for static HTML. Shell `$ ` and recognized `# ` prompts have separate tokens; `CopyCode.astro` removes those tokens when copying, preserving displayed command changes from the setup controls.

`build-seo.mjs` calls `scripts/lib/cover-thumbnails.mjs` for marked local blog covers, generating content-hashed 1×/2× WebP files under `/_astro/`. `scripts/lib/avatar-thumbnails.mjs` generates 1×/2× contributor avatars at stable URLs shared with hydrated components. Avatar derivatives stay outside immutable caching; source attachments remain available.

## Client interactions

| Region | Boundary |
|---|---|
| Navigation and sidebar | `chrome/nav-client.tsx` hydrates `NavIslandRoot`; the category sidebar hydrates collapsible groups while keeping its frame static. |
| Cards | `chrome/cardLinks.ts` delegates clicks on static card surfaces, skipping handled events, mounted Astryx cards, nested controls, and text selection. Middle clicks, modifiers, and `_blank` open a new tab; other clicks activate the original link. |
| Setup switcher | `guideSetupPage.ts` rewrites code for the language default and renders `GuideSetup`; `guide-setup-client.tsx` hydrates controls and rewrites both panes when mirror, channel, or sudo changes. Both sides use `guideSetup.ts`; copying reads the displayed code. Choices persist in localStorage, with a separate official-mirror choice; the pane does not persist. |
| Manual/quick panes | HTML contains both panes. Before first paint, `GuideSetupScript.astro` selects the URL fragment's pane or manual by default; the hydrated island handles later tab and fragment changes. Both panes remain visible without JavaScript. |
| Search and contributors | Opening search loads `SearchDialog` and Pagefind on demand; only the contributor library hydrates. Profiles render static headers, metadata, and repository tables. |
| Status | `StatusScript.astro` selects `StatusDashboardScript.astro` on `/status/`, loading `StatusDashboard` and charts at idle; static HTML retains unknown states. |
| Data and small enhancements | Packages load after the table enters the viewport and the browser is idle; mirror health updates the DOM. Cost summaries hydrate. Copying, post filtering, and legacy anchors use small scripts; the home avatar wall uses CSS animation. |

Client entries use kebab-case `*-client.tsx` names. `chrome/hydrateIsland.tsx` shares the navigation, sidebar, contributors, costs, and guide hydration sequence; `IslandMount.tsx` defines `ISLAND_ATTRIBUTE` and `IslandKind`. Each caller keeps its component and identifier prefix. First-paint scripts and data-fetching mounts remain separate.

## Checks and retained exceptions

Run `pnpm check` from the repository root. It checks types, theme, data, code rendering, contributors, UI, and conversion tools, then builds and checks output. Standalone output checks below require `pnpm build` first.

| Check | Constraint |
|---|---|
| `typecheck`, `check:theme` | Types and generated theme consistency. |
| `check:content-parity` | After building, preserve Hugo-era URLs, attachments, images, and other static assets; content bytes may change. |
| `check:data`, `check:contributors` | Data schemas, cost and mirror regressions, contributor ordering, and offline updater replay. |
| `check:code` | Prompt detection, token ranges, mirror/sudo rewriting, long-block highlighting, and HTML escaping; no build required. |
| `check:ui`, `check:no-convert` | ESLint, Astro structure, layers, styles, sizes, UI copy, and the ban on Chinese conversion tools. |
| `check:i18n`, `check:urls` | Messages and output language, old URLs, redirects, attachments, feeds, historical fragments, internal links, and duplicate IDs. |
| `check:seo` | Metadata, one h1, image dimensions, font preloads, sitemap, 301 mappings, and 404 noindex. |
| `check:budget`, `check:search`, `check:headers` | Script ownership and Brotli budgets, nonempty Pagefind indexes per locale with a 512 KiB limit, caching, and security headers. |

Keep the Hugo baselines as historical evidence after cutover. `scripts/baseline/historical-assets.json` records public asset and post-attachment URLs from the pinned commit, excluding hosting configuration (`CNAME` and `_headers`). `check:urls` validates feeds against current post bundles and allows added headings while preserving historical IDs. `check:data` overrides individual old cost-baseline fields using `scripts/fixtures/cost-corrections.json`; remove those overrides after master includes the corrections and the baseline is regenerated. `check:urls` checks every fragment in `scripts/baseline/historical-fragments.json` and contributor URLs.

`scripts/lib/ui-rules.mjs` registers exceptions for native head elements, images, SVG, layout wrappers with `stylex.props`, HTML injection in `IslandMount.tsx`, the prose CSS module, and static `CodeHighlight.css`. Client scripts must appear in `SCRIPT_OWNERS`. `scripts/lib/budgets.mjs` uses the first matching route rule and deduplicates Brotli bytes over import closures. Idle loading counts toward the initial budget; only scripts registered as `onDemand` and reached exclusively through on-demand paths receive a separate budget.
