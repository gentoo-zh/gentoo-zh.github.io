// Adapted from the Astryx Product Gallery template for category navigation.
import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {layout} from '../../theme/layout.stylex';
import {ICON, SPACE} from '../../theme/scale';
import {entryAnchor, menuEntries, type SectionId, sectionOf} from '../chrome/sections';
import {DiscourseLogo, MatrixLogo, TelegramLogo} from '../chrome/channelLogos';
import {Hash} from '../chrome/icons';
import {SITE} from '../../site';
import {EntryIcon} from './entryIcons';
import {MarkdownBlock} from './SectionPage';
import {LandingBlocks} from './LandingBlocks';
import {pageStart} from './pageStart.stylex';

const styles = stylex.create({
  section: {marginInline: 'auto', width: '100%'},
});

export interface LandingContent {
  id?: string;
  summaries?: Record<string, string>;
  steps?: Record<string, string>;
}

export interface SectionLandingProps {
  locale: Locale;
  section: SectionId;
  body?: string;
  landing: LandingContent;
  pages: ReadonlySet<string>;
}

export function SectionLanding({locale, section, body, landing, pages}: SectionLandingProps) {
  const t = useMessage();
  const entries = menuEntries(locale, sectionOf(section));
  return (
    <Section maxWidth={layout.contentMaxWidth} padding={SPACE.page} xstyle={[styles.section, pageStart.start]}>
      <VStack gap={SPACE.page}>
        <VStack gap={SPACE.block} maxWidth={layout.proseMaxWidth}>
          <Heading level={1} type="display-1" id={`${section}-title`}>{t(`gz.nav.${section}`)}</Heading>
          <Text type="large" weight="normal" color="secondary">{t(`gz.section.lead.${section}`)}</Text>
          {body ? <MarkdownBlock locale={locale} pages={pages}>{body}</MarkdownBlock> : null}
        </VStack>
        <LandingBlocks id={landing.id} label={t(`gz.nav.${section}`)} entries={entries.map(({entry, link}) => ({
          id: entry.id,
          anchor: entryAnchor(locale, entry),
          title: t(`gz.nav.${entry.id}`),
          description: landing.summaries?.[entry.id] ?? t(`gz.section.sub.${entry.id}`),
          step: landing.steps?.[entry.id],
          link,
          icon: <EntryIcon id={entry.id} />,
          links: entry.id === 'channels' ? [
            {label: 'Telegram', href: SITE.telegramChat, icon: <TelegramLogo size={ICON.inlinePx} />},
            {label: 'Matrix', href: SITE.matrix, icon: <MatrixLogo size={ICON.inlinePx} />},
            {label: 'IRC', href: SITE.irc, icon: <Hash size={ICON.inlinePx} />},
            {label: t('gz.nav.forum'), href: SITE.forum, icon: <DiscourseLogo size={ICON.inlinePx} />},
          ] : undefined,
        }))} />
      </VStack>
    </Section>
  );
}
