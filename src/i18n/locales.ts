import astryxZhCN from '@astryxdesign/core/locales/zh-CN.generated.js';
import astryxZhTW from '@astryxdesign/core/locales/zh-TW.generated.js';
import en from './en.json';
import zhCN from './zh-cn.json';
import zhTW from './zh-tw.json';
import {LANGUAGE_TAG, type Locale} from './localeCodes.ts';

export {DEFAULT_LOCALE, LANGUAGE_TAG, LOCALES, type Locale} from './localeCodes.ts';

export type MessageKey = keyof typeof zhCN;
export type Catalog = Record<MessageKey, string>;

export const CATALOGS: Record<Locale, Catalog> = {'zh-cn': zhCN, 'zh-tw': zhTW, en};

/** Astryx ships `en` built in; the Chinese catalogs are merged under the site catalog. */
const ASTRYX_CATALOGS: Partial<Record<Locale, Record<string, string>>> = {
  'zh-cn': astryxZhCN,
  'zh-tw': astryxZhTW,
};

export function providerMessages(locale: Locale): Record<string, Record<string, string>> {
  return {[LANGUAGE_TAG[locale]]: {...ASTRYX_CATALOGS[locale], ...CATALOGS[locale]}};
}

/** Site catalog entries the navigation island renders. */
const NAV_KEYS = /^gz\.(nav|service|language|theme|search)\.|^gz\.site\.title$|^gz\.footer\.github$/;
/** Astryx catalog namespaces of the components inside the navigation island. */
const NAV_ASTRYX = /^@astryx\.(topNav|mobileNav|dropdownMenu|appShell|popover|dialog|layer|button|tooltip|textInput|input|field|commandPalette|kbd)\./;

/** The catalog subset that travels with each page for the hydrated navigation. */
export function navMessages(locale: Locale): Record<string, string> {
  const entries = [
    ...Object.entries(ASTRYX_CATALOGS[locale] ?? {}).filter(([key]) => NAV_ASTRYX.test(key)),
    ...Object.entries(CATALOGS[locale]).filter(([key]) => NAV_KEYS.test(key)),
  ];
  return Object.fromEntries(entries);
}
