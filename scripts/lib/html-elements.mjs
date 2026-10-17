import {decodeEntities} from './html.mjs';

const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAW = new Set(['script', 'style', 'textarea', 'title']);

/** Read HTML tags and attributes, skipping comments and raw text, with HTML's case rules. */
export function htmlElements(html) {
  const tags = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  const elements = [];
  const stack = [];
  for (let match; (match = tags.exec(html));) {
    if (!match[1]) continue;
    const name = match[1].toLowerCase();
    if (match[0].startsWith('</')) {
      const index = stack.findLastIndex(element => element.name === name);
      if (index !== -1) {
        stack[index].end = tags.lastIndex;
        stack.length = index;
      }
      continue;
    }
    const attrs = new Map();
    const source = match[0].slice(match[1].length + 1, -1);
    for (const [, key, double, single, bare] of source.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const lower = key.toLowerCase();
      if (!attrs.has(lower)) attrs.set(lower, decodeEntities(double ?? single ?? bare ?? ''));
    }
    const element = {name, attrs, start: match.index, end: tags.lastIndex, content: '', parent: stack.at(-1) ?? null};
    elements.push(element);
    if (RAW.has(name)) {
      const close = new RegExp(`</${name}\\s*>`, 'gi');
      close.lastIndex = tags.lastIndex;
      const end = close.exec(html);
      element.content = html.slice(tags.lastIndex, end?.index ?? html.length);
      element.end = end ? close.lastIndex : html.length;
      tags.lastIndex = element.end;
    } else if (!VOID.has(name)) stack.push(element);
  }
  return elements;
}

/** The fragment map that requires a redirect to run in the browser instead of an HTTP 301. */
export function redirectAnchors(html) {
  if (!html.includes('data-redirect-anchors=')) return undefined;
  const data = htmlElements(html).find(e => e.name === 'script' && e.attrs.has('data-redirect-anchors'))?.attrs.get('data-redirect-anchors');
  return data == null ? undefined : JSON.parse(data);
}
