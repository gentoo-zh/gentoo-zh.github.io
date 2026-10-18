// Adapted from Astryx TableRowStatusTable (MIT, Meta Platforms, Inc.).
import {lazy, Suspense, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Layout, LayoutHeader, LayoutContent, LayoutPanel, HStack, VStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Selector} from '@astryxdesign/core/Selector';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Table, proportional, useTableRowStatus} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import type {MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, CHIP, GRID, SPACE, TEMPLATE} from '../../theme/scale';
import {FALLBACK, isKnown, StatusLinks, statusLevel, statusRowColor, statusTokenColor, statusVariant, useServiceName, type BoardProps, type StatusData, type StatusSite, type StatusTree, type StatusMirror, type StatusIslandProps, type StatusLevel} from './StatusBoard';
import {PageHeader} from '../PageHeader';
import {media} from '../../theme/layout.stylex';
import {stickyHeader} from '../data/stickyHeader';
import type {SkeletonColumn} from '../data/LoadingRows';

const styles = stylex.create({
  sparkEmpty: {height: 'var(--spacing-10)', borderBottomWidth: 'var(--border-width)', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)'},
  chartEmpty: {height: 'calc(var(--spacing-10) * 7)', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 'var(--border-width)', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)'},
  detail: {overflowWrap: 'anywhere'},
  // A fixed-width, end-aligned time column so the status tokens line up whatever the relative time reads.
  eventTime: {display: 'inline-block', minWidth: 'calc(var(--spacing-6) * 4)', textAlign: 'end'},
  // The content column opens with the page padding plus the gap after its empty notice stack; the feeds start level with it.
  railTop: {paddingBlockStart: 'calc(var(--spacing-6) * 2)'},
  // Phones get the stacked list instead, so no column hides in a sideways scroll.
  wide: {display: {default: 'block', [media.mobile]: 'none'}},
  narrow: {display: {default: 'none', [media.mobile]: 'block'}},
  // The server cannot read the viewport, so its loading frame draws both feed placements and CSS keeps the one
  // useMediaQuery(TEMPLATE.narrow) picks once data arrives.
  railPanel: {display: {default: null, [media.toc]: 'none'}},
  railFolded: {display: {default: 'none', [media.toc]: 'flex'}},
});

/** Portage tree names; the API keys them the same way. */
const TREE_KEYS = ['stable', 'unstable'] as const;

const SPARK_SKELETON = TEMPLATE.sparkHeight;
const CHART_SKELETON = TEMPLATE.chartHeight;
/** The lg Selector on a desktop; on touch screens the segmented control beside it sets the taller row. */
const CONTROL_SKELETON = 36;
/** One line of body text, the host link under each service. */
const HOST_SKELETON = 20;
/** A small Token and an md Button, whose heights follow the theme's touch sizing. */
const TOKEN_SKELETON = 'calc(var(--size-element-sm) - var(--spacing-2))';
const BUTTON_SKELETON = 'var(--size-element-md)';

// Recharts loads on the first render that draws a chart; until then the loading skeleton holds its size.
const ServiceSparkline = lazy(() => import('./StatusCharts').then(module => ({default: module.ServiceSparkline})));
const AvailabilityChart = lazy(() => import('./StatusCharts').then(module => ({default: module.AvailabilityChart})));

const STATUS_STROKE: Record<StatusLevel, string> = {
  up: 'var(--color-success)', down: 'var(--color-error)', unknown: 'var(--color-text-secondary)', maintenance: 'var(--color-accent)',
};

/** Column keys and widths of the mirror table, shared with its loading skeleton; the floors fit 620px. */
export const MIRROR_COLUMNS = [
  {key: 'name', header: 'gz.status.mirrors.mirror', width: proportional(2, {minWidth: GRID.statusName}), lines: 2},
  {key: 'up', header: 'gz.packages.col.status', width: proportional(1, {minWidth: GRID.statusCell})},
  {key: 'ms', header: 'gz.status.responseHeading', width: proportional(1, {minWidth: GRID.statusCell}), align: 'end'},
  {key: 'stable', header: 'gz.status.tree.stable', width: proportional(1, {minWidth: GRID.statusCell}), lines: 2},
  {key: 'unstable', header: 'gz.status.tree.unstable', width: proportional(1, {minWidth: GRID.statusCell}), lines: 2},
] as const satisfies readonly (Omit<SkeletonColumn, 'header'> & {header: MessageKey})[];


