// Adapted from the Astryx table-filter template's LoadingRows (MIT, Meta Platforms, Inc.).
// Rendered on the server inside an island's mount point; the island's first render replaces it.
// Skeleton rows only: the template keeps its ProgressBar for refetching rows already on screen, and
// the Skeleton guidance says to pick one loading pattern per content area.
import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Table} from '@astryxdesign/core/Table';
import type {TableDensity} from '@astryxdesign/core/Table';
import {media} from '../../theme/layout.stylex';
import {useMessage} from '../../i18n/useMessage';
import {TEMPLATE} from '../../theme/scale';
import {LoadingRows, SKELETON_ROWS, type SkeletonColumn} from './LoadingRows';
import {stickyHeader} from './stickyHeader';

export {LoadingRows, SKELETON_ROWS, type SkeletonColumn} from './LoadingRows';

type Density = TableDensity;

/**
 * The live tables' plugin. Without it Table pulls a first-child wrapper up into the container's block
 * padding, which put the header row over the line above it; with it the header lands where the live one does.
 */
const PLUGINS = {stickyHeader: stickyHeader<Record<string, unknown>>()};

const styles = stylex.create({
  wide: {display: {default: 'flex', [media.mobile]: 'none'}},
  narrow: {display: {default: 'none', [media.mobile]: 'flex'}},
});

function SkeletonTable({columns, density, rows, rowHeight, xstyle}: {
  columns: readonly SkeletonColumn[];
  density: Density;
  rows: number;
  rowHeight?: string;
  xstyle?: stylex.StyleXStyles;
}) {
  // The live Table draws the header row, so its labels and widths match the loaded table exactly.
  const header = columns.map(({key, header, width, align}) => ({key, header, width, align}));
  return (
    <VStack gap={TEMPLATE.zero} xstyle={xstyle}>
      <Table data={[]} columns={header} density={density} dividers="rows" emptyState={false} plugins={PLUGINS} />
      <LoadingRows columns={columns} density={density} rows={rows} rowHeight={rowHeight} />
    </VStack>
  );
}

export interface TableSkeletonProps {
  columns: readonly SkeletonColumn[];
  /** Columns the phone layout shows instead, when it merges or drops columns. */
  compactColumns?: readonly SkeletonColumn[];
  density?: Density;
  rows?: number;
  rowHeight?: string;
  compactRowHeight?: string;
}

/** A loading table: the live header row, then placeholder rows shaped like the live columns. */
export function TableSkeleton({columns, compactColumns, density = 'balanced', rows = SKELETON_ROWS, rowHeight, compactRowHeight}: TableSkeletonProps) {
  const t = useMessage();
  const label = t('gz.data.loading');
  return (
    <VStack gap={TEMPLATE.zero} role="status" aria-busy aria-label={label} data-gz-skeleton>
      {compactColumns == null ? (
        <SkeletonTable columns={columns} density={density} rows={rows} rowHeight={rowHeight} />
      ) : (
        <>
          <SkeletonTable columns={columns} density={density} rows={rows} rowHeight={rowHeight} xstyle={styles.wide} />
          <SkeletonTable columns={compactColumns} density={density} rows={rows} rowHeight={compactRowHeight ?? rowHeight} xstyle={styles.narrow} />
        </>
      )}
    </VStack>
  );
}
