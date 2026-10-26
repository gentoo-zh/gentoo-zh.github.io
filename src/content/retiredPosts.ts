import type {Locale} from '../i18n/localeCodes';

/**
 * Posts removed after Hugo published them, per locale: old slug to the path that replaces it.
 * Each old address stays as a permanent redirect. No runtime imports, so the URL checks can read it.
 */
export const RETIRED_POSTS: Record<Locale, Record<string, string>> = {
  'zh-cn': {'2026-06-18-gentoo-linux-with-zfs': '/posts/'},
  'zh-tw': {'2026-06-18-gentoo-linux-with-zfs': '/zh-tw/posts/'},
  en: {},
};
