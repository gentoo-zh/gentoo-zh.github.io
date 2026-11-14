// Adapted from the Astryx table-page template; the hourly package index loads in the browser.
// Rows open their details as in the Astryx table-collapsible template (useTableRowExpansion).
// The header (tabs, toolbar, results line) is PackagesFrame, shared with the server's loading frame.
import * as stylex from '@stylexjs/stylex';
import {Fragment, memo, useCallback, useDeferredValue, useMemo, useState, type ReactNode} from 'react';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {usePowerSearchConfig} from '@astryxdesign/core/PowerSearch';
import type {PowerSearchFilter} from '@astryxdesign/core/PowerSearch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  Table,
  toSearchFilters,
  useTableFilterState,
  useTableFiltering,
  useTableRowExpansion,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin, TableSortComparator} from '@astryxdesign/core/Table';
import {Minus} from './PackagesIcons';
import {PackagesFrame, type Channel, type View} from './PackagesFrame';
import {useMessage} from '../../i18n/useMessage';
import type {MessageKey} from '../../i18n/locales';
import {BUTTON, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {layoutOf} from '../data/columns';
import {stickyHeader} from '../data/stickyHeader';
import {formatSize} from './filesData';
import {
  DEPS_COLUMNS,
  DEPS_COMPACT_COLUMNS,
  MARK_COLOR,
  PACKAGE_COMPACT_COLUMNS,
  STATUS_COLOR,
  overlayUrl,
  packageColumns,
  type PackageStatus,
  type TokenColor,
} from './packagesData';

/** One entry of `packages.json` (schema 4, or 5 with `ver` and `size`), as build/gen-packages.py writes it. */
export interface PackageEntry {
  cp: string;
  binhost: boolean;
  dist: string[];
  why?: string;
  excluded?: string | boolean;
  channelExcluded?: string | boolean;
  policy?: string;
  removed?: boolean;
  /** Schema 5: the published version and its binary package size in bytes. */
  ver?: string;
  size?: number;
  /** The published build's IUSE flags as emerge -pv shows them: `flag` on, `-flag` off. */
  use?: string[];
}

/** One entry of `deps` in `packages.json`: a `::gentoo` dependency the binhost publishes. */
export interface DepEntry extends Record<string, unknown> {
  cp: string;
  ver: string;
  slot: string;
  /** Present when it differs from the slot. */
  subslot?: string;
  /** As in PackageEntry. */
  use?: string[];
  /** Only on builds sharing name, slot and version: the bound dependency subslots that tell them apart. */
  bindings?: string[];
}

export interface PackageIndex {
  generated: number;
  packages: PackageEntry[];
  deps?: DepEntry[];
}

/** Keep a search parameter in the address bar, so the view and the query can be linked. */
function setParam(name: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value == null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  window.history.replaceState(null, '', url);
}

type Status = PackageStatus;

/** `why` codes that have a reason sentence of their own (the others are their own status). */
const WHY_REASONS = new Set(['prebuilt', 'nobuild', 'candidate']);

interface PackageRow extends Record<string, unknown> {
  cp: string;
  status: Status;
  /** The public index has a binary package; the binary package column's mark. */
  published: boolean;
  policy: string;
  removed: boolean;
  why: string;
  /** Distfile count, for sorting. */
  dist: number;
  hasDist: boolean;
  /** The two marks as enum values: the Astryx 0.7 filter popover has no editor for a boolean field. */
  binMark: Mark;
  distMark: Mark;
  distfiles: string[];
  use: string[];
  ver: string;
  /** Bytes; -1 when the index carries no size (schema 4). */
  size: number;
  /** Status, policy and reason words, lower-cased, so the search box matches what the tokens say. */
  words: string;
  /** Set only on the copy an open row renders from; see OPEN_KEYS. */
  isOpen?: true;
}

type Mark = 'yes' | 'no';
const MARKS = ['yes', 'no'] as const;
const markOf = (isYes: boolean): Mark => (isYes ? 'yes' : 'no');

interface RowToken {
  key: string;
  label: string;
  color: TokenColor;
}

/** Schema 5 carries `ver` and `size`; schema 4 carries neither. */
const hasVersionsOf = (index: PackageIndex) => index.packages.some(entry => entry.ver != null || entry.size != null);

/**
 * Whether the channel's public index has a binary package for the entry. Schema 5 records it as `ver`;
 * schema 4 has no versions, so the direct build list (`binhost`) stands in.
 */
const isPublished = (entry: PackageEntry, hasVersions: boolean) => (hasVersions ? entry.ver != null : entry.binhost);

function statusOf(entry: PackageEntry, published: boolean): Status {
  if (entry.binhost) return published ? 'published' : 'pending';
  if (entry.excluded) return 'excluded';
  if (entry.channelExcluded) return 'channel';
  if (entry.why === 'live' || entry.why === 'masked' || entry.why === 'nokeyword') return entry.why;
  if (entry.policy || entry.removed || entry.why === 'removed') return 'unpublished';
  if (entry.why != null && WHY_REASONS.has(entry.why)) return 'offlist';
  return 'pending';
}

function policyLabel(policy: string, t: ReturnType<typeof useMessage>) {
  return policy === 'license' ? t('gz.packages.status.license') : policy === 'bindist' ? t('gz.packages.status.bindist') : policy;
}

/**
 * The tokens beside a name. A plain published row has none. The policy stands in for the bare
 * `unpublished` status it causes, and `removed` follows either.
 */
function tokensOf(row: PackageRow, t: ReturnType<typeof useMessage>): RowToken[] {
  const tokens: RowToken[] = [];
  if (row.status !== 'published' && !(row.status === 'unpublished' && row.policy !== '')) {
    tokens.push({key: 'status', label: t(`gz.packages.status.${row.status}` as MessageKey), color: STATUS_COLOR[row.status]});
  }
  if (row.policy !== '') tokens.push({key: 'policy', label: policyLabel(row.policy, t), color: MARK_COLOR.policy});
  if (row.removed) tokens.push({key: 'removed', label: t('gz.packages.status.removed'), color: MARK_COLOR.removed});
  return tokens;
}

function toRows(index: PackageIndex, t: ReturnType<typeof useMessage>): PackageRow[] {
  const hasVersions = hasVersionsOf(index);
  return index.packages.map(entry => {
    const published = isPublished(entry, hasVersions);
    const reason = typeof entry.excluded === 'string' ? entry.excluded : typeof entry.channelExcluded === 'string' ? entry.channelExcluded : null;
    const why = reason ?? (entry.why != null && WHY_REASONS.has(entry.why) ? t(`gz.packages.why.${entry.why}` as MessageKey) : '');
    const status = statusOf(entry, published);
    const policy = entry.policy ?? '';
    const words = [t(`gz.packages.status.${status}` as MessageKey), policy === '' ? '' : policyLabel(policy, t), why].join(' ').toLowerCase();
    return {
      cp: entry.cp,
      status,
      published,
      policy,
      removed: entry.removed === true || entry.why === 'removed',
      why,
      dist: entry.dist.length,
      hasDist: entry.dist.length > 0,
      binMark: markOf(published),
      distMark: markOf(entry.dist.length > 0),
      distfiles: entry.dist,
      use: entry.use ?? [],
      ver: entry.ver ?? '',
      size: entry.size ?? -1,
      words,
    };
  });
}

/**
 * The rows of a second channel, sharing each row object that the first channel has with equal values.
 * Table re-renders a row only when its object changes, so a channel switch redraws only the rows that differ.
 */
function shareRows(rows: PackageRow[], base: readonly PackageRow[]): PackageRow[] {
  const byName = new Map(base.map(row => [row.cp, row]));
  return rows.map(row => {
    const other = byName.get(row.cp);
    if (other == null) return row;
    const same = (Object.keys(row) as (keyof PackageRow)[]).every(key =>
      key === 'distfiles' || key === 'use' ? row[key].join('\n') === other[key].join('\n') : row[key] === other[key],
    );
    return same ? other : row;
  });
}

/**
 * Row expansion without rebuilding the plugin. useTableRowExpansion memoizes on its `expandedKeys`, and
 * a new plugin re-renders all rows, so the plugin gets this fixed lookup instead: an open row renders
 * from a copy flagged `isOpen`, and its expansion key carries the OPEN prefix. Toggling a row then
 * swaps only that row's object, and Table re-renders that row alone.
 */
const OPEN = 'open:';
const OPEN_KEYS = {has: (key: string) => key.startsWith(OPEN)} as unknown as Set<string>;
const expansionKeyOf =
  <T extends {isOpen?: true}>(keyOf: (row: T) => string) =>
  (row: T) =>
    row.isOpen ? `${OPEN}${keyOf(row)}` : keyOf(row);
const OPENED = new WeakMap<object, object>();
function opened<T extends object>(row: T): T {
  let copy = OPENED.get(row) as T | undefined;
  if (copy == null) {
    copy = {...row, isOpen: true};
    OPENED.set(row, copy);
  }
  return copy;
}

/** Expansion state for one table: a toggle takes either form of a row's key. */
function useExpanded() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const onToggle = useCallback(
    (key: string) =>
      setExpanded(previous => {
        const id = key.startsWith(OPEN) ? key.slice(OPEN.length) : key;
        const next = new Set(previous);
        if (!next.delete(id)) next.add(id);
        return next;
      }),
    [],
  );
  return [expanded, onToggle] as const;
}

