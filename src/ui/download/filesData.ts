export const FILES_ISLAND = 'files';

/** distfiles serves `/_ls/` with CORS and sends browsers here, so the pages are indexed and in sitemap.xml. */
export const FILES_INDEXED = true;

/** A listing that has not answered by then shows the error state with a retry button. */
export const FILES_TIMEOUT_MS = 20_000;

/** Catalog entries the island renders: the page's own strings and the Astryx controls it uses. */
export const FILES_MESSAGE_KEYS = /^gz\.(files|data)\.|^@astryx\.(table|breadcrumbs|emptyState|button|link)\./;

export interface FilesIslandProps {
  languageTag: string;
  messages: Record<string, string>;
  /** The distfiles host; `PUBLIC_DISTFILES_ORIGIN` overrides it at build time. */
  origin: string;
  /** This locale's `/files/` path; deeper paths map 1:1 to directories on the origin. */
  base: string;
}

/** One entry of nginx `autoindex_format json`, as `/_ls/<dir>` returns it. */
export interface ListingEntry {
  name: string;
  type: 'directory' | 'file' | 'other';
  mtime: string;
  size?: number;
}

/**
 * The listed directory below `base`: percent-encoded segments, each ending in `/`; '' is the
 * root. Null when `pathname` lies outside `base`.
 */
export function directoryOf(pathname: string, base: string): string | null {
  if (pathname !== base.slice(0, -1) && !pathname.startsWith(base)) return null;
  return pathname
    .slice(base.length)
    .split('/')
    .filter(segment => segment !== '')
    .map(segment => `${segment}/`)
    .join('');
}

export function parentOf(dir: string): string {
  return dir.split('/').filter(segment => segment !== '').slice(0, -1).map(segment => `${segment}/`).join('');
}

/** Each ancestor of `dir` with its decoded name, for the breadcrumbs. */
export function crumbsOf(dir: string): Array<{name: string; dir: string}> {
  const segments = dir.split('/').filter(segment => segment !== '');
  return segments.map((segment, index) => ({name: decodeSegment(segment), dir: segments.slice(0, index + 1).map(part => `${part}/`).join('')}));
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export const listingUrl = (origin: string, dir: string) => `${origin}/_ls/${dir}`;
export const fileUrl = (origin: string, dir: string, name: string) => `${origin}/${dir}${encodeURIComponent(name)}`;
export const dirPath = (dir: string, name: string) => `${dir}${encodeURIComponent(name)}/`;

const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'] as const;

/** Binary multiples with IEC symbols; Intl's byte unit names differ between the three locales. */
export function formatSize(bytes: number, languageTag: string): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${new Intl.NumberFormat(languageTag, {maximumFractionDigits: unit === 0 ? 0 : 1}).format(value)} ${UNITS[unit]}`;
}
