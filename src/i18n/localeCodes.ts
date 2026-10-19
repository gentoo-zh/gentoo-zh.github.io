/** The locale codes on their own, free of the catalogs, so the Worker and the boot script can share them. */
export const LOCALES = ['zh-cn', 'zh-tw', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh-cn';

/** BCP 47 tag used for `<html lang>`, `hreflang`, feeds, and Astryx's catalogs. */
export const LANGUAGE_TAG: Record<Locale, string> = {'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', en: 'en'};
