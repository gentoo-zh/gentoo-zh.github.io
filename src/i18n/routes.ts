import {DEFAULT_LOCALE, LOCALES, type Locale} from './localeCodes.ts';

/** The one place that knows how a locale maps to a URL prefix: zh-cn sits at the root. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/** Hugo's `urlize` for the tags this site uses: lower case, spaces become hyphens. */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export const routes = {
  home: (locale: Locale) => `${localePrefix(locale)}/`,
  posts: (locale: Locale) => `${localePrefix(locale)}/posts/`,
  post: (locale: Locale, slug: string) => `${localePrefix(locale)}/posts/${slug}/`,
  tags: (locale: Locale) => `${localePrefix(locale)}/tags/`,
  tag: (locale: Locale, tag: string) => `${localePrefix(locale)}/tags/${tagSlug(tag)}/`,
  feed: (locale: Locale) => `${localePrefix(locale)}/feed.xml`,
  /** A single page such as `about` or `faq`, at the same path as on the Hugo site. */
  page: (locale: Locale, slug: string) => `${localePrefix(locale)}/${slug}/`,
};

/**
 * One page of a post read in pages (front matter `paged`): 0 is the overview at the post's own address, a
 * section number its page. Kept out of `routes`, which the navigation bundle carries whole, so only pages
 * that link them ship it.
 */
export function chapterRoute(locale: Locale, slug: string, page: number): string {
  return page === 0 ? routes.post(locale, slug) : `${routes.post(locale, slug)}${page}/`;
}

/** Value of the `[...locale]` rest parameter: undefined renders at the root. */
export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function localePaths() {
  return LOCALES.map(locale => ({params: {locale: localeParam(locale)}, props: {locale}}));
}

/**
 * Root-relative page links in Markdown point at the zh-cn tree. Like Hugo's link render
 * hook, they resolve to the same page in the reader's locale when that page exists there;
 * otherwise, and for files, the link stays as written.
 */
export function localizeHref(locale: Locale, href: string, exists: (path: string) => boolean): string {
  if (!href.startsWith('/') || href.startsWith('//')) {
    return href;
  }
  const path = href.split(/[?#]/, 1)[0];
  // A link already written for another locale's tree keeps its prefix.
  if (LOCALES.some(other => other !== DEFAULT_LOCALE && `${path}/`.startsWith(`${localePrefix(other)}/`))) {
    return href;
  }
  const suffix = href.slice(path.length);
  const lastSegment = path.slice(path.lastIndexOf('/') + 1);
  const localized = `${localePrefix(locale)}${path.endsWith('/') ? path : `${path}/`}`;
  return lastSegment.includes('.') || !exists(localized) ? href : `${localized}${suffix}`;
}
