import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative, sep} from 'node:path';

/** Every file under `root`, as URL paths (`/posts/x/index.html`). */
export function listFiles(root) {
  const out = [];
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else out.push(`/${relative(root, path).split(sep).join('/')}`);
    }
  };
  walk(root);
  return out;
}

/** The file a URL path is served from inside a static output directory. */
export function fileFor(root, url) {
  const path = decodeURIComponent(url);
  return join(root, path.endsWith('/') ? `${path}index.html` : path);
}

export function readPage(root, url) {
  const file = fileFor(root, url);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

export const ids = html => [...html.matchAll(/\sid="([^"]+)"/g)].map(match => decodeEntities(match[1]));

export const refreshTarget = html => /http-equiv="refresh" content="0; ?url=([^"]+)"/.exec(html)?.[1];

export function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Channel fields and items of an RSS 2.0 document, enough to compare two feeds. A missing or
 * unreadable pubDate is `null` for the caller to report. `bodies` holds each item's decoded
 * description, in item order.
 */
export function parseFeed(xml) {
  const tag = (source, name) => {
    const match = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(source);
    return match == null ? undefined : decodeEntities(match[1].trim());
  };
  const isoDate = text => {
    const time = Date.parse(text ?? '');
    return Number.isNaN(time) ? null : new Date(time).toISOString();
  };
  const channel = xml.slice(0, xml.indexOf('<item>') === -1 ? undefined : xml.indexOf('<item>'));
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => item);
  return {
    link: tag(channel, 'link'),
    language: tag(channel, 'language'),
    self: /<atom:link href="([^"]+)"/.exec(channel)?.[1],
    items: items.map(item => ({
      title: tag(item, 'title'),
      link: tag(item, 'link'),
      guid: tag(item, 'guid'),
      pubDate: isoDate(tag(item, 'pubDate')),
    })),
    bodies: items.map(item => tag(item, 'description') ?? ''),
  };
}

/** Reports failures and exits non-zero when there are any. */
export function report(gate, failures) {
  if (failures.length === 0) {
    console.log(`${gate}: ok`);
    return;
  }
  for (const failure of failures) console.error(`${gate}: ${failure}`);
  console.error(`${gate}: ${failures.length} failure(s)`);
  process.exit(1);
}
