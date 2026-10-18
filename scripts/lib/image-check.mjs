import {imageExemption, imageUrl} from './image-variants.mjs';

const ORIGIN = 'https://gentoozh.org';
/** A source may be at most this many times wider than the width it is displayed at, per device pixel. */
export const OVERSIZE = 1.5;
/** The highest device pixel ratio a `w` set is sized for; phones ship at 3. */
const MAX_DPR = 3;
const FIX = 'mark it with data-image-widths and sizes (see scripts/lib/image-variants.mjs)';
const WIDTH = /^\d+w$/;
const DENSITY = /^(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?x$/i;
const LENGTH = /^(\d*\.?\d+)(px|r?em)$/;

/** Split on commas outside parentheses, as `sizes` (`min(100vw - 3rem, 75rem)`) needs. */
function topLevel(text) {
  const parts = [''];
  let depth = 0;
  for (const char of text) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (char === ',' && depth === 0) parts.push('');
    else parts[parts.length - 1] += char;
  }
  return parts.map(part => part.trim());
}

/** The widest slot `sizes` gives, in CSS pixels, when every entry is a fixed length; null otherwise. */
function fixedSlot(sizes) {
  const lengths = topLevel(sizes ?? '').map(entry => LENGTH.exec(entry.split(/\s+/).at(-1)));
  return lengths.length && lengths.every(Boolean) ? Math.max(...lengths.map(([, value, unit]) => Number(value) * (unit === 'px' ? 1 : 16))) : null;
}

/**
 * Parse `srcset` into `{url, kind: 'w' | 'x', value}` candidates, or return the reason it is invalid: a candidate
 * that is not `url [descriptor]`, a descriptor that is not a positive integer `w` or a positive `x`, both kinds in
 * one set, or one descriptor twice. Browsers drop invalid candidates and fall back to `src`, so none may pass.
 */
export function parseSrcset(srcset) {
  const candidates = [];
  for (const text of srcset.split(',').map(candidate => candidate.trim())) {
    const [url, descriptor = '1x', ...rest] = text.split(/\s+/);
    if (!url || rest.length) return {error: `malformed candidate "${text}"`};
    const kind = WIDTH.test(descriptor) ? 'w' : DENSITY.test(descriptor) ? 'x' : null;
    const value = Number.parseFloat(descriptor);
    if (kind == null || !(value > 0)) return {error: `invalid descriptor "${descriptor}"`};
    candidates.push({url, kind, value});
  }
  if (new Set(candidates.map(({kind}) => kind)).size > 1) return {error: 'mixes w and x descriptors'};
  if (new Set(candidates.map(({value}) => value)).size < candidates.length) return {error: 'repeats a descriptor'};
  return {candidates};
}

/**
 * A content image ships at its displayed size. Without `srcset`, the source is at most OVERSIZE × its `width`.
 * With one, the set must parse (parseSrcset), include `src`, and name only files whose `w` matches their width.
 * What a browser can then download is bounded by the display width D (the `width` attribute, or else the widest
 * fixed length in `sizes`):
 * - an `x` candidate is picked on a screen of that density, so it is at most OVERSIZE × D × its density; this
 *   holds an original-only set (`/large.png 1x`) to the no-`srcset` rule;
 * - one `w` candidate is the only choice on every screen, so it is at most OVERSIZE × D;
 * - several `w` candidates are picked by `sizes`, which a check cannot evaluate per viewport, so the largest is at
 *   most OVERSIZE × D × MAX_DPR: no screen needs more, whatever `sizes` says.
 * `intrinsic(url)` resolves a same-origin image URL to its `{width}`, or null when the file is missing.
 */
export async function imageFailures(image, path, intrinsic) {
  const url = imageUrl(image, path);
  if (imageExemption(url)) return [];
  const src = image.attrs.get('src');
  const srcset = image.attrs.get('srcset');
  const sizes = image.attrs.get('sizes');
  const width = Number(image.attrs.get('width'));
  if (srcset == null) {
    const size = await intrinsic(url);
    if (!size) return [`${path}: missing image ${url.pathname}`];
    if (!(width > 0)) return [`${path}: ${src} has neither a width nor a srcset; ${FIX}`];
    return size.width > OVERSIZE * width ? [`${path}: ${src} is ${size.width}px wide but displayed at ${width}px; ${FIX}, or resize the source`] : [];
  }
  const {candidates, error} = parseSrcset(srcset);
  if (error) return [`${path}: ${src} has an invalid srcset (${error}); ${FIX}`];
  const failures = [];
  const widths = candidates[0].kind === 'w';
  if (widths && !sizes) failures.push(`${path}: ${src} has width descriptors but no sizes`);
  if (!candidates.some(candidate => new URL(candidate.url, `${ORIGIN}${path}`).href === url.href)) failures.push(`${path}: ${src} is not one of its srcset candidates`);
  const display = width > 0 ? width : widths ? fixedSlot(sizes) : null;
  if (display == null) failures.push(`${path}: ${src} has a srcset but neither a width nor a fixed-length sizes, so its display width is unknown`);
  const files = [];
  for (const candidate of candidates) {
    const file = new URL(candidate.url, `${ORIGIN}${path}`);
    const size = file.origin === ORIGIN ? await intrinsic(file) : null;
    if (!size) failures.push(`${path}: missing srcset candidate ${candidate.url}`);
    else if (widths && candidate.value !== size.width) failures.push(`${path}: srcset candidate ${candidate.url} is ${size.width}px wide, not ${candidate.value}w`);
    else files.push({...candidate, width: size.width});
  }
  if (display == null) return failures;
  const bounded = widths ? files.toSorted((a, b) => b.width - a.width).slice(0, 1) : files;
  for (const file of bounded) {
    const density = widths ? (candidates.length > 1 ? MAX_DPR : 1) : file.value;
    const limit = OVERSIZE * display * density;
    if (file.width > limit) failures.push(`${path}: srcset candidate ${file.url} is ${file.width}px wide, over ${limit}px for ${display}px at ${density}x; ${FIX}, or resize the source`);
  }
  return failures;
}