/**
 * The plugin also gives every body cell a context menu with one entry, expand or collapse. Each menu
 * mounts a layer that reads computed styles, which made mounting 520 rows several times slower, and
 * it took the browser's own menu off the package links. The chevron stays the way to open a row.
 */
function withoutRowMenu<T extends Record<string, unknown>>(plugin: TablePlugin<T>): TablePlugin<T> {
  return {...plugin, transformBodyCell: (props, ...rest) => ({...plugin.transformBodyCell!(props, ...rest), contextMenuActions: props.contextMenuActions})};
}

/** One collator per order: comparing through `localeCompare` builds a collator on every call. */
const NAME_ORDER = new Intl.Collator();
const PACKAGE_KEY = expansionKeyOf<PackageRow>(row => row.cp);
const VERSION_ORDER = new Intl.Collator(undefined, {numeric: true});

const styles = stylex.create({
  // A Go or Rust package lists hundreds of distfiles; the list scrolls inside the details instead.
  distfiles: {maxHeight: '15rem', overflowY: 'auto', overflowWrap: 'anywhere'},
  // One text node per list, one name per line: up to 302 names cost one element, not 302.
  distfileNames: {whiteSpace: 'pre-line'},
  // The tables bleed into the container padding (Astryx Table default).
  tables: {position: 'relative', minWidth: 0},
  // A plain block, so the other view's native `hidden` (display: none) applies. The content-visibility
  // rule used before never reached the page, so both views painted, one under the other.
  view: {minWidth: 0},
  // USE flags and bound subslots wrap between words; a long word breaks rather than widening the row.
  words: {overflowWrap: 'anywhere'},
  // The template's reload bar: drawn over the top edge of the rows already on screen, no layout shift.
  progress: {position: 'absolute', insetBlockStart: 0, insetInline: 0, zIndex: 5},
});

