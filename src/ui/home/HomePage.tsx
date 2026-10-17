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
import {AVATAR, BUTTON, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {ArrowRight, HeartHandshake, Hash} from '../chrome/icons';
import {DiscourseLogo, TelegramLogo, MatrixLogo} from '../chrome/channelLogos';
import {EntryIcon} from '../section/entryIcons';
import {entryLink, sectionHref, sectionOf, type SectionId, type SectionPageId} from '../chrome/sections';
import {homeStyles as s} from './home.styles';

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

function PostCard({post, locale}: {post: PostSummary; locale: Locale}) {
  return <ClickableCard href={routes.post(locale, post.slug)} label={post.title} padding={SPACE.page} xstyle={s.card}>
    <VStack gap={SPACE.tight} xstyle={s.fill}>
      {post.image && <AspectRatio ratio={TEMPLATE.libraryImageRatio} xstyle={s.cover}><img src={post.image.src} alt={post.image.alt} loading="lazy" decoding="async" {...stylex.props(s.image)} /></AspectRatio>}
      <Heading level={3}>{post.title}</Heading>
      <Text color="secondary" xstyle={s.excerpt}>{post.description}</Text>
      <Text type="supporting" color="secondary" xstyle={s.postDate}><Timestamp value={post.date} format="date" /></Text>
    </VStack>
  </ClickableCard>;
}

export function HomePage({locale, posts, contributors, contributorCount, commits, days, sponsors}: HomePageProps) {
  const t = useMessage();
  const number = new Intl.NumberFormat(LANGUAGE_TAG[locale]);
  const entry = (section: SectionId, id: SectionPageId) => entryLink(locale, sectionOf(section).pages.find(page => page.id === id)!).href;
  const tagline = t('gz.home.tagline');
  const at = tagline.indexOf(BRAND);
  const headline = <>{at < 0 ? tagline : tagline.slice(0, at)}{at >= 0 && <Text type="inherit" weight="semibold" xstyle={s.brandLine}>{BRAND}</Text>}{at >= 0 && tagline.slice(at + BRAND.length)}</>;
  const metrics = [
    {value: contributorCount, label: t('gz.homeE.people'), href: routes.page(locale, 'contributors')},
    {value: commits, label: t('gz.homeE.commits'), href: 'https://github.com/gentoo-zh/overlay/commits/master'},
    {value: days, label: t('gz.homeE.days'), href: routes.post(locale, '2013-02-05-gentoo-zh-community-has-been-founded')},
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
    {contributors.slice(0, AVATARS).map(person => <Avatar key={person.href} src={person.avatar} name={person.name} />)}
    <AvatarGroupOverflow count={Math.max(0, contributorCount - AVATARS)} />
  </AvatarGroup>;
  // Each group runs from the most used entry down.
  const groups = [
    {id: 'setup', items: [['docs', 'overlay'], ['docs', 'binpkg'], ['docs', 'distfilesSetup'], ['docs', 'gentooRepoSetup'], ['docs', 'gentooDistfilesSetup'], ['docs', 'gentooBinpkgSetup']]},
    {id: 'services', items: [['download', 'liveIso'], ['download', 'packages'], ['download', 'mirrorlist'], ['support', 'paste'], ['support', 'status'], ['download', 'officialMedia']]},
  ] as const;
  const featureGroups = groups.map(group => ({
    id: group.id, title: t(`gz.homeF.group.${group.id}`),
    items: group.items.map(([section, id]) => ({id, title: t(`gz.nav.${id}`), description: t(`gz.section.sub.${id}`), href: entry(section, id)})),
  }));
  return <VStack gap={TEMPLATE.zero} data-home xstyle={[homeTheme.scope, s.scope]}>
    <VStack data-home-hero xstyle={s.hero}>
      <Grid xstyle={s.heroColumns}>
        <VStack gap={SPACE.page} xstyle={s.heroText}>
          <Heading level={1} type="display-1" textWrap="balance" id="home-title" xstyle={s.headline}>{headline}</Heading>
          <Text type="large" weight="normal" color="secondary">{t('gz.homeF.intro')}</Text>
          {buttons}
          <HStack gap={SPACE.group} xstyle={s.metrics}>
            {metrics.map(metric => <Link key={metric.href} href={metric.href} color="inherit" aria-label={`${metric.label}: ${number.format(metric.value)}`}>
              <VStack gap={TEMPLATE.zero}>
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
          {contributors.slice(0, AVATARS).map(person => <Avatar key={person.href} src={person.avatar} name={person.name} tooltip={false} />)}
          <AvatarGroupOverflow count={Math.max(0, contributorCount - Math.min(AVATARS, contributors.length))} />
        </AvatarGroup>
      </Link>
    </VStack>
    <VStack xstyle={s.sheet}>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-features" xstyle={s.section}>
        <Heading id="home-features" level={2} type="display-2" xstyle={s.sectionTitle}>{t('gz.homeF.features')}</Heading>
        <Grid gap={SPACE.group} xstyle={s.features}>
          {featureGroups.map(group => <VStack key={group.id} gap={SPACE.tight} xstyle={s.group}>
            <Heading level={3} xstyle={s.groupTitle}>{group.title}</Heading>
            <List hasDividers>
              {group.items.map(item => <ListItem key={item.id} href={item.href} label={item.title} description={item.description} startContent={<VStack xstyle={s.brandInk}><EntryIcon id={item.id} /></VStack>} endContent={<VStack xstyle={s.brandInk}><Icon icon={ArrowRight} size={ICON.inline} color="inherit" /></VStack>} />)}
            </List>
          </VStack>)}
        </Grid>
      </VStack>
      <VStack as="section" aria-labelledby="home-join" xstyle={[s.section, s.about]}>
        <VStack gap={SPACE.block} xstyle={s.aboutHeading}>
          <Heading level={2} id="home-join" type="display-2" xstyle={s.sectionTitle}>{t('gz.homeF.join')}</Heading>
          <Link href={routes.page(locale, 'contributors')} color="inherit"><Text type="display-1" weight="semibold" xstyle={s.brandInk}>{number.format(contributorCount)}</Text>{' '}{t('gz.homeE.people')}</Link>
          <Link href={routes.page(locale, 'contributors')} aria-label={t('gz.homeF.contributors')}>{avatarGroup}</Link>
        </VStack>
        <VStack gap={SPACE.tight} xstyle={s.group}>
          <HStack gap={SPACE.inline} hAlign="between" vAlign="center">
            <Heading level={3} xstyle={s.groupTitle}>{t('gz.nav.channels')}</Heading>
            <Button label={t('gz.homeF.allChannels')} href={entry('community', 'channels')} variant="ghost" size={BUTTON.toolbar} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} />
          </HStack>
          <List hasDividers xstyle={s.channels}>
            {CHANNELS.map(({id, logo: Logo}, index) => <ListItem key={id} xstyle={CHANNELS.length % 2 === 0 && index === CHANNELS.length - 2 && s.lastRowStart} href={links[id].href} label={links[id].label} description={links[id].handle || undefined} startContent={<VStack xstyle={s.brandInk}><Logo size={ICON.channelPx} /></VStack>} endContent={<VStack xstyle={s.brandInk}><Icon icon={ArrowRight} size={ICON.inline} color="inherit" /></VStack>} />)}
          </List>
        </VStack>
      </VStack>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-posts" xstyle={s.section}>
        <HStack gap={SPACE.inline} hAlign="between" vAlign="center" wrap="wrap">
          <Heading id="home-posts" level={2} type="display-2" xstyle={s.sectionTitle}>{t('gz.home.latestPosts')}</Heading>
          <Button label={t('gz.home.allPosts')} href={routes.posts(locale)} variant="ghost" size={BUTTON.toolbar} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} />
        </HStack>
        <Grid gap={SPACE.group} xstyle={s.posts}>{posts.map(post => <PostCard key={post.slug} post={post} locale={locale} />)}</Grid>
      </VStack>
      <VStack as="section" gap={SPACE.group} aria-labelledby="home-thanks" xstyle={s.section}>
        <HStack gap={SPACE.inline} hAlign="between" vAlign="center" wrap="wrap">
          <Heading id="home-thanks" level={2} type="display-2" xstyle={s.sectionTitle}>{t('gz.homeE.thanks')}</Heading>
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
