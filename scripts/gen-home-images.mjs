// Writes the home hero's contributor images to public/home/ and their addresses to
// src/ui/home/home-images.json: one period of the logo wall as a single mosaic per breakpoint and
// density, and the AvatarGroup avatars. The site build only reads them; the monthly contributor
// update runs this script, and `--check` (pnpm check:home-images) fails when they are stale.
//   node --experimental-strip-types scripts/gen-home-images.mjs [--check | --force]
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {parseFrontmatter} from 'astro/markdown';
import {groupContributors} from '../src/content/contributorOrder.ts';
import {GROUP_AVATARS, WALL_PERIOD, homeImageOrder, wallSources} from '../src/ui/home/homeImages.ts';
import identicons from '../src/ui/home/home-identicons.json' with {type: 'json'};
import {report} from './lib/html.mjs';

// sharp is Astro's image service dependency; resolve it from there rather than pinning a second copy.
const sharp = createRequire(import.meta.resolve('astro/package.json'))('sharp');

/** Bump when the geometry or encoding below changes, so --check asks for a rebuild. */
const VERSION = 1;
const LOCALES = ['zh-cn', 'zh-tw', 'en'];
const CONTENT = 'content';
const OUT = 'public/home';
const MANIFEST = 'src/ui/home/home-images.json';
const REM = 16;
// Mirrors src/ui/home/home.styles.ts: tiles are 9cqw of the logo mark (homeLayout markCompact,
// markTablet and mark), the gap is var(--spacing-1) / 2. Media queries follow theme/layout.stylex media.
const TILE = 0.09;
const GAP_REM = 0.125;
const BREAKPOINTS = [
  {name: 'compact', markRem: 12, media: '(width < 48em)', densities: [1, 2, 3]},
  {name: 'tablet', markRem: 18, media: '(48em <= width < 64em)', densities: [1, 2, 3]},
  // A 3x desktop display is rare and its 2x mosaic already has 92px tiles; 3x would add 430 KB to the repository each month.
  {name: 'desktop', markRem: 32, media: '(width >= 64em)', densities: [1, 2]},
];
/** Each density gets an AVIF; the WebP at 2x serves browsers without AVIF. */
const FALLBACK_DENSITY = 2;
/** The AvatarGroup circle is 48px (Astryx Avatar `lg`); 3x covers every common display. */
const GROUP_PX = 144;
const AVATAR_FILES = ['avatar_card.webp', 'avatar_single.webp', 'feature.webp'];

const check = process.argv.includes('--check');
const sha = data => createHash('sha256').update(data).digest('hex');

/** homeData's contributor order: ranked by commits, then every profile in group order; default identicons left out. */
function homeAvatars(locale) {
  const root = join(CONTENT, locale, 'contributors');
  // getCollection returns entries by id; that order breaks ties in the commit ranking.
  const entries = readdirSync(root, {withFileTypes: true}).filter(entry => entry.isDirectory()).map(({name}) => {
    const {frontmatter} = parseFrontmatter(readFileSync(join(root, name, 'index.md'), 'utf8'));
    return {data: {...frontmatter, tags: frontmatter.tags ?? []}, slug: name.toLowerCase(), dir: join(root, name)};
  }).sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  const commits = ({data}) => data.contributions?.total ?? (data.weight == null ? undefined : 10000 - data.weight);
  const ranked = entries.filter(entry => commits(entry) != null).sort((a, b) => commits(b) - commits(a));
  const everyone = groupContributors(entries).flatMap(group => group.contributors);
  const people = [...new Map([...ranked, ...everyone].map(entry => [entry.slug, entry])).values()];
  const defaults = new Set(identicons);
  const prefix = locale === 'zh-cn' ? '' : `/${locale}`;
  return people.filter(person => !defaults.has(person.slug)).flatMap(person => {
    const file = AVATAR_FILES.find(name => existsSync(join(person.dir, name)));
    return file == null ? [] : [{url: `${prefix}/contributors/${person.slug}/${file}`, path: join(person.dir, file)}];
  });
}