/** A yes/no mark: a check or a dash, each named for screen readers. */
function MarkIcon({isYes}: {isYes: boolean}) {
  const t = useMessage();
  return isYes ? (
    <Icon icon="check" color="success" size={ICON.inline} label={t('gz.packages.mark.yes')} />
  ) : (
    <Icon icon={Minus} color="secondary" size={ICON.inline} label={t('gz.packages.mark.no')} />
  );
}

/** USE flags in emerge -pv form: enabled flags in the text colour, disabled (`-flag`) ones muted. */
function UseFlags({flags, type}: {flags: readonly string[]; type?: 'supporting'}) {
  return (
    <Text type={type} color="primary" xstyle={styles.words}>
      {flags.map((flag, index) => (
        <Fragment key={flag}>
          {index === 0 ? null : ' '}
          <Text type="inherit" color={flag.startsWith('-') ? 'secondary' : 'inherit'}>{flag}</Text>
        </Fragment>
      ))}
    </Text>
  );
}

/** The row's details: status, policy, reason, both marks, USE and the distfile names. */
function PackageDetails({row, languageTag}: {row: PackageRow; languageTag: string}) {
  const t = useMessage();
  return (
    <MetadataList>
      <MetadataListItem label={t('gz.packages.col.status')}>
        <HStack gap={SPACE.hairline} wrap="wrap">
          <Token color={STATUS_COLOR[row.status]} label={t(`gz.packages.status.${row.status}` as MessageKey)} />
          {row.removed ? <Token color={MARK_COLOR.removed} label={t('gz.packages.status.removed')} /> : null}
        </HStack>
      </MetadataListItem>
      {row.policy === '' ? null : (
        <MetadataListItem label={t('gz.packages.col.policy')}>
          <HStack gap={SPACE.hairline}><Token color={MARK_COLOR.policy} label={policyLabel(row.policy, t)} /></HStack>
        </MetadataListItem>
      )}
      {row.why === '' ? null : <MetadataListItem label={t('gz.packages.col.why')}><Text>{row.why}</Text></MetadataListItem>}
      <MetadataListItem label={t('gz.packages.col.binpkg')}>
        <HStack gap={SPACE.hairline} vAlign="center">
          <MarkIcon isYes={row.published} />
          {row.ver === '' ? null : <Text hasTabularNumbers>{row.ver}</Text>}
          {row.size < 0 ? null : <Text color="secondary" hasTabularNumbers>{formatSize(row.size, languageTag)}</Text>}
        </HStack>
      </MetadataListItem>
      {row.use.length === 0 ? null : <MetadataListItem label={t('gz.packages.col.use')}><UseFlags flags={row.use} /></MetadataListItem>}
      <MetadataListItem label={t('gz.packages.col.dist')}>
        {row.hasDist ? (
          <VStack gap={TEMPLATE.zero} xstyle={styles.distfiles} tabIndex={0} role="region" aria-label={`${t('gz.packages.col.dist')}: ${row.cp}`}>
            <Text hasTabularNumbers xstyle={styles.distfileNames}>{row.distfiles.join('\n')}</Text>
          </VStack>
        ) : (
          <MarkIcon isYes={false} />
        )}
      </MetadataListItem>
    </MetadataList>
  );
}

