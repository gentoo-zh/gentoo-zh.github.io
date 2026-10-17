// Adapted from the Astryx table-filter template's LoadingRows (MIT, Meta Platforms, Inc.).
// Kept apart from TableSkeleton so client bundles that only draw rows skip its header Table.
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import type {TableColumn, TableDensity} from '@astryxdesign/core/Table';
import {SPACE, TEMPLATE} from '../../theme/scale';

/** Placeholder rows; enough to fill the first screen so the swap moves nothing below the fold. */
export const SKELETON_ROWS = 12;

type Density = TableDensity;

/** One placeholder column: the live column's key, header and width. */
export type SkeletonColumn = Pick<TableColumn<Record<string, unknown>>, 'key' | 'header' | 'width' | 'align'> & {
  /** Text lines the live cell usually takes; two-line cells get a shorter second bar, and 0 keeps a control column (the expansion chevron) empty. */
  lines?: 0 | 1 | 2;
};

/** Cell padding per density, mirroring the table's own scale. */
const DENSITY_PADDING: Record<Density, string> = {
  compact: spacingVars['--spacing-2'],
  balanced: spacingVars['--spacing-3'],
  spacious: spacingVars['--spacing-4'],
};

const styles = stylex.create({
  // Dividers between rows only, as Table draws them.
  skeletonRow: {
    borderBlockStartColor: colorVars['--color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: borderVars['--border-width'],
  },
  // The table bleeds past this container to the layout edge and re-applies the
  // inset on its outer cells. Matching that keeps the two grids on one axis.
  skeletonBleed: {marginInline: 'calc(-1 * var(--container-padding-inline-start, 0rem))'},
  skeletonEdgeStart: {paddingInlineStart: `max(var(--container-padding-inline-start, 0rem), ${spacingVars['--spacing-2']})`},
  skeletonEdgeEnd: {paddingInlineEnd: `max(var(--container-padding-inline-end, 0rem), ${spacingVars['--spacing-2']})`},
});

/**
 * Widths come straight from the column definitions, so each bar sits under the column it fills.
 * The padding sits inside the sized cell: on a flexible cell it would join the flex basis, and outer
 * cells with the wider edge inset would then grow apart from their proportional share.
 */
const skeletonCell = stylex.create({
  row: (paddingBlock: string, minHeight: string) => ({paddingBlock, minHeight}),
  fixed: (width: number) => ({flexGrow: 0, flexShrink: 0, width}),
  flexible: (flexGrow: number, minWidth: number) => ({flexBasis: 0, flexGrow, minWidth}),
  inset: (paddingInline: string) => ({paddingInline}),
});

/** The rows still loading, drawn as rows rather than a spinner so the page keeps its shape. */
export function LoadingRows({columns, density = 'balanced', rows = SKELETON_ROWS, rowHeight = '0rem'}: {
  columns: readonly SkeletonColumn[];
  density?: Density;
  rows?: number;
  /** Minimum height of one placeholder row, matched to the live row. */
  rowHeight?: string;
}) {
  const pad = DENSITY_PADDING[density];
  return (
    <VStack gap={TEMPLATE.zero} xstyle={styles.skeletonBleed}>
      {Array.from({length: rows}, (_, row) => (
        <HStack key={row} gap={TEMPLATE.zero} vAlign="center" aria-hidden xstyle={[styles.skeletonRow, skeletonCell.row(pad, rowHeight)]}>
          {columns.map((column, index) => (
            <VStack
              key={column.key}
              gap={TEMPLATE.zero}
              vAlign="center"
              xstyle={column.width?.type === 'pixel' ? skeletonCell.fixed(column.width.value) : skeletonCell.flexible(column.width?.value ?? 1, column.width?.minWidth ?? 0)}>
              <VStack
                gap={TEMPLATE.zero}
                hAlign={column.align === 'end' ? 'end' : 'start'}
                xstyle={[skeletonCell.inset(pad), index === 0 && styles.skeletonEdgeStart, index === columns.length - 1 && styles.skeletonEdgeEnd]}>
                {column.lines === 0 ? null : column.lines === 2 ? (
                  <VStack gap={SPACE.toolbar} width="100%">
                    <Skeleton height={14} index={row * columns.length + index} />
                    <Skeleton width="40%" height={11} index={row * columns.length + index + 1} />
                  </VStack>
                ) : (
                  <Skeleton height={12} index={row * columns.length + index} />
                )}
              </VStack>
            </VStack>
          ))}
        </HStack>
      ))}
    </VStack>
  );
}
