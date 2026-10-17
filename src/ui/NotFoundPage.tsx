// Adapted from the Astryx docsite (app/not-found.tsx, MIT, Meta Platforms, Inc.).
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import {CATALOGS, LANGUAGE_TAG, LOCALES, type Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {useMessage} from '../i18n/useMessage';
import {layout} from '../theme/layout.stylex';
import {ArrowRight} from './chrome/icons';
import {BUTTON, ICON, SPACE} from '../theme/scale';

const styles = stylex.create({
  // Fill the space below the navigation so short pages keep the footer at the viewport edge.
  section: {
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 'calc(100dvh - var(--appshell-header-height, 4rem) - 12rem)',
  },
  actions: {flexWrap: 'wrap', justifyContent: 'center'},
});

export function NotFoundPage({locale}: {locale: Locale}) {
  const m = CATALOGS[locale];
  const t = useMessage();
  return (
    <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={styles.section}>
      <VStack gap={SPACE.tight} hAlign="center">
        <Heading level={1} type="display-1" justify="center">404</Heading>
        <VStack gap={SPACE.group} hAlign="center" data-not-found={locale}>
          <VStack gap={SPACE.tight} hAlign="center">
            <Text type="large" weight="medium" justify="center">{m['gz.notFound.title']}</Text>
            <Text weight="normal" color="secondary" justify="center">{m['gz.notFound.description']}</Text>
          </VStack>
          <HStack gap={SPACE.inline} xstyle={styles.actions}>
            <Button variant="primary" size={BUTTON.cta} label={m['gz.notFound.home']} href={routes.home(locale)} />
            <Button variant="secondary" size={BUTTON.cta} label={m['gz.notFound.posts']} href={routes.posts(locale)} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} />
          </HStack>
          <HStack gap={SPACE.inline} xstyle={styles.actions}>
            {LOCALES.filter(target => target !== locale).map(target => (
              <Link key={target} href={routes.home(target)} {...{lang: LANGUAGE_TAG[target], hrefLang: LANGUAGE_TAG[target]}}>{t(`gz.language.${target}`)}</Link>
            ))}
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