export interface PackagesTableProps {
  languageTag: string;
  stable: PackageIndex;
  /** Absent until packages-unstable.json loads, or when it fails. */
  unstable: PackageIndex | null;
  /** The status reference page, linked from the toolbar. */
  statusHref: string;
}

export function PackagesTable({languageTag, stable, unstable, statusHref}: PackagesTableProps) {
  const t = useMessage();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [view, setViewState] = useState<View>(() => (new URLSearchParams(window.location.search).get('view') === 'deps' ? 'deps' : 'packages'));
  const setView = (value: View) => {
    setViewState(value);
    setParam('view', value === 'deps' ? 'deps' : null);
  };
  const [channel, setChannel] = useState<Channel>('stable');
  // Off-list packages are not meant for the binhost, so the table leaves them out until asked.
  const [hideOffList, setHideOffList] = useState(true);
  const {filters: columnFilters, onFilterChange, clearAll} = useTableFilterState();
  // The controls show their new state at once; the tables follow in a background render that input
  // can interrupt, and the reload bar marks the rows on screen as stale until then.
  const shownView = useDeferredValue(view);
  const shownChannel = useDeferredValue(channel);
  const shownQuery = useDeferredValue(query);
  const shownFilters = useDeferredValue(columnFilters);
  const shownHideOffList = useDeferredValue(hideOffList);
  const isCompact = useMediaQuery(TEMPLATE.compactTable);

  // Both channels' rows once per load; equal rows are one object, so a switch redraws only the rest.
  const stableRows = useMemo(() => toRows(stable, t), [stable, t]);
  const unstableRows = useMemo(() => (unstable == null ? null : shareRows(toRows(unstable, t), stableRows)), [unstable, stableRows, t]);
  const isUnstable = shownChannel === 'unstable' && unstable != null;
  const index = isUnstable ? unstable : stable;
  const channelRows = isUnstable && unstableRows != null ? unstableRows : stableRows;
  const rows = useMemo(() => (shownHideOffList ? channelRows.filter(row => row.status !== 'offlist') : channelRows), [channelRows, shownHideOffList]);
  // Schema 4 carries no version or size; their columns stay hidden until the index does.
  const hasVersions = useMemo(() => hasVersionsOf(index), [index]);

  const searchFields = useMemo(() => {
    const markValues = MARKS.map(value => ({value, label: t(`gz.packages.mark.${value}`)}));
    return [
        {key: 'cp', type: 'string', label: t('gz.packages.col.package')},
        {key: 'binMark', type: 'enum', label: t('gz.packages.col.binpkg'), enumValues: markValues},
        {key: 'distMark', type: 'enum', label: t('gz.packages.col.dist'), enumValues: markValues},
        {key: 'ver', type: 'string', label: t('gz.packages.col.version')},
        {key: 'size', type: 'number', label: t('gz.packages.col.size')},
    ] as const;
  }, [t]);
  const {config, applyFilters} = usePowerSearchConfig(searchFields, t('gz.packages.col.package'));
  const filterPlugin = useTableFiltering<PackageRow>({filters: columnFilters, onFilterChange, searchConfig: config, variant: 'popover'});

  const [expanded, onToggle] = useExpanded();
  const renderExpanded = useCallback((row: PackageRow) => <PackageDetails row={row} languageTag={languageTag} />, [languageTag]);
  const rowExpansion = useTableRowExpansion<PackageRow>({expandedKeys: OPEN_KEYS, onToggle, getRowKey: PACKAGE_KEY, renderExpanded});
  const expansionPlugin = useMemo(() => withoutRowMenu(rowExpansion), [rowExpansion]);

  const columns: TableColumn<PackageRow>[] = useMemo(() => {
    const name = (row: PackageRow) => (
      <HStack gap={SPACE.hairline} vAlign="center" wrap="wrap">
        {row.removed ? <Text>{row.cp}</Text> : <Link href={overlayUrl(row.cp)}>{row.cp}</Link>}
        {tokensOf(row, t).map(token => <Token key={token.key} color={token.color} label={token.label} />)}
      </HStack>
    );
    const distMark = (row: PackageRow) => (
      <HStack gap={SPACE.hairline} vAlign="center">
        <MarkIcon isYes={row.hasDist} />
        {row.hasDist ? <Text type="supporting" color="secondary" hasTabularNumbers>{String(row.dist)}</Text> : null}
      </HStack>
    );
    if (isCompact) {
      // Phones stack both marks, each with its column's name, under the name.
      const labelled = (label: string, mark: ReactNode) => (
        <HStack gap={SPACE.hairline} vAlign="center"><Text type="supporting" color="secondary">{label}</Text>{mark}</HStack>
      );
      return [
        {
          ...layoutOf(PACKAGE_COMPACT_COLUMNS, 'cp'),
          header: t('gz.packages.col.package'),
          sortable: true,
          filter: 'cp',
          renderCell: row => (
            <VStack gap={SPACE.hairline}>
              {name(row)}
              <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
                {labelled(t('gz.packages.col.binpkg'), <MarkIcon isYes={row.published} />)}
                {labelled(t('gz.packages.col.dist'), distMark(row))}
              </HStack>
            </VStack>
          ),
        },
      ];
    }
    const layouts = packageColumns(hasVersions);
    const all: TableColumn<PackageRow>[] = [
      {...layoutOf(layouts, 'cp'), header: t('gz.packages.col.package'), sortable: true, filter: 'cp', renderCell: name},
      {...layoutOf(layouts, 'binhost'), header: t('gz.packages.col.binpkg'), sortable: true, filter: 'binMark', renderCell: row => <MarkIcon isYes={row.published} />},
      {...layoutOf(layouts, 'dist'), header: t('gz.packages.col.dist'), sortable: true, filter: 'distMark', renderCell: distMark},
    ];
    if (hasVersions) {
      all.push(
        {...layoutOf(layouts, 'ver'), header: t('gz.packages.col.version'), sortable: true, filter: 'ver', renderCell: row => <Text hasTabularNumbers>{row.ver}</Text>},
        {
          ...layoutOf(layouts, 'size'),
          header: t('gz.packages.col.size'),
          sortable: true,
          filter: 'size',
          renderCell: row => <Text hasTabularNumbers>{row.size < 0 ? '' : formatSize(row.size, languageTag)}</Text>,
        },
      );
    }
    return all;
  }, [t, isCompact, hasVersions, languageTag]);
  const comparators: Partial<Record<string, TableSortComparator<PackageRow>>> = useMemo(
    () => ({
      cp: (a, b) => NAME_ORDER.compare(a.cp, b.cp),
      binhost: (a, b) => Number(a.published) - Number(b.published),
      dist: (a, b) => a.dist - b.dist,
      ver: (a, b) => VERSION_ORDER.compare(a.ver, b.ver),
      size: (a, b) => a.size - b.size,
    }),
    [],
  );

  const term = shownQuery.trim().toLowerCase();
  const visible = useMemo(() => {
    const predicates = toSearchFilters(shownFilters, columns, config) as PowerSearchFilter[];
    const matched = applyFilters(predicates, rows);
    // Status, policy and reason have no column of their own, so the search box matches them too.
    return term === '' ? matched : matched.filter(row => row.cp.toLowerCase().includes(term) || row.words.includes(term));
  }, [applyFilters, shownFilters, columns, config, rows, term]);
  const deps = useMemo(() => (index.deps == null ? null : toDepRows(index.deps)), [index]);
  const depsHaveUse = useMemo(() => deps != null && deps.some(hasUse), [deps]);
  const visibleDeps = useMemo(
    () => (deps == null || term === '' ? deps : deps.filter(row => [row.cp, row.slot, row.ver].some(value => value.toLowerCase().includes(term)))),
    [deps, term],
  );
  // The sort plugin reads its state through a ref, so the header shows the new order in the urgent
  // render, while the reordered rows arrive with the deferred data.
  const {sortedData, sortConfig} = useTableSortableState<PackageRow>({data: visible, comparators});
  const sortPlugin = useTableSortable<PackageRow>(sortConfig);
  const shownData = useDeferredValue(sortedData);
  const tableData = useMemo(() => (expanded.size === 0 ? shownData : shownData.map(row => (expanded.has(row.cp) ? opened(row) : row))), [shownData, expanded]);
  const plugins = useMemo(
    () => ({sort: sortPlugin, filter: filterPlugin, expansion: expansionPlugin, stickyHeader: stickyHeader<PackageRow>()}),
    [sortPlugin, filterPlugin, expansionPlugin],
  );
  const isPending = view !== shownView || channel !== shownChannel || query !== shownQuery || columnFilters !== shownFilters || hideOffList !== shownHideOffList || sortedData !== shownData;

  const onQuery = (value: string) => {
    setQuery(value);
    setParam('q', value.trim() === '' ? null : value.trim());
  };
  // The column filters belong to the packages view; the deps view only searches.
  const searchCount = term === '' ? 0 : 1;
  const clearPackages = () => {
    onQuery('');
    clearAll();
  };
  const clearDeps = () => onQuery('');
  const facts = useMemo(() => factsOf(index), [index]);
  const filteredBanner = (count: number, onClear: () => void) => (
    <Banner
      status="info"
      title={t('gz.packages.filtered', {count})}
      endContent={<Button label={t('gz.packages.clear')} variant="secondary" size={BUTTON.inline} onClick={onClear} />}
    />
  );
  const empty = (onClear: () => void) => (
    <EmptyState
      title={t('gz.packages.empty.title')}
      description={t('gz.packages.empty.description')}
      actions={<Button label={t('gz.packages.clear')} variant="secondary" size={BUTTON.inline} onClick={onClear} />}
    />
  );

  return (
    <PackagesFrame
      view={view}
      channel={channel}
      isUnstableReady={unstable != null}
      query={query}
      hideOffList={hideOffList}
      statusHref={statusHref}
      summary={`${t('gz.packages.view.packages')} ${facts.packages} · ${t('gz.packages.facts.binpkgs')} ${facts.binpkgs} · ${t('gz.packages.facts.distfiles')} ${facts.distfiles}`}
      onView={setView}
      onChannel={setChannel}
      onQuery={onQuery}
      onHideOffList={setHideOffList}
    >
      <div {...stylex.props(styles.tables)}>
        {isPending ? <ProgressBar label={t('gz.packages.updating')} isLabelHidden isIndeterminate xstyle={styles.progress} /> : null}
        {/* Both views stay mounted: a tab switch shows the other table instead of building it again.
            Not <Activity>: hiding one would unmount and remount every row's effects. */}
        <div {...stylex.props(styles.view)} data-gz-view="packages" hidden={shownView !== 'packages'}>
          <VStack gap={SPACE.group}>
            {visible.length === 0 ? (
              empty(clearPackages)
            ) : (
              <PackageRows data={tableData} columns={columns} plugins={plugins} isCompact={isCompact} sort={sortConfig.sort} />
            )}
            {visible.length > 0 && searchCount + Object.keys(shownFilters).length > 0 ? filteredBanner(visible.length, clearPackages) : null}
          </VStack>
        </div>
        <div {...stylex.props(styles.view)} data-gz-view="deps" hidden={shownView !== 'deps'}>
          <VStack gap={SPACE.group}>
            {visibleDeps == null ? (
              <Banner status="error" title={t('gz.packages.loadFailed')} />
            ) : visibleDeps.length === 0 ? (
              empty(clearDeps)
            ) : (
              <DepsTable rows={visibleDeps} hasUseColumn={depsHaveUse} />
            )}
            {visibleDeps != null && visibleDeps.length > 0 && searchCount > 0 ? filteredBanner(visibleDeps.length, clearDeps) : null}
          </VStack>
        </div>
      </div>
    </PackagesFrame>
  );
}

