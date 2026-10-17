// Adapted from Astryx dashboard-alert-rail and TableRowStatusTable (MIT, Meta Platforms, Inc.).
import {useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Layout, LayoutHeader, LayoutContent, LayoutPanel, HStack, VStack, StackItem} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon, type IconProps} from '@astryxdesign/core/Icon';
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
import {BUTTON, CHIP, GRID, ICON, SPACE, STACK, TEMPLATE} from '../../theme/scale';
import {FALLBACK, isKnown, StatusLinks, statusLevel, statusVariant, useServiceName, type BoardProps, type StatusData, type StatusSite, type StatusTree, type StatusMirror, type StatusIslandProps} from './StatusBoard';
import {AvailabilityChart, ServiceSparkline, STATUS_STROKE} from './StatusCharts';
import {PageHeader} from '../PageHeader';
import {media} from '../../theme/layout.stylex';
import {stickyHeader} from '../data/stickyHeader';
import {LoadingRows, type SkeletonColumn} from '../data/LoadingRows';

const styles = stylex.create({
  header: {backgroundColor: 'var(--color-background-muted)'},
  sticky: {position: 'sticky', insetBlockStart: 0, zIndex: 1, backgroundColor: 'var(--color-background-surface)'},
  // Keep the divider on the stretched panel and bound only its sticky scroll region.
  rail: {maxHeight: 'calc(100dvh - var(--appshell-header-height, var(--spacing-10)))', position: 'sticky', insetBlockStart: 'var(--appshell-header-height, 0rem)', overflowY: 'auto'},
  sparkEmpty: {height: 'var(--spacing-10)', borderBottomWidth: 'var(--border-width)', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)'},
  chartEmpty: {height: 'calc(var(--spacing-10) * 7)', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 'var(--border-width)', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)'},
  detail: {overflowWrap: 'anywhere'},
  // Phones get the stacked list instead, so no column hides in a sideways scroll.
  wide: {display: {default: 'block', [media.mobile]: 'none'}},
  narrow: {display: {default: 'none', [media.mobile]: 'block'}},
});

/** Portage tree names; the API keys them the same way. */
const TREE_KEYS = ['stable', 'unstable'] as const;

const SPARK_SKELETON = TEMPLATE.sparkHeight;
const CHART_SKELETON = TEMPLATE.chartHeight;

/** Column keys and widths of the mirror table, shared with its loading skeleton; the floors fit 620px. */
export const MIRROR_COLUMNS = [
  {key: 'name', header: 'gz.status.mirrors.mirror', width: proportional(2, {minWidth: GRID.statusName}), lines: 2},
  {key: 'up', header: 'gz.packages.col.status', width: proportional(1, {minWidth: GRID.statusCell})},
  {key: 'ms', header: 'gz.status.responseHeading', width: proportional(1, {minWidth: GRID.statusCell}), align: 'end'},
  {key: 'stable', header: 'gz.status.tree.stable', width: proportional(1, {minWidth: GRID.statusCell}), lines: 2},
  {key: 'unstable', header: 'gz.status.tree.unstable', width: proportional(1, {minWidth: GRID.statusCell}), lines: 2},
] as const satisfies readonly (Omit<SkeletonColumn, 'header'> & {header: MessageKey})[];

