import {readFileSync, writeFileSync} from 'node:fs';
import sharpService from 'astro/assets/services/sharp';
import {fileFor} from './html.mjs';
import {htmlElements} from './html-elements.mjs';

const avatars = new Set();

// Stable URLs also render in hydrated islands; keep them outside immutable /_astro/ caching.
export async function buildAvatarThumbnails(html, dist) {
  for (const image of htmlElements(html).filter(e => e.name === 'img' && e.attrs.has('data-avatar-source'))) {
    const source = image.attrs.get('data-avatar-source');
    const width = Number(image.attrs.get('width'));
    const height = Number(image.attrs.get('height'));
    for (const density of [1, 2]) {
      const path = `${source}.${width * density}.webp`;
      if (avatars.has(path)) continue;
      const input = readFileSync(fileFor(dist, decodeURIComponent(source)));
      const {data} = await sharpService.transform(input, {src: source, width: width * density, height: height * density, fit: 'cover', format: 'webp', quality: 'high'}, {service: {config: {}}});
      writeFileSync(fileFor(dist, decodeURIComponent(path)), data);
      avatars.add(path);
    }
  }
}