interface PackageRowsProps {
  data: PackageRow[];
  columns: TableColumn<PackageRow>[];
  plugins: Record<string, TablePlugin<PackageRow>>;
  isCompact: boolean;
  /** Not read here: a new sort state re-renders the header (the sort plugin reads it through a ref). */
  sort: unknown;
}

/**
 * The package table, skipped by renders that change none of its props, such as the urgent render of a
 * channel or search change, whose rows arrive later with the deferred data.
 */
const PackageRows = memo(function PackageRows({data, columns, plugins, isCompact}: PackageRowsProps) {
  return (
    <Table<PackageRow>
      data={data}
      columns={columns}
      idKey="cp"
      density="balanced"
      dividers="rows"
      hasHover
      textOverflow="wrap"
      // Wide rows centre the marks and the chevron on the name; stacked phone rows keep them on its first line.
      verticalAlign={isCompact ? 'top' : 'middle'}
      plugins={plugins}
    />
  );
});

/**
 * A dependency row with a unique key. Builds sharing name, slot and version are told apart in the row by
 * their subslot, their `bindings` and `useDiff`, the USE flags not common to all of them.
 */
interface DepRow extends DepEntry {
  key: string;
  useDiff: string[];
  /** Set only on the copy an open row renders from; see OPEN_KEYS. */
  isOpen?: true;
}

