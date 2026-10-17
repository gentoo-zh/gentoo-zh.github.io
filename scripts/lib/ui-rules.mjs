// Shared ESLint/Astro rules; docs/architecture.md records native-element exceptions.

/** Native exceptions; div requires StyleX props, enforced by eslint.config.js. */
export const NATIVE_ELEMENTS = [
  'title',
  'meta',
  'link',
  'img',
  'picture',
  'source',
  'div',
  'svg',
  'path',
  'circle',
  'rect',
  'defs',
  'radialGradient',
  'stop',
  'use',
  // SiteHead's scripting fallback: one <noscript><style> for the loading placeholders.
  'noscript',
  'style',
];

/** Registered docsite prose and static CodeBlock highlight stylesheets. */
export const UPSTREAM_CSS_MODULES = ['src/markdown/MarkdownBody.module.css', 'src/markdown/CodeHighlight.css'];

/** Only IslandMount may inject server-rendered React markup. */
export const HTML_INJECTION = ['src/ui/chrome/IslandMount.tsx'];

/** Props whose value a reader sees or hears. */
export const VISIBLE_PROPS = [
  'label',
  'title',
  'alt',
  'description',
  'placeholder',
  'heading',
  'tooltip',
  'caption',
  'subtitle',
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'aria-placeholder',
];

/** Imports no source file may make. Copied CSS modules are imported by their components. */
export const BANNED_IMPORTS = [
  {
    test: specifier => specifier.endsWith('.css') && !specifier.endsWith('/MarkdownBody.module.css'),
    message: 'only Base.astro loads stylesheets; components import the registered upstream CSS modules only',
  },
];

/**
 * Every client script, by owning source file. An inline script carries `data-owner` with
 * the owner's path; a bundled module is listed by its file name without the content hash.
 */
export const SCRIPT_OWNERS = [
  {source: 'src/layouts/Redirect.astro', modules: []},
  {source: 'src/ui/CopyCode.astro', modules: []},
  {source: 'src/ui/LegacyAnchors.astro', modules: []},
  {source: 'src/ui/section/OutlineSpy.astro', modules: []},
  {source: 'src/ui/section/SectionNavScript.astro', modules: ['SectionNavScript.astro_astro_type_script_index_0_lang']},
  {source: 'src/ui/blog/BlogSearch.astro', modules: []},
  {source: 'src/ui/chrome/ThemeScript.astro', modules: []},
  {source: 'src/ui/chrome/HeaderOffset.astro', modules: []},
  {
    source: 'src/ui/chrome/NavScript.astro',
    modules: ['NavScript.astro_astro_type_script_index_0_lang', 'ItemSwipeLayer', 'themeProps', 'scale', 'preload-helper', 'isRtlElement', 'icons', 'MenuBottomSheet', 'site', 'chrome', 'rolldown-runtime', 'Card'],
  },
  {source: 'src/ui/support/StatusScript.astro', modules: []},
  {source: 'src/ui/support/StatusCompactScript.astro', modules: ['StatusCompactScript.astro_astro_type_script_index_0_lang', 'status-client', 'StatusBoard']},
  {source: 'src/ui/support/StatusDashboardScript.astro', modules: ['StatusDashboardScript.astro_astro_type_script_index_0_lang', 'status-dashboard-client', 'Badge', 'StackItem', 'characters', 'TimestampHoverCard', 'IconButton']},
  {source: 'src/ui/home/HomeStatus.astro', modules: []},
  {source: 'src/ui/home/HomeLive.astro', modules: []},
  {source: 'src/ui/download/MirrorHealth.astro', modules: ['MirrorHealth.astro_astro_type_script_index_0_lang', 'mirrorHealth']},
  {source: 'src/ui/download/FilesScript.astro', modules: ['FilesScript.astro_astro_type_script_index_0_lang', 'files-client', 'LoadingRows']},
  {source: 'src/ui/download/PackagesScript.astro', modules: ['PackagesScript.astro_astro_type_script_index_0_lang', 'packages-client', 'EmptyState', 'columns', 'Banner', 'stickyHeader', 'filesData', 'ProgressBarMarkTooltip']},
  {source: 'src/ui/about/CostsSummaryScript.astro', modules: ['CostsSummaryScript.astro_astro_type_script_index_0_lang', 'Popover']},
  {source: 'src/ui/start/GuideSetupScript.astro', modules: ['GuideSetupScript.astro_astro_type_script_index_0_lang', 'Selector', 'Tab']},
  {source: 'src/ui/contributors/ContributorsScript.astro', modules: ['ContributorsScript.astro_astro_type_script_index_0_lang']},
  {source: 'src/ui/search/SearchButton.tsx', modules: ['SearchDialog', 'pagefind', 'LayoutContent', 'hooks', 'stackItem.stylex'], onDemand: true},
  {source: 'src/ui/contributors/ContributorsLibrary.tsx', modules: ['TextInput', 'Grid', 'OverflowList', 'searchControls']},
];
