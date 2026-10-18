import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import sharpService from 'astro/assets/services/sharp';
import {fileFor} from './html.mjs';
import {htmlElements} from './html-elements.mjs';

const covers = new Map();

// Bundle attachments are emitted routes, not ESM images; transform their built bytes with Astro's service.
// `inside` keeps the whole image; the page letterboxes it with object-fit: contain.
export async function buildCoverThumbnails(html, dist) {
  for (const image of htmlElements(html).filter(e => e.name === 'img' && e.attrs.has('data-blog-cover')).reverse()) {
    const source = image.attrs.get('data-blog-cover');
    const url = new URL(source, 'https://gentoozh.org');
    if (url.origin !== 'https://gentoozh.org') continue;
    // Vector covers scale without a raster thumbnail.
    if (url.pathname.endsWith('.svg')) continue;
    const width = Number(image.attrs.get('width'));
    const height = Number(image.attrs.get('height'));
    const key = `${url.pathname}:${width}:${height}`;
    if (!covers.has(key)) {
      const input = readFileSync(fileFor(dist, decodeURIComponent(url.pathname)));
      const variants = [];
      for (const density of [1, 2]) {
        const {data} = await sharpService.transform(input, {src: source, width: width * density, height: height * density, fit: 'inside', format: 'webp', quality: 'high'}, {service: {config: {}}});
        const hash = createHash('sha256').update(data).digest('hex').slice(0, 8);
        const path = `/_astro/blog-cover-${width * density}.${hash}.webp`;
        mkdirSync(`${dist}/_astro`, {recursive: true});
        writeFileSync(fileFor(dist, path), data);
        variants.push(path);
      }
      covers.set(key, variants);
    }
    const [normal, retina] = covers.get(key);
    const tag = html.slice(image.start, image.end).replace(/\s+srcset="[^"]*"/gi, '').replace(/\ssrc="[^"]*"/, ` src="${normal}" srcset="${normal} 1x, ${retina} 2x"`);
    html = html.slice(0, image.start) + tag + html.slice(image.end);
  }
  return html;
}
