import {existsSync, readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {getCollection, getEntry, type CollectionEntry} from 'astro:content';
import type {Locale} from '../i18n/locales';
import {localePrefix} from '../i18n/routes';
import {groupContributors, type ContributorGroup} from './contributorOrder';
import {contributorLogins, contributorsRoot} from './contributorsLoader';

export {CONTRIBUTOR_GROUPS, contributorGroup, type ContributorGroup} from './contributorOrder';

export type Contributor = CollectionEntry<'contributors'>;

export const contributorRoutes = {
  list: (locale: Locale) => `${localePrefix(locale)}/contributors/`,
  page: (locale: Locale, slug: string) => `${localePrefix(locale)}/contributors/${slug}/`,
};

/** The list page's sections, in Hugo's order; see `groupContributors`. */
export async function getContributorGroups(locale: Locale): Promise<Array<{group: ContributorGroup; contributors: Contributor[]}>> {
  const entries = await getCollection('contributors', entry => entry.data.locale === locale);
  return groupContributors(entries);
}

/** Title, description and Markdown body of `content/<locale>/contributors/_index.md`. */
export async function getContributorsIndex(locale: Locale) {
  const index = await getEntry('contributorsIndex', `${locale}/contributors`);
  if (index == null) {
    throw new Error(`content/${locale}/contributors/_index.md is missing`);
  }
  return index;
}

/** Commits across all gentoo-zh repositories, printed on each card; `weight` is `10000 - total`. */
function commitCount(contributor: Contributor): number | undefined {
  const {weight, contributions} = contributor.data;
  return contributions?.total ?? (weight == null ? undefined : 10000 - weight);
}

/** `@handle` under the name on Hugo's cards, taken from the GitHub profile address; none once the account is gone. */
function githubHandle(contributor: Contributor): string | undefined {
  const {externalUrl} = contributor.data;
  return externalUrl == null ? undefined : /^https?:\/\/github\.com\/([^/]+)\/?$/.exec(externalUrl)?.[1];
}

/** Files in each bundle, served under the lower-cased page address as Hugo does. */
export function contributorFiles(locale: Locale): Array<{slug: string; file: string; path: string}> {
  return contributorLogins(locale).flatMap(login => {
    const dir = join(contributorsRoot(locale), login);
    return readdirSync(dir)
      .filter(file => file !== 'index.md')
      .map(file => ({slug: login.toLowerCase(), file, path: join(dir, file)}));
  });
}

const AVATAR_PREFERENCE = {
  feature: ['feature.webp'],
  card: ['avatar_card.webp', 'avatar_single.webp', 'feature.webp'],
  page: ['avatar_single.webp', 'avatar_card.webp', 'feature.webp'],
} as const;

/** Address of the avatar Hugo picks for the list card or the profile page; none means a placeholder. */
export function contributorAvatar(contributor: Contributor, use: keyof typeof AVATAR_PREFERENCE): string | undefined {
  const {locale, slug} = contributor.data;
  if (contributor.filePath == null) {
    throw new Error(`contributors entry ${contributor.id} has no file`);
  }
  const dir = dirname(contributor.filePath);
  const file = AVATAR_PREFERENCE[use].find(name => existsSync(join(dir, name)));
  return file == null ? undefined : `${contributorRoutes.page(locale, slug)}${file}`;
}

/** The same contributor in every locale that has the page. */
export async function contributorAlternates(slug: string): Promise<Partial<Record<Locale, string>>> {
  const entries = await getCollection('contributors', entry => entry.data.slug === slug);
  return Object.fromEntries(entries.map(entry => [entry.data.locale, contributorRoutes.page(entry.data.locale, slug)]));
}

/** What a list card and a profile header show. */
export function contributorCard(contributor: Contributor, use: 'card' | 'page') {
  const {locale, slug, title, contributions} = contributor.data;
  return {
    slug,
    name: title,
    href: contributorRoutes.page(locale, slug),
    avatar: contributorAvatar(contributor, use),
    handle: githubHandle(contributor),
    commits: commitCount(contributor),
    repos: contributions?.repos ?? [],
  };
}

/** The update script's body line "N commits" says what the profile already shows; anything else is hand-written. */
export function contributorBio(contributor: Contributor): string | undefined {
  const body = (contributor.body ?? '').trim();
  return body === '' || /^\d+\s*(?:commits?|次提交)$/.test(body) ? undefined : body;
}

/** Everyone with commits, most first, for the home page's ContributorsStack; `total` counts all pages. */
export async function topContributors(locale: Locale, limit = 12) {
  const entries = await getCollection('contributors', entry => entry.data.locale === locale);
  const ranked = entries.filter(entry => commitCount(entry) != null).sort((a, b) => (commitCount(b) ?? 0) - (commitCount(a) ?? 0));
  return {people: ranked.slice(0, limit).map(entry => contributorCard(entry, 'card')), total: entries.length, href: contributorRoutes.list(locale)};
}