/** The facts above the tables, for one channel. */
function factsOf(index: PackageIndex) {
  // A dependency is one binary package per name and slot, beside the overlay's published packages.
  const depSlots = new Set((index.deps ?? []).map(dep => `${dep.cp}:${dep.slot}`));
  const hasVersions = hasVersionsOf(index);
  return {
    packages: index.packages.length,
    binpkgs: index.packages.filter(entry => isPublished(entry, hasVersions)).length + depSlots.size,
    distfiles: new Set(index.packages.flatMap(entry => entry.dist)).size,
  };
}


const slotOf = (dep: DepEntry) => (dep.subslot == null ? dep.slot : `${dep.slot}/${dep.subslot}`);

function toDepRows(deps: readonly DepEntry[]): DepRow[] {
  const builds = new Map<string, DepEntry[]>();
  for (const dep of deps) {
    const id = `${dep.cp}:${dep.slot}:${dep.ver}`;
    builds.set(id, [...(builds.get(id) ?? []), dep]);
  }
  const seen = new Map<string, number>();
  return [...deps]
    .sort((a, b) => a.cp.localeCompare(b.cp) || a.slot.localeCompare(b.slot))
    .map(dep => {
      const group = builds.get(`${dep.cp}:${dep.slot}:${dep.ver}`) ?? [];
      const useDiff = group.length < 2 ? [] : (dep.use ?? []).filter(flag => !group.every(other => other.use?.includes(flag)));
      const id = [dep.cp, slotOf(dep), dep.ver, ...(dep.bindings ?? [])].join(':');
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      return {...dep, key: count === 0 ? id : `${id}#${count}`, useDiff};
    });
}

