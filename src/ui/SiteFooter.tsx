// Adapted from the Astryx docsite footer (MIT, Meta Platforms, Inc.).
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Section} from '@astryxdesign/core/Section';
import {Text} from '@astryxdesign/core/Text';
import type {Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {useMessage} from '../i18n/useMessage';
import {LAYOUT, SITE} from '../site';
import {DiscourseLogo, TelegramLogo} from './chrome/channelLogos';
import {GitHubLogo, Mail, Rss} from './chrome/icons';
import {Divider} from '@astryxdesign/core/Divider';
import {FOOTER_ID} from './chrome/footerId';
import {SECTIONS, sectionHref} from './chrome/sections';
import {SPACE} from '../theme/scale';
import {media} from '../theme/layout.stylex';

const styles = stylex.create({
  // Same surface as the app shell above it, or the top padding shows the darker page canvas in dark mode.
  footer: {
    backgroundColor: 'var(--color-background-surface)',
    paddingTop: {default: 'var(--spacing-12)', [media.footerCompact]: 'var(--spacing-8)'},
  },
  row: {
    flexDirection: {default: 'row', [media.footerCompact]: 'column'},
    gap: {default: 'var(--spacing-6)', [media.footerCompact]: 'var(--spacing-6)'},
  },
  brand: {
    flexShrink: 0,
  },
  legalLink: {minHeight: {default: 0, [media.mobile]: 'var(--size-element-md)'}},
  legal: {
    minWidth: 0,
  },
  contact: {
    justifyContent: {default: 'flex-end', [media.footerCompact]: 'center'},
  },
  // Fragment navigation reveals real, focusable links when the phone menu has no script.
  fallback: {
    display: {default: 'none', ':target': 'flex'},
  },
});

export function SiteFooter({locale}: {locale: Locale}) {
  const t = useMessage();
  const site = t('gz.site.title');
  const social = [
    {label: SITE.email, href: `mailto:${SITE.email}`, icon: <Mail />},
    {label: t('gz.footer.github'), href: SITE.github, icon: <GitHubLogo />},
    {label: t('gz.footer.telegram'), href: SITE.telegramChat, icon: <TelegramLogo />},
    {label: t('gz.service.forum'), href: SITE.forum, icon: <DiscourseLogo />},
    {label: t('gz.footer.feed'), href: routes.feed(locale), icon: <Rss />},
  ];

  return (
    <Section role="contentinfo" padding={SPACE.page} xstyle={styles.footer}>
      <VStack gap={SPACE.block}>
        <Divider />
        <HStack align="center" justify="between" xstyle={styles.row}>
          <HStack gap={SPACE.inline} align="center" xstyle={styles.brand}>
            <Link href={routes.home(locale)} label={site} isStandalone>
              <img loading="lazy" decoding="async" src="/favicon.svg" alt="" width={LAYOUT.wordmarkHeight} height={LAYOUT.wordmarkHeight} />
            </Link>
            <Text type="supporting" color="secondary">
              {t('gz.footer.copyright', {site})}
            </Text>
          </HStack>
          <HStack gap={SPACE.block} wrap="wrap" align="center" hAlign="center" xstyle={styles.legal}>
            <Link href={SITE.license} type="supporting" color="secondary" isStandalone target="_blank" xstyle={styles.legalLink}>
              {t('gz.footer.license')}
            </Link>
            <Link href={SITE.issues} type="supporting" color="secondary" isStandalone target="_blank" xstyle={styles.legalLink}>
              {t('gz.footer.issues')}
            </Link>
          </HStack>
          <HStack gap={SPACE.block} wrap="wrap" align="center" xstyle={styles.contact}>
            <HStack gap={SPACE.tight} align="center">
              {social.map(item => (
                <Button key={item.href} label={item.label} tooltip={item.label} variant="secondary" isIconOnly icon={item.icon} href={item.href} />
              ))}
            </HStack>
          </HStack>
        </HStack>
        <HStack as="nav" id={FOOTER_ID} aria-label={t('gz.nav.label')} gap={SPACE.block} wrap="wrap" align="center" hAlign="center" xstyle={styles.fallback}>
          {SECTIONS.map(section => (
            <Link key={section.id} href={sectionHref(locale, section)} type="supporting" color="secondary" isStandalone>
              {t(`gz.nav.${section.id}`)}
            </Link>
          ))}
        </HStack>
      </VStack>
    </Section>
  );
}
