import {getEntry, type CollectionEntry} from 'astro:content';
import {LOCALES, type Locale} from '../i18n/locales';
import {localeParam, routes} from '../i18n/routes';
import {guideSchema, type GuideData, type GuideSlug} from './guides';

export type Page = CollectionEntry<'pages'>;

/** A single page in one locale, or undefined when that locale has no translation. */
export async function getPage(locale: Locale, slug: string): Promise<Page | undefined> {
  return getEntry('pages', `${locale}/${slug}`);
}

/** The same page in every locale that has it; the home page is the slug ''. */
export async function pageAlternates(slug: string): Promise<Partial<Record<Locale, string>>> {
  const entries = await Promise.all(LOCALES.map(async locale => [locale, await getPage(locale, slug)] as const));
  return Object.fromEntries(
    entries.filter(([, page]) => page != null).map(([locale]) => [locale, slug === '' ? routes.home(locale) : routes.page(locale, slug)]),
  );
}

/**
 * `getStaticPaths` for a page route under `src/pages/[...locale]/<slug>/index.astro`: one path
 * per locale that has `content/<locale>/<slug>/_index.md`, with the entry and its alternates.
 */
export async function pagePaths(slug: string) {
  const alternates = await pageAlternates(slug);
  const perLocale = await Promise.all(LOCALES.map(async locale => ({locale, page: await getPage(locale, slug)})));
  return perLocale
    .filter((entry): entry is {locale: Locale; page: Page} => entry.page != null)
    .map(({locale, page}) => ({params: {locale: localeParam(locale)}, props: {locale, page, alternates}}));
}

export interface PageRouteProps {
  locale: Locale;
  page: Page;
  alternates: Partial<Record<Locale, string>>;
}

export interface GuideRouteProps<Slug extends GuideSlug = GuideSlug> extends Omit<PageRouteProps, 'page'> {
  page: Omit<Page, 'data'> & {data: Extract<GuideData, {slug: Slug}>};
}

export async function guidePaths(slug: GuideSlug) {
  return (await pagePaths(slug)).map(path => ({
    ...path,
    props: {...path.props, page: {...path.props.page, data: guideSchema.parse(path.props.page.data)}},
  }));
}
