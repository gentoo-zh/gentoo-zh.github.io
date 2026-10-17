// Adapted from the Astryx Table and Breadcrumbs examples; the listing loads from distfiles' `/_ls/`.
import {useEffect, useMemo, useState, type MouseEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars as space} from '@astryxdesign/core/theme/tokens.stylex';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {Table, useTableSortable, useTableSortableState} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import type {TableColumn, TableSortComparator} from '@astryxdesign/core/Table';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, SPACE, TEMPLATE} from '../../theme/scale';
import {layoutOf} from '../data/columns';
import {stickyHeader} from '../data/stickyHeader';
import {FILE_COLUMNS, FILE_COMPACT_COLUMNS, FilesSkeleton} from './FilesSkeleton';
import {
  FILES_TIMEOUT_MS,
  crumbsOf,
  dirPath,
  directoryOf,
  fileUrl,
  formatSize,
  listingUrl,
  parentOf,
  type ListingEntry,
} from './filesData';

type Listing =
  | {state: 'loading'}
  | {state: 'ready'; entries: ListingEntry[]}
  | {state: 'missing'}
  | {state: 'error'; reason: 'timeout' | 'failed'};

interface FileRow extends Record<string, unknown> {
  id: string;
  name: string;
  isDir: boolean;
  /** The `../` row: always first, never sorted. */
  isParent: boolean;
  href: string;
  size: number;
  mtime: number;
}

async function fetchListing(url: string, signal: AbortSignal): Promise<Listing> {
  const response = await fetch(url, {signal});
  if (response.status === 404) return {state: 'missing'};
  if (!response.ok) return {state: 'error', reason: 'failed'};
  const entries = (await response.json()) as unknown;
  return Array.isArray(entries) ? {state: 'ready', entries: entries as ListingEntry[]} : {state: 'error', reason: 'failed'};
}

/** Follow a same-page directory link without reloading; modified clicks keep the browser's behaviour. */
function inPage(navigate: (dir: string) => void, dir: string) {
  return (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(dir);
  };
}

const styles = stylex.create({
  // Distfile names rarely have spaces; break them anywhere so the name column never widens the table.
  name: {overflowWrap: 'anywhere'},
  // A size or time never wraps inside its cell.
  nowrap: {whiteSpace: 'nowrap'},
  // The trail keeps one height whether its last item is a link or the current page, so the table never moves.
  trail: {minHeight: space['--spacing-9']},
});

export interface FilesTableProps {
  languageTag: string;
  origin: string;
  base: string;
}

