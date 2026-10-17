import type {SearchSource} from '@astryxdesign/core/Typeahead';
import type {Locale, MessageKey} from '../../i18n/locales';
import {LOCALES, DEFAULT_LOCALE} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {SECTIONS, entryLink, sectionHref} from '../chrome/sections';

const GROUPS = ['docs', 'download', 'community', 'support', 'about', 'posts', 'contributors'] as const;
const PER_GROUP = 3;
const CANDIDATES = 60;
type Group = typeof GROUPS[number];
export interface ExcerptPart {text: string; match: boolean}
export interface SearchItem {
  id: string;
  label: string;
  auxiliaryData: {group: string; excerpt: ExcerptPart[]};
}
export interface SearchEntry {url: string; title: string; excerpt: string}
interface PagefindHit extends SearchEntry {
  meta: {title?: string};
  sub_results?: Array<{url: string; title: string; excerpt: string}>;
}
interface Pagefind {
  init(): Promise<void>;
  search(query: string): Promise<{results: Array<{data(): Promise<PagefindHit>}>}>;
}
let pagefind: Promise<Pagefind> | undefined;
function loadPagefind(): Promise<Pagefind> {
  // Pagefind is generated after Astro builds; it remains outside the initial import graph.
  // @ts-expect-error -- no type declarations for a rooted runtime URL
  pagefind ??= import(/* @vite-ignore */ '/pagefind/pagefind.js').then(async (api: Pagefind) => {
    await api.init();
    return api;
  }).catch(error => {
    pagefind = undefined;
    throw error;
  });
  return pagefind;
}

/** Resolve only local pages in the active language, including the unprefixed default locale. */
export function localPath(url: string, locale: Locale): string | undefined {
  const parsed = new URL(url, window.location.origin);
  if (parsed.origin !== window.location.origin) return;
  const language = LOCALES.find(candidate => candidate !== DEFAULT_LOCALE && parsed.pathname.startsWith(routes.home(candidate))) ?? DEFAULT_LOCALE;
  return language === locale ? parsed.pathname : undefined;
}

function groupFor(path: string, locale: Locale): Group | undefined {
  if (path.startsWith(routes.posts(locale))) return 'posts';
  if (path.startsWith(routes.page(locale, 'contributors'))) return 'contributors';
  return SECTIONS.find(section => path === sectionHref(locale, section) || section.pages.some(entry =>
    entry.kind !== 'external' && path === entryLink(locale, entry).href,
  ))?.id;
}

/** Keep prose and Pagefind match terms, never executable markup or command output. */
export function cleanExcerpt(html: string): ExcerptPart[] {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const terms = [...body.querySelectorAll('mark')].map(mark => mark.textContent ?? '').filter(Boolean);
  const text = (body.textContent ?? '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b[\da-f]{16,}\b/gi, '')
    .replace(/(?:^|\s)(?:\S+@\S+\s*)?[$#]\s+.*?(?=\.\s+[A-Z\u3400-\u9fff]|[\u3400-\u9fff。！？]|$)/g, ' ')
    .replace(/\b(?:bash|sh)\.\s*/g, '')
    .replace(/(?:^|\s)\.(?=\s|$)/g, '')
    .replace(/\b[\w./-]+\.(?:sh|bash)\b/g, '')
    .replace(/\s+/g, ' ').trim();
  const firstMatch = terms.map(term => text.toLowerCase().indexOf(term.toLowerCase())).filter(index => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, firstMatch - 45);
  const excerpt = `${start > 0 ? '…' : ''}${text.slice(start, start + 140)}${text.length > start + 140 ? '…' : ''}`;
  if (!terms.length) return [{text: excerpt, match: false}];
  const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return excerpt.split(pattern).filter(Boolean).map(part => ({text: part, match: terms.some(term => term.toLowerCase() === part.toLowerCase())}));
}

export function createPagefindSource(locale: Locale, t: (key: MessageKey) => string, onFailure: (failed: boolean) => void): SearchSource<SearchItem> {
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let settle: ((items: SearchItem[]) => void) | undefined;
  let controller: AbortController | undefined;
  let bootstrap: SearchEntry[] | undefined;

  const itemsFor = (entries: SearchEntry[]) => GROUPS.flatMap(group => entries
    .filter(entry => {
      const path = localPath(entry.url, locale);
      return path != null && groupFor(path, locale) === group;
    })
    .slice(0, PER_GROUP)
    .map(entry => ({id: entry.url, label: entry.title, auxiliaryData: {group: t(`gz.nav.${group}`), excerpt: cleanExcerpt(entry.excerpt)}})));

  const cancel = () => {
    generation++;
    clearTimeout(timer);
    settle?.([]);
    settle = undefined;
    controller?.abort();
  };
  const run = async (query: string, version: number): Promise<SearchItem[]> => {
    try {
      onFailure(false);
      if (!query) {
        if (!bootstrap) {
          controller = new AbortController();
          const response = await fetch(`${routes.home(locale)}search.json`, {signal: controller.signal});
          if (!response.ok) throw new Error('Search bootstrap unavailable');
          const entries: SearchEntry[] = await response.json();
          if (version !== generation) return [];
          bootstrap = entries;
        }
        return itemsFor(bootstrap);
      }
      const api = await loadPagefind();
      if (version !== generation) return [];
      const search = await api.search(query);
      if (version !== generation) return [];
      const hits = await Promise.all(search.results.slice(0, CANDIDATES).map(result => result.data()));
      if (version !== generation) return [];
      return itemsFor(hits.map(hit => {
        const section = hit.sub_results?.find(part => part.url.includes('#') && part.excerpt.includes('<mark>'));
        const excerpt = section?.excerpt || hit.excerpt;
        // A heading is more useful than a matching command or configuration fragment.
        const code = /(?:[$#]\s|\b(?:bash|sh)\s*\.|\s=\s|https?:\/\/|\b[\da-f]{16,}\b)/i.test(excerpt.replace(/<\/?mark>/g, ''));
        return {url: section?.url ?? hit.url, title: hit.meta.title ?? hit.url, excerpt: section && code && (/\s=\s/.test(excerpt) || !cleanExcerpt(excerpt).some(part => part.match)) ? section.title.replace(/\s*#$/, '') : excerpt};
      }));
    } catch {
      if (version === generation) onFailure(true);
      return [];
    }
  };
  return {
    cancel,
    bootstrap: () => run('', generation),
    search: query => new Promise(resolve => {
      settle = resolve;
      const version = generation;
      timer = setTimeout(() => {
        void run(query.trim(), version).then(items => {
          if (version === generation) settle = undefined;
          resolve(items);
        });
      }, 180);
    }),
  };
}
