// Keep a data table's header row under the sticky site navbar while the page scrolls.
// Astryx 0.7 pins columns (useTableStickyColumns) but not the header row.
import * as stylex from '@stylexjs/stylex';
import type {FocusEvent} from 'react';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {TablePlugin} from '@astryxdesign/core/Table';

/** Room between the stuck header row and a focused body element, so its focus ring shows. */
const FOCUS_GAP = 8;

/**
 * Focus moving up the rows (Shift+Tab) scrolls its target to the viewport top, under the navbar
 * and the stuck header row; scroll it back down below them. The header cells stick, not the
 * <thead>, so a cell's box gives the header's current bottom edge.
 */
function revealBelowHeader(event: FocusEvent<HTMLTableElement>) {
  const target = event.target;
  const cell = event.currentTarget.tHead?.querySelector('th');
  if (cell == null || !(target instanceof Element) || cell.closest('thead')?.contains(target)) return;
  const overlap = cell.getBoundingClientRect().bottom + FOCUS_GAP - target.getBoundingClientRect().top;
  if (overlap > 0) window.scrollBy({top: -overlap});
}

const styles = stylex.create({
  // Table bleeds its first/last child into a padded container's block padding; inside an article
  // that pulls the next paragraph onto the table, so the wrapper keeps the article's block gap.
  inArticle: {marginTop: 0, marginBottom: 0},
  // A scroll container would capture position: sticky, so the wrapper only clips. Every data table
  // fits its column (no horizontal scroll), so nothing is cut off.
  clip: {overflowX: 'clip !important', overflowY: 'clip !important'},
  cell: {
    position: 'sticky',
    // HeaderOffset.astro publishes the navbar height before first paint.
    insetBlockStart: 'var(--appshell-header-height, 0rem)',
    // Above body cells and their sticky-column layers (Astryx uses 3 for pinned header cells).
    zIndex: 4,
    backgroundColor: `var(--table-sticky-background, ${colorVars['--color-background-surface']})`,
    backgroundClip: 'padding-box',
  },
});

const IN_ARTICLE: TablePlugin<Record<string, unknown>> = {
  transformScrollWrapper: props => ({...props, xstyle: [...props.xstyle, styles.inArticle]}),
};

const STICKY_HEADER: TablePlugin<Record<string, unknown>> = {
  transformTable: props => ({
    ...props,
    htmlProps: {
      ...props.htmlProps,
      onFocus: event => {
        props.htmlProps.onFocus?.(event);
        revealBelowHeader(event);
      },
    },
  }),
  transformScrollWrapper: props => ({...props, xstyle: [...props.xstyle, styles.inArticle, styles.clip]}),
  transformHeaderCell: props => ({...props, xstyle: [...props.xstyle, styles.cell]}),
};

/** Margins only, for a table in a page that keeps the sticky outline bar (it would cover the header). */
export function articleTable<T extends Record<string, unknown>>(): TablePlugin<T> {
  return IN_ARTICLE as TablePlugin<T>;
}

/**
 * The shared sticky-header plugin; one stable object, so Table memoizes its pipeline. Its page must not
 * show the outline bar (SectionPage `isTablePage`), which sticks at the same offset below 1024px.
 */
export function stickyHeader<T extends Record<string, unknown>>(): TablePlugin<T> {
  return STICKY_HEADER as TablePlugin<T>;
}
