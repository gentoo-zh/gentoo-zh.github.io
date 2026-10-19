// Run with pnpm check:worker.
import assert from 'node:assert/strict';
import {LANGUAGE_TAG, LOCALES} from '../src/i18n/localeCodes.ts';
import {handle, negotiateLocale, pathLocale, planRequest} from '../src/worker/language.ts';

// The language menu writes `hreflang` lowercased as the cookie (src/ui/chrome/languageChoice.ts).
for (const locale of LOCALES) assert.equal(LANGUAGE_TAG[locale].toLowerCase(), locale);

const ORIGIN = 'https://gentoozh.org';
const PAGES = new Set(['/', '/x/', '/zh-tw/', '/zh-tw/x/', '/en/', '/en/x/', '/only-zh/']);

/** Static assets with a few pages; anything else is the 404 page. */
const assets = {
  async fetch(request) {
    const {pathname} = new URL(request.url);
    if (pathname.startsWith('/_astro/')) {
      return new Response('js', {headers: {'Content-Type': 'text/javascript'}});
    }
    const status = PAGES.has(pathname) ? 200 : 404;
    return new Response(request.method === 'HEAD' ? null : pathname, {status, headers: {'Content-Type': 'text/html; charset=utf-8'}});
  },
};

const page = (path, headers = {}) => new Request(`${ORIGIN}${path}`, {headers: {Accept: 'text/html', ...headers}});
const plan = (path, headers) => planRequest(page(path, headers));

assert.equal(negotiateLocale(null), undefined);
assert.equal(negotiateLocale(''), undefined);
assert.equal(negotiateLocale('*'), undefined);
assert.equal(negotiateLocale('zh-TW,zh;q=0.9'), 'zh-tw');
assert.equal(negotiateLocale('zh-HK'), 'zh-tw');
assert.equal(negotiateLocale('zh-Hant'), 'zh-tw');
assert.equal(negotiateLocale('zh-Hans-HK'), 'zh-cn');
assert.equal(negotiateLocale('zh'), 'zh-cn');
assert.equal(negotiateLocale('zh-SG'), 'zh-cn');
assert.equal(negotiateLocale('en-US,en;q=0.9'), 'en');
assert.equal(negotiateLocale('ja'), 'en');
assert.equal(negotiateLocale('en;q=0.5, zh-TW;q=0.8'), 'zh-tw', 'highest weight wins');
assert.equal(negotiateLocale('zh-CN;q=0, en'), 'en', 'q=0 excludes a language');

assert.equal(pathLocale('/'), 'zh-cn');
assert.equal(pathLocale('/zh-tw'), 'zh-tw');
assert.equal(pathLocale('/en/x/'), 'en');
assert.equal(pathLocale('/enroll/'), 'zh-cn');

// Without a cookie, the browser language picks the tree.
assert.deepEqual(plan('/x/'), {vary: true}, 'no Accept-Language never redirects');
assert.deepEqual(plan('/x/', {'Accept-Language': 'zh-TW'}), {vary: true, redirect: '/zh-tw/x/'});
assert.deepEqual(plan('/x/', {'Accept-Language': 'en-US,en;q=0.9'}), {vary: true, redirect: '/en/x/'});
assert.deepEqual(plan('/x/', {'Accept-Language': 'zh-CN'}), {vary: true});
assert.deepEqual(plan('/x/', {'Accept-Language': 'en-US', 'User-Agent': 'Mozilla/5.0 (compatible; bingbot/2.0)'}), {vary: true}, 'crawlers are never redirected');
assert.deepEqual(plan('/x/?a=1&b=2', {'Accept-Language': 'en'}), {vary: true, redirect: '/en/x/?a=1&b=2'}, 'query string kept');
assert.deepEqual(plan('/x/', {'Accept-Language': 'en', Referer: 'https://gentoozh.org/en/'}), {vary: true, redirect: '/en/x/'}, 'Referer plays no part');

