// Shared server fallback and live island; keep message catalogs out of this module.
import type {StatusDotProps} from '@astryxdesign/core/StatusDot';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Fragment} from 'react';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {SITE} from '../../site';
import {BUTTON, GRID, SPACE} from '../../theme/scale';

/** The live status endpoint; it sends `access-control-allow-origin: *`. */
export const STATUS_API = 'https://status.gentoozh.org/api/status';
/** The public status board. */
export const STATUS_BOARD = '/status/';
export const STATUS_FEED = 'https://status.gentoozh.org/feed.rss';

/** Marks the island's container; the value names the island. */
export const STATUS_ISLAND_ATTRIBUTE = 'data-gz-island';
export const STATUS_ISLAND = 'status';

export type StatusLevel = 'up' | 'down' | 'unknown';

/** The one mapping from a service's level to its Astryx StatusDot variant. */
export function statusVariant(level: StatusLevel): StatusDotProps['variant'] {
  switch (level) {
    case 'up':
      return 'success';
    case 'down':
      return 'error';
    case 'unknown':
      return 'neutral';
  }
}

/** One entry of `sites[]` in the API response; only the fields the board reads. */
export interface StatusSite {
  key: string;
  name: string;
  desc?: string;
  url?: string;
  up?: boolean | null;
  ms?: number | null;
  uptimePct?: number | null;
  history?: {date: string; up: number | null}[];
}

export interface StatusTree {
  key: string;
  name: string;
  up?: boolean | null;
  lagSec?: number | null;
}

export interface StatusMirror extends StatusSite {
  host: string;
  origin: boolean;
  landed?: string | null;
  trees?: StatusTree[];
}

export interface StatusData {
  updated?: number;
  overall?: string;
  sites: StatusSite[];
  mirrors?: {
    updated?: number;
    published?: {key: string; name: string; ageSec?: number | null}[];
    list?: StatusMirror[];
  };
  events?: {time: number; service: string; name: string; status: StatusLevel}[];
}

export function statusLevel(site: {up?: boolean | null}): StatusLevel {
  if (site.up == null) return 'unknown';
  // Only the monitor's own verdict: the API has no degraded state, and the board invents none.
  return site.up ? 'up' : 'down';
}

/** The services the server-rendered board lists before any data arrives. */
const KNOWN_SERVICES = ['main', 'forum', 'mirrors', 'matrix', 'monitor'] as const;
export const FALLBACK: StatusData = {sites: KNOWN_SERVICES.map(key => ({key, name: key}))};

export function isKnown(key: string): key is (typeof KNOWN_SERVICES)[number] {
  return (KNOWN_SERVICES as readonly string[]).includes(key);
}

export interface BoardProps {
  /** Live data; null renders the static fallback. */
  data: StatusData | null;
  languageTag: string;
  /** The home page's summary: service rows and links only, no alert rail. */
  compact?: boolean;
  failed?: boolean;
  onRetry?: () => Promise<void>;
}

export function useServiceName() {
  const t = useMessage();
  return (site: StatusSite) => (isKnown(site.key) ? t(`gz.status.service.${site.key}` as MessageKey) : site.name);
}

function ServiceRow({site, languageTag, loading}: {site: StatusSite; languageTag: string; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName();
  const level = statusLevel(site);
  const pct = site.uptimePct == null ? null : new Intl.NumberFormat(languageTag, {maximumFractionDigits: 2}).format(site.uptimePct);
  return (
    <HStack gap={SPACE.inline} vAlign="center" hAlign="between" wrap="wrap">
      <HStack gap={SPACE.tight} vAlign="center">
        <StatusDot variant={statusVariant(level)} label={t(`gz.status.level.${level}`)} />
        <Heading level={3}>{name(site)}</Heading>
        {loading ? <Skeleton width={GRID.statusCell} height={12} radius={1} /> : <Text type="supporting" color="secondary">{t(`gz.status.level.${level}`)}</Text>}
      </HStack>
      {loading ? <Skeleton width={GRID.controlSkeleton} height={12} radius={1} index={1} /> : <HStack gap={SPACE.block} wrap="wrap">
        {pct == null ? null : <Text type="supporting" color="secondary" hasTabularNumbers>{t('gz.status.uptime', {pct})}</Text>}
        {!site.up || site.ms == null ? null : <Text type="supporting" color="secondary" hasTabularNumbers>{t('gz.status.latency', {ms: site.ms})}</Text>}
      </HStack>}
    </HStack>
  );
}

export function StatusLinks({compact, languageTag}: {compact: boolean; languageTag: string}) {
  const t = useMessage();
  return (
    <HStack gap={SPACE.inline} wrap="wrap">
      {compact ? <Button variant="primary" size={BUTTON.toolbar} label={t('gz.status.board')}
        href={languageTag === 'zh-TW' ? '/zh-tw/status/' : languageTag === 'en' ? '/en/status/' : STATUS_BOARD} /> : null}
      <Button variant="secondary" size={BUTTON.toolbar} label={t('gz.status.grafana')} href={SITE.status} />
      {compact ? null : <Button variant="secondary" size={BUTTON.toolbar} label={t('gz.status.subscribe')} href={STATUS_FEED} />}
    </HStack>
  );
}

export function StatusBoard({data, languageTag, compact = true, failed = false}: BoardProps) {
  const t = useMessage();
  const sites = data?.sites.length ? data.sites : FALLBACK.sites;
  return (
    <VStack gap={SPACE.inline}>
      <VStack gap={SPACE.page}>
        {sites.map((site, index) => (
          <Fragment key={site.key}>
            {index === 0 ? null : <Divider />}
            <ServiceRow site={site} languageTag={languageTag} loading={data == null && !failed} />
          </Fragment>
        ))}
      </VStack>
      {data?.updated == null ? null : <Text type="supporting" color="secondary">{t('gz.status.summary.updated', {
        time: new Intl.DateTimeFormat(languageTag, {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(data.updated * 1000)),
      })}</Text>}
      {failed ? <Text type="supporting" color="secondary">{data == null ? t('gz.status.loadFailed') : t('gz.status.summary.refreshFailed')}</Text> : null}
      <StatusLinks compact={compact} languageTag={languageTag} />
    </VStack>
  );
}

/** What the server stores on the island's container for status-client.tsx. */
export interface StatusIslandProps {
  languageTag: string;
  /** The status messages and shared status-column label, sent with the page. */
  messages: Record<string, string>;
  compact: boolean;
}

/** The island's React root in the browser, with its own message catalog. */
export function StatusIslandRoot({languageTag, messages, compact, data, failed, onRetry}: StatusIslandProps & BoardProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <StatusBoard data={data} languageTag={languageTag} compact={compact} failed={failed} onRetry={onRetry} />
    </InternationalizationProvider>
  );
}
