// Column layouts shared by a live table and the loading skeleton the server renders in its place.
import type {ColumnWidth} from '@astryxdesign/core/Table';
import type {MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import type {SkeletonColumn} from './LoadingRows';

export interface ColumnLayout {
  key: string;
  header: MessageKey;
  width: ColumnWidth;
  align?: 'end';
  /** Lines the cell usually takes, for the loading placeholder. */
  lines?: 1 | 2;
}

/** The live column's key, width and alignment, taken from the same layout as its skeleton. */
export function layoutOf(layouts: readonly ColumnLayout[], key: string) {
  const layout = layouts.find(item => item.key === key);
  if (layout == null) throw new Error(`columns: no column ${key}`);
  return {key, width: layout.width, align: layout.align};
}

export function useSkeletonColumns(layouts: readonly ColumnLayout[]): SkeletonColumn[] {
  const t = useMessage();
  return layouts.map(({key, header, width, align, lines}) => ({key, header: t(header), width, align, lines}));
}
