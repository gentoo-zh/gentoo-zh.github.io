// Adapted from the Astryx table-page template; MirrorHealth fills the static health cells.
// Use a List on narrow screens so the health column remains visible.
import * as stylex from '@stylexjs/stylex';
import {Token} from '@astryxdesign/core/Token';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Text} from '@astryxdesign/core/Text';
import type {Mirrors} from '../../data/schemas';
import type {Locale} from '../../i18n/locales';
import type {MessageKey} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import {media} from '../../theme/layout.stylex';
import {BUTTON, CODE, GRID, SPACE, STACK} from '../../theme/scale';
import {ArrowRight} from '../chrome/icons';
import {codeTokenizer} from '../../markdown/codeTokenizer';
import {articleTable} from '../data/stickyHeader';
import {islandProps} from '../islands/kinds';

const METADATA_LABEL = {position: 'top'} as const;

const styles = stylex.create({
  wide: {display: {default: 'none', [media.tablet]: 'block'}},
  narrow: {display: {default: 'flex', [media.tablet]: 'none'}},
  // The placeholder MirrorHealth.astro copies into each health cell once its script runs.
  pending: {display: 'none'},
});

interface MirrorRow extends Record<string, unknown> {
  /** `origin` for the origin pair (distfiles.gentoozh.org and the GitHub overlay), else the data `source`. */
  id: string;
  dist?: string;
  git?: string;
  /** Host matched against status.gentoozh.org/api/status `mirrors.list[].host`. */
  host?: string;
  isDefault: boolean;
}

/** One row per mirror site: the distfiles and Git sets merged by source, the origins paired. */
function mirrorRows(mirrors: Mirrors, locale: Locale): MirrorRow[] {
  const rows = new Map<string, MirrorRow>();
  const row = (id: string) => {
    const found = rows.get(id) ?? {id, isDefault: false};
    rows.set(id, found);
    return found;
  };
  for (const mirror of mirrors.dist) {
    const entry = row(mirror.origin ? 'origin' : mirror.source);
    entry.dist = mirror.uri;
    entry.host = new URL(mirror.uri).host;
    entry.isDefault ||= mirror.defaultFor.includes(locale);
  }
  for (const mirror of mirrors.git) {
    const entry = row(mirror.origin ? 'origin' : mirror.source);
    entry.git = mirror.uri;
    entry.isDefault ||= mirror.defaultFor.includes(locale);
  }
  return [...rows.values()];
}

// Style Table's own scroll wrapper: an extra wrapper would trigger its first-child bleed.
const WIDE_ONLY: TablePlugin<MirrorRow> = {
  transformScrollWrapper: props => ({...props, xstyle: [...props.xstyle, styles.wide]}),
};

/** The unknown dash until scripting swaps in the pending placeholder; mirrorHealth.ts then writes the state. */
function Health({host}: {host?: string}) {
  const t = useMessage();
  return (
    <Text as="div" color="secondary" data-gz-mirror-host={host ?? ''}>
      {t('gz.mirror.health.unknown')}
    </Text>
  );
}

function Address({title, uri}: {title: string; uri?: string}) {
  if (uri == null) return null;
  return (
    <VStack gap={SPACE.code}>
      <Text type="supporting">{title}</Text>
      <CodeBlock code={uri} highlightMode="spans" tokenizer={codeTokenizer} size={CODE.cell} container="section" width="100%" hasLanguageLabel={false} hasCopyButton isWrapped isCollapsible={false} />
    </VStack>
  );
}

export function MirrorTable({locale, mirrors}: {locale: Locale; mirrors: Mirrors}) {
  const t = useMessage();
  const rows = mirrorRows(mirrors, locale);
  const name = (id: string) => t(`gz.mirror.name.${id}` as MessageKey);
  // The distfiles and Git defaults can sit on different rows (en: OSUOSL and the GitHub overlay).
  const defaults = new Intl.ListFormat(locale, {type: 'conjunction'}).format(rows.filter(item => item.isDefault).map(item => name(item.id)));

  const columns: TableColumn<MirrorRow>[] = [
    {
      key: 'name',
      header: t('gz.mirror.col.name'),
      width: proportional(2),
      renderCell: item => (
        <HStack gap={SPACE.code} vAlign="center" wrap="wrap">
          <Text weight="semibold">{name(item.id)}</Text>
          {item.isDefault ? <Token color="green" label={t('gz.mirror.default')} /> : null}
        </HStack>
      ),
    },
    {
      key: 'address',
      header: t('gz.mirror.col.address'),
      width: proportional(4),
      renderCell: item => (
        <VStack gap={SPACE.code}>
          <Address title={t('gz.mirror.dist')} uri={item.dist} />
          <Address title={t('gz.mirror.git')} uri={item.git} />
        </VStack>
      ),
    },
    {
      key: 'health',
      header: t('gz.mirror.col.health'),
      width: pixel(GRID.statusResponse),
      renderCell: item => <Health host={item.host} />,
    },
  ];

  return (
    <VStack
      gap={SPACE.block}
      {...islandProps('mirror-health')}
      data-gz-labels={JSON.stringify({
        up: t('gz.mirror.health.up'),
        lag: t('gz.mirror.health.lag'),
        down: t('gz.mirror.health.down'),
        unknown: t('gz.mirror.health.unknown'),
      })}
    >
      <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
        <StackItem size={STACK.fill}>
          <MetadataList columns="multi" orientation="vertical" label={METADATA_LABEL}>
            <MetadataListItem label={t('gz.mirror.fact.count')}>{String(rows.length)}</MetadataListItem>
            <MetadataListItem label={t('gz.mirror.fact.default')}>
              {defaults}
            </MetadataListItem>
          </MetadataList>
        </StackItem>
        <Button
          variant="secondary"
          size={BUTTON.cta}
          label={t('gz.mirror.status')}
          href={routes.page(locale, 'status')}
          icon={<ArrowRight />}
        />
      </HStack>
      <VStack xstyle={styles.pending} data-gz-health-pending>
        <Skeleton width={GRID.skeletonText} height={12} radius={1} />
      </VStack>
      <Table<MirrorRow> data={rows} columns={columns} idKey="id" density="balanced" dividers="rows" hasHover plugins={{wideOnly: WIDE_ONLY, inArticle: articleTable<MirrorRow>()}} />
      <VStack xstyle={styles.narrow}>
        <List hasDividers edgeCompensation="inline">
          {rows.map(item => (
            <ListItem
              key={item.id}
              label={name(item.id)}
              description={
                <VStack gap={SPACE.code}>
                  <HStack gap={SPACE.code} vAlign="center" wrap="wrap">
                    {item.isDefault ? <Token color="green" label={t('gz.mirror.default')} /> : null}
                    <Text color="secondary">{t('gz.mirror.col.health')}</Text>
                    <Health host={item.host} />
                  </HStack>
                  <Address title={t('gz.mirror.dist')} uri={item.dist} />
                  <Address title={t('gz.mirror.git')} uri={item.git} />
                </VStack>
              }
            />
          ))}
        </List>
      </VStack>
    </VStack>
  );
}
