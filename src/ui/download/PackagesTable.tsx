// Adapted from the Astryx table-page template; the hourly package index loads in the browser.
import {useMemo, useState} from 'react';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {usePowerSearchConfig} from '@astryxdesign/core/PowerSearch';
import type {PowerSearchFilter} from '@astryxdesign/core/PowerSearch';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  Table,
  proportional,
  toSearchFilters,
  useTableFilterState,
  useTableFiltering,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TableSortComparator} from '@astryxdesign/core/Table';
import {Search} from './PackagesIcons';
import {useMessage} from '../../i18n/useMessage';
import type {MessageKey} from '../../i18n/locales';
import {BUTTON, GRID, ICON, SPACE} from '../../theme/scale';

/** One entry of `packages.json` (schema 4), as build/gen-packages.py writes it. */
export interface PackageEntry {
  cp: string;
  binhost: boolean;
  dist: string[];
  why?: string;
  excluded?: string | boolean;
  channelExcluded?: string | boolean;
  policy?: string;
  removed?: boolean;
}

export interface PackageIndex {
  generated: number;
  packages: PackageEntry[];
}

/** Channel names are Portage terms and stay untranslated in every locale. */
const CHANNELS = ['stable', 'unstable'] as const;
export type Channel = (typeof CHANNELS)[number];

/** The status labels of the page's legend, in the order a row is checked against them. */
const STATUSES = [
  'published',
  'excluded',
  'channel',
  'live',
  'masked',
  'nokeyword',
  'unpublished',
  'offlist',
  'pending',
] as const;
type Status = (typeof STATUSES)[number];

const STATUS_COLOR: Record<Status, 'green' | 'gray' | 'orange' | 'blue'> = {
  published: 'green',
  excluded: 'orange',
  channel: 'gray',
  live: 'gray',
  masked: 'orange',
  nokeyword: 'gray',
  unpublished: 'gray',
  offlist: 'gray',
  pending: 'blue',
};

/** `why` codes that have a reason sentence of their own (the others are their own status). */
const WHY_REASONS = new Set(['prebuilt', 'nobuild', 'candidate']);

const FACT_LABEL = {position: 'top'} as const;

interface PackageRow extends Record<string, unknown> {
  cp: string;
  status: Status;
  binhost: boolean;
  policy: string;
  removed: boolean;
  why: string;
  dist: number;
}

function statusOf(entry: PackageEntry): Status {
  if (entry.binhost) return 'published';
  if (entry.excluded) return 'excluded';
  if (entry.channelExcluded) return 'channel';
  if (entry.why === 'live' || entry.why === 'masked' || entry.why === 'nokeyword') return entry.why;
  if (entry.policy || entry.removed || entry.why === 'removed') return 'unpublished';
  if (entry.why != null && WHY_REASONS.has(entry.why)) return 'offlist';
  return 'pending';
}

function toRows(index: PackageIndex, t: ReturnType<typeof useMessage>): PackageRow[] {
  return index.packages.map(entry => {
    const reason = typeof entry.excluded === 'string' ? entry.excluded : typeof entry.channelExcluded === 'string' ? entry.channelExcluded : null;
    const why = reason ?? (entry.why != null && WHY_REASONS.has(entry.why) ? t(`gz.packages.why.${entry.why}` as MessageKey) : '');
    return {cp: entry.cp, status: statusOf(entry), binhost: entry.binhost, policy: entry.policy ?? '', removed: entry.removed === true || entry.why === 'removed', why, dist: entry.dist.length};
  });
}

export interface PackagesTableProps {
  languageTag: string;
  stable: PackageIndex;
  /** Absent until packages-unstable.json loads, or when it fails. */
  unstable: PackageIndex | null;
}