function dateTime(seconds: number, languageTag: string) {
  return new Intl.DateTimeFormat(languageTag, {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(seconds * 1000));
}
function duration(seconds: number, languageTag: string, ago = false) {
  const unit = seconds < 90 ? 'second' : seconds < 5400 ? 'minute' : seconds < 172800 ? 'hour' : 'day';
  const divisor = {second: 1, minute: 60, hour: 3600, day: 86400}[unit];
  const value = Math.round(Math.max(0, seconds) / divisor);
  return ago ? new Intl.RelativeTimeFormat(languageTag, {numeric: 'always'}).format(-value, unit)
    : new Intl.NumberFormat(languageTag, {style: 'unit', unit, unitDisplay: 'long'}).format(value);
}

function ServiceTile({site, languageTag, loading}: {site: StatusSite; languageTag: string; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName()(site);
  const level = statusLevel(site);
  const description = isKnown(site.key) ? t(`gz.status.description.${site.key}`) : site.desc;
  const percent = new Intl.NumberFormat(languageTag, {style: 'percent', maximumFractionDigits: 2});
  let url: URL | null = null;
  try { if (site.url) url = new URL(site.url); } catch { /* The fallback has no URL. */ }
  const serviceUrl = url && ['https:', 'http:'].includes(url.protocol) ? url : null;
  return <Card padding={SPACE.block}>
    <VStack gap={SPACE.tight}>
      <HStack gap={SPACE.tight} vAlign="center" hAlign="between">
        <HStack gap={SPACE.tight} vAlign="center">
          <StatusDot variant={statusVariant(level)} label={t(`gz.status.level.${level}`)} />
          <Text type="label" color="secondary">{name}</Text>
        </HStack>
        {loading ? <Skeleton width={GRID.statusCell} height={12} radius={1} /> : <Text type="supporting" color="secondary">{t(`gz.status.level.${level}`)}</Text>}
      </HStack>
      {loading ? <HStack gap={SPACE.tight} vAlign="center"><Skeleton width={GRID.skeletonText} height={24} radius={1} /><Skeleton width={GRID.statusCell} height={12} radius={1} index={1} /></HStack> : <HStack gap={SPACE.tight} vAlign="center" wrap="wrap">
        <Text type="service-metric" display="block" hasTabularNumbers>{site.uptimePct == null ? '—' : percent.format(site.uptimePct / 100)}</Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>{site.ms == null ? '—' : t('gz.status.latency', {ms: new Intl.NumberFormat(languageTag).format(site.ms)})}</Text>
      </HStack>}
      <Text type="supporting" color="secondary">{t('gz.status.uptimeHeading')}</Text>
      {loading ? <Skeleton height={SPARK_SKELETON} radius={1} index={2} /> : site.history?.some(day => day.up != null)
        ? <Suspense fallback={<Skeleton height={SPARK_SKELETON} radius={1} index={2} />}><ServiceSparkline site={site} color={STATUS_STROKE[level]} name={name} languageTag={languageTag} /></Suspense>
        : <VStack xstyle={styles.sparkEmpty}><Text type="supporting" color="secondary">{t('gz.status.history.unknown')}</Text></VStack>}
      {loading ? <Skeleton width={GRID.statusName} height={HOST_SKELETON} radius={1} index={3} /> : serviceUrl ? <Link href={serviceUrl.origin}>{serviceUrl.host}</Link> : null}
      {description ? <Text type="supporting" color="secondary">{description}</Text> : null}
    </VStack>
  </Card>;
}

function TreeState({tree, languageTag}: {tree?: StatusTree; languageTag: string}) {
  const t = useMessage();
  const level = statusLevel(tree ?? {});
  return <VStack gap={SPACE.hairline}>
    <HStack gap={SPACE.hairline} vAlign="center">
      <StatusDot variant={statusVariant(level)} label={t(`gz.status.level.${level}`)} />
      <Text type="supporting">{t(`gz.status.level.${level}`)}</Text>
    </HStack>
    <Text type="supporting" color="secondary" hasTabularNumbers>
      {tree?.lagSec == null ? '—' : tree.lagSec === 0 ? t('gz.status.mirrors.synced') : t('gz.status.mirrors.lag', {time: duration(tree.lagSec, languageTag)})}
    </Text>
  </VStack>;
}

type MirrorRow = StatusMirror & Record<string, unknown>;

// Style Table's own scroll wrapper: an extra wrapper would trigger its first-child bleed.
const WIDE_ONLY: TablePlugin<MirrorRow> = {
  transformScrollWrapper: props => ({...props, xstyle: [...props.xstyle, styles.wide]}),
};

function MirrorsSection({data, languageTag, loading, skeleton}: {data: StatusData | null; languageTag: string; loading: boolean; skeleton?: ReactNode}) {
  const t = useMessage();
  const mirrors = data?.mirrors;
  const rowStatus = useTableRowStatus<MirrorRow>({getStatus: mirror => {
    const level = statusLevel(mirror);
    return {color: statusRowColor(level), label: t(`gz.status.level.${level}`)};
  }});
  const published = mirrors?.published?.length ? mirrors.published : [{key: 'stable', name: ''}, {key: 'unstable', name: ''}];
  const mirrorName = (mirror: StatusMirror) => mirror.origin ? t('gz.status.mirrors.origin')
    : ['nju', 'nyist', 'ha'].includes(mirror.key) ? t(`gz.status.mirror.${mirror.key}` as MessageKey) : mirror.name;
  const cells: Record<(typeof MIRROR_COLUMNS)[number]['key'], (mirror: MirrorRow) => ReactNode> = {
    name: mirror => <VStack gap={SPACE.hairline}>
      <Text type="body">{mirrorName(mirror)}</Text><Text type="supporting" color="secondary" xstyle={styles.detail}>{mirror.host}</Text>
    </VStack>,
    up: mirror => t(`gz.status.level.${statusLevel(mirror)}`),
    ms: mirror => <Text type="body" hasTabularNumbers>{mirror.ms == null ? '—' : new Intl.NumberFormat(languageTag).format(mirror.ms)}</Text>,
    stable: mirror => <TreeState tree={mirror.trees?.find(tree => tree.key === 'stable')} languageTag={languageTag} />,
    unstable: mirror => <TreeState tree={mirror.trees?.find(tree => tree.key === 'unstable')} languageTag={languageTag} />,
  };
  const mirrorColumns: TableColumn<MirrorRow>[] = MIRROR_COLUMNS.map(({key, header, width, ...rest}) => ({
    key, header: t(header), width, align: 'align' in rest ? rest.align : undefined, renderCell: cells[key],
  }));
  return <VStack gap={SPACE.page}>
    <VStack gap={SPACE.hairline}>
      <Heading level={2} id="mirrors">{t('gz.status.mirrors.title')}</Heading>
      <Text type="supporting" color="secondary">{t('gz.status.mirrors.note')}</Text>
      {mirrors?.updated == null ? null : <Text type="supporting" color="secondary">{t('gz.status.updated', {time: dateTime(mirrors.updated, languageTag)})}</Text>}
    </VStack>
    <HStack gap={SPACE.page} wrap="wrap">
      {published.map(tree => <VStack gap={SPACE.hairline} key={tree.key}>
        <Text type="supporting" color="secondary">{t('gz.status.mirrors.published')} · {tree.key === 'stable' || tree.key === 'unstable' ? t(`gz.status.tree.${tree.key}`) : tree.name}</Text>
        {loading ? <Skeleton width={GRID.skeletonText} height={16} radius={1} /> : <Text type="label" hasTabularNumbers>{'ageSec' in tree && tree.ageSec != null ? duration(tree.ageSec, languageTag, true) : t('gz.status.level.unknown')}</Text>}
      </VStack>)}
    </HStack>
    {loading ? skeleton
      : !mirrors?.list?.length ? <Text type="body" color="secondary">{data == null || mirrors == null ? t('gz.status.mirrors.unknown') : t('gz.status.mirrors.empty')}</Text>
      : <>
        <Table aria-label={t('gz.status.mirrors.title')} data={mirrors.list.map(mirror => ({...mirror}))} idKey="key" hasHover textOverflow="wrap" verticalAlign="top"
          plugins={{rowStatus, wideOnly: WIDE_ONLY, stickyHeader: stickyHeader<MirrorRow>()}} columns={mirrorColumns} />
        <VStack xstyle={styles.narrow}>
          <List hasDividers edgeCompensation="inline">{mirrors.list.map(mirror => <ListItem key={mirror.key} label={mirrorName(mirror)}
            description={<VStack gap={SPACE.hairline}>
              <Text type="supporting" color="secondary" xstyle={styles.detail}>{mirror.host}</Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>{t('gz.status.responseHeading')} · {mirror.ms == null ? '—' : new Intl.NumberFormat(languageTag).format(mirror.ms)}</Text>
              <HStack gap={SPACE.inline} wrap="wrap">{TREE_KEYS.map(key => <VStack key={key} gap={SPACE.hairline}>
                <Text type="supporting" color="secondary">{t(`gz.status.tree.${key}`)}</Text>
                <TreeState tree={mirror.trees?.find(tree => tree.key === key)} languageTag={languageTag} />
              </VStack>)}</HStack>
            </VStack>}
            endContent={<Token size={CHIP.small} color={statusTokenColor(statusLevel(mirror))} label={t(`gz.status.level.${statusLevel(mirror)}`)} />} />)}</List>
        </VStack>
      </>}
  </VStack>;
}

/** One feed card, laid out as the 每日可用率 card: heading, then content; the count sits quietly beside the heading. */
function FeedCard({title, count, children}: {title: string; count: number | null; children: ReactNode}) {
  return <Card padding={SPACE.page}>
    <VStack gap={SPACE.block}>
      <HStack gap={SPACE.tight} vAlign="center" hAlign="between">
        <Heading level={2}>{title}</Heading>
        {count == null ? null : <Text type="supporting" color="secondary" hasTabularNumbers>{count}</Text>}
      </HStack>
      {children}
    </VStack>
  </Card>;
}

/** Placeholder rows drawn with the live List, so loading and loaded rows share one height. */
function FeedSkeleton({rows}: {rows: number}) {
  return <List hasDividers edgeCompensation="inline">{Array.from({length: rows}, (_, row) => <ListItem key={row}
    label={<Skeleton width={GRID.statusName} height={HOST_SKELETON} radius={1} index={row} />}
    endContent={<Skeleton width={GRID.statusCell} height={TOKEN_SKELETON} radius={1} index={row + 1} />} />)}</List>;
}

function AlertsFeed({data, loading}: {data: StatusData | null; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName();
  const alerts = data?.sites.filter(site => statusLevel(site) === 'down') ?? [];
  const unknown = data == null || data.sites.some(site => statusLevel(site) === 'unknown');
  const clear = unknown ? 'unknown' : 'up';
  return <FeedCard title={t('gz.status.alerts.title')} count={data == null ? null : alerts.length}>
    {loading ? <Skeleton width={GRID.statusName} height={HOST_SKELETON} radius={1} />
      : alerts.length === 0 ? <HStack gap={SPACE.tight} vAlign="center">
        <StatusDot variant={statusVariant(clear)} label={t(`gz.status.level.${clear}`)} />
        <Text type="label">{unknown ? t('gz.status.alerts.unknown') : t('gz.status.alerts.clear')}</Text>
      </HStack>
      : <List hasDividers edgeCompensation="inline">{alerts.map(site => <ListItem key={site.key} label={name(site)}
        startContent={<StatusDot variant="error" label={t('gz.status.level.down')} />}
        endContent={<Token size={CHIP.small} color="red" label={t('gz.status.level.down')} />} />)}</List>}
  </FeedCard>;
}

function EventsFeed({data, loading}: {data: StatusData | null; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName();
  const [expanded, setExpanded] = useState(false);
  const events = [...(data?.events ?? [])].sort((a, b) => b.time - a.time);
  const recent = expanded ? events : events.slice(0, 6);
  return <FeedCard title={t('gz.status.events.title')} count={data?.events == null ? null : events.length}>
    {loading ? <FeedSkeleton rows={6} />
      : events.length === 0 ? <Text type="body" color="secondary">{data?.events == null ? t('gz.status.events.unknown') : t('gz.status.events.empty')}</Text>
      : <List hasDividers edgeCompensation="inline">{recent.map((event, index) => <ListItem key={`${event.time}-${event.service}-${index}`}
        label={name({key: event.service, name: event.name})}
        startContent={<StatusDot variant={statusVariant(event.status)} label={t(`gz.status.level.${event.status}`)} />}
        endContent={<HStack gap={SPACE.inline} vAlign="center">
          <Token size={CHIP.small} color={statusTokenColor(event.status)} label={t(`gz.status.level.${event.status}`)} />
          <Timestamp value={event.time} format="relative" color="secondary" xstyle={styles.eventTime} />
        </HStack>} />)}</List>}
    {loading ? <Skeleton width={GRID.statusCell} height={BUTTON_SKELETON} radius={1} /> : events.length > 6 ? <HStack><Button variant="secondary" size={BUTTON.toolbar}
      label={expanded ? t('gz.status.events.less') : t('gz.status.events.all')} onClick={() => setExpanded(!expanded)} /></HStack> : null}
  </FeedCard>;
}

/** Both feeds as cards; the desktop column and the narrow layout place the same block. */
function Feeds({data, loading}: {data: StatusData | null; loading: boolean}) {
  return <VStack gap={SPACE.inline}>
    <AlertsFeed data={data} loading={loading} />
    <EventsFeed data={data} loading={loading} />
  </VStack>;
}

export function StatusDashboard({data, languageTag, failed = false, onRetry, mirrorsSkeleton}: BoardProps & {
  /** The server's loading table for the mirrors section; the client never renders the loading state. */
  mirrorsSkeleton?: ReactNode;
}) {
  const t = useMessage();
  const name = useServiceName();
  const sites = data?.sites.length ? data.sites : FALLBACK.sites;
  const [window, setWindow] = useState('90');
  const [selected, setSelected] = useState(sites[0].key);
  const site = sites.find(site => site.key === selected) ?? sites[0];
  const isNarrow = useMediaQuery(TEMPLATE.narrow, true);
  const overall = data?.overall === 'ok' || data?.overall === 'down' ? data.overall : 'unknown';
  // The server renders the board before any data; the first client render has data or a failure.
  const loading = data == null && !failed;
  const level = overall === 'ok' ? 'up' : overall;
  // Before data the server draws both forms and CSS shows one; afterwards the client renders only the one in use.
  const docked = loading || !isNarrow;
  const folded = loading || isNarrow;
  return <Layout height="auto" header={<LayoutHeader padding={SPACE.page} hasDivider>
    <HStack gap={SPACE.inline} vAlign="center" hAlign="between" wrap="wrap">
      <VStack gap={SPACE.tight}>
        <PageHeader title={t('gz.status.title')} description={t('gz.status.probe')} />
        {loading ? <VStack gap={SPACE.block}><Skeleton width={GRID.statusName} height={20} radius={1} /><Skeleton width={GRID.controlSkeleton} height={12} radius={1} index={1} /></VStack> : <>
          <HStack gap={SPACE.tight} vAlign="center"><StatusDot variant={statusVariant(level)} label={t(`gz.status.overall.${overall}`)} /><Text type="label">{t(`gz.status.overall.${overall}`)}</Text></HStack>
          <Text type="supporting" color="secondary">{data?.updated == null ? t('gz.status.never') : t('gz.status.updated', {time: dateTime(data.updated, languageTag)})}</Text>
        </>}
      </VStack>
      <StatusLinks compact={false} languageTag={languageTag} />
    </HStack>
  </LayoutHeader>}
  content={<LayoutContent padding={SPACE.page} isScrollable={false}>
    <VStack gap={SPACE.section}>
      <VStack gap={SPACE.page}>
        <VStack gap={SPACE.tight}>
          {/* Only a page without scripts keeps the note; with scripts it takes no space, so nothing moves when data lands. */}
          {loading ? <noscript><Text type="supporting" color="secondary">{t('gz.status.fallback')}</Text></noscript> : null}
          {failed ? <Banner status="warning" title={data == null ? t('gz.status.loadFailed') : t('gz.status.stale')} endContent={<Button size={BUTTON.inline} variant="secondary" label={t('gz.status.retry')} clickAction={onRetry} />} /> : null}
        </VStack>
        <VStack gap={SPACE.inline}>
          <Heading level={2} id="services">{t('gz.status.services')}</Heading>
          <Grid columns={{minWidth: GRID.statusTile, repeat: 'fit'}} gap={SPACE.inline}>{sites.map(site => <ServiceTile key={site.key} site={site} languageTag={languageTag} loading={loading} />)}</Grid>
        </VStack>
        <Card padding={SPACE.page}>
          <VStack gap={SPACE.block}>
            <VStack gap={SPACE.hairline}><Heading level={2}>{t('gz.status.history.title')}</Heading><Text type="supporting" color="secondary">{t('gz.status.history.note')}</Text></VStack>
            <HStack gap={SPACE.tight} hAlign="between" vAlign="center" wrap="wrap">
              {loading ? <Skeleton width={GRID.statusCell} height={CONTROL_SKELETON} radius={1} />
                : <Selector label={t('gz.status.services')} isLabelHidden size={BUTTON.cta} value={site.key} options={sites.map(site => ({value: site.key, label: name(site)}))} onChange={setSelected} placement="below" isDisabled={data == null} />}
              <SegmentedControl label={t('gz.status.history.window')} size={BUTTON.cta} value={window} onChange={setWindow} isDisabled={data == null}>
                {['7', '30', '90'].map(days => <SegmentedControlItem key={days} value={days} label={t('gz.status.history.days', {days})} />)}
              </SegmentedControl>
            </HStack>
            {loading ? <Skeleton height={CHART_SKELETON} radius={1} /> : site.history?.some(day => day.up != null)
              ? <Suspense fallback={<Skeleton height={CHART_SKELETON} radius={1} />}><AvailabilityChart site={site} days={Number(window)} name={name(site)} languageTag={languageTag} /></Suspense>
              : <VStack xstyle={styles.chartEmpty}><Text type="supporting" color="secondary">{t('gz.status.history.unknown')}</Text></VStack>}
          </VStack>
        </Card>
      </VStack>
      <Divider />
      <MirrorsSection data={data} languageTag={languageTag} loading={loading} skeleton={mirrorsSkeleton} />
      {/* Below 1024px the feeds fold in here */}
      {folded ? <VStack gap={TEMPLATE.zero} xstyle={loading ? styles.railFolded : undefined}><Feeds data={data} loading={loading} /></VStack> : null}
      <Text type="supporting" color="secondary">{t('gz.status.grafanaDescription')}</Text>
    </VStack>
  </LayoutContent>}
  end={docked ? <LayoutPanel width={GRID.statusRail} role="complementary" label={t('gz.status.rail')} isScrollable={false} xstyle={[styles.railTop, loading && styles.railPanel]}>
    <Feeds data={data} loading={loading} />
  </LayoutPanel> : undefined} />;
}

export function StatusDashboardRoot({languageTag, messages, ...props}: StatusIslandProps & BoardProps) {
  return <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}><StatusDashboard {...props} languageTag={languageTag} /></InternationalizationProvider>;
}