const FEED_SKELETON: readonly SkeletonColumn[] = [{key: 'item', width: proportional(1)}];

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
      {loading ? <HStack gap={SPACE.tight} vAlign="center"><Skeleton width={GRID.skeletonText} height={28} radius={1} /><Skeleton width={GRID.statusCell} height={12} radius={1} index={1} /></HStack> : <HStack gap={SPACE.tight} vAlign="center" wrap="wrap">
        <Text type="service-metric" display="block" hasTabularNumbers>{site.uptimePct == null ? '—' : percent.format(site.uptimePct / 100)}</Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>{site.ms == null ? '—' : t('gz.status.latency', {ms: new Intl.NumberFormat(languageTag).format(site.ms)})}</Text>
      </HStack>}
      <Text type="supporting" color="secondary">{t('gz.status.uptimeHeading')}</Text>
      {loading ? <Skeleton height={SPARK_SKELETON} radius={1} index={2} /> : site.history?.some(day => day.up != null)
        ? <ServiceSparkline site={site} color={STATUS_STROKE[level]} name={name} languageTag={languageTag} />
        : <VStack xstyle={styles.sparkEmpty}><Text type="supporting" color="secondary">{t('gz.status.history.unknown')}</Text></VStack>}
      {serviceUrl ? <Link href={serviceUrl.origin}>{serviceUrl.host}</Link> : null}
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
    return {color: level === 'up' ? 'success' : level === 'down' ? 'error' : 'gray', label: t(`gz.status.level.${level}`)};
  }});
  const published = mirrors?.published?.length ? mirrors.published : [{key: 'stable', name: ''}, {key: 'unstable', name: ''}];
  const mirrorName = (mirror: StatusMirror) => mirror.origin ? t('gz.status.mirrors.origin')
    : ['nju', 'nyist', 'ha'].includes(mirror.key) ? t(`gz.status.mirror.${mirror.key}` as MessageKey) : mirror.name;
  const cells: Record<(typeof MIRROR_COLUMNS)[number]['key'], (mirror: MirrorRow) => ReactNode> = {
    name: mirror => <VStack gap={SPACE.hairline}>
      <Text type="body">{mirrorName(mirror)}</Text><Text type="supporting" color="secondary" xstyle={styles.detail}>{mirror.host}</Text>
      {mirror.landed ? <Text type="supporting" color="secondary" xstyle={styles.detail}>{t('gz.status.mirrors.landed', {host: mirror.landed})}</Text> : null}
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
              {mirror.landed ? <Text type="supporting" color="secondary" xstyle={styles.detail}>{t('gz.status.mirrors.landed', {host: mirror.landed})}</Text> : null}
              <Text type="supporting" color="secondary" hasTabularNumbers>{t('gz.status.responseHeading')} · {mirror.ms == null ? '—' : new Intl.NumberFormat(languageTag).format(mirror.ms)}</Text>
              <HStack gap={SPACE.inline} wrap="wrap">{TREE_KEYS.map(key => <VStack key={key} gap={SPACE.hairline}>
                <Text type="supporting" color="secondary">{t(`gz.status.tree.${key}`)}</Text>
                <TreeState tree={mirror.trees?.find(tree => tree.key === key)} languageTag={languageTag} />
              </VStack>)}</HStack>
            </VStack>}
            endContent={<Token size={CHIP.small} color={statusLevel(mirror) === 'up' ? 'green' : statusLevel(mirror) === 'down' ? 'red' : 'gray'} label={t(`gz.status.level.${statusLevel(mirror)}`)} />} />)}</List>
        </VStack>
      </>}
  </VStack>;
}

function RailSection({icon, iconColor = 'secondary', title, id, count, children, sticky}: {icon: IconProps['icon']; iconColor?: 'error' | 'secondary'; title: string; id: string; count?: number; children: ReactNode; sticky: boolean}) {
  return <VStack gap={TEMPLATE.zero}>
    <VStack xstyle={sticky ? styles.sticky : undefined}>
      <HStack gap={SPACE.tight} padding={SPACE.block} vAlign="center" xstyle={styles.header}>
        <Icon icon={icon} size={ICON.inline} color={iconColor} />
        <StackItem size={STACK.fill}><Heading level={2} id={id}>{title}</Heading></StackItem>
        {count == null ? null : <Badge label={String(count)} />}
      </HStack>
      <Divider />
    </VStack>
    {children}
  </VStack>;
}