export function PackagesTable({languageTag, stable, unstable}: PackagesTableProps) {
  const t = useMessage();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [channel, setChannel] = useState<Channel>('stable');
  const index = channel === 'unstable' && unstable != null ? unstable : stable;
  const rows = useMemo(() => toRows(index, t), [index, t]);
  const statusLabel = (status: Status) => t(`gz.packages.status.${status}` as MessageKey);

  const searchFields = useMemo(
    () =>
      [
        {key: 'cp', type: 'string', label: t('gz.packages.col.package')},
        {key: 'status', type: 'enum', label: t('gz.packages.col.status'), enumValues: STATUSES.map(value => ({value, label: statusLabel(value)}))},
        {key: 'policy', type: 'string', label: t('gz.packages.col.policy')},
        {key: 'why', type: 'string', label: t('gz.packages.col.why')},
        {key: 'dist', type: 'number', label: t('gz.packages.col.dist')},
      ] as const,
    [t],
  );
  const {config, applyFilters} = usePowerSearchConfig(searchFields, t('gz.packages.col.package'));
  const {filters: columnFilters, onFilterChange, clearAll} = useTableFilterState();
  const filterPlugin = useTableFiltering<PackageRow>({filters: columnFilters, onFilterChange, searchConfig: config, variant: 'popover'});

  const columns: TableColumn<PackageRow>[] = useMemo(
    () => [
      {
        key: 'cp',
        header: t('gz.packages.col.package'),
        width: proportional(3),
        sortable: true,
        filter: 'cp',
        renderCell: row => (
          <VStack gap={SPACE.hairline}>
            <Text maxLines={1} hasTabularNumbers>{row.cp}</Text>
            {row.removed ? <Token color="gray" label={t('gz.packages.status.removed')} /> : null}
          </VStack>
        ),
      },
      {
        key: 'status',
        header: t('gz.packages.col.status'),
        width: proportional(2),
        sortable: true,
        filter: 'status',
        renderCell: row => <Token color={STATUS_COLOR[row.status]} label={statusLabel(row.status)} />,
      },
      {
        key: 'policy',
        header: t('gz.packages.col.policy'),
        width: proportional(2),
        sortable: true,
        filter: 'policy',
        renderCell: row => row.policy === '' ? null : (
          <Token color="orange" label={row.policy === 'license' ? t('gz.packages.status.license') : row.policy === 'bindist' ? t('gz.packages.status.bindist') : row.policy} />
        ),
      },
      {
        key: 'why',
        header: t('gz.packages.col.why'),
        width: proportional(4),
        sortable: true,
        filter: 'why',
        renderCell: row => (
          <Text color="secondary" maxLines={2}>
            {row.why}
          </Text>
        ),
      },
      {
        key: 'dist',
        header: t('gz.packages.col.dist'),
        width: proportional(1),
        align: 'end',
        sortable: true,
        filter: 'dist',
        renderCell: row => <Text hasTabularNumbers>{String(row.dist)}</Text>,
      },
    ],
    [t],
  );
  const comparators: Partial<Record<string, TableSortComparator<PackageRow>>> = useMemo(
    () => ({
      cp: (a, b) => a.cp.localeCompare(b.cp),
      status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status),
      policy: (a, b) => a.policy.localeCompare(b.policy),
      why: (a, b) => a.why.localeCompare(b.why),
      dist: (a, b) => a.dist - b.dist,
    }),
    [],
  );

  const visible = useMemo(() => {
    const predicates = toSearchFilters(columnFilters, columns, config) as PowerSearchFilter[];
    const matched = applyFilters(predicates, rows);
    const term = query.trim().toLowerCase();
    return term === '' ? matched : matched.filter(row => row.cp.toLowerCase().includes(term));
  }, [applyFilters, columnFilters, columns, config, rows, query]);
  const {sortedData, sortConfig} = useTableSortableState<PackageRow>({data: visible, comparators});
  const sortPlugin = useTableSortable<PackageRow>(sortConfig);

  const onQuery = (value: string) => {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim() === '') url.searchParams.delete('q');
    else url.searchParams.set('q', value.trim());
    window.history.replaceState(null, '', url);
  };
  const activeFilterCount = (query.trim() === '' ? 0 : 1) + Object.keys(columnFilters).length;
  const clearEverything = () => {
    onQuery('');
    clearAll();
  };
  const generated = new Intl.DateTimeFormat(languageTag, {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(index.generated * 1000));
  const published = rows.filter(row => row.binhost).length;

  return (
    <VStack gap={SPACE.group}>
      <MetadataList columns="multi" orientation="vertical" label={FACT_LABEL}>
        <MetadataListItem label={t('gz.packages.facts.stable')}>{String(stable.packages.length)}</MetadataListItem>
        {unstable == null ? null : (
          <MetadataListItem label={t('gz.packages.facts.unstable')}>{String(unstable.packages.length)}</MetadataListItem>
        )}
        <MetadataListItem label={t('gz.packages.facts.published')}>{String(published)}</MetadataListItem>
        <MetadataListItem label={t('gz.packages.facts.generated')}>{generated}</MetadataListItem>
      </MetadataList>
      <HStack gap={SPACE.inline} vAlign="center" hAlign="between" wrap="wrap">
        <SegmentedControl label={t('gz.packages.scope')} value={channel} onChange={value => setChannel(value as Channel)}>
          {CHANNELS.map(name => (
            <SegmentedControlItem key={name} value={name} label={name} isDisabled={name === 'unstable' && unstable == null} />
          ))}
        </SegmentedControl>
        <VStack width={GRID.card}>
          <TextInput
            label={t('gz.packages.search')}
            isLabelHidden
            value={query}
            onChange={onQuery}
            placeholder={t('gz.packages.searchPlaceholder')}
            startIcon={<Icon icon={Search} size={ICON.inline} />}
          />
        </VStack>
      </HStack>
      {visible.length === 0 ? (
        <EmptyState
          title={t('gz.packages.empty.title')}
          description={t('gz.packages.empty.description')}
          actions={<Button label={t('gz.packages.clear')} variant="secondary" size={BUTTON.inline} onClick={clearEverything} />}
        />
      ) : (
        <Table<PackageRow>
          data={sortedData}
          columns={columns}
          idKey="cp"
          density="balanced"
          dividers="none"
          hasHover
          textOverflow="truncate"
          plugins={{sort: sortPlugin, filter: filterPlugin}}
        />
      )}
      {visible.length > 0 && activeFilterCount > 0 && (
        <Banner
          status="info"
          title={t('gz.packages.filtered', {count: visible.length})}
          endContent={<Button label={t('gz.packages.clear')} variant="secondary" size={BUTTON.inline} onClick={clearEverything} />}
        />
      )}
    </VStack>
  );
}
