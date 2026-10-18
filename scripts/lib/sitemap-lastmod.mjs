// Sitemap <lastmod>: master is one squashed commit, so git cannot date a page. Each build hashes the
// rendered content of every sitemap page and compares it with the manifest the live site published
// on the previous deploy; an unchanged hash keeps its date, a new or changed one takes the build time.
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {htmlElements} from './html-elements.mjs';

export const MANIFEST = '/sitemap-lastmod.json';
const DEFAULT_BASE = `https://gentoozh.org${MANIFEST}`;
/** W3C Datetime in UTC to the second, the form this build writes. */
export const LASTMOD = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
export const HASH = /^[0-9a-f]{64}$/;

/**
 * Hash of what a reader sees: the main landmark (the app shell's `role="main"`, else `<body>`)
 * without scripts, styles, class and style attributes, comments, fingerprinted asset names or
 * island hydration attributes, so a rebuild of unchanged sources yields the same hash.
 */
export function contentHash(html) {
  const elements = htmlElements(html);
  const landmark = elements.find(e => e.name === 'main' || e.attrs.get('role') === 'main') ?? elements.find(e => e.name === 'body');
  const text = (landmark ? html.slice(landmark.start, landmark.end) : html)
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Astro bundle names: `<name>.<8-character hash>.<ext>`, fonts `fonts/<16 hex>.<ext>`.
    .replace(/\/_astro\/[^"'\s),]+/g, '/_astro/*')
    // Island attributes carry bundle URLs, render ids and serialized props; the SSR markup inside stays.
    .replace(/\s(?:class|style|uid|component-url|renderer-url|before-hydration-url|component-export|opts|props|ssr|client|nonce)="[^"]*"/g, '')
    .replace(/\s+/g, ' ');
  return createHash('sha256').update(text).digest('hex');
}

/** `{url: {hash, lastmod}}` from SITEMAP_LASTMOD_BASE (a URL or a file), else the live site; `{}` when absent or invalid. */
export async function previousManifest() {
  const base = process.env.SITEMAP_LASTMOD_BASE || DEFAULT_BASE;
  let manifest;
  try {
    if (/^https?:\/\//.test(base)) {
      const response = await fetch(base, {signal: AbortSignal.timeout(10_000)});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifest = await response.json();
    } else {
      if (!existsSync(base)) throw new Error('no such file');
      manifest = JSON.parse(readFileSync(base, 'utf8'));
    }
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('not an object');
  } catch (error) {
    console.warn(`build:seo: WARNING: no previous sitemap manifest at ${base} (${error.message}); every <lastmod> is this build's time`);
    return {};
  }
  return Object.fromEntries(Object.entries(manifest).filter(([, entry]) => HASH.test(entry?.hash) && LASTMOD.test(entry?.lastmod)));
}
