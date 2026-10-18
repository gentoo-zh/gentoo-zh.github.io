// Ported from facebook/astryx apps/docsite/src/app/(site)/page.tsx and _landing (MIT).
// Copyright (c) Meta Platforms, Inc. and affiliates.
import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Section} from '@astryxdesign/core/Section';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import type {PostSummary} from '../../content/posts';
import type {Sponsor} from '../../data/schemas';
import {LANGUAGE_TAG, type Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import {SITE} from '../../site';
import {homeTheme} from '../../theme/home.stylex';
import {homeMedia} from '../../theme/layout.stylex';
import {AVATAR, BUTTON, GRID, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {ArrowRight, HeartHandshake, Hash} from '../chrome/icons';
import {DiscourseLogo, TelegramLogo, MatrixLogo} from '../chrome/channelLogos';
import {IconTile} from '../chrome/IconTile';
import {EntryIcon} from '../section/entryIcons';
import {PostCover} from '../blog/PostCover';
import {entryLink, sectionHref, sectionOf, type SectionId, type SectionPageId} from '../chrome/sections';
import {STATUS_API, type StatusLevel} from '../support/StatusBoard';
import {homeStyles as s} from './home.styles';
import {HOME_LIVE_ATTRIBUTE} from './homeLive';
import {HOME_STATUS_ATTRIBUTE} from './homeStatus';

export interface HomeContributor {name: string; avatar: string; href: string}
export interface HomePageProps {
  locale: Locale;
  posts: PostSummary[];
  contributors: HomeContributor[];
  contributorCount: number;
  commits: number;
  days: number;
  sponsors: Sponsor[];
}

const BRAND = 'gentoo-zh overlay';
const AVATARS = 6;
// Repeat the avatar wall every WALL_PERIOD tiles so a one-period translation loops seamlessly.
const WALL_PERIOD = 14;
const WALL_COLUMNS = 26;
const WALL_ROWS = 26;
const CHANNELS = [
  {id: 'telegramChannel', logo: TelegramLogo},
  {id: 'telegramChat', logo: TelegramLogo},
  {id: 'matrix', logo: MatrixLogo},
  {id: 'irc', logo: Hash},
  {id: 'forum', logo: DiscourseLogo},
  {id: 'contribute', logo: HeartHandshake},
] as const;
/** StatusDot variants per status level; a healthy state stays quiet (dot + supporting text, not a solid badge). The live script reveals one. */
const STATUS_DOT = {up: 'success', down: 'error', unknown: 'neutral', maintenance: 'accent'} as const satisfies Record<StatusLevel, string>;

/** Server markup holds a skeleton; HomeStatus.astro swaps in the indicator for what the status API reports. */
function StatusIndicator() {
  const t = useMessage();
  return <HStack as="span" vAlign="center" {...{[HOME_STATUS_ATTRIBUTE]: ''}} data-api={STATUS_API}>
    <HStack as="span" data-loading xstyle={s.toggle}><Skeleton width={GRID.statusCell / 2} height={16} radius="rounded" /></HStack>
    {(Object.keys(STATUS_DOT) as StatusLevel[]).map(level => <HStack as="span" key={level} data-level={level} hidden gap={SPACE.tight} vAlign="center" xstyle={s.toggle}><StatusDot variant={STATUS_DOT[level]} label={t(`gz.status.level.${level}`)} /><Text type="supporting" color="secondary">{t(`gz.status.level.${level}`)}</Text></HStack>)}
  </HStack>;
}

/** Content - Card Grid (library): the cover on top, then title and date. */
function PostCard({post, locale}: {post: PostSummary; locale: Locale}) {
  return <ClickableCard href={routes.post(locale, post.slug)} label={post.title} padding={TEMPLATE.zero} xstyle={s.card}>
    {post.image && <AspectRatio ratio={TEMPLATE.coverRatio} fit="cover" xstyle={s.cover}><PostCover image={post.image} dark={post.coverDark} loading="lazy" decoding="async" /></AspectRatio>}
    <Section variant="transparent" padding={SPACE.block}>
      <VStack gap={SPACE.hairline}>
        <Heading level={3} maxLines={2}>{post.title}</Heading>
        <Text type="supporting" color="secondary"><Timestamp value={post.date} format="date" /></Text>
      </VStack>
    </Section>
  </ClickableCard>;
}

export function HomePage({locale, posts, contributors, contributorCount, commits, days, sponsors}: HomePageProps) {
  const t = useMessage();
  const number = new Intl.NumberFormat(LANGUAGE_TAG[locale]);
  const page = (section: SectionId, id: SectionPageId) => sectionOf(section).pages.find(item => item.id === id)!;
  const entry = (section: SectionId, id: SectionPageId) => entryLink(locale, page(section, id)).href;
  const tagline = t('gz.home.tagline');
  const at = tagline.indexOf(BRAND);
  const headline = <>{at < 0 ? tagline : tagline.slice(0, at)}{at >= 0 && <Text type="inherit" weight="semibold" xstyle={s.brandLine}>{BRAND}</Text>}{at >= 0 && tagline.slice(at + BRAND.length)}</>;
  const metrics = [
    {value: contributorCount, label: t('gz.homeE.people'), href: routes.page(locale, 'contributors')},
    {value: commits, label: t('gz.homeE.commits'), href: 'https://github.com/gentoo-zh/overlay/commits/master', live: 'commits'},
    {value: days, label: t('gz.homeE.days'), href: routes.post(locale, '2013-02-05-gentoo-zh-community-has-been-founded'), live: 'days'},
  ];
  const links = {
    telegramChannel: {label: t('gz.homeF.telegramChannel'), handle: '@gentoocn', href: SITE.telegramChannel},
    telegramChat: {label: t('gz.homeF.telegramChat'), handle: '@gentoo_zh', href: SITE.telegramChat},
    matrix: {label: t('gz.homeF.matrix'), handle: '#gentoo-zh:matrix.gentoozh.org', href: SITE.matrix},
    irc: {label: 'IRC', handle: '#gentoo-zh @ Libera.Chat', href: SITE.irc},
    forum: {label: t('gz.nav.forum'), handle: 'forum.gentoozh.org', href: SITE.forum},
    contribute: {label: t('gz.homeF.contribute'), handle: '', href: entry('community', 'contributing')},
  };
  const buttons = <Grid columns={2} gap={SPACE.inline} xstyle={s.buttons}>
    <Button label={t('gz.homeF.useOverlay')} variant="primary" size={BUTTON.cta} href={entry('docs', 'overlay')} xstyle={s.button} />
    <Button label={t('gz.homeF.liveIso')} variant="secondary" size={BUTTON.cta} href={sectionHref(locale, sectionOf('download'))} xstyle={s.button} />
  </Grid>;
  const avatarGroup = <AvatarGroup size={AVATAR.card}>
    {contributors.slice(0, AVATARS).map(person => <Avatar key={person.href} src={person.avatar} name={person.name} xstyle={s.avatar} />)}
    <AvatarGroupOverflow count={Math.max(0, contributorCount - AVATARS)} xstyle={[s.avatar, s.overflowCount]} />
  </AvatarGroup>;
  const entryOf = (section: SectionId, id: SectionPageId) => ({id, title: t(`gz.nav.${id}`), description: t(`gz.section.sub.${id}`), icon: <EntryIcon id={id} />, link: entryLink(locale, page(section, id))});
  // Two ranks: the gentoo-zh sources lead in their own panel with large tiles; the official sources, downloads and
  // services share a second panel as three columns. Each group runs from the most used entry down.
  const sources = (['overlay', 'binpkg', 'distfilesSetup'] as const).map(id => entryOf('docs', id));
  const official = (['gentooRepoSetup', 'gentooDistfilesSetup', 'gentooBinpkgSetup'] as const).map(id => entryOf('docs', id));
  const downloads = ([['download', 'packages'], ['download', 'liveIso'], ['download', 'officialMedia']] as const).map(([section, id]) => entryOf(section, id));
  const services = ([['download', 'mirrorlist'], ['support', 'paste'], ['support', 'status']] as const).map(([section, id]) => entryOf(section, id));
  const groups = [
    {key: 'official', label: t('gz.homeF.group.official'), entries: official},
    {key: 'downloads', label: t('gz.homeF.group.downloads'), entries: downloads},
    {key: 'services', label: t('gz.homeF.group.services'), entries: services},
  ];
  return <VStack gap={TEMPLATE.zero} data-home xstyle={[homeTheme.scope, s.scope]}>
    <VStack data-home-hero xstyle={s.hero}>
      <Grid xstyle={s.heroColumns}>
        <VStack gap={SPACE.page} xstyle={s.heroText}>
          <Heading level={1} type="display-1" weight="normal" textWrap="balance" id="home-title" xstyle={s.headline}>{headline}</Heading>
          <Text type="large" weight="normal" color="secondary">{t('gz.homeF.intro')}</Text>
          {buttons}
          <HStack gap={SPACE.group} xstyle={s.metrics}>
            {metrics.map(metric => <Link key={metric.href} href={metric.href} color="inherit" aria-label={`${metric.label}: ${number.format(metric.value)}`}>
              <VStack gap={TEMPLATE.zero} {...('live' in metric ? {[HOME_LIVE_ATTRIBUTE]: metric.live} : {})}>
                <Text type="display-3" weight="semibold">{number.format(metric.value)}</Text>
                <Text type="supporting" color="secondary">{metric.label}</Text>
              </VStack>
            </Link>)}
          </HStack>
        </VStack>
        <VStack aria-hidden xstyle={s.artwork}>
          <VStack aria-hidden xstyle={s.logoWall}>
            <Grid xstyle={s.wallTrack}>
              {Array.from({length: WALL_ROWS * WALL_COLUMNS}, (_, index) => {
                const row = Math.floor(index / WALL_COLUMNS) % WALL_PERIOD;
                const column = (index % WALL_COLUMNS) % WALL_PERIOD;
                return <img key={index} src={contributors[(row * WALL_PERIOD + column) % contributors.length]!.avatar} alt="" decoding="async" {...stylex.props(s.wallTile)} />;
              })}
            </Grid>
          </VStack>
        </VStack>
      </Grid>
      <Link href={routes.page(locale, 'contributors')} aria-label={t('gz.homeF.contributors')} display="block" xstyle={s.contributors}>
        <AvatarGroup size={AVATAR.card}>
          {contributors.slice(0, AVATARS).map(person => <Avatar key={person.href} src={person.avatar} name={person.name} tooltip={false} xstyle={s.avatar} />)}
          <AvatarGroupOverflow count={Math.max(0, contributorCount - Math.min(AVATARS, contributors.length))} xstyle={[s.avatar, s.overflowCount]} />
        </AvatarGroup>
      </Link>
    </VStack>
    <VStack xstyle={s.sheet}>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-features" xstyle={s.section}>
        <Heading id="home-features" level={2} type="display-2">{t('gz.homeF.features')}</Heading>
        <VStack gap={SPACE.block}>
          <VStack role="group" gap={SPACE.tight} aria-labelledby="home-group-sources" xstyle={s.group}>
            <Text type="label" id="home-group-sources" xstyle={[s.brandInk, s.groupLabelInset]}>{t('gz.homeF.group.sources')}</Text>
            <List hasDividers xstyle={s.serviceRows}>
              {sources.map(entry => <ListItem key={entry.id} xstyle={[s.row, s.oneRow]} href={entry.link.href} target={entry.link.isExternal ? '_blank' : undefined} label={entry.title} description={<Text type="supporting">{entry.description}</Text>} startContent={<IconTile isLarge>{entry.icon}</IconTile>} />)}
            </List>
          </VStack>
          <Grid xstyle={[s.group, s.groupColumns]}>
            {groups.map(group => <VStack key={group.key} role="group" gap={TEMPLATE.zero} aria-labelledby={`home-group-${group.key}`} xstyle={s.groupColumn}>
              <Text type="label" id={`home-group-${group.key}`} xstyle={[s.brandInk, s.groupLabelInset, s.columnLabel]}>{group.label}</Text>
              <List hasDividers xstyle={s.columnRows}>
                {group.entries.map(entry => <ListItem key={entry.id} xstyle={s.row} href={entry.link.href} target={entry.link.isExternal ? '_blank' : undefined} label={entry.title} description={<Text type="supporting">{entry.description}</Text>} startContent={<IconTile>{entry.icon}</IconTile>} endContent={entry.id === 'status' ? <StatusIndicator /> : undefined} />)}
              </List>
            </VStack>)}
          </Grid>
        </VStack>
      </VStack>
      <VStack as="section" aria-labelledby="home-join" xstyle={[s.section, s.about]}>
        <VStack gap={SPACE.block} xstyle={s.aboutHeading}>
          <Heading level={2} id="home-join" type="display-2">{t('gz.homeF.join')}</Heading>
          <Link href={routes.page(locale, 'contributors')} color="inherit"><Text type="display-1" weight="semibold" xstyle={s.brandInk}>{number.format(contributorCount)}</Text>{' '}{t('gz.homeE.people')}</Link>
          <Link href={routes.page(locale, 'contributors')} aria-label={t('gz.homeF.contributors')}>{avatarGroup}</Link>
        </VStack>
        <VStack role="group" gap={SPACE.tight} aria-labelledby="home-channels" xstyle={s.group}>
          <HStack gap={SPACE.inline} hAlign="between" xstyle={s.groupHeader}>
            <Text type="label" id="home-channels" xstyle={[s.brandInk, s.groupLabelInset]}>{t('gz.nav.channels')}</Text>
            <Button label={t('gz.homeF.allChannels')} href={entry('community', 'channels')} variant="ghost" size={BUTTON.inline} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} xstyle={s.groupAction} />
          </HStack>
          <List hasDividers xstyle={s.channels}>
            {CHANNELS.map(({id, logo: Logo}, index) => <ListItem key={id} xstyle={[s.row, CHANNELS.length % 2 === 0 && index === CHANNELS.length - 2 && s.lastRowStart]} href={links[id].href} label={links[id].label} description={links[id].handle || undefined} startContent={<IconTile><Logo size={ICON.toolbarPx} /></IconTile>} />)}
          </List>
        </VStack>
      </VStack>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-posts" xstyle={s.section}>
        <HStack gap={SPACE.inline} hAlign="between" vAlign="center" wrap="wrap">
          <Heading id="home-posts" level={2} type="display-2">{t('gz.home.latestPosts')}</Heading>
          <Button label={t('gz.home.allPosts')} href={routes.posts(locale)} variant="ghost" size={BUTTON.toolbar} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} />
        </HStack>
        <Grid gap={SPACE.group} xstyle={s.posts}>{posts.map(post => <PostCard key={post.slug} post={post} locale={locale} />)}</Grid>
      </VStack>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-thanks" xstyle={s.section}>
        <HStack gap={SPACE.inline} hAlign="between" vAlign="center" wrap="wrap">
          <Heading id="home-thanks" level={2} type="display-2">{t('gz.homeE.thanks')}</Heading>
          <Button label={t('gz.home.sponsorsMore')} href={entry('about', 'thanks')} variant="ghost" size={BUTTON.toolbar} endContent={<Icon icon={ArrowRight} />} />
        </HStack>
        <Grid gap={SPACE.page} xstyle={s.logos}>
          {sponsors.map(sponsor => <ClickableCard key={sponsor.href} href={sponsor.href} label={sponsor.name[locale]} padding={TEMPLATE.zero} xstyle={s.card}>
            <HStack vAlign="center" xstyle={s.logoBox}>
              {(sponsor.logoDark ? [[sponsor.logo, homeMedia.light], [sponsor.logoDark, homeMedia.dark]] as const : [[sponsor.logo, null]] as const).map(([src, mode]) => <img key={src} src={src} alt="" loading="lazy" {...stylex.props(s.logo, s.logoScale(sponsor.scale ?? 1), mode)} />)}
            </HStack>
          </ClickableCard>)}
        </Grid>
      </VStack>
    </VStack>
  </VStack>;
}
