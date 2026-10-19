import {DEFAULT_LOCALE, LOCALES, type Locale} from '../i18n/localeCodes.ts';
import {LOCALE_COOKIE} from '../i18n/localeCookie.ts';
import {localePrefix} from '../i18n/routes.ts';

/** The static assets binding, reduced to the one call the Worker makes. */
export type Assets = {fetch(request: Request): Promise<Response>};

const VARY = 'Accept-Language, Cookie';

/** What the Worker does with one request before and after asking the assets. */
export type Plan = {
  /** The same page in the reader's locale, to send them to when it exists there. */
  redirect?: string;
  /** Whether the answer depends on Accept-Language and the cookie. */
  vary: boolean;
};

/** A browser opening a page, as opposed to a script, style, image or fetch. */
function isPageNavigation(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }
  const dest = request.headers.get('Sec-Fetch-Dest');
  return dest ? dest === 'document' : (request.headers.get('Accept') ?? '').includes('text/html');
}

/** The locale whose tree holds this path; zh-cn owns everything without a prefix. */
export function pathLocale(path: string): Locale {
  return LOCALES.find(locale => locale !== DEFAULT_LOCALE && `${path}/`.startsWith(`${localePrefix(locale)}/`)) ?? DEFAULT_LOCALE;
}

function isLocale(value: string | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? '');
}

function cookieLocale(header: string | null): Locale | undefined {
  const value = header
    ?.split(';')
    .map(pair => pair.trim().split('='))
    .find(([name]) => name === LOCALE_COOKIE)?.[1];
  return isLocale(value) ? value : undefined;
}

/** zh-TW, zh-HK, zh-MO and Traditional script read zh-tw; other Chinese reads zh-cn; the rest read en. */
function tagLocale(tag: string): Locale {
  const [language, ...subtags] = tag.toLowerCase().split('-');
  if (language !== 'zh') {
    return 'en';
  }
  if (subtags.includes('hant')) {
    return 'zh-tw';
  }
  if (subtags.includes('hans')) {
    return 'zh-cn';
  }
  return subtags.some(subtag => ['tw', 'hk', 'mo'].includes(subtag)) ? 'zh-tw' : 'zh-cn';
}

/** The locale of the reader's most wanted language, or undefined when they state none. */
export function negotiateLocale(header: string | null): Locale | undefined {
  const ranges = (header ?? '')
    .split(',')
    .map(range => {
      const [tag, ...params] = range.trim().split(';');
      const q = params.map(param => param.trim()).find(param => param.startsWith('q='));
      return {tag: tag.trim(), q: q ? Number(q.slice(2)) : 1};
    })
    .filter(({tag, q}) => tag && tag !== '*' && q > 0);
  // Array.prototype.sort is stable, so equal weights keep the reader's order.
  const best = ranges.sort((a, b) => b.q - a.q)[0];
  return best && tagLocale(best.tag);
}

/** Search engine crawlers index every locale's tree as it is, whatever language they send. */
const CRAWLER = /bot|crawl|spider|slurp/i;

/**
 * A zh-cn page sends the reader to the same page in the locale they last picked from a language
 * menu (the cookie, written by the page), or else in their browser's language. Pages under /zh-tw/
 * and /en/ are never redirected, so a shared link opens as shared; neither is a crawler, nor a
 * request with no cookie and no Accept-Language. The Worker only reads the cookie, never sets it.
 */
export function planRequest(request: Request): Plan {
  if (!isPageNavigation(request)) {
    return {vary: false};
  }
  const url = new URL(request.url);
  const locale = pathLocale(url.pathname);
  const vary = locale === DEFAULT_LOCALE;
  const wanted = cookieLocale(request.headers.get('Cookie')) ?? negotiateLocale(request.headers.get('Accept-Language'));
  if (locale !== DEFAULT_LOCALE || !wanted || wanted === locale || CRAWLER.test(request.headers.get('User-Agent') ?? '')) {
    return {vary};
  }
  return {vary, redirect: `${localePrefix(wanted)}${url.pathname}${url.search}`};
}

export async function handle(request: Request, assets: Assets): Promise<Response> {
  const plan = planRequest(request);
  if (plan.redirect) {
    const target = await assets.fetch(new Request(new URL(plan.redirect, request.url), {method: 'HEAD'}));
    if (target.status === 200) {
      return new Response(null, {
        status: 302,
        headers: {Location: plan.redirect, Vary: VARY, 'Cache-Control': 'private, no-store'},
      });
    }
  }
  const response = await assets.fetch(request);
  if (!plan.vary) {
    return response;
  }
  const answer = new Response(response.body, response);
  answer.headers.append('Vary', VARY);
  return answer;
}