/**
 * Slot, then the subslot muted, so `4.1/0` reads as one value. A slot alone fits its column on one line;
 * a long subslot (`4/gcr-4.4-gck-2.2`) may wrap.
 */
function SlotText({row, type}: {row: DepRow; type?: 'supporting'}) {
  return (
    <Text type={type} hasTabularNumbers textWrap={row.subslot == null ? 'nowrap' : undefined} xstyle={styles.words}>
      {row.slot}
      {row.subslot == null ? null : <Text type="inherit" color="secondary">/{row.subslot}</Text>}
    </Text>
  );
}

/** What tells a build apart from others of the same name, slot and version; nothing for the rest. */
function DepBuildFacts({row}: {row: DepRow}) {
  const t = useMessage();
  const bindings = row.bindings ?? [];
  if (bindings.length === 0 && row.useDiff.length === 0) return null;
  return (
    <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
      {bindings.length === 0 ? null : (
        <HStack gap={SPACE.hairline} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary">{t('gz.packages.col.bindings')}</Text>
          <Text type="supporting" color="primary" hasTabularNumbers xstyle={styles.words}>{bindings.join(' ')}</Text>
        </HStack>
      )}
      {row.useDiff.length === 0 ? null : (
        <HStack gap={SPACE.hairline} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary">{t('gz.packages.col.use')}</Text>
          <UseFlags flags={row.useDiff} type="supporting" />
        </HStack>
      )}
    </HStack>
  );
}