const locales = Object.fromEntries(LOCALES.map(locale => {
  const avatars = homeAvatars(locale);
  const files = new Map(avatars.map(avatar => [avatar.url, avatar.path]));
  const wall = wallSources(avatars.map(avatar => avatar.url)).map(url => files.get(url));
  const group = avatars.slice(0, GROUP_AVATARS).map(avatar => avatar.path);
  return [locale, {order: homeImageOrder(avatars.map(avatar => avatar.url)), wall, group}];
}));
const digests = new Map();
const digest = path => digests.get(path) ?? digests.set(path, sha(readFileSync(path))).get(path);
const input = sha(JSON.stringify({VERSION, BREAKPOINTS, GROUP_PX, locales: Object.entries(locales).map(([locale, {order, wall, group}]) => [locale, order, wall.map(digest), group.map(digest)])})).slice(0, 16);

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
const referenced = manifest == null ? [] : Object.values(manifest.locales).flatMap(entry => [...Object.values(entry.wall).flatMap(({avif, webp}) => [...avif.map(([url]) => url), webp]), ...entry.group]);

if (check) {
  const failures = [];
  if (manifest?.input !== input) failures.push(`${MANIFEST} does not match the contributor list, order or avatar files; run pnpm gen:home-images and commit public/home/ and ${MANIFEST}`);
  for (const url of referenced) if (!existsSync(join('public', url))) failures.push(`${url} is missing; run pnpm gen:home-images`);
  const kept = new Set(referenced.map(url => url.slice('/home/'.length)));
  for (const file of existsSync(OUT) ? readdirSync(OUT) : []) if (!kept.has(file)) failures.push(`public/home/${file} is not referenced; run pnpm gen:home-images`);
  report('check:home-images', failures);
} else if (manifest?.input === input && !process.argv.includes('--force') && referenced.every(url => existsSync(join('public', url)))) {
  // Encoders may not be byte-stable across versions; unchanged inputs keep the committed files.
  console.log(`gen:home-images: up to date, input ${input}`);
} else {
  mkdirSync(OUT, {recursive: true});
  const written = new Set();
  /** Writes `<name>.<content hash>.<ext>` and returns its address. */
  const emit = (name, ext, data) => {
    const file = `${name}.${sha(data).slice(0, 16)}.${ext}`;
    writeFileSync(join(OUT, file), data);
    written.add(file);
    return `/home/${file}`;
  };
  const tiles = new Map();
  const tile = (path, width, height) => {
    const key = `${path} ${width} ${height}`;
    if (!tiles.has(key)) tiles.set(key, sharp(path).resize(width, height, {fit: 'cover'}).png().toBuffer());
    return tiles.get(key);
  };
  /** One period at `density`: each tile snapped to device pixels, the gaps transparent. */
  async function mosaic(sources, {markRem}, density) {
    const scale = REM * density;
    const size = TILE * markRem * scale;
    const cell = size + GAP_REM * scale;
    const edge = index => Math.round(index * cell);
    const side = edge(WALL_PERIOD);
    const layers = await Promise.all(sources.map(async (path, index) => {
      const [x, y] = [index % WALL_PERIOD, Math.floor(index / WALL_PERIOD)].map(edge);
      const [width, height] = [index % WALL_PERIOD, Math.floor(index / WALL_PERIOD)].map(i => Math.round(i * cell + size) - edge(i));
      return {input: await tile(path, width, height), left: x, top: y};
    }));
    return sharp({create: {width: side, height: side, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}}).composite(layers).png().toBuffer();
  }
  const walls = new Map();
  const output = {};
  for (const [locale, {order, wall, group}] of Object.entries(locales)) {
    const key = wall.map(digest).join();
    if (!walls.has(key)) {
      const entry = {};
      for (const breakpoint of BREAKPOINTS) {
        const avif = [];
        let webp;
        for (const density of breakpoint.densities) {
          const image = await mosaic(wall, breakpoint, density);
          const name = `wall-${breakpoint.name}-${density}x`;
          avif.push(emit(name, 'avif', await sharp(image).avif({quality: 60, effort: 6}).toBuffer()));
          if (density === FALLBACK_DENSITY) webp = emit(name, 'webp', await sharp(image).webp({quality: 80, effort: 6}).toBuffer());
        }
        entry[breakpoint.name] = {media: breakpoint.media, avif: avif.map((url, index) => [url, breakpoint.densities[index]]), webp};
      }
      walls.set(key, entry);
    }
    const avatars = [];
    for (const path of group) avatars.push(emit('avatar', 'webp', await sharp(path).resize(GROUP_PX, GROUP_PX, {fit: 'cover'}).webp({quality: 80}).toBuffer()));
    output[locale] = {order, wall: walls.get(key), group: avatars};
  }
  for (const file of readdirSync(OUT)) if (!written.has(file)) rmSync(join(OUT, file));
  writeFileSync(MANIFEST, `${JSON.stringify({input, locales: output}, null, 2)}\n`);
  console.log(`gen:home-images: ${written.size} files in ${OUT}, input ${input}`);
}
