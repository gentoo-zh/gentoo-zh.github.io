// Shared layout measures; keep visual constants in src/theme/.
import * as stylex from '@stylexjs/stylex';

export const LAYOUT = stylex.defineConsts({
  logoSize: 24,
  wordmarkWidth: 116,
  wordmarkHeight: 40,
});

export const typography = stylex.defineConsts({
  sidebarLabelSize: '1rem',
  sidebarGroupWeight: '600',
  sidebarItemWeight: '400',
});

export const layout = stylex.defineConsts({
  bylineDividerHeight: '0.75em',
  contentMaxWidth: '1200px',
  proseMaxWidth: '800px',
  /** Reading column, outline gap and outline rail share one sidebar-page frame. */
  sidebarPageMaxWidth: 'calc(800px + var(--spacing-8) + 232px)',
  heroButtonsMaxWidth: '420px',
  tocWidth: '232px',
  landingColumns: 'repeat(3, minmax(0, 1fr))',
  landingTabletColumns: 'repeat(2, minmax(0, 1fr))',
  landingPhoneColumns: 'minmax(0, 1fr)',
});

/** Media queries of the copied docsite styles, used as StyleX condition keys. */
export const media = stylex.defineConsts({
  /** Below AppShell's md breakpoint, written as a negated min-width so equality stays desktop. */
  mobile: '@media not (min-width: 768px)',
  /** Footer viewport stacking point, independent of the shell's 768px breakpoint. */
  footerCompact: '@media (max-width: 45rem)',
  tablet: '@media (min-width: 768px)',
  /** Where the docsite's "On this page" rail gives way (DocPageLayout TOC_BREAKPOINT). */
  toc: '@media (max-width: 1024px)',
  desktop: '@media (min-width: 1024px)',
});

export const container = stylex.defineConsts({
  /** Guide controls stack according to their available width, including beside a sidebar. */
  guideCompact: '@container (max-width: 45rem)',
});

export const homeMedia = stylex.create({
  light: {display: {default: 'block', '@media (prefers-color-scheme: dark)': 'none', ':is(html[data-theme="light"] *)': 'block', ':is(html[data-theme="dark"] *)': 'none'}},
  dark: {display: {default: 'none', '@media (prefers-color-scheme: dark)': 'block', ':is(html[data-theme="light"] *)': 'none', ':is(html[data-theme="dark"] *)': 'block'}},
});

export const homeLayout = stylex.defineConsts({
  band: 'calc(100svh - var(--appshell-header-height))',
  headline: '3.25rem',
  sectionHeading: '2.1875rem',
  mark: '32rem',
  /** Hero columns: fixed text width so every locale lands in the same place. */
  heroGrid: 'minmax(0, 34rem) 32rem',
  markTablet: '18rem',
  markCompact: '12rem',
  sectionGap: '100px',
});
