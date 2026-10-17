// Check catalog coverage, ICU formatting and locale-specific strings in built pages.
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {InternationalizationProvider, useTranslator} from '@astryxdesign/core/i18n';
import {listFiles, readPage, refreshTarget, report} from './lib/html.mjs';
import {EXTRA_REDIRECTS} from './lib/url-manifest.mjs';

const LOCALES = {'zh-cn': {tag: 'zh-CN', prefix: ''}, 'zh-tw': {tag: 'zh-TW', prefix: '/zh-tw'}, en: {tag: 'en', prefix: '/en'}};
const SAMPLE = {site: 'S', page: 'P', tag: 'Gentoo', count: 2, days: 5000, date: '2026-10-16', ms: 120, time: '02:40', pct: 99.9, cny: '1', twd: '2', hkd: '3', approx: 'true', amount: '1', currency: 'USD', period: 'monthly', start: 'A', end: 'B', region: 'us', host: 'H', query: 'Q', name: 'N', repo: 'R', git: 'TUNA', rsync: 'TUNA'};
const failures = [];
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const catalogs = Object.fromEntries(Object.keys(LOCALES).map(locale => [locale, json(`src/i18n/${locale}.json`)]));

const reference = Object.keys(catalogs['zh-cn']).sort().join('\n');
for (const [locale, catalog] of Object.entries(catalogs)) {
  if (Object.keys(catalog).sort().join('\n') !== reference) failures.push(`${locale}.json: key set differs from zh-cn.json`);
}

const keys = Object.keys(catalogs['zh-cn']);
const used = new Set();
for (const path of listFiles('src').map(url => `src${url}`).filter(path => /\.(tsx?|astro)$/.test(path))) {
  const source = readFileSync(path, 'utf8');
  for (const [, key] of source.matchAll(/(?:t\(|\[)\s*'(gz\.[\w.-]+)'/g)) {
    if (!keys.includes(key)) failures.push(`${path}: unknown message "${key}"`);
    used.add(key);
  }
  for (const [, prefix] of source.matchAll(/t\(\s*`(gz\.[\w.-]+)\$\{/g)) {
    const matches = keys.filter(key => key.startsWith(prefix));
    if (matches.length === 0) failures.push(`${path}: no messages start with "${prefix}"`);
    matches.forEach(key => used.add(key));
  }
}
for (const key of keys.filter(key => !used.has(key))) failures.push(`unused message "${key}"`);

function Probe({keys: probeKeys, values}) {
  const t = useTranslator();
  return probeKeys.map(key => `${key}=${t(key, values)}\n`).join('');
}
for (const [locale, {tag}] of Object.entries(LOCALES)) {
  for (const count of [1, 2]) {
    const html = renderToStaticMarkup(
      createElement(
        InternationalizationProvider,
        {locale: tag, messages: {[tag]: catalogs[locale]}},
        createElement(Probe, {keys, values: {...SAMPLE, count}}),
      ),
    );
    for (const line of html.split('\n').filter(Boolean)) {
      const [key, ...rest] = line.split('=');
      const text = rest.join('=');
      if (text === key || /[{}]/.test(text)) failures.push(`${locale} "${key}" does not format: ${text}`);
    }
  }
}

// Every built page, of every type, must carry its locale's <html lang> and Astryx strings.
const PAGE_TYPES = {
  home: /^\/$/,
  list: /^\/posts\/$/,
  post: /^\/posts\/[^/]+\/$/,
  tags: /^\/tags\/$/,
  tag: /^\/tags\/[^/]+\/$/,
  section: /^\/(docs|download|community|support|about)\/$/,
  contributor: /^\/contributors\/[^/]+\/$/,
  page: /^\/[^/]+\/$/,
};
// Single-page coverage is optional per locale.
const OPTIONAL_TYPES = new Set(['page']);
// Contributor role tags redirect to groups in the library; only baseline tag routes qualify.
const contributorTags = json('scripts/baseline/p3-contributors.json').pages.filter(page => /^(\/zh-tw|\/en)?\/tags\//.test(page));
const REDIRECTS = new Set([...Object.keys(json('scripts/baseline/hugo.json').allRedirects), ...EXTRA_REDIRECTS, ...contributorTags]);
const pages = listFiles('dist').filter(url => url.endsWith('/index.html')).map(url => url.slice(0, -'index.html'.length));
if (pages.length === 0) failures.push('dist has no pages; run pnpm build first');
for (const [locale, {tag, prefix}] of Object.entries(LOCALES)) {
  // One catalog string of the chrome: a zh-tw page carrying Simplified navigation fails here.
  const navText = catalogs[locale]['gz.nav.docs'];
  const astryx = json(`node_modules/@astryxdesign/core/locales/${tag}.json`)['@astryx.appShell.skipToContent'].defaultMessage;
  const errorPath = `${prefix}/404.html`;
  const error = readPage('dist', errorPath) ?? '';
  for (const text of [navText, astryx, catalogs[locale]['gz.notFound.title'], catalogs[locale]['gz.notFound.description'], catalogs[locale]['gz.notFound.home'], catalogs[locale]['gz.notFound.posts']]) {
    if (!error.includes(text)) failures.push(`${errorPath}: missing localized text ${text}`);
  }
  if (!error.includes(`<html lang="${tag}"`)) failures.push(`${errorPath}: incorrect document language`);
  if (!error.includes(`data-not-found="${locale}"`) || error.includes('data-owner="src/ui/NotFoundScript.astro"')) failures.push(`${errorPath}: recovery must render in its locale without a script`);
  const inLocale = page => (prefix === '' ? !/^\/(zh-tw|en)\//.test(page) : page.startsWith(`${prefix}/`));
  const seen = new Set();
  for (const page of pages.filter(inLocale)) {
    const html = readPage('dist', page);
    if (refreshTarget(html) != null) {
      if (!REDIRECTS.has(page)) failures.push(`${page}: refresh page that is not a known redirect`);
      continue;
    }
    const type = Object.keys(PAGE_TYPES).find(name => PAGE_TYPES[name].test(page.slice(prefix.length)));
    if (type == null) {
      failures.push(`${page}: page of no known type; add it to PAGE_TYPES`);
      continue;
    }
    seen.add(type);
    for (const [, key] of html.matchAll(/>\s*(gz\.[\w.-]+)\s*</g)) failures.push(`${page}: untranslated message ${key}`);
    if (!html.includes(`<html lang="${tag}"`)) failures.push(`${page}: <html lang> is not ${tag}`);
    if (!html.includes(`>${astryx}</a>`)) failures.push(`${page}: Astryx strings are not in ${tag} (no InternationalizationProvider?)`);
    if (!html.includes(`>${navText}<`)) failures.push(`${page}: navigation text "${navText}" of ${locale} is missing`);
  }
  for (const type of Object.keys(PAGE_TYPES).filter(type => !seen.has(type) && !OPTIONAL_TYPES.has(type))) failures.push(`${locale}: no ${type} page in dist`);
}

report('check:i18n', failures);
