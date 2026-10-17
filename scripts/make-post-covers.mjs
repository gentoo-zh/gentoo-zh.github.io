// Regenerate the 1200x630 post covers on a transparent ground, so the cover frame takes the theme's card colour:
// the contributor-avatar logo alone (also on the mail post), and the gentoo-zh mark beside the OSUOSL logo. Marks
// that do not read on the dark card also get a `cover-dark.webp` with their dark form.
// Run with `node scripts/make-post-covers.mjs`; every locale's bundle gets the same files.
import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

// sharp ships with Astro's image service; resolve it from there rather than adding a direct dependency.
const sharp = createRequire(createRequire(import.meta.url).resolve('astro/package.json'))('sharp');
const root = fileURLToPath(new URL('..', import.meta.url));
const WIDTH = 1200;
const HEIGHT = 630;
const LOCALES = ['zh-cn', 'zh-tw', 'en'];

// The thanks page's logos are 327x169; 1.5x keeps them legible without visible resampling blur. The light logo's
// black lettering disappears on the dark card, so the dark cover uses the thanks page's dark logo.
const OSL_SCALE = 1.5;
const osl = async variant => {
  const source = `${root}public/img/thanks/osuosl-logo-${variant}.png`;
  const {width = 0} = await sharp(source).metadata();
  return sharp(source).resize({width: Math.round(width * OSL_SCALE), kernel: 'lanczos3'}).png().toBuffer();
};

// The site's gentoo-zh mark, trimmed of the empty wordmark area in the SVG, at a height that balances the OSL logo.
// Its purple reads on both cards.
const GENTOO_HEIGHT = 200;
const GAP = 120;
const gentoo = await sharp(`${root}public/img/logo-mark.svg`, {density: 300}).trim().resize({height: GENTOO_HEIGHT}).png().toBuffer();

/** Centre the marks as one row, left to right, with GAP between them. */
async function row(marks) {
  const sizes = await Promise.all(marks.map(async input => sharp(input).metadata()));
  let left = Math.round((WIDTH - sizes.reduce((sum, {width = 0}) => sum + width, 0) - GAP * (marks.length - 1)) / 2);
  return marks.map((input, index) => {
    const {width = 0, height = 0} = sizes[index];
    const placed = {input, left, top: Math.round((HEIGHT - height) / 2)};
    left += width + GAP;
    return placed;
  });
}

// The contributor-avatar logo is a screenshot on a flat light ground. Flood-fill that ground from the image border
// so that white and pale avatar tiles inside the logo keep their pixels. The 2px seams between tiles are ground too,
// but lossy compression leaves them only partly within TOLERANCE, so a closing of SEAM pixels gives them back and
// they stay light, as in the light cover; the closing runs a second fill from the border, so a pale tile reached
// through a seam stays as well. Last, shrink the outline by ERODE pixels and soften it by FEATHER so the
// light anti-aliased rim of the screenshot leaves no halo on the dark card.
const TOLERANCE = 8;
const SEAM = 3;
const ERODE = 1;
const FEATHER = 0.6;

/** Grow the pixels equal to `value` by `steps` 4-neighbour steps. */
function grow(mask, width, value, steps) {
  for (let step = 0; step < steps; step++) {
    const next = mask.slice();
    for (let index = 0; index < mask.length; index++) {
      const x = index % width;
      if (mask[index] !== value && ((x > 0 && mask[index - 1] === value) || (x < width - 1 && mask[index + 1] === value) || mask[index - width] === value || mask[index + width] === value)) next[index] = value;
    }
    mask = next;
  }
  return mask;
}

/** Clear the pixels that `keep` accepts and that connect to the image border; every other pixel stays opaque. */
function fillFromBorder(width, height, keep) {
  const alpha = new Uint8Array(width * height).fill(255);
  const queue = [];
  const visit = index => {
    if (alpha[index] && keep(index)) {
      alpha[index] = 0;
      queue.push(index);
    }
  };
  for (let x = 0; x < width; x++) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (queue.length > 0) {
    const index = queue.pop();
    const x = index % width;
    if (x > 0) visit(index - 1);
    if (x < width - 1) visit(index + 1);
    if (index >= width) visit(index - width);
    if (index < width * (height - 1)) visit(index + width);
  }
  return alpha;
}

async function keyGround(source) {
  const {data, info: {width, height}} = await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject: true});
  const colour = data.subarray(0, 3);
  const ground = fillFromBorder(width, height, index => Math.max(...[0, 1, 2].map(c => Math.abs(data[index * 3 + c] - colour[c]))) <= TOLERANCE);
  const closed = grow(ground, width, 255, SEAM);
  const outside = fillFromBorder(width, height, index => closed[index] === 0);
  const alpha = grow(outside, width, 0, SEAM + ERODE);
  const mask = await sharp(Buffer.from(alpha), {raw: {width, height, channels: 1}}).blur(FEATHER).extractChannel(0).raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4);
  for (let index = 0; index < mask.length; index++) {
    data.copy(rgba, index * 4, index * 3, index * 3 + 3);
    rgba[index * 4 + 3] = mask[index];
  }
  return sharp(rgba, {raw: {width, height, channels: 4}}).png().toBuffer();
}

const mosaic = await keyGround(`${root}scripts/post-covers/contributors-mosaic.webp`);

const covers = [
  {slug: '2026-10-17-site-redesign', light: [{input: mosaic, left: 0, top: 0}]},
  {slug: '2026-09-30-distfiles-site-redo', light: await row([gentoo, await osl('light')]), dark: await row([gentoo, await osl('dark')])},
  {slug: '2026-10-17-gentoozh-mail', light: [{input: mosaic, left: 0, top: 0}]},
];

const transparent = {r: 0, g: 0, b: 0, alpha: 0};
for (const {slug, ...variants} of covers) {
  for (const [variant, layers] of Object.entries(variants)) {
    const image = await sharp({create: {width: WIDTH, height: HEIGHT, channels: 4, background: transparent}})
      .composite(layers)
      .webp({quality: 90, alphaQuality: 100})
      .toBuffer();
    const name = variant === 'dark' ? 'cover-dark.webp' : 'cover.webp';
    for (const locale of LOCALES) await writeFile(`${root}content/${locale}/posts/${slug}/${name}`, image);
  }
}
