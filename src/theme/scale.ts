// check:ui requires shared spacing and control sizes; see docs/design-language.md.

/** Astryx spacing steps (×4px). */
export const SPACE = {
  section: 10,
  gridColumn: 5,
  group: 8,
  block: 4,
  tight: 2,
  inline: 3,
  hairline: 1,
  cluster: 2,
  toolbar: 0.5,
  page: 6,
  heading: 3,
  sectionHeading: 6,
  code: 1,
} as const;

/** Astryx Button sizes: one per role, so a role has the same height on every page. */
export const BUTTON = {
  cta: 'lg',
  toolbar: 'md',
  sidebar: 'lg',
  inline: 'sm',
} as const;

/** Icon sizes by control role. */
export const ICON = {inline: 'sm', inlinePx: 16, toolbarPx: 20, channelPx: 32} as const;
/** Avatar sizes by display role. */
export const AVATAR = {compact: 'xsm', compactPx: 20, full: 'md', fullPx: 36, card: 'lg', profile: 96, profileDesktop: 128} as const;
export const CHIP = {small: 'sm'} as const;

/** Responsive grid minimums; landing columns narrow in layout.stylex.ts. */
export const GRID = {costSummary: 280, statusRail: 400, statusTile: 240, card: 280, landingColumns: 3, statusState: 104, statusMirror: 232, statusTree: 120, statusResponse: 112, category: 200} as const;

/** Padding by card role. */
export const CARD = {padding: 3, scorecard: 5} as const;

export const STACK = {fill: 'fill'} as const;

export const CODE = {cell: 'sm'} as const;

export const TEMPLATE = {
  zero: 0,
  sideGalleryWidth: 1400,
  sideGalleryColumn: 360,
  chartHeight: 280,
  sparkHeight: 40,
  chartMargin: {top: 12, right: 16, left: 0, bottom: 4},
  sparkMargin: {top: 4, right: 0, left: 0, bottom: 2},
  chartAxisWidth: 56,
  chartPointRadius: 3,
  /** Channel handles, including their platform mark, stay readable before Table scrolls. */
  channelPlatformWidth: 224,
  fill: 'fill',
  libraryColumn: 240,
  logoColumn: 200,
  productImageRatio: 1,
  libraryImageRatio: 16 / 9,
  libraryImageWidth: 144,
  libraryImageHeight: 81,
  narrow: '(max-width: 1024px)',
} as const;

/** Keep figure/date widths fixed; specifications use the remaining space. */
export const COSTS = {specWidth: 320, priceWidth: 160, dateWidth: 110, periodWidth: 100} as const;
