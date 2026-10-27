// Adapted from Astryx table-collapsible: independent tables, compact rows and group totals.
import type {ComponentType, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Table, pixel, proportional, type TableColumn} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {formatAmount, type CostReport, type CostRow, type Converted} from '../../data/costs';
import {LANGUAGE_TAG, type Locale, type MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {outlineItems} from '../../markdown/outline';
import {BUTTON, COSTS, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';
import {History, Server, Wallet, type SvgProps} from '../chrome/icons';
import {articleTable} from '../data/stickyHeader';

type Props = Omit<SectionPageProps, 'slots' | 'children'> & {body: string; report: CostReport; summary: ReactNode};
type Row = CostRow & Record<string, unknown>;
const LOCAL_CURRENCIES = ['CNY', 'TWD', 'HKD'] as const;

const styles = stylex.create({
  // The table template uses Astryx body metrics, not SectionPage's article typography or bleed.
  wash: {marginBlock: 0, marginInline: 0, containerType: 'inline-size', '--text-body-size': 'var(--font-size-base)', '--text-body-leading': '1.4286'},
  disclosure: {display: 'block', minWidth: 0},
  summary: {cursor: 'pointer', listStyle: 'none', '::-webkit-details-marker': {display: 'none'}},
  group: {display: 'block', minWidth: 0, '--cost-chevron': {default: '0deg', ':open': '180deg'}},
  chevron: {transform: 'rotate(var(--cost-chevron))', flexShrink: 0},
  // After the Astryx connected-accounts template: a 24px category tile on the table's left edge.
  tile: {display: 'grid', placeItems: 'center', width: 'var(--spacing-6)', height: 'var(--spacing-6)', flexShrink: 0, borderRadius: 'var(--radius-inner)', backgroundColor: 'var(--color-background-muted)'},
  groupTitle: {fontSize: 'var(--text-body-size)', lineHeight: 'var(--text-body-leading)', fontWeight: 'var(--font-weight-semibold)'},
  rowSummary: {display: 'list-item', cursor: 'pointer'},
  wide: {display: {default: 'block', '@container (max-width: 45rem)': 'none'}},
  compact: {display: {default: 'none', '@container (max-width: 45rem)': 'block'}},
  figure: {whiteSpace: 'nowrap'},
});

function useFormat(locale: Locale) {
  const t = useMessage();
  const tag = LANGUAGE_TAG[locale];
  const usd = (value: number, approx = false) => t('gz.cost.usd', {approx: String(approx), amount: formatAmount(value, 'USD', tag)});
  const converted = (value: Converted) => t('gz.cost.converted', {
    cny: formatAmount(value.CNY, 'CNY', tag), twd: formatAmount(value.TWD, 'TWD', tag), hkd: formatAmount(value.HKD, 'HKD', tag),
  });
  const price = (row: CostRow) => row.price === 'paid'
    ? t('gz.cost.price', {approx: String(row.approx), amount: String(row.amount), currency: row.currency, period: row.period})
    : row.price === 'credit' ? t('gz.cost.credit', {amount: String(row.amount), currency: row.currency})
    : row.price === 'sponsored' ? t('gz.cost.sponsored') : t('gz.cost.free');
  const periods = (row: CostRow) => t('gz.cost.periods', {count: row.periods, period: row.period});
  return {t, usd, converted, price, periods};
}

function Figure({children}: {children: string}) {
  return <Text hasTabularNumbers xstyle={styles.figure}>{children}</Text>;
}

// Native disclosure keeps the template's interaction available on this server-rendered route.
function CostGroup({id, icon: Glyph, title, count, summary, children}: {id: string; icon: ComponentType<SvgProps>; title: string; count: number; summary?: string; children: ReactNode}) {
  return (
    <Card padding={SPACE.block}>
      <VStack as="details" {...{open: true}} xstyle={styles.group}>
        <HStack as="summary" gap={SPACE.tight} vAlign="center" paddingBlock={SPACE.tight} xstyle={styles.summary}>
          <StackItem size={TEMPLATE.fill}>
          <HStack gap={SPACE.tight} vAlign="center" hAlign="between" wrap="wrap">
            <HStack gap={SPACE.tight} vAlign="center">
              <HStack aria-hidden xstyle={styles.tile}><Glyph size={ICON.inlinePx} /></HStack>
              <Heading level={2} id={id} xstyle={styles.groupTitle}>{title}</Heading>
              <Badge variant="neutral" label={String(count)} />
            </HStack>
            {summary == null ? null : <Text weight="semibold" hasTabularNumbers>{summary}</Text>}
          </HStack>
          </StackItem>
          <Icon icon="chevronDown" size={ICON.inline} xstyle={styles.chevron} />
        </HStack>
        <VStack paddingBlockStart={SPACE.inline}>{children}</VStack>
      </VStack>
    </Card>
  );
}

function CostTable({rows, columns, compactColumns, label}: {rows: Row[]; columns: TableColumn<Row>[]; compactColumns: TableColumn<Row>[]; label: string}) {
  return <>
    <VStack xstyle={styles.wide}>
      <Table data={rows} columns={columns} idKey="key" density="compact" dividers="rows" textOverflow="wrap" verticalAlign="top" aria-label={label} plugins={{inArticle: articleTable<Row>()}} />
    </VStack>
    <VStack xstyle={styles.compact} data-pagefind-ignore>
      <Table data={rows} columns={compactColumns} idKey="key" density="compact" dividers="rows" textOverflow="wrap" verticalAlign="top" aria-label={label} plugins={{inArticle: articleTable<Row>()}} />
    </VStack>
  </>;
}

export function CostsPage({report, summary, ...page}: Props) {
  const {t, usd, converted, price, periods} = useFormat(page.locale);
  // Preserve Markdown heading text and anchors in the disclosure triggers.
  const groups = [...page.body.matchAll(/## ([^\n]+)\n+<!-- slot:(specs|ledger|retired) -->/g)].map(match => ({
    slot: match[2], ...outlineItems(`## ${match[1]}`)[0],
  }));
  const group = (slot: string) => groups.find(entry => entry.slot === slot)!;
  const body = page.body.replace(/<!-- slot:summary -->[\s\S]*?<!-- slot:retired -->/, '<!-- slot:tables -->');
  const name = (row: Row) => t(`gz.cost.item.${row.key}` as MessageKey);
  // Only domains have expiry dates.
  const specLine = (row: Row) => {
    const spec = row.spec[page.locale].trim();
    if (!spec || spec === '—') return '';
    return row.expires == null ? spec : `${spec} · ${t('gz.cost.expiresOn', {date: row.expires})}`;
  };
  const item: TableColumn<Row> = {
    key: 'key', header: t('gz.cost.column.item'), width: proportional(2),
    renderCell: row => row.price === 'credit' ? <VStack gap={TEMPLATE.zero}><Text>{name(row)}</Text><Text type="supporting" color="secondary">{row.spec[page.locale]}</Text></VStack> : <Text>{name(row)}</Text>,
  };
  const specs: TableColumn<Row> = {
    ...item, header: t('gz.cost.column.spec'), width: proportional(2, {minWidth: COSTS.specWidth}),
    renderCell: row => <VStack gap={TEMPLATE.zero}><Text>{name(row)}</Text>{specLine(row) ? <Text type="supporting" color="secondary">{specLine(row)}</Text> : null}</VStack>,
  };
  const priceColumn: TableColumn<Row> = {key: 'price', header: t('gz.cost.column.price'), width: pixel(COSTS.priceWidth), renderCell: row => <Figure>{price(row)}</Figure>};
  const since: TableColumn<Row> = {key: 'start', header: t('gz.cost.column.since'), width: pixel(COSTS.dateWidth), renderCell: row => <Figure>{row.start}</Figure>};
  const paid: TableColumn<Row> = {key: 'periods', header: t('gz.cost.column.paid'), width: pixel(COSTS.periodWidth), align: 'end', renderCell: row => <Figure>{row.price === 'credit' ? t('gz.cost.creditLeft', {amount: usd(row.remaining ?? 0)}) : periods(row)}</Figure>};
  const total: TableColumn<Row> = {key: 'accumulated', header: t('gz.cost.column.accumulated'), width: pixel(COSTS.priceWidth), align: 'end', renderCell: row => <Figure>{usd(row.accumulated.USD, row.approx)}</Figure>};
  const conversion: TableColumn<Row> = {
    key: 'converted', header: t('gz.cost.column.converted'), width: pixel(COSTS.priceWidth), align: 'end',
    renderCell: row => <VStack gap={TEMPLATE.zero}>{LOCAL_CURRENCIES.map(currency => <Figure key={currency}>{`${formatAmount(row.accumulated[currency], currency, LANGUAGE_TAG[page.locale])} ${currency}`}</Figure>)}</VStack>,
  };
  // Keep per-row conversions available on hover and to assistive technology.
  const totalWithConversion: TableColumn<Row> = {
    ...total,
    renderCell: row => {
      const conversions = LOCAL_CURRENCIES.map(currency => `${formatAmount(row.accumulated[currency], currency, LANGUAGE_TAG[page.locale])} ${currency}`).join(' · ');
      return <Text hasTabularNumbers xstyle={styles.figure} {...{title: conversions}}>
        {usd(row.accumulated.USD, row.approx)}
        <VisuallyHidden>{` · ${conversions}`}</VisuallyHidden>
      </Text>;
    },
  };
  const service: TableColumn<Row> = {key: 'service', header: t('gz.cost.column.inService'), width: pixel(COSTS.dateWidth), renderCell: row => <Text hasTabularNumbers>{t('gz.cost.range', {start: row.start, end: row.end ?? ''})}</Text>};
  const compactItem = (fields: TableColumn<Row>[]): TableColumn<Row> => ({
    ...item,
    renderCell: row => <VStack as="details" xstyle={styles.disclosure}>
      <VStack as="summary" xstyle={styles.rowSummary}><Text>{name(row)}</Text></VStack>
      <VStack gap={SPACE.tight} paddingBlockStart={SPACE.tight}>
        {fields.filter(field => field.key !== 'spec' || specLine(row)).map(field => <VStack key={field.key} gap={TEMPLATE.zero}>
          <Text type="supporting" color="secondary">{field.header as string}</Text>
          {field.renderCell?.(row)}
        </VStack>)}
      </VStack>
    </VStack>,
  });
  const description: TableColumn<Row> = {...specs, key: 'spec', renderCell: row => specLine(row) ? <Text>{specLine(row)}</Text> : null};
  const retiredTotal: TableColumn<Row> = {...total, renderCell: row => <VStack gap={TEMPLATE.zero}>
    <Figure>{usd(row.accumulated.USD, row.approx)}</Figure>
    <Text type="supporting">{price(row)}</Text>
    <Text type="supporting">{periods(row)}</Text>
  </VStack>};
  const active = report.active as Row[];
  const ledger = [...report.active.filter(row => row.price === 'paid'), ...report.credits] as Row[];
  const retired = report.retired as Row[];
  const slots = {
    tables: {
      outline: groups.map(({id, label, level}) => ({id, label, level})),
      node: <Layout height="auto" xstyle={styles.wash}
        header={<LayoutHeader padding={SPACE.block}>
          {summary}
        </LayoutHeader>}
        content={<LayoutContent padding={SPACE.block}>
          <VStack gap={SPACE.block}>
            <CostGroup id={group('specs').id} icon={Server} title={group('specs').label} count={active.length}>
              <CostTable rows={active} label={group('specs').label} columns={[specs, priceColumn, since]} compactColumns={[compactItem([description, since]), priceColumn]} />
            </CostGroup>
            <CostGroup id={group('ledger').id} icon={Wallet} title={group('ledger').label} count={ledger.length} summary={usd(report.totals.active.USD, true)}>
              <CostTable rows={ledger} label={group('ledger').label} columns={[item, priceColumn, paid, totalWithConversion]} compactColumns={[compactItem([priceColumn, paid, conversion]), total]} />
              <VStack paddingBlock={SPACE.tight}><Text type="supporting" color="secondary">{converted(report.totals.active)}</Text></VStack>
            </CostGroup>
            <CostGroup id={group('retired').id} icon={History} title={group('retired').label} count={retired.length} summary={usd(report.totals.retired.USD, true)}>
              <CostTable rows={retired} label={group('retired').label} columns={[specs, service, retiredTotal]} compactColumns={[compactItem([description, priceColumn, service, paid]), total]} />
            </CostGroup>
          </VStack>
        </LayoutContent>}
      />,
    },
    support: <Banner status="info" collapsible={false} title={t('gz.cost.support.title')} description={t('gz.cost.support.body')}
      endContent={<HStack gap={SPACE.tight} wrap="wrap">
        <Button variant="secondary" size={BUTTON.inline} label={t('gz.cost.support.donate')} href="https://osuosl.org/donate/" target="_blank" endContent={<Icon icon="externalLink" size={ICON.inline} />} />
        <Button variant="secondary" size={BUTTON.inline} label={t('gz.cost.support.gentoo')} href="https://www.gentoo.org/donate/" target="_blank" endContent={<Icon icon="externalLink" size={ICON.inline} />} />
      </HStack>} />,
  };
  return <SectionPage {...page} body={body} isDataPage slots={slots} />;
}
