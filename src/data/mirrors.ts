import rawOfficialMirrors from './official-mirrors.json' with {type: 'json'};
import {officialMirrorsSchema, type DataLocale, type Mirror, type Mirrors, type MirrorSet} from './schemas.ts';

const officialData = officialMirrorsSchema.parse(rawOfficialMirrors);
export const officialMirrorColumns = officialData.columns;

/** The mirror preselected for a language: the first one listing it in `default`, else the first. */
export function defaultMirror(mirrors: Mirrors, set: MirrorSet, locale: DataLocale): Mirror {
  const list = mirrors[set];
  return list.find(mirror => mirror.defaultFor.includes(locale)) ?? list[0]!;
}

/**
 * Order for a list slot such as `GENTOO_MIRRORS`: the default first, the other mirrors in
 * file order, the origin last as the fallback.
 */
export function mirrorOrder(mirrors: Mirrors, set: MirrorSet, locale: DataLocale): Mirror[] {
  const chosen = defaultMirror(mirrors, set, locale);
  const rest = mirrors[set].filter(mirror => mirror !== chosen && !mirror.origin);
  const origin = mirrors[set].find(mirror => mirror.origin && mirror !== chosen);
  return [chosen, ...rest, ...(origin ? [origin] : [])];
}

export function officialMirrors(mirrors: Mirrors) {
  const endpoint = (set: MirrorSet, source: string): Mirror => {
    const mirror = mirrors[set].find(item => item.source === source);
    if (mirror == null) throw new Error(`Unknown official mirror source: ${set}.${source}`);
    return mirror;
  };
  return officialData.items.map(item => ({
    id: item.id,
    name: item.name,
    region: item.region,
    uri: 'source' in item.dist ? endpoint('gentoo_dist', item.dist.source).uri : item.dist.uri,
    note: item.note,
    git: item.git == null ? undefined : endpoint('gentoo_git', item.git),
    rsync: item.rsync == null ? undefined : endpoint('gentoo_rsync', item.rsync),
  }));
}

/** Keep the media picker's existing order, independent of the overview table's order. */
export function officialMediaMirrors(mirrors: Mirrors): {id: string; uri: string}[] {
  const rows = officialMirrors(mirrors);
  const sources = mirrors.gentoo_dist.filter(mirror => !mirror.origin).map(mirror => {
    const row = rows.find(item => item.id === mirror.source);
    if (row == null) throw new Error(`Official mirror overview lacks ${mirror.source}`);
    return row;
  });
  const extra = officialData.items
    .flatMap(({id, dist}) => 'mediaOrder' in dist ? [{id, order: dist.mediaOrder}] : [])
    .sort((a, b) => a.order - b.order)
    .map(({id}) => rows.find(row => row.id === id)!);
  return [...sources, ...extra].map(({id, uri}) => ({id, uri: `${uri.replace(/\/$/, '')}/releases/`}));
}
