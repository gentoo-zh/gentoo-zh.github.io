import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {CONTENT_ROOT, markdownLoader} from './loader';

/** Directory of a locale's contributor bundles, named by GitHub login (`content/<locale>/contributors/<Login>/`). */
export const contributorsRoot = (locale: string) => join(CONTENT_ROOT, locale, 'contributors');

/** GitHub logins as written on disk; Hugo lower-cases them in URLs, and so do the entry slugs. */
export function contributorLogins(locale: string): string[] {
  return readdirSync(contributorsRoot(locale), {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export const contributorsLoader = markdownLoader('contributors', locale =>
  contributorLogins(locale).map(login => [login.toLowerCase(), join(contributorsRoot(locale), login, 'index.md')]),
);

export const contributorsIndexLoader = markdownLoader('contributorsIndex', locale => [
  ['contributors', join(contributorsRoot(locale), '_index.md')],
]);