// The language picked from the menu beats the header, and only a known locale counts.
assert.deepEqual(plan('/x/', {'Accept-Language': 'en', Cookie: 'a=b; gz-lang=zh-tw'}), {vary: true, redirect: '/zh-tw/x/'});
assert.deepEqual(plan('/x/', {'Accept-Language': 'en', Cookie: 'gz-lang=zh-cn'}), {vary: true}, 'zh-cn picked by an English browser stays');
assert.deepEqual(plan('/x/', {'Accept-Language': 'zh-CN', Cookie: 'gz-lang=en'}), {vary: true, redirect: '/en/x/'});
assert.deepEqual(plan('/x/', {Cookie: 'gz-lang=en'}), {vary: true, redirect: '/en/x/'}, 'the cookie needs no Accept-Language');
assert.deepEqual(plan('/x/', {Cookie: 'gz-lang=en', 'User-Agent': 'Googlebot/2.1'}), {vary: true}, 'crawlers are never redirected');
assert.deepEqual(plan('/x/', {'Accept-Language': 'en', Cookie: 'gz-lang=fr'}), {vary: true, redirect: '/en/x/'});

// Explicit /zh-tw/ and /en/ links open as shared.
assert.deepEqual(plan('/zh-tw/x/', {'Accept-Language': 'en'}), {vary: false});
assert.deepEqual(plan('/en/', {'Accept-Language': 'zh-TW', Cookie: 'gz-lang=zh-cn'}), {vary: false});

// Anything but a page navigation passes through.
assert.deepEqual(planRequest(new Request(`${ORIGIN}/x/`, {headers: {'Accept-Language': 'en'}})), {vary: false}, 'Accept without text/html');
assert.deepEqual(planRequest(new Request(`${ORIGIN}/x/`, {method: 'POST', headers: {Accept: 'text/html', 'Accept-Language': 'en'}})), {vary: false});
assert.deepEqual(plan('/x/', {'Sec-Fetch-Dest': 'iframe', 'Accept-Language': 'en'}), {vary: false});
assert.deepEqual(plan('/x/', {'Sec-Fetch-Dest': 'document', 'Accept-Language': 'en'}), {vary: true, redirect: '/en/x/'});

// The handler against the assets.
let response = await handle(page('/x/?q=1', {'Accept-Language': 'zh-TW'}), assets);
assert.equal(response.status, 302);
assert.equal(response.headers.get('Location'), '/zh-tw/x/?q=1');
assert.equal(response.headers.get('Vary'), 'Accept-Language, Cookie');
assert.equal(response.headers.get('Cache-Control'), 'private, no-store');

response = await handle(page('/only-zh/', {'Accept-Language': 'en'}), assets);
assert.equal(response.status, 200, 'a page missing in the wanted locale is served as is');
assert.equal(await response.text(), '/only-zh/');
assert.equal(response.headers.get('Vary'), 'Accept-Language, Cookie');

response = await handle(page('/'), assets);
assert.equal(response.status, 200);
assert.equal(response.headers.get('Vary'), 'Accept-Language, Cookie');

response = await handle(page('/zh-tw/', {'Accept-Language': 'en', Cookie: 'gz-lang=en'}), assets);
assert.equal(response.status, 200);
assert.equal(response.headers.get('Vary'), null);

const script = new Request(`${ORIGIN}/_astro/app.js`, {headers: {'Accept-Language': 'en'}});
response = await handle(script, assets);
assert.equal(await response.text(), 'js');
assert.equal(response.headers.get('Vary'), null);

// The Worker never sets the cookie; the language menu does.
for (const request of [page('/x/', {'Accept-Language': 'en'}), page('/'), page('/en/', {Cookie: 'gz-lang=zh-cn'}), page('/missing/')]) {
  assert.equal((await handle(request, assets)).headers.get('Set-Cookie'), null);
}

console.log('PASS worker language redirect');