export function FilesTable({languageTag, origin, base}: FilesTableProps) {
  const t = useMessage();
  const host = new URL(origin).host;
  const [dir, setDir] = useState(() => directoryOf(window.location.pathname, base) ?? '');
  const [attempt, setAttempt] = useState(0);
  const [listing, setListing] = useState<Listing>({state: 'loading'});

  useEffect(() => {
    const onPop = () => setDir(directoryOf(window.location.pathname, base) ?? '');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [base]);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, FILES_TIMEOUT_MS);
    setListing({state: 'loading'});
    fetchListing(listingUrl(origin, dir), controller.signal)
      .then(setListing, () => {
        if (timedOut || !controller.signal.aborted) setListing({state: 'error', reason: timedOut ? 'timeout' : 'failed'});
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [origin, dir, attempt]);

  const navigate = (next: string) => {
    window.history.pushState(null, '', `${base}${next}`);
    window.scrollTo(0, 0);
    setDir(next);
  };

  const rows = useMemo(() => {
    if (listing.state !== 'ready') return [];
    return listing.entries.map((entry): FileRow => {
      const isDir = entry.type === 'directory';
      return {
        id: entry.name,
        name: entry.name,
        isDir,
        isParent: false,
        href: isDir ? `${base}${dirPath(dir, entry.name)}` : fileUrl(origin, dir, entry.name),
        size: isDir ? -1 : entry.size ?? 0,
        mtime: Date.parse(entry.mtime),
      };
    });
  }, [listing, base, dir, origin]);

  const collator = useMemo(() => new Intl.Collator(languageTag, {numeric: true}), [languageTag]);
  const comparators: Partial<Record<string, TableSortComparator<FileRow>>> = useMemo(
    () => ({
      name: (a, b) => collator.compare(a.name, b.name),
      size: (a, b) => a.size - b.size,
      mtime: (a, b) => a.mtime - b.mtime,
    }),
    [collator],
  );
  const {applySort, sortConfig} = useTableSortableState<FileRow>({data: rows, comparators, defaultSort: [{sortKey: 'name', direction: 'ascending'}]});
  const sortPlugin = useTableSortable<FileRow>(sortConfig);
  // Directories stay above files in every sort order.
  const sorted = useMemo(() => [...applySort(rows.filter(row => row.isDir)), ...applySort(rows.filter(row => !row.isDir))], [applySort, rows]);
  const parent: FileRow | null =
    dir === '' ? null : {id: '../', name: '../', isDir: true, isParent: true, href: `${base}${parentOf(dir)}`, size: -1, mtime: Number.NaN};
  const data = parent == null ? sorted : [parent, ...sorted];

  const isCompact = useMediaQuery(TEMPLATE.compactTable);
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(languageTag, {dateStyle: 'medium', timeStyle: 'short'}), [languageTag]);
  const size = (row: FileRow) => (row.isDir ? null : formatSize(row.size, languageTag));
  const mtime = (row: FileRow) => (Number.isNaN(row.mtime) ? null : dateFormat.format(row.mtime));
  const name = (row: FileRow) => (
    <VStack gap={SPACE.hairline}>
      {row.isDir ? (
        <Link href={row.href} xstyle={styles.name} onClick={inPage(navigate, row.isParent ? parentOf(dir) : dirPath(dir, row.name))}>
          {row.isParent ? row.name : `${row.name}/`}
        </Link>
      ) : (
        <Link href={row.href} xstyle={styles.name}>
          {row.name}
        </Link>
      )}
      {isCompact && mtime(row) != null ? (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {[size(row), mtime(row)].filter(part => part != null).join(' · ')}
        </Text>
      ) : null}
    </VStack>
  );
  const columns: TableColumn<FileRow>[] = isCompact
    ? [{...layoutOf(FILE_COMPACT_COLUMNS, 'name'), header: t('gz.files.col.name'), sortable: true, renderCell: name}]
    : [
        {...layoutOf(FILE_COLUMNS, 'name'), header: t('gz.files.col.name'), sortable: true, renderCell: name},
        {...layoutOf(FILE_COLUMNS, 'size'), header: t('gz.files.col.size'), sortable: true, renderCell: row => <Text hasTabularNumbers xstyle={styles.nowrap}>{size(row)}</Text>},
        {...layoutOf(FILE_COLUMNS, 'mtime'), header: t('gz.files.col.modified'), sortable: true, renderCell: row => <Text hasTabularNumbers xstyle={styles.nowrap}>{mtime(row)}</Text>},
      ];

  const crumbs = crumbsOf(dir);
  return (
    <VStack gap={SPACE.inline}>
      {/* The trail reads as a path: host / dir / dir /, the closing slash marking a directory like the table's names. */}
      <HStack gap={SPACE.tight} vAlign="center" xstyle={styles.trail}>
        <Breadcrumbs>
          <BreadcrumbItem href={base} onClick={inPage(navigate, '')} isCurrent={dir === ''}>
            {host}
          </BreadcrumbItem>
          {crumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.dir} href={`${base}${crumb.dir}`} onClick={inPage(navigate, crumb.dir)} isCurrent={index === crumbs.length - 1}>
              {crumb.name}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <Text color="secondary" aria-hidden>/</Text>
      </HStack>
      {listing.state === 'loading' ? (
        <FilesSkeleton />
      ) : listing.state === 'missing' ? (
        <EmptyState title={t('gz.files.missing.title')} description={t('gz.files.missing.description', {host})} />
      ) : listing.state === 'error' ? (
        <EmptyState
          title={t('gz.files.error.title')}
          description={listing.reason === 'timeout' ? t('gz.files.error.timeout', {host}) : t('gz.files.error.failed', {host})}
          actions={<Button label={t('gz.files.retry')} variant="secondary" size={BUTTON.inline} onClick={() => setAttempt(value => value + 1)} />}
        />
      ) : (
        <>
          {data.length > 0 ? (
            <Table<FileRow> data={data} columns={columns} idKey="id" density="balanced" dividers="none" hasHover textOverflow="wrap" verticalAlign="top" plugins={{sort: sortPlugin, stickyHeader: stickyHeader<FileRow>()}} />
          ) : null}
          {rows.length === 0 ? <EmptyState title={t('gz.files.empty.title')} /> : null}
        </>
      )}
    </VStack>
  );
}
