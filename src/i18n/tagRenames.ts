import type {Locale} from './locales';

/**
 * Post tags renamed to English slugs, old name to new slug. Hugo served the old tag pages,
 * so they stay as redirects. No imports, so scripts/check-i18n.mjs can read it.
 */
export const RENAMED_TAGS: Record<Locale, Record<string, string>> = {
  'zh-cn': {翻译: 'translation', 贡献: 'contributing'},
  'zh-tw': {翻譯: 'translation', 貢獻: 'contributing'},
  en: {},
};
