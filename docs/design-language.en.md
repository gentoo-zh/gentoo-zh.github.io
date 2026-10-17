[简体中文](design-language.md)

# Design language

The site combines the Astryx docsite theme and article shell with galleries, tables, guides, and dashboards. Current components and theme code define the implementation; template names identify structural sources.

## Theme and style ownership

`src/theme/gentoo.ts` uses neutral light and dark backgrounds, semibold headings, larger radii, and pill buttons. `--color-accent` uses Gentoo purple and `--color-accent-muted` uses a purple tint; text and icon accent tokens use neutral ink colors.

`Base.astro` loads the Astryx reset, component styles, and generated theme. Figtree 400 and 600 Latin subsets are self-hosted; Chinese uses system fonts. The theme follows the system by default. `ThemeScript.astro` reads `gz-theme` before first paint, and navigation saves the user's selection.

| Location | Responsibility |
|---|---|
| `src/theme/gentoo.ts`, `src/theme/built/` | Theme source and generated CSS, JavaScript, and types; run `pnpm theme` after source edits and do not edit generated files by hand. |
| `src/theme/scale.ts` | Spacing, buttons, icons, avatars, grids, cards, tables, and template dimensions. |
| `src/theme/layout.stylex.ts` | Prose and data widths, outlines, sidebar typography, grid columns, and media/container breakpoints. |
| `src/theme/home.stylex.ts`, `src/ui/home/home.styles.ts` | Home layout, local radii, and avatar-wall animation. |
| `src/markdown/MarkdownBody.module.css` | Docsite prose styles shared by `SectionPage` and `BlogArticle`; the only registered prose CSS module. |
| `src/markdown/CodeHighlight.css`, `codeTokenizer.ts` | Build-time syntax highlighting and shell prompt styles adapted from Astryx CodeBlock. |
| `src/markdown/PostMarkdown.tsx`, `StaticCodeBlock.tsx` | Headings, permalinks, inline code, and static code blocks; Markdown plugins also live in `src/markdown/`. |

Prefer component props. Custom styles use `stylex.create()`, `xstyle`, and semantic tokens. `astro.config.ts` compiles StyleX through `@stylexjs/unplugin` without runtime style injection. Define colors in the theme and dimensions in `scale.ts` or `layout.stylex.ts`, rather than repeating literals in pages. Do not introduce Tailwind or extra global CSS; `scripts/lib/ui-rules.mjs` defines native-element and CSS exceptions.

## Page structures

`Base.astro` and `SiteShell` provide the site shell; `SectionLayout.astro` adds the category sidebar. `PageHeader` standardizes titles and descriptions; `SectionPage` supplies prose, component slots, outlines, and previous/next links. Data pages can widen data regions; the status page uses `isFullWidthDataPage` for its own header and frame.

| Page | Structural source and current components |
|---|---|
| Home | `HomePage` adapts the Astryx docsite landing page: a split hero with a CSS-animated contributor wall, six feature links, community rows, posts, and sponsor logos. |
| Five categories and topic hubs | Product Gallery tiles in shared `LandingBlocks` for `SectionLanding` and `PageEntries`. Three desktop columns, two tablet columns, one phone column; legacy card anchors remain. |
| Technical guides and ISO | Numbered procedures from `documentation-technical`; `GuidePage`/`GuideProcedure` sit within `SectionPage`, while `IsoPage` composes download lists and writing procedures. |
| FAQ, Paste, contribution, and informational pages | Docsite `DocPageLayout`; pages compose `SectionPage` slots directly. Paste offers web and command-line entry points. |
| Mirrors and packages | `table-page`; `MirrorTable`, `OfficialMirrorTable`, and `PackagesTable` use wide data regions. |
| Status | `dashboard-alert-rail` and `TableRowStatusTable`; `StatusDashboard` presents service summaries, history charts, and status tables. Home links to the status page. |
| Post index and detail | `BlogIndex` uses search, tag filters, and divided rows; `BlogArticle` combines the docsite article layout with shared Markdown prose. Covers come only from front matter or the first body image. |
| Tags | `TagsPage` uses divided rows and counts. |
| Contributors | The `library`-based `ContributorsLibrary` offers search, filters, sorting, and avatar cards; `ContributorProfile` renders a static header, metadata, and repository table. |
| Costs | `table-collapsible`; `CostsPage` uses summary figures, independent grouped tables, compact rows, and group totals. |
| Thanks, logo, and channels | `ThanksPage` presents sponsors, `LogoPage` uses image download tiles, and `ChannelsPage` uses grouped channel tables. |
| 404 and redirects | `NotFoundPage` provides recovery links; `RedirectPage` provides the destination. |

File browsing links to the external download site; feeds and attachments have no page shell. `src/ui/chrome/sections.ts` registers navigation categories, order, links, and historical card anchors.

## Components, icons, and interactions

Dense package, mirror, service-status, and ledger data use `Table` or divided rows. `Card` serves statistics, galleries, and identity previews; `ClickableCard` serves destinations and keeps the library’s hover behavior. `Badge` represents counts only, `Token` categories or defaults, and `StatusDot` accompanies visible state text. Notices use `Banner` with `info`, `warning`, or `error` severity.

`src/ui/chrome/icons.tsx` centralizes Lucide SVG snapshots, `SvgProps`, and the `Lucide` wrapper, hiding decorative icons from assistive technology by default. The glyphs are inlined from lucide-react, with `Hash` from 0.468.0; licenses remain in the file. `download/PackagesIcons.tsx` only re-exports icons; `section/entryIcons.tsx` maps page IDs to glyphs. GitHub and channel brand marks retain separate modules.

`src/ui/chrome/cardLinks.ts` delegates clicks on static card surfaces; mounted Astryx cards use their own handlers. Nested links, buttons, inputs, and text selection retain their behavior. See [architecture](architecture.en.md#client-interactions) for the event boundary.

Setup guides use `GuideSetup` for mirror selection, channel switching, sudo, and optional manual/quick tabs. Server and client share code-rewriting rules, keeping copied content equal to displayed content. Without JavaScript, default commands remain readable and both panes are visible.

## Motion and copy

Menus, drawers, and dialogs retain Astryx motion. Custom transitions use duration and easing tokens; `PostMarkdown` heading links and custom home motion respect `prefers-reduced-motion`. Outlines use ordinary anchors.

UI messages live in `src/i18n/{zh-cn,zh-tw,en}.json`, using the `gz.` prefix and ICU parameters. Write each locale independently without Chinese script conversion. Developer docs have corresponding Simplified Chinese and English versions.
