import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Layout';
import type {Locale} from '../../i18n/locales';
import {localizeHref} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON} from '../../theme/scale';

const styles = stylex.create({
  // Only the requested legacy fragment needs a fallback when scripting is unavailable.
  target: {
    display: {default: 'none', ':target': 'flex'},
    scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))',
  },
});

export function localizedAnchors(locale: Locale, anchors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(anchors).map(([id, target]) => [id, localizeHref(locale, target, () => true)]));
}

export function LegacyAnchorLinks({locale, anchors}: {locale: Locale; anchors: Record<string, string>}) {
  const t = useMessage();
  return Object.entries(localizedAnchors(locale, anchors)).map(([id, target]) => (
    <VStack key={id} id={id} data-pagefind-ignore xstyle={styles.target}>
      <Button href={target.startsWith('/') ? target : `#${target}`} label={t('gz.guide.moved')} variant="ghost" size={BUTTON.cta} />
    </VStack>
  ));
}
