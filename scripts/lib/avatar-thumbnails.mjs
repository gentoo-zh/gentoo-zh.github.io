import {readFileSync, writeFileSync} from 'node:fs';
import sharpService from 'astro/assets/services/sharp';
import {fileFor} from './html.mjs';
import {htmlElements} from './html-elements.mjs';

const avatars = new Set();

// Stable URLs also render in hydrated islands; keep them outside immutable /_astro/ caching.
export async function buildAvatarThumbnails(html, dist) {
  for (const image of htmlElements(html).filter(e => e.name === 'img' && e.attrs.has('data-avatar-source'))) {
    const source = image.attrs.get('data-avatar-source');
    // A fixed-size avatar gets 1x and 2x; one sized by CSS (the home wall) lists its square widths.
    const sizes = avatarWidths(image);
    for (const size of sizes) {
      const path = `${source}.${size}.webp`;
      if (avatars.has(path)) continue;
      const input = readFileSync(fileFor(dist, decodeURIComponent(source)));
      const {data} = await sharpService.transform(input, {src: source, width: size, height: size, fit: 'cover', format: 'webp', quality: 'high'}, {service: {config: {}}});
      writeFileSync(fileFor(dist, decodeURIComponent(path)), data);
      avatars.add(path);
    }
  }
}

/** Square widths an avatar `<img>` references: `data-avatar-widths`, else its width at 1x and 2x. */
export function avatarWidths(image) {
  const widths = image.attrs.get('data-avatar-widths');
  if (widths != null) return widths.split(' ').map(Number);
  const width = Number(image.attrs.get('width'));
  return [width, width * 2];
}
