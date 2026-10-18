import * as stylex from '@stylexjs/stylex';
import {Banner} from '@astryxdesign/core/Banner';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Table, pixel, proportional, type TableColumn, type TablePlugin} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';
import type {Locale, MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {media} from '../../theme/layout.stylex';
import {CHANNEL_COLUMNS, ICON, SPACE} from '../../theme/scale';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';
import {CHANNELS, type Channel, type ChannelPlatform} from './channels';

const PLATFORMS: ChannelPlatform[] = ['telegram', 'matrix', 'irc', 'discord'];

const styles = stylex.create({
  scroll: {
    // Table's measurement hook emits overflow: clip until hydration; this page is static.
    overflowX: 'auto !important',
    // A slot is not a padded Section; its first/last child must not consume the section gap.
    marginBlock: 0,
  },
  // Below 1024px the five columns cannot fit beside the sidebar, so the stacked list replaces the
  // table there and Matrix and IRC never hide in a sideways scroll.
  wide: {display: {default: 'none', [media.wide]: 'block'}, marginBlock: 0},
  narrow: {display: {default: 'block', [media.wide]: 'none'}, marginBlock: 0},
});

const STATIC_SCROLL: TablePlugin<Channel> = {
  transformScrollWrapper: props => ({
    ...props,
    htmlProps: {...props.htmlProps, tabIndex: 0},
    xstyle: [...props.xstyle, styles.scroll],
  }),
};

function ChannelLink({join, locale, handleOnly = false}: {join: Channel['join'][number]; locale: Locale; handleOnly?: boolean}) {
  const t = useMessage();
  const href = typeof join.href === 'string' ? join.href : join.href[locale];
  // A join without a handle (a Discord invite) shows a short "Join" and names the target in its accessible name.
  const label = handleOnly && !join.handle ? `${t('gz.channels.join')} ${join.label}` : undefined;
  return (
    <Link href={href} label={label} target={href.startsWith('https:') ? '_blank' : undefined}>
      {handleOnly ? (
        <HStack as="span" gap={SPACE.hairline} align="center">
          <Icon icon={join.icon} size={ICON.inline} />
          <Text type="inherit" textWrap="nowrap">{join.handle ?? t('gz.channels.join')}</Text>
        </HStack>
      ) : join.label}
    </Link>
  );
}

function ChannelTable({channels, locale}: {channels: Channel[]; locale: Locale}) {
  const t = useMessage();
  const columns: TableColumn<Channel>[] = [
    {
      key: 'channel',
      header: t('gz.channels.col.channel'),
      width: proportional(1, {minWidth: CHANNEL_COLUMNS.nameWidth}),
      renderCell: channel => (
        <VStack gap={SPACE.hairline}>
          <Text weight="medium">{t(`gz.channels.${channel.id}.name` as MessageKey)}</Text>
          <Text type="supporting">{t(`gz.channels.${channel.id}.line` as MessageKey)}</Text>
        </VStack>
      ),
    },
    ...PLATFORMS.map(platform => ({
      key: platform,
      header: t(`gz.channels.col.${platform}` as MessageKey),
      width: pixel(CHANNEL_COLUMNS.platformWidth[platform]),
      renderCell: (channel: Channel) => {
        const join = channel.join.find(target => target.platform === platform);
        return join ? <ChannelLink join={join} locale={locale} handleOnly /> : <Text color="secondary">—</Text>;
      },
    })),
  ];
  return (
    <>
      <div {...stylex.props(styles.wide)}>
        <Table<Channel> data={channels} columns={columns} idKey="id" hasHover plugins={{staticScroll: STATIC_SCROLL}} />
      </div>
      <div {...stylex.props(styles.narrow)}>
        <List density="compact" hasDividers edgeCompensation="inline">
          {channels.map(channel => <StackedChannel key={channel.id} channel={channel} locale={locale} />)}
        </List>
      </div>
    </>
  );
}

/** The phone form of a table row: name and line, then each platform handle on its own line. */
function StackedChannel({channel, locale}: {channel: Channel; locale: Locale}) {
  const t = useMessage();
  const joins = PLATFORMS.flatMap(platform => channel.join.filter(target => target.platform === platform));
  return (
    <ListItem
      label={<Text weight="medium">{t(`gz.channels.${channel.id}.name` as MessageKey)}</Text>}
      description={
        <VStack as="span" gap={SPACE.hairline}>
          <Text type="supporting">{t(`gz.channels.${channel.id}.line` as MessageKey)}</Text>
          {joins.map(join => <ChannelLink key={join.label} join={join} locale={locale} handleOnly />)}
        </VStack>
      }
      startContent={<Icon icon={channel.icon} size={ICON.inline} color="secondary" />}
    />
  );
}

function OtherChannel({channel, locale}: {channel: Channel; locale: Locale}) {
  const t = useMessage();
  return (
    <ListItem
      label={<Text weight="medium">{t(`gz.channels.${channel.id}.name` as MessageKey)}</Text>}
      description={<Text type="supporting">{t(`gz.channels.${channel.id}.line` as MessageKey)}</Text>}
      startContent={<Icon icon={channel.icon} size={ICON.inline} color="secondary" />}
      endContent={channel.join.length > 0 ? (
        <VStack gap={SPACE.hairline} hAlign="end">
          {channel.join.map(join => <ChannelLink key={join.label} join={join} locale={locale} />)}
        </VStack>
      ) : <Text color="secondary">—</Text>}
    />
  );
}

export function ChannelsPage(page: Omit<SectionPageProps, 'slots' | 'children'> & {body: string}) {
  const t = useMessage();
  const slots = {
    groups: <ChannelTable channels={CHANNELS.groups} locale={page.locale} />,
    feeds: <ChannelTable channels={CHANNELS.feeds} locale={page.locale} />,
    other: (
      <List density="compact" hasDividers edgeCompensation="inline">
        {CHANNELS.other.map(channel => <OtherChannel key={channel.id} channel={channel} locale={page.locale} />)}
      </List>
    ),
    rules: <Banner status="info" collapsible={false} title={t('gz.channels.rules.title')} description={t('gz.channels.rules.body')} />,
  };
  return <SectionPage {...page} isDataPage slots={slots} />;
}
