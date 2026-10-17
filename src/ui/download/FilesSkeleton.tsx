// The directory table's columns, and the shared TableSkeleton shaped like them while a listing loads:
// on the server inside the mount point, then on each navigation. filesData.ts stays free of UI imports for scripts/check-code.mjs.
import {pixel, proportional} from '@astryxdesign/core/Table';
import {GRID} from '../../theme/scale';
import {useSkeletonColumns, type ColumnLayout} from '../data/columns';
import {TableSkeleton} from '../data/TableSkeleton';

/** Shared by the live table and its skeleton; the floors fit the narrowest wide table, so it never scrolls sideways. */
export const FILE_COLUMNS: readonly ColumnLayout[] = [
  {key: 'name', header: 'gz.files.col.name', width: proportional(4, {minWidth: GRID.fileName})},
  {key: 'size', header: 'gz.files.col.size', width: pixel(GRID.fileSize), align: 'end'},
  {key: 'mtime', header: 'gz.files.col.modified', width: proportional(2, {minWidth: GRID.fileDate})},
];

/** Phones stack the size and time under the name. */
export const FILE_COMPACT_COLUMNS: readonly ColumnLayout[] = [
  {key: 'name', header: 'gz.files.col.name', width: proportional(1)},
];

export function FilesSkeleton() {
  return <TableSkeleton columns={useSkeletonColumns(FILE_COLUMNS)} compactColumns={useSkeletonColumns(FILE_COMPACT_COLUMNS)} compactRowHeight="calc(var(--spacing-12) + var(--spacing-4))" />;
}
