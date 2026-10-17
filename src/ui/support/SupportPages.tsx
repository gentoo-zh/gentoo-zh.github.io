// Support pages use SectionPage slots; the status board remains the shared live island.
import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {List, ListItem} from '@astryxdesign/core/List';
import {GitHubLogo} from '../chrome/icons';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {providerMessages, LANGUAGE_TAG, type Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {localizeHref} from '../../i18n/routes';
import {LegacyAnchorLinks} from '../section/LegacyAnchorLinks';
import {SITE} from '../../site';
import {BUTTON, SPACE} from '../../theme/scale';
import {SectionPage} from '../section/SectionPage';
import {StatusDashboard} from './StatusDashboard';
import {STATUS_ISLAND, STATUS_ISLAND_ATTRIBUTE, StatusBoard, type StatusIslandProps} from './StatusBoard';

const styles = stylex.create({
  // The island container adds no box; the board inside lays out as the page's own child.
  mount: {display: 'contents'},
});

export {STATUS_BOARD} from './StatusBoard';

interface PageProps {
  locale: Locale;
  title: string;
  description?: string;
  body?: string;
  pages: ReadonlySet<string>;
}

/** The catalog entries the status island renders, so they can travel with the page. */
function statusMessages(locale: Locale): Record<string, string> {
  return Object.fromEntries(Object.entries(providerMessages(locale)[LANGUAGE_TAG[locale]]).filter(([key]) => key.startsWith('gz.status.') || key === 'gz.packages.col.status' || /^@astryx\.(keyboardHint|selector|button|input|field|textInput|table|popover|dropdownMenu|tooltip|layer)\./.test(key)));
}

/** Render unknown service states until the live status script supplies data. */
function StatusMount({locale, compact}: {locale: Locale; compact: boolean}) {
  const languageTag = LANGUAGE_TAG[locale];
  const props: StatusIslandProps = {languageTag, messages: statusMessages(locale), compact};
  return (
    <VStack xstyle={styles.mount} {...{[STATUS_ISLAND_ATTRIBUTE]: STATUS_ISLAND}} data-props={JSON.stringify(props)}>
      {compact ? <StatusBoard data={null} languageTag={languageTag} compact /> : <StatusDashboard data={null} languageTag={languageTag} />}
    </VStack>
  );
}

export function StatusPage({locale, title, description, body = '', pages}: PageProps) {
  return <SectionPage locale={locale} section="support" title={title} description={description} pages={pages} isFullWidthDataPage
    body={`<!-- slot:board -->\n\n${body}`} slots={{board: <StatusMount locale={locale} compact={false} />}} />;
}

export function FaqPage({locale, title, description, body = '', pages, questions, anchors}: PageProps & {
  questions: ReadonlyArray<{title: string; href: string}>;
  anchors: Record<string, string>;
}) {
  const t = useMessage();
  return (
    <SectionPage
      locale={locale}
      section="support"
      title={title}
      description={description}
      body={body}
      pages={pages}
      slots={{
        topics: (
          <List header={t('gz.support.faq.topics')} hasDividers density="compact" data-pagefind-ignore edgeCompensation="inline">
            {questions.map(question => (
              <ListItem key={question.href} href={localizeHref(locale, question.href, () => true)} label={<Text>{question.title}</Text>} />
            ))}
          </List>
        ),
        legacy: <LegacyAnchorLinks locale={locale} anchors={anchors} />,
      }}
    />
  );
}

export function PastePage({locale, title, description, body, pages}: PageProps) {
  const t = useMessage();
  return (
    <SectionPage
      locale={locale}
      section="support"
      title={title}
      description={description}
      body={body}
      pages={pages}
      slots={{
        // The web form and the command line are two ways to paste, not steps: one primary, one secondary.
        actions: (
          <VStack gap={SPACE.block}>
            <HStack gap={SPACE.inline} wrap="wrap">
              <Button variant="primary" size={BUTTON.cta} label={t('gz.support.paste.open')} href={SITE.paste} />
              <Button variant="secondary" size={BUTTON.cta} label={t('gz.support.paste.cli')} href="https://github.com/gentoo-zh/gzpaste" icon={<GitHubLogo />} />
            </HStack>
            <Banner status="warning" title={t('gz.support.paste.warningTitle')} description={t('gz.support.paste.warning')} />
          </VStack>
        ),
      }}
    />
  );
}
