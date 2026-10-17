export const PACKAGES_ISLAND = 'packages';

const ORIGIN = 'https://distfiles.gentoozh.org';

/** The hourly package index (build/gen-packages.py). */
export const PACKAGES_SOURCE = {
  stable: `${ORIGIN}/packages.json`,
  unstable: `${ORIGIN}/packages-unstable.json`,
} as const;

/** Catalog entries the island renders: the page's own strings and the Astryx table controls. */
export const PACKAGES_MESSAGE_KEYS =
  /^gz\.packages\.|^@astryx\.(table|powerSearch|segmentedControl|textInput|emptyState|banner|button|popover|layer|metadataList|badge)\./;

export interface PackagesIslandProps {
  languageTag: string;
  messages: Record<string, string>;
}
