import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import {modeDisplay} from '../../theme/mode.stylex';
import type {Sponsor} from '../../data/schemas';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, SPACE, TEMPLATE} from '../../theme/scale';
import {THANKS_LOGO_IMAGE} from '../../theme/images';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';
import {anchorId} from './anchors';

const styles = stylex.create({
  media: {backgroundColor: 'var(--color-background-surface)'},
  // Logos are artwork, not photos: inset them so they do not fill the tile edge to edge.
  logo: {boxSizing: 'border-box', padding: 'var(--spacing-8)'},
  scale: (scale: number) => ({transform: `scale(${scale})`}),
});

type Group = 'builder' | 'mirrors' | 'services';
/** What each sponsor provides and where it is, by host; a sponsor missing here fails the build. */
const ROLES: Record<string, {group: Group; region: 'us' | 'cn' | 'ca'; note?: 'osuosl' | 'onepassword'}> = {
  'osuosl.org': {group: 'builder', region: 'us', note: 'osuosl'},
  'mirrors.cernet.edu.cn': {group: 'mirrors', region: 'cn'},
  'mirror.nju.edu.cn': {group: 'mirrors', region: 'cn'},
  'mirror.nyist.edu.cn': {group: 'mirrors', region: 'cn'},
  'mirrors.ha.edu.cn': {group: 'mirrors', region: 'cn'},
  '1password.com': {group: 'services', region: 'ca', note: 'onepassword'},
};

const hostOf = (sponsor: Sponsor) => new URL(sponsor.href).hostname;

/** The 1Password tile opens its non-profit programme page, localized as the Hugo page linked it. */
const NON_PROFIT: Record<Locale, string> = {
  'zh-cn': 'https://1password.com/zh-cn/for-non-profits',
  'zh-tw': 'https://1password.com/zh-tw/for-non-profits',
  en: 'https://1password.com/for-non-profits',
};
/** The distfiles page's fragment id for one sponsor, kept for its links after the 301. */
const SPONSOR_ID: Record<string, string> = {'osuosl.org': 'osuosl'};

function roleOf(sponsor: Sponsor) {
  const role = ROLES[hostOf(sponsor)];
  if (role == null) throw new Error(`ThanksPage: no role for ${sponsor.href}`);
  return role;
}

type Props = Omit<SectionPageProps, 'slots' | 'children'> & {body: string; sponsors: Sponsor[]};

export function ThanksPage({sponsors, ...page}: Props) {
  const t = useMessage();
  const group = (id: Group) => (
    <Grid id={anchorId(page.locale, id)} columns={{minWidth: TEMPLATE.logoColumn}} gap={SPACE.block}>
      {sponsors
        .filter(sponsor => roleOf(sponsor).group === id)
        .map(sponsor => {
          const role = roleOf(sponsor);
          const name = sponsor.name[page.locale];
          return (
            <ClickableCard
              key={sponsor.href}
              id={SPONSOR_ID[hostOf(sponsor)]}
              href={role.note === 'onepassword' ? NON_PROFIT[page.locale] : sponsor.href}
              label={name} target="_blank" padding={TEMPLATE.zero}>
              <AspectRatio ratio={TEMPLATE.libraryImageRatio} fit="contain" xstyle={styles.media}>
                {(sponsor.logoDark ? [[sponsor.logo, modeDisplay.light], [sponsor.logoDark, modeDisplay.dark]] as const : [[sponsor.logo, null]] as const).map(([src, mode]) => <img key={src} src={src} alt="" data-image-widths={THANKS_LOGO_IMAGE.widths} sizes={THANKS_LOGO_IMAGE.sizes} loading="lazy" decoding="async" {...stylex.props(styles.logo, styles.scale(sponsor.scale ?? 1), mode)} />)}
              </AspectRatio>
              <Section variant="transparent" padding={SPACE.block}>
                <VStack gap={SPACE.hairline}>
                  <Heading level={3}>{name}</Heading>
                  <Text type="body" size={BUTTON.inline} color="secondary">
                    {t('gz.thanks.meta', {region: role.region, host: hostOf(sponsor)})}
                  </Text>
                  {role.note == null ? null : <Text type="body" size={BUTTON.inline} color="secondary">{t(`gz.thanks.note.${role.note}`)}</Text>}
                </VStack>
              </Section>
            </ClickableCard>
          );
        })}
    </Grid>
  );
  return <SectionPage {...page} slots={{builder: group('builder'), mirrors: group('mirrors'), services: group('services')}} />;
}
