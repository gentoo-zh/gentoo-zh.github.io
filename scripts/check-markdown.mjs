// Run with pnpm check:markdown. Renders post Markdown through Vite with the site's StyleX plugin.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import stylex from '@stylexjs/unplugin/vite';
import {createServer} from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: {middlewareMode: true, hmr: false, ws: false, watch: null},
  optimizeDeps: {noDiscovery: true, include: []},
  plugins: [stylex({dev: false, runtimeInjection: false, classNamePrefix: 'p', unstable_moduleResolution: {type: 'commonJS'}})],
});

try {
  const {PostMarkdown} = await server.ssrLoadModule('/src/markdown/PostMarkdown.tsx');
  const {SiteI18n} = await server.ssrLoadModule('/src/ui/SiteProviders.tsx');
  const render = (locale, source) =>
    renderToStaticMarkup(createElement(SiteI18n, {locale}, createElement(PostMarkdown, {locale, pages: new Set()}, source)));

  // Paged posts: pages cut at numbered top-level `## N.` only, keep the ids they have in the whole post, and resolve links across pages.
  const {splitPages, pageGroups, pageHashResolver} = await server.ssrLoadModule('/src/markdown/chapters.ts');
  const {outlineItems} = await server.ssrLoadModule('/src/markdown/outline.ts');
  const post = [
    'Cover note before any section.',
    '',
    '## Overview',
    '',
    '### Install',
    '',
    '## 1. Setup',
    '',
    '### Install',
    '',
    '```sh',
    '## 2. not a section',
    '```',
    '',
    'See [later](#install-2) and [here](#install-1) and [top](#overview).',
    '',
    '## 3. Use it',
    '',
    '### Install',
    '',
    '### Kept {#own-id}',
    '',
    '![shot](shot.webp) and [notes](notes.txt), [root](/faq/), [site](https://example.com/a.png)',
    '',
    '## References',
    '',
    'Stays on the page before.',
  ].join('\n');
  const split = splitPages(post);
  assert.deepEqual(split.pages.map(({number, id, title}) => [number, id, title]), [[0, undefined, undefined], [1, '1-setup', '1. Setup'], [3, '3-use-it', '3. Use it']]);
  assert.match(split.pages[0].body, /^Cover note before any section\./, 'content before the first numbered ## is the overview');
  assert.match(split.pages[0].body, /^## Overview \{#overview\}$/m, 'an unnumbered ## before the first section stays on the overview');
  assert.ok(split.pages[1].body.includes('## 2. not a section'), 'a ## line in a fence does not cut');
  assert.match(split.pages[2].body, /^## References \{#references\}$/m, 'an unnumbered ## after a section stays on its page');
  assert.ok(split.pages.slice(1).every(page => !page.body.includes(`## ${page.title}`)), 'the section heading leaves the body');
  // Ids on the pages equal the whole post's, including the duplicate text that Hugo numbers across pages.
  const fullIds = outlineItems(post).map(item => item.id);
  const pageIds = split.pages.flatMap(page => [...(page.id == null ? [] : [page.id]), ...outlineItems(page.body).map(item => item.id)]);
  assert.deepEqual(pageIds, fullIds);
  assert.deepEqual(fullIds, ['overview', 'install', '1-setup', 'install-1', '3-use-it', 'install-2', 'own-id', 'references']);
  assert.equal(split.pages[2].body.match(/\{#own-id\}/g)?.length, 1, 'an explicit id is not written twice');
  assert.deepEqual(split.pages.map(page => page.sections), [[{id: 'install', label: 'Install'}], [{id: 'install-1', label: 'Install'}], [{id: 'install-2', label: 'Install'}, {id: 'own-id', label: 'Kept'}]], 'each page lists its own ### headings with their whole-post ids');
  assert.deepEqual(split.pages.map(page => page.intro), [true, false, false], 'only text before the first ### is an intro');
  assert.deepEqual([...split.pageOf], [['overview', 0], ['install', 0], ['1-setup', 1], ['install-1', 1], ['3-use-it', 3], ['install-2', 3], ['own-id', 3], ['references', 3]]);
  assert.throws(() => splitPages('## Unnumbered\n\nonly'), /numbered ## heading/);
  assert.throws(() => splitPages('## 2. Two\n\n## 1. One'), /rising section numbers/);

  assert.deepEqual(pageGroups(split, [{title: 'Use', from: 3}]).map(({title, pages}) => [title, pages.map(page => page.number)]), [[undefined, [1]], ['Use', [3]]]);
  assert.throws(() => pageGroups(split, [{title: 'Gone', from: 2}]), /does not have/);

  const resolve = pageHashResolver(split, 1, number => `/posts/p/${number === 0 ? '' : `${number}/`}`);
  assert.equal(resolve('install-1'), '#install-1', 'same-page links stay fragments');
  assert.equal(resolve('install-2'), '/posts/p/3/#install-2', 'other-page links go to that page');
  assert.equal(resolve('overview'), '/posts/p/#overview', 'overview links go to the post address');
  assert.throws(() => resolve('missing'), /names no heading/);
  assert.throws(() => resolve('%E0%A4%A'), /not a valid percent-encoded fragment/);

  const chapterHtml = renderToStaticMarkup(createElement(SiteI18n, {locale: 'en'}, createElement(PostMarkdown, {locale: 'en', pages: new Set(), resolveHash: resolve, assetBase: '/en/posts/p/'}, split.pages[1].body + '\n\n' + split.pages[2].body)));
  assert.ok(chapterHtml.includes('href="/posts/p/3/#install-2"') && chapterHtml.includes('href="#install-1"'), 'links resolve through resolveHash');
  assert.ok(chapterHtml.includes('src="/en/posts/p/shot.webp"') && chapterHtml.includes('href="/en/posts/p/notes.txt"'), 'relative images and files resolve against assetBase');
  assert.ok(chapterHtml.includes('href="/en/faq/"') || chapterHtml.includes('href="/faq/"'), 'root links stay root links');
  assert.ok(chapterHtml.includes('href="https://example.com/a.png"'), 'absolute URLs stay');
  assert.ok(['id="install-1"', 'id="install-2"', 'id="own-id"'].every(id => chapterHtml.includes(id)), 'headings carry the written ids');
  // A section page renders its ### and deeper one level up under the page's h1; an unnumbered ## stays h2.
  const sectionHtml = renderToStaticMarkup(createElement(SiteI18n, {locale: 'en'}, createElement(PostMarkdown, {locale: 'en', pages: new Set(), promoteHeadings: true}, split.pages[2].body + '\n\n#### Deeper')));
  assert.match(sectionHtml, /<h2[^>]*id="install-2"/, 'a section page renders ### as h2');
  assert.match(sectionHtml, /<h2[^>]*id="own-id"/, 'a promoted heading keeps its explicit id');
  assert.match(sectionHtml, /<h3[^>]*id="deeper"/, 'a section page renders #### as h3');
  assert.match(sectionHtml, /<h2[^>]*id="references"/, 'an unnumbered ## stays h2');
  assert.match(render('en', split.pages[0].body), /<h3[^>]*id="install"/, 'without promoteHeadings, as on the overview, ### stays h3');
  // Without the options a body renders exactly as before.
  const plain = render('en', '![shot](shot.webp) [a](#x) [b](notes.txt)');
  assert.ok(plain.includes('src="shot.webp"') && plain.includes('href="#x"') && plain.includes('href="notes.txt"'));
} finally {
  await server.close();
}
// A closed Vite server still holds a handle open (a StyleX or bundler worker); nothing is left to wait for.
process.exit(0);
