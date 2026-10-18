/** Site-wide addresses. Visible wording lives in the i18n catalogs. */
export const SITE = {
  origin: 'https://gentoozh.org',
  github: 'https://github.com/gentoo-zh',
  issues: 'https://github.com/gentoo-zh/gentoo-zh.github.io/issues',
  license: 'https://creativecommons.org/licenses/by-sa/4.0/',
  email: 'zakk@gentoozh.org',
  wiki: {
    'zh-cn': 'https://wiki.gentoo.org/wiki/Gentoo-zh/zh-cn',
    'zh-tw': 'https://wiki.gentoo.org/wiki/Gentoo-zh/zh-tw',
    en: 'https://wiki.gentoo.org/wiki/Gentoo-zh',
  },
  logo: '/favicon.svg',
  shareImage: '/img/og-cover.png',
  /** The mask takes its color from --color-wordmark without client-side script. */
  wordmark: {mark: '/img/logo-mark.svg', mask: '/img/logo-wordmark-mask.svg'},
  distfiles: 'https://distfiles.gentoozh.org',
  /** The download site's plain-text root listing; it sends browsers back to /files/. */
  distfilesListing: 'curl https://distfiles.gentoozh.org/',
  forum: 'https://forum.gentoozh.org/',
  paste: 'https://paste.gentoozh.org/',
  telegramChannel: 'https://telegram.me/gentoocn',
  telegramChat: 'https://telegram.me/gentoo_zh',
  matrix: 'https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org',
  irc: 'https://web.libera.chat/#gentoo-zh',
  status: 'https://grafana.gentoozh.org/public-dashboards/d5754b79824d4d8dbd8c70e13e54c11e',
} as const;

export {LAYOUT} from './theme/layout.stylex';
