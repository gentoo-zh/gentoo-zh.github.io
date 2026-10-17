import type {Locale} from '../../i18n/locales';

/** English heading ids that equal a distfiles.gentoozh.org anchor; there the heading already serves it. */
const EN_HEADINGS = new Set(['mirrors', 'services', 'horizontal', 'vertical', 'icon', 'wordmark']);

/**
 * The distfiles page's fragment id for a group of cards, kept so its links land here after the
 * 301; left off where the English heading carries the same id.
 */
export function anchorId(locale: Locale, id: string): string | undefined {
  return locale === 'en' && EN_HEADINGS.has(id) ? undefined : id;
}
