import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import sharpService from 'astro/assets/services/sharp';
import {imageMetadata} from 'astro/assets/utils';
import {fileFor} from './html.mjs';
import {htmlElements} from './html-elements.mjs';

const ORIGIN = 'https://gentoozh.org';

/** Raster formats the variants are made from; vectors scale without them. */
const RASTER = /\.(?:avif|gif|jpe?g|png|webp)$/i;

/**
 * Content images that need no `srcset`, each with the reason; check:seo reads this list.
 * Everything else that is a local raster image either has a `srcset` or is at most 1.5× its `width`.
 */
export const IMAGE_EXEMPTIONS = [
  ['vector images', image => /\.svg$/i.test(image.pathname), 'an SVG scales to any width'],
  ['avatar derivatives', image => /\.webp\.\d+\.webp$/.test(image.pathname), 'avatar-thumbnails.mjs writes them at the displayed size; check:seo verifies them separately'],
  ['home images', image => image.pathname.startsWith('/home/'), 'gen-home-images.mjs writes them at the displayed size; check:home-images verifies them'],
  ['external images', image => image.origin !== ORIGIN, 'no local file to resize'],
];

/** The resolved source of an `<img>` on page `path`. */
export function imageUrl(image, path) {
  return new URL(image.attrs.get('src') ?? '', `${ORIGIN}${path}`);
}

export function imageExemption(url) {
  return IMAGE_EXEMPTIONS.find(([, applies]) => applies(url));
}

/** Lossless sources (PNG, GIF, VP8L WebP) keep lossless variants, so logos stay sharp. */
function isLossless(input, format) {
  if (format === 'png' || format === 'gif') return true;
  if (format !== 'webp') return false;
  // RIFF chunks after the 12-byte header; VP8X only announces the image chunk that follows.
  for (let offset = 12; offset + 8 <= input.length;) {
    const chunk = input.toString('latin1', offset, offset + 4);
    if (chunk === 'VP8L') return true;
    if (chunk === 'VP8 ') return false;
    offset += 8 + input.readUInt32LE(offset + 4) + (input.readUInt32LE(offset + 4) % 2);
  }
  return false;
}

async function writeVariant(dist, input, {src, width, height, fit, lossless}, name) {
  const options = {src, width, height, fit, format: 'webp', ...(lossless ? {} : {quality: 'high'})};
  const {data} = await sharpService.transform(input, options, {service: {config: lossless ? {webp: {lossless: true}} : {}}});
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 8);
  const path = `/_astro/${name}.${hash}.webp`;
  mkdirSync(`${dist}/_astro`, {recursive: true});
  writeFileSync(fileFor(dist, path), data);
  return path;
}

const sources = new Map();

async function source(dist, url) {
  if (!sources.has(url.pathname)) {
    const file = fileFor(dist, decodeURIComponent(url.pathname));
    if (!existsSync(file)) throw new Error(`missing image ${url.pathname}`);
    const input = readFileSync(file);
    const metadata = await imageMetadata(input);
    sources.set(url.pathname, {input, ...metadata, lossless: isLossless(input, metadata.format), variants: new Map()});
  }
  return sources.get(url.pathname);
}

const replaceTag = (html, image, tag) => html.slice(0, image.start) + tag + html.slice(image.end);
const dropAttribute = (tag, name) => tag.replace(new RegExp(`\\s+${name}="[^"]*"`, 'gi'), '');

/**
 * Serve images at their displayed size. Two marks, both written by components and consumed here:
 * - `data-image-widths="400 800"` with `sizes`: one `w` candidate per listed width below the source width, plus
 *   the source itself, picked by `sizes`; missing `width`/`height` come from the source for layout stability.
 *   Lossless sources give lossless variants.
 * - `data-blog-cover` with fixed `width`/`height` (the post lists): 1x and 2x, letterboxed with `fit: inside`.
 * Bundle attachments are emitted routes, not ESM images, so the built bytes go through Astro's sharp service.
 * Variants are content-hashed under `/_astro/`; avatar-thumbnails.mjs keeps stable URLs for hydrated islands.
 */
export async function buildImageVariants(html, dist, path) {
  const rewritten = new Map();
  for (const image of htmlElements(html).filter(e => e.name === 'img' && (e.attrs.has('data-image-widths') || e.attrs.has('data-blog-cover'))).reverse()) {
    const url = imageUrl(image, path);
    const widths = image.attrs.get('data-image-widths');
    let tag = dropAttribute(html.slice(image.start, image.end), 'data-image-widths');
    if (url.origin !== ORIGIN || !RASTER.test(url.pathname)) {
      // Vectors and external images keep their source; `sizes` is only valid beside a `srcset`.
      html = replaceTag(html, image, widths == null ? tag : dropAttribute(tag, 'sizes'));
      continue;
    }
    const file = await source(dist, url);
    const candidates = widths == null ? await densityCandidates(dist, file, url, image) : await widthCandidates(dist, file, url, widths.split(' ').map(Number));
    tag = dropAttribute(tag, 'srcset').replace(/\ssrc="[^"]*"/, ` src="${candidates[0].split(' ')[0]}" srcset="${candidates.join(', ')}"`);
    if (!image.attrs.has('width') && !image.attrs.has('height')) tag = tag.replace(/\s*\/?>$/, ` width="${file.width}" height="${file.height}">`);
    html = replaceTag(html, image, tag);
    rewritten.set(image.attrs.get('src'), candidates);
  }
  // React preloads an eager image from its render-time props; point the preload at the same candidates.
  for (const link of htmlElements(html).filter(e => e.name === 'link' && e.attrs.get('rel') === 'preload' && e.attrs.get('as') === 'image' && rewritten.has(e.attrs.get('href'))).reverse()) {
    const candidates = rewritten.get(link.attrs.get('href'));
    html = replaceTag(html, link, dropAttribute(html.slice(link.start, link.end), 'imageSrcSet').replace(/\shref="[^"]*"/, ` href="${candidates[0].split(' ')[0]}" imageSrcSet="${candidates.join(', ')}"`));
  }
  return html;
}

async function widthCandidates(dist, file, url, widths) {
  const stem = url.pathname.split('/').at(-1).replace(/\.[^.]+$/, '');
  const candidates = [];
  for (const width of widths.filter(width => width < file.width)) {
    const key = `${width}w`;
    if (!file.variants.has(key)) file.variants.set(key, await writeVariant(dist, file.input, {src: url.pathname, width, lossless: file.lossless}, `${stem}-${width}w`));
    candidates.push(`${file.variants.get(key)} ${width}w`);
  }
  candidates.push(`${url.pathname} ${file.width}w`);
  return candidates;
}

async function densityCandidates(dist, file, url, image) {
  const width = Number(image.attrs.get('width'));
  const height = Number(image.attrs.get('height'));
  const candidates = [];
  for (const density of [1, 2]) {
    const key = `${width * density}x${height * density}`;
    if (!file.variants.has(key)) file.variants.set(key, await writeVariant(dist, file.input, {src: url.pathname, width: width * density, height: height * density, fit: 'inside', lossless: file.lossless}, `blog-cover-${width * density}`));
    candidates.push(`${file.variants.get(key)} ${density}x`);
  }
  return candidates;
}
