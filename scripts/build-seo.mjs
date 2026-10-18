import {existsSync, readFileSync, renameSync, rmdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {decodeEntities, fileFor, listFiles, refreshTarget} from './lib/html.mjs';
import {imageMetadata} from 'astro/assets/utils';
import {ERROR_PAGES, FILES_REWRITES, SITEMAP_REDIRECTS} from './lib/url-manifest.mjs';
import {buildImageVariants} from './lib/image-variants.mjs';
import {buildAvatarThumbnails} from './lib/avatar-thumbnails.mjs';
import {htmlElements, redirectAnchors} from './lib/html-elements.mjs';
import {MANIFEST, contentHash, previousManifest} from './lib/sitemap-lastmod.mjs';

const DIST = 'dist';
const ORIGIN = 'https://gentoozh.org';
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const dimensions = new Map();
async function imageDimensions(file) {
  if (!dimensions.has(file)) dimensions.set(file, imageMetadata(readFileSync(file), file));
  return dimensions.get(file);
}
// The locale route emits directories; Workers needs each error file beside its locale index.
for (const path of ERROR_PAGES) {
  const source = fileFor(DIST, path.replace(/\.html$/, '/'));
  if (existsSync(source)) {
    renameSync(source, fileFor(DIST, path));
    rmdirSync(dirname(source));
  }
}
const urls = [];
const previous = await previousManifest();
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const manifest = {};
// Production matches the percent-encoded request path, wrangler dev the decoded one; emit both forms.
const redirectRules = (from, to) => [...new Set([from, encodeURI(from)])].map(source => `${source} ${to} 301`);
const redirects = Object.entries(SITEMAP_REDIRECTS).flatMap(([from, to]) => redirectRules(from, to));
for (const file of listFiles(DIST).filter(file => file.endsWith('.html')).sort()) {
  const original = readFileSync(fileFor(DIST, file), 'utf8');
  const path = file.replace(/index\.html$/, '');
  const html = await buildImageVariants(original, DIST, path);
  await buildAvatarThumbnails(html, DIST);
  if (html !== original) writeFileSync(fileFor(DIST, file), html);
  const target = refreshTarget(html);
  if (target) {
    if (!redirectAnchors(html)) {
      const destination = new URL(decodeEntities(target), ORIGIN);
      redirects.push(...redirectRules(path, destination.origin === ORIGIN ? destination.pathname + destination.search + destination.hash : destination.href));
    }
    continue;
  }
  const elements = htmlElements(html);
  let page = html;
  if (!/^\/(?:en\/|zh-tw\/)?$/.test(path)) {
    let output = html;
    for (const element of elements.filter(e => e.name === 'img').reverse()) {
      if (element.attrs.has('width') && element.attrs.has('height')) continue;
      const source = new URL(element.attrs.get('src'), `${ORIGIN}${path}`);
      // Raster images take their size from the component or from data-image-widths; check:seo reports the rest.
      if (source.origin !== ORIGIN || !source.pathname.endsWith('.svg')) continue;
      const file = fileFor(DIST, source.pathname);
      if (!existsSync(file)) throw new Error(`${path}: missing image ${source.pathname}`);
      const size = await imageDimensions(file);
      const width = Number(element.attrs.get('width')) || (Number(element.attrs.get('height')) ? Number(element.attrs.get('height')) * size.width / size.height : size.width);
      const height = Number(element.attrs.get('height')) || width * size.height / size.width;
      const attributes = `${element.attrs.has('width') ? '' : ` width="${width}"`}${element.attrs.has('height') ? '' : ` height="${height}"`}`;
      output = output.slice(0, element.start) + output.slice(element.start, element.end).replace(/\s*\/?>(?=$)/, `${attributes}>`) + output.slice(element.end);
    }
    if (output !== html) writeFileSync(fileFor(DIST, file), output);
    page = output;
  }
  if (elements.some(e => e.name === 'meta' && e.attrs.get('name') === 'robots' && e.attrs.get('content')?.split(/[,\s]+/).includes('noindex'))) continue;
  const canonical = elements.find(e => e.name === 'link' && e.attrs.get('rel') === 'canonical')?.attrs.get('href');
  if (!canonical) throw new Error(`${path}: cannot generate sitemap without canonical`);
  const alternates = elements.filter(e => e.name === 'link' && e.attrs.get('rel') === 'alternate' && e.attrs.has('hreflang'));
  const hash = contentHash(page);
  manifest[canonical] = {hash, lastmod: previous[canonical]?.hash === hash ? previous[canonical].lastmod : now};
  urls.push(`  <url><loc>${xml(canonical)}</loc><lastmod>${manifest[canonical].lastmod}</lastmod>${alternates.map(e => `<xhtml:link rel="alternate" hreflang="${xml(e.attrs.get('hreflang'))}" href="${xml(e.attrs.get('href'))}"/>`).join('')}</url>`);
}
writeFileSync(`${DIST}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
writeFileSync(`${DIST}${MANIFEST}`, `${JSON.stringify(manifest, null, 1)}\n`);
// Rewrites are dynamic rules, so they follow every static redirect.
const rewrites = Object.entries(FILES_REWRITES).map(([from, to]) => `${from} ${to} 200`);
writeFileSync(`${DIST}/_redirects`, `${[...redirects, ...rewrites].join('\n')}\n`);
const changed = Object.values(manifest).filter(entry => entry.lastmod === now).length;
console.log(`build:seo: ${urls.length} sitemap URLs (${changed} new or changed), ${redirects.length} permanent redirects`);
