import {pixel, proportional} from '@astryxdesign/core/Table';
import type {ColumnLayout} from '../data/columns';
import {GRID} from '../../theme/scale';

export const PACKAGES_ISLAND = 'packages';

const ORIGIN = 'https://distfiles.gentoozh.org';

/** The hourly package index (build/gen-packages.py). */
export const PACKAGES_SOURCE = {
  stable: `${ORIGIN}/packages.json`,
  unstable: `${ORIGIN}/packages-unstable.json`,
} as const;

/** The plain-text lists beside the package index, one line per package or dependency. */
export const PACKAGES_TEXT = ['packages.txt', 'packages-unstable.txt', 'deps.txt', 'deps-unstable.txt'].map(name => ({name, href: `${ORIGIN}/${name}`}));

/** Row statuses, in the order a row is checked against them. */
export const STATUSES = [
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
export type PackageStatus = (typeof STATUSES)[number];

export type TokenColor = 'green' | 'gray' | 'orange' | 'blue';

/** Token colours of the table and of the status reference page, which shows the same tokens. */
export const STATUS_COLOR: Record<PackageStatus, TokenColor> = {
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

/** The tokens beside a name besides its status: the publication policy (`license`, `bindist` or raw) and `removed`. */
export const MARK_COLOR = {policy: 'orange', removed: 'gray'} as const satisfies Record<string, TokenColor>;

/** Catalog entries the island renders: the page's own strings and the Astryx table controls. */
export const PACKAGES_MESSAGE_KEYS =
  /^gz\.packages\.|^@astryx\.(table|powerSearch|segmentedControl|tabList|textInput|emptyState|banner|button|popover|tooltip|layer|metadataList|badge|tableRowExpansion|dropdownMenu|progressBar)\./;

export interface PackagesIslandProps {
  languageTag: string;
  messages: Record<string, string>;
  /** The status reference page in the page's locale, linked from the toolbar. */
  statusHref: string;
}

/** Overlay source of a package, as the old distfiles table linked it. */
export const overlayUrl = (cp: string) => `https://github.com/gentoo-zh/overlay/tree/master/${cp}`;

/**
 * Column keys, headers and widths shared by the live tables and their server-rendered skeletons.
 * The row-expansion chevron adds 40px; with it the floors still add up to less than the narrowest
 * table width (764px at 1024), so no table scrolls sideways. The status, policy and reason open in
 * the row's details.
 */
export const PACKAGE_COLUMNS: readonly ColumnLayout[] = [
  {key: 'cp', header: 'gz.packages.col.package', width: proportional(4, {minWidth: GRID.packageText})},
  {key: 'binhost', header: 'gz.packages.col.binpkg', width: pixel(GRID.packageMark)},
  {key: 'dist', header: 'gz.packages.col.dist', width: pixel(GRID.packageMark)},
  {key: 'ver', header: 'gz.packages.col.version', width: proportional(2, {minWidth: GRID.packageVersion})},
  {key: 'size', header: 'gz.packages.col.size', width: pixel(GRID.fileSize), align: 'end'},
];

/** Columns that only schema 5 fills; on schema 4 they are left out. */
const VERSION_KEYS = new Set(['ver', 'size']);

export const packageColumns = (hasVersions: boolean) => PACKAGE_COLUMNS.filter(column => hasVersions || !VERSION_KEYS.has(column.key));

/** Phones stack the status and both marks under the name. */
export const PACKAGE_COMPACT_COLUMNS: readonly ColumnLayout[] = [
  {key: 'cp', header: 'gz.packages.col.package', width: proportional(1), lines: 2},
];

/**
 * Slot and version fit their longest value in the live index on one line, plus the cell padding and a
 * character to spare (`2.91-gtk4` 79px, `0.32h_pre20181117064816` 232px in 17px Figtree); the name takes the rest.
 */
export const DEPS_COLUMNS: readonly ColumnLayout[] = [
  {key: 'cp', header: 'gz.packages.col.package', width: proportional(1, {minWidth: GRID.depsName})},
  {key: 'slot', header: 'gz.packages.col.slot', width: pixel(GRID.depsSlot)},
  {key: 'ver', header: 'gz.packages.col.version', width: pixel(GRID.depsVersion)},
];

/** Phones stack the slot and version under the name, since the version column alone would fill the row. */
export const DEPS_COMPACT_COLUMNS: readonly ColumnLayout[] = [
  {key: 'cp', header: 'gz.packages.col.package', width: proportional(1), lines: 2},
];
