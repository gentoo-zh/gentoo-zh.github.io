import {existsSync, readFileSync} from 'node:fs';
import {decodeEntities, fileFor, listFiles, refreshTarget, report} from './lib/html.mjs';
import {imageMetadata} from 'astro/assets/utils';
import {htmlElements, redirectAnchors} from './lib/html-elements.mjs';
import {ERROR_PAGES, FILES_REWRITES, NOINDEX_PAGES, SITEMAP_REDIRECTS} from './lib/url-manifest.mjs';

const DIST = 'dist';
const ORIGIN = 'https://gentoozh.org';
const failures = [];
const pages = new Map();
const redirects = new Map();
const fragmentRedirects = new Set();
const avatarFiles = new Set();
for (const file of listFiles(DIST).filter(file => file.endsWith('.html'))) {
  const path = file.replace(/index\.html$/, '');
  const html = readFileSync(fileFor(DIST, file), 'utf8');
  const target = refreshTarget(html);
  if (target) {
    redirects.set(path, decodeEntities(target));
    if (redirectAnchors(html)) fragmentRedirects.add(path);
    continue;
  }
  const elements = htmlElements(html);
  for (const image of elements.filter(e => e.name === 'img' && e.attrs.has('data-avatar-source'))) {
    const source = image.attrs.get('data-avatar-source');
    const width = Number(image.attrs.get('width'));
    const height = Number(image.attrs.get('height'));
    const normal = `${source}.${width}.webp`;
    const retina = `${source}.${width * 2}.webp`;
    if (image.attrs.get('src') !== normal || image.attrs.get('srcset') !== `${normal} 1x, ${retina} 2x`) failures.push(`${path}: incorrect avatar srcset for ${source}`);
    for (const [url, density] of [[normal, 1], [retina, 2]]) {
      if (avatarFiles.has(url)) continue;
      avatarFiles.add(url);
      const file = fileFor(DIST, decodeURIComponent(url));
      if (!existsSync(file)) { failures.push(`${path}: missing avatar derivative ${url}`); continue; }
      const metadata = await imageMetadata(readFileSync(file), file);
      if (metadata.format !== 'webp' || metadata.width !== width * density || metadata.height !== height * density) failures.push(`${url}: incorrect avatar format or dimensions`);
    }
  }
  const metas = key => elements.filter(e => e.name === 'meta' && (e.attrs.get('name') === key || e.attrs.get('property') === key));
  const meta = key => metas(key)[0]?.attrs.get('content');
  const links = rel => elements.filter(e => e.name === 'link' && e.attrs.get('rel') === rel);
  const titles = elements.filter(e => e.name === 'title');
  if (titles.length !== 1 || !titles[0].content.trim()) failures.push(`${path}: expected one nonempty title`);
  if (metas('description').length !== 1 || !meta('description')?.trim()) failures.push(`${path}: missing description`);
  if (elements.filter(e => e.name === 'h1').length !== 1) failures.push(`${path}: expected exactly one h1`);
  if (!/^\/(?:en\/|zh-tw\/)?$/.test(path)) {
    for (const image of elements.filter(e => e.name === 'img')) {
      if (!['width', 'height'].every(key => Number(image.attrs.get(key)) > 0)) failures.push(`${path}: missing image dimensions for ${image.attrs.get('src')}`);
    }
  }
  if (elements.filter(e => e.name === 'link' && e.attrs.get('rel') === 'preload' && e.attrs.get('as') === 'font').length < 2) failures.push(`${path}: missing main font preloads`);
  const error = ERROR_PAGES.includes(path);
  const noindex = meta('robots')?.split(/[,\s]+/).includes('noindex') ?? false;
  if (noindex && !error && !NOINDEX_PAGES.includes(path)) failures.push(`${path}: unexpected noindex`);
  const canonicals = links('canonical');
  if (error || noindex) {
    if (canonicals.length) failures.push(`${path}: canonical must be absent`);
    if (!noindex) failures.push(`${path}: missing noindex`);
  } else if (canonicals.length !== 1 || canonicals[0].attrs.get('href') !== new URL(path, ORIGIN).href) {
    failures.push(`${path}: missing or incorrect self canonical`);
  }
  for (const key of ['og:title', 'og:description', 'og:url', 'og:locale', 'og:type', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!meta(key)?.trim()) failures.push(`${path}: missing ${key}`);
  }
  if (meta('og:url') !== new URL(path, ORIGIN).href) failures.push(`${path}: incorrect og:url`);
  if (!['website', 'article'].includes(meta('og:type'))) failures.push(`${path}: invalid og:type`);
  if (meta('twitter:card') !== 'summary_large_image') failures.push(`${path}: missing large Twitter card`);
  if (meta('og:image:width') !== '1200' || meta('og:image:height') !== '630') failures.push(`${path}: share image must be 1200×630`);
  try {
    const image = new URL(meta('og:image'));
    if (image.origin !== ORIGIN || !existsSync(fileFor(DIST, image.pathname))) failures.push(`${path}: missing local share image`);
  } catch { failures.push(`${path}: invalid absolute og:image`); }
  const alternates = new Map(links('alternate').filter(e => e.attrs.has('hreflang')).map(e => [e.attrs.get('hreflang'), e.attrs.get('href')]));
  if (!error && (!alternates.size || !alternates.has('x-default'))) failures.push(`${path}: missing hreflang or x-default`);
  const lang = elements.find(e => e.name === 'html')?.attrs.get('lang');
  if (!error && alternates.get(lang) !== new URL(path, ORIGIN).href) failures.push(`${path}: missing self hreflang`);
  if (!links('alternate').some(e => e.attrs.get('type') === 'application/rss+xml' && existsSync(fileFor(DIST, new URL(e.attrs.get('href'), ORIGIN).pathname)))) failures.push(`${path}: missing RSS discovery`);
  const schemas = elements.filter(e => e.name === 'script' && e.attrs.get('type') === 'application/ld+json').flatMap(e => {
    try { const value = JSON.parse(e.content); return value['@graph'] ?? [value]; }
    catch { failures.push(`${path}: invalid JSON-LD`); return []; }
  });
  if (/^\/(?:en\/|zh-tw\/)?$/.test(path)) {
    for (const type of ['WebSite', 'Organization']) if (!schemas.some(s => s['@type'] === type)) failures.push(`${path}: missing ${type}`);
  } else if (!error && !noindex) {
    if (!schemas.some(s => s['@type'] === 'BreadcrumbList')) failures.push(`${path}: missing BreadcrumbList`);
  }
  if (/\/posts\/[^/]+\/$/.test(path)) {
    const article = schemas.find(s => s['@type'] === 'BlogPosting');
    if (!article?.author?.length || !article.image || !Number.isFinite(Date.parse(article.datePublished)) || !Number.isFinite(Date.parse(article.dateModified))) failures.push(`${path}: incomplete BlogPosting`);
  }
  pages.set(new URL(path, ORIGIN).href, {path, error, noindex, alternates, title: titles[0]?.content, description: meta('description')});
}
for (const [url, page] of pages) {
  for (const [lang, href] of page.alternates) {
    const target = pages.get(href);
    if (!target || target.error) failures.push(`${page.path}: hreflang ${lang} does not resolve`);
    else if (lang !== 'x-default' && ![...target.alternates.values()].includes(url)) failures.push(`${page.path}: hreflang ${lang} is not reciprocal`);
  }
}
const taxonomy = [...pages.values()].filter(p => /\/tags\//.test(p.path));
for (const page of taxonomy) {
  const prefix = /^\/(en|zh-tw)\//.exec(page.path)?.[1] ?? 'zh-cn';
  for (const field of ['title', 'description']) if (taxonomy.some(other => other !== page && (/^\/(en|zh-tw)\//.exec(other.path)?.[1] ?? 'zh-cn') === prefix && other[field] === page[field])) failures.push(`${page.path}: duplicate taxonomy ${field}`);
}
const cover = fileFor(DIST, '/img/og-cover.png');
if (existsSync(cover)) {
  const dimensions = await imageMetadata(readFileSync(cover), cover);
  if (dimensions.width !== 1200 || dimensions.height !== 630) failures.push('share image: intrinsic dimensions must be 1200×630');
}
const sitemapFile = fileFor(DIST, '/sitemap.xml');
if (!existsSync(sitemapFile)) failures.push('missing sitemap.xml');
else {
  const xml = readFileSync(sitemapFile, 'utf8');
  if (!xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) failures.push('sitemap: missing xhtml namespace');
  const found = new Set();
  for (const [, entry] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const url = decodeEntities(/<loc>(.*?)<\/loc>/.exec(entry)?.[1] ?? '');
    if (found.has(url)) failures.push(`sitemap: duplicate ${url}`);
    found.add(url);
    const page = pages.get(url);
    if (!page || page.error || page.noindex) { failures.push(`sitemap: non-indexable ${url}`); continue; }
    const alternates = htmlElements(entry).filter(e => e.name === 'xhtml:link');
    if (alternates.length !== page.alternates.size) failures.push(`sitemap: alternate count differs for ${url}`);
    for (const [lang, href] of page.alternates) if (!alternates.some(e => e.attrs.get('hreflang') === lang && e.attrs.get('href') === href && e.attrs.get('rel') === 'alternate')) failures.push(`sitemap: missing alternate ${lang} for ${url}`);
  }
  for (const [url, page] of pages) if (!page.error && !page.noindex && !found.has(url)) failures.push(`sitemap: missing ${url}`);
}
if (!readFileSync(fileFor(DIST, '/robots.txt'), 'utf8').split(/\r?\n/).includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) failures.push('robots.txt: incorrect Sitemap');
const redirectFile = fileFor(DIST, '/_redirects');
if (!existsSync(redirectFile)) failures.push('missing _redirects');
else {
  const rows = readFileSync(redirectFile, 'utf8').trim().split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
  // A non-ASCII source carries a second, percent-encoded row for production.
  const permanent = [...redirects, ...Object.entries(SITEMAP_REDIRECTS)].filter(([from]) => !fragmentRedirects.has(from));
  if (rows.length !== permanent.reduce((count, [from]) => count + (encodeURI(from) === from ? 1 : 2), 0) + Object.keys(FILES_REWRITES).length) failures.push('_redirects: count differs from permanent HTML fallbacks and /files/ rewrites');
  for (const [from, to] of Object.entries(FILES_REWRITES)) if (!rows.some(([source, target, status]) => source === from && target === to && status === '200')) failures.push(`_redirects: missing 200 ${from}`);
  for (const [from, target] of [...redirects, ...Object.entries(SITEMAP_REDIRECTS)]) {
    if (fragmentRedirects.has(from)) {
      if (rows.some(([source]) => source === from || source === encodeURI(from))) failures.push(`_redirects: fragment redirect must stay in HTML ${from}`);
    } else {
      for (const form of new Set([from, encodeURI(from)])) {
        if (!rows.some(([source, to, status]) => source === form && new URL(to, ORIGIN).href === new URL(target, ORIGIN).href && status === '301')) failures.push(`_redirects: missing 301 ${form}`);
      }
    }
  }
}
console.log(`check:seo: ${pages.size} pages, ${redirects.size} redirect fallbacks`);
report('check:seo', failures);