function AlertsFeed({data, sticky, loading}: {data: StatusData | null; sticky: boolean; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName();
  const alerts = data?.sites.filter(site => statusLevel(site) === 'down') ?? [];
  const unknown = data == null || data.sites.some(site => statusLevel(site) === 'unknown');
  return <RailSection icon="warning" iconColor={alerts.length > 0 ? 'error' : 'secondary'} title={t('gz.status.alerts.title')} id="service-alerts" count={data == null ? undefined : alerts.length} sticky={sticky}>
    {loading ? <LoadingRows columns={FEED_SKELETON} rows={2} />
      : alerts.length === 0 ? <EmptyState isCompact
      title={unknown ? t('gz.status.alerts.unknown') : t('gz.status.alerts.clear')}
      icon={<Icon icon={unknown ? 'info' : 'success'} color={unknown ? 'secondary' : 'success'} />} />
      : <List density="compact" hasDividers>{alerts.map(site => <ListItem key={site.key} label={name(site)}
        startContent={<StatusDot variant="error" label={t('gz.status.level.down')} />}
        endContent={<Token size={CHIP.small} color="red" label={t('gz.status.level.down')} />} />)}</List>}
  </RailSection>;
}

function EventsFeed({data, sticky, loading}: {data: StatusData | null; sticky: boolean; loading: boolean}) {
  const t = useMessage();
  const name = useServiceName();
  const [expanded, setExpanded] = useState(false);
  const events = [...(data?.events ?? [])].sort((a, b) => b.time - a.time);
  const recent = expanded ? events : events.slice(0, 6);
  return <RailSection icon="clock" title={t('gz.status.events.title')} id="events" count={data?.events == null ? undefined : events.length} sticky={sticky}>
    {loading ? <LoadingRows columns={FEED_SKELETON} rows={6} />
      : events.length === 0 ? <VStack padding={SPACE.block}><Text type="body" color="secondary">{data?.events == null ? t('gz.status.events.unknown') : t('gz.status.events.empty')}</Text></VStack>
      : <List density="compact" hasDividers>{recent.map((event, index) => <ListItem key={`${event.time}-${event.service}-${index}`}
        label={name({key: event.service, name: event.name})}
        startContent={<StatusDot variant={statusVariant(event.status)} label={t(`gz.status.level.${event.status}`)} />}
        endContent={<VStack gap={SPACE.hairline} hAlign="end">
          <Token size={CHIP.small} color={event.status === 'up' ? 'green' : event.status === 'down' ? 'red' : 'gray'} label={t(`gz.status.level.${event.status}`)} />
          <Timestamp value={event.time} format="relative" color="secondary" />
        </VStack>} />)}</List>}
    {events.length > 6 ? <VStack padding={SPACE.block} hAlign="start"><Button variant="ghost" size={BUTTON.inline}
      label={expanded ? t('gz.status.events.less') : t('gz.status.events.all')} onClick={() => setExpanded(!expanded)} /></VStack> : null}
  </RailSection>;
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
  const rail = <VStack gap={TEMPLATE.zero} xstyle={styles.rail}>
    <AlertsFeed data={data} sticky={!isNarrow} loading={loading} /><Divider /><EventsFeed data={data} sticky={!isNarrow} loading={loading} />
  </VStack>;
  return <Layout height="auto" header={<LayoutHeader padding={SPACE.page} hasDivider>
    <HStack gap={SPACE.inline} vAlign="center" hAlign="between" wrap="wrap">
      <VStack gap={SPACE.tight}>
        <PageHeader title={t('gz.status.title')} description={t('gz.status.probe')} />
        {loading ? <VStack gap={SPACE.tight}><Skeleton width={GRID.statusName} height={20} radius={1} /><Skeleton width={GRID.controlSkeleton} height={12} radius={1} index={1} /></VStack> : <>
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
          {data == null && !failed ? <Text type="supporting" color="secondary">{t('gz.status.fallback')}</Text> : null}
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
              {data == null ? <Text type="label">{name(site)}</Text> : <Selector label={t('gz.status.services')} isLabelHidden size={BUTTON.cta} value={site.key} options={sites.map(site => ({value: site.key, label: name(site)}))} onChange={setSelected} placement="below" />}
              <SegmentedControl label={t('gz.status.history.window')} size={BUTTON.cta} value={window} onChange={setWindow} isDisabled={data == null}>
                {['7', '30', '90'].map(days => <SegmentedControlItem key={days} value={days} label={t('gz.status.history.days', {days})} />)}
              </SegmentedControl>
            </HStack>
            {loading ? <Skeleton height={CHART_SKELETON} radius={1} /> : site.history?.some(day => day.up != null) ? <AvailabilityChart site={site} days={Number(window)} name={name(site)} languageTag={languageTag} />
              : <VStack xstyle={styles.chartEmpty}><Text type="supporting" color="secondary">{t('gz.status.history.unknown')}</Text></VStack>}
          </VStack>
        </Card>
      </VStack>
      <Divider />
      <MirrorsSection data={data} languageTag={languageTag} loading={loading} skeleton={mirrorsSkeleton} />
      {isNarrow ? <VStack gap={SPACE.block}><Card padding={TEMPLATE.zero}><AlertsFeed data={data} sticky={false} loading={loading} /></Card><Card padding={TEMPLATE.zero}><EventsFeed data={data} sticky={false} loading={loading} /></Card></VStack> : null}
      <Text type="supporting" color="secondary">{t('gz.status.grafanaDescription')}</Text>
    </VStack>
  </LayoutContent>}
  end={isNarrow ? undefined : <LayoutPanel width={GRID.statusRail} padding={TEMPLATE.zero} hasDivider role="complementary" label={t('gz.status.rail')} isScrollable={false}>{rail}</LayoutPanel>} />;
}

export function StatusDashboardRoot({languageTag, messages, ...props}: StatusIslandProps & BoardProps) {
  return <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}><StatusDashboard {...props} languageTag={languageTag} /></InternationalizationProvider>;
}