const DEP_KEY = expansionKeyOf<DepRow>(row => row.key);
const hasUse = (row: DepRow) => (row.use?.length ?? 0) > 0;

const DEPS_STICKY = stickyHeader<DepRow>();

/**
 * The `::gentoo` dependencies of the selected channel that match the search, sorted by name and slot.
 * A row with USE flags opens to list them; an index without any (before USE was recorded) gets
 * no chevron column. That is decided on the whole index, so a search does not add or remove the column.
 */
const DepsTable = memo(function DepsTable({rows, hasUseColumn}: {rows: DepRow[]; hasUseColumn: boolean}) {
  const t = useMessage();
  const isCompact = useMediaQuery(TEMPLATE.compactTable);
  const [expanded, onToggle] = useExpanded();
  const renderExpanded = useCallback(
    (row: DepRow) => (
      <MetadataList>
        <MetadataListItem label={t('gz.packages.col.use')}><UseFlags flags={row.use ?? []} /></MetadataListItem>
      </MetadataList>
    ),
    [t],
  );
  const rowExpansion = useTableRowExpansion<DepRow>({expandedKeys: OPEN_KEYS, onToggle, getRowKey: DEP_KEY, renderExpanded, getIsItemExpandable: hasUse});
  const plugins = useMemo(
    (): Record<string, TablePlugin<DepRow>> => (hasUseColumn ? {expansion: withoutRowMenu(rowExpansion), stickyHeader: DEPS_STICKY} : {stickyHeader: DEPS_STICKY}),
    [hasUseColumn, rowExpansion],
  );
  const data = useMemo(() => (expanded.size === 0 ? rows : rows.map(row => (expanded.has(row.key) ? opened(row) : row))), [rows, expanded]);
  const columns: TableColumn<DepRow>[] = useMemo(() => {
    const headers: Record<string, string> = {cp: t('gz.packages.col.package'), slot: t('gz.packages.col.slot'), ver: t('gz.packages.col.version')};
    if (isCompact) {
      const labelled = (key: 'slot' | 'ver', value: ReactNode) => (
        <HStack gap={SPACE.hairline} vAlign="center">
          <Text type="supporting" color="secondary">{headers[key]}</Text>
          {value}
        </HStack>
      );
      return [
        {
          ...layoutOf(DEPS_COMPACT_COLUMNS, 'cp'),
          header: headers.cp,
          renderCell: (row: DepRow) => (
            <VStack gap={SPACE.hairline}>
              <Text hasTabularNumbers>{row.cp}</Text>
              <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
                {labelled('slot', <SlotText row={row} type="supporting" />)}
                {labelled('ver', <Text type="supporting" hasTabularNumbers textWrap="nowrap">{row.ver}</Text>)}
              </HStack>
              <DepBuildFacts row={row} />
            </VStack>
          ),
        },
      ];
    }
    const cells: Record<string, (row: DepRow) => ReactNode> = {
      cp: row => (
        <VStack gap={SPACE.hairline}>
          <Text hasTabularNumbers>{row.cp}</Text>
          <DepBuildFacts row={row} />
        </VStack>
      ),
      slot: row => <SlotText row={row} />,
      // Versions are single tokens, and their column fits the longest one in the index.
      ver: row => <Text hasTabularNumbers textWrap="nowrap">{row.ver}</Text>,
    };
    return DEPS_COLUMNS.map(layout => ({key: layout.key, header: headers[layout.key] ?? t(layout.header), width: layout.width, renderCell: cells[layout.key]}));
  }, [t, isCompact]);
  return (
    <Table<DepRow>
      data={data}
      columns={columns}
      idKey="key"
      density="balanced"
      dividers="rows"
      hasHover
      textOverflow="wrap"
      verticalAlign="top"
      plugins={plugins}
    />
  );
});
