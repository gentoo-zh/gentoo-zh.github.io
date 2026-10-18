// Run with pnpm check:code.
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {codeTokenizer} from '../src/markdown/codeTokenizer.ts';
import {rewriteCode} from '../src/ui/start/guideSetup.ts';
import {crumbsOf, dirPath, directoryOf, fileUrl, formatSize, listingUrl, parentOf} from '../src/ui/download/filesData.ts';
import {distfilesLink} from '../src/i18n/distfilesLink.ts';
import {imageFailures} from './lib/image-check.mjs';
import {feedHtml} from '../src/ui/feedHtml.ts';

function tokens(code, language) {
  let end = 0;
  return codeTokenizer(code, language).map(token => {
    assert.ok(token.start >= end && token.end > token.start && token.end <= code.length, 'ordered, disjoint token ranges');
    end = token.end;
    return [token.type, code.slice(token.start, token.end)];
  });
}

for (const language of ['bash', 'sh', 'zsh', 'shell', 'console']) {
  const source = '$ sudo emerge --sync\n# emerge --sync\n# Download the file\n# /etc/portage/make.conf';
  assert.deepEqual(tokens(source, language).filter(([type]) => type.startsWith('prompt')), [['prompt-user', '$ '], ['prompt-root', '# ']]);
  assert.deepEqual(tokens(source, language).filter(([type]) => type === 'comment').map(([, text]) => text), ['# Download the file', '# /etc/portage/make.conf']);
  assert.equal(tokens("$ cat <<'EOF'\n# emerge is literal data here\n$ literal\nEOF\n$ pwd", language).filter(([type]) => type.startsWith('prompt')).length, 2);
}

for (const language of ['ini', 'conf', 'toml']) {
  const found = tokens('[gentoo-zh]\nsync-uri = "https://example.org/#fragment" # mirror\nFEATURES="${FEATURES} getbinpkg"\npriority = 10\nenabled = true', language);
  for (const expected of [['keyword', '[gentoo-zh]'], ['property', 'sync-uri'], ['operator', '='], ['comment', '# mirror'], ['variable', '${FEATURES}'], ['number', '10'], ['constant', 'true']]) {
    assert.ok(found.some(token => JSON.stringify(token) === JSON.stringify(expected)), `${language}: ${expected}`);
  }
}
assert.deepEqual(tokens('-old\n+new\n@@ -1 +1 @@', 'diff'), [['deleted', '-old'], ['inserted', '+new'], ['keyword', '@@ -1 +1 @@']]);
assert.deepEqual(tokens('# root\nUUID=abc / btrfs defaults 0 1', 'fstab').map(([type]) => type), ['comment', 'string', 'property', 'type', 'keyword', 'number', 'number']);
assert.ok(tokens('const answer = 42;', 'js').some(([type]) => type === 'keyword'));
assert.deepEqual(tokens('$ literal\n# literal', 'text'), []);

const mirrors = [{id: 'a', uri: 'https://a.example'}, {id: 'b', uri: 'https://b.example'}];
const source = '$ sudo emaint sync -r gentoo-zh\n$ curl https://a.example/repo\n# Keep this comment';
const rewritten = rewriteCode(source, 'overlay', mirrors, {mirror: 'b', channel: 'stable', sudo: false});
assert.equal(rewritten, '# emaint sync -r gentoo-zh\n$ curl https://b.example/repo\n# Keep this comment');
assert.equal(rewriteCode(source, 'overlay', mirrors, {mirror: 'a', channel: 'stable', sudo: true}), source);

// Astryx's default async threshold must not leave long static blocks without tokens.
const long = 'const answer = 42;\n'.repeat(150);
const html = renderToStaticMarkup(createElement(CodeBlock, {code: long, language: 'js', highlightMode: 'spans', tokenizer: codeTokenizer}));
assert.equal((html.match(/class="astryx-token-keyword /g) ?? []).length, 150);
assert.ok(renderToStaticMarkup(createElement(CodeBlock, {code: '$ echo <script>', language: 'bash', highlightMode: 'spans', tokenizer: codeTokenizer})).includes('&lt;'));
// /files/ maps the address bar 1:1 to distfiles directories, always with a trailing slash.
assert.equal(directoryOf('/files/', '/files/'), '');
assert.equal(directoryOf('/files', '/files/'), '');
assert.equal(directoryOf('/en/files/distfiles//ab', '/en/files/'), 'distfiles/ab/');
assert.equal(directoryOf('/en/files/a%20b/', '/en/files/'), 'a%20b/');
assert.equal(directoryOf('/packages/', '/files/'), null);
assert.equal(parentOf('distfiles/ab/'), 'distfiles/');
assert.equal(parentOf('distfiles/'), '');
assert.deepEqual(crumbsOf('a%20b/c/'), [{name: 'a b', dir: 'a%20b/'}, {name: 'c', dir: 'a%20b/c/'}]);
assert.deepEqual(crumbsOf('100%/'), [{name: '100%', dir: '100%/'}]);
assert.equal(listingUrl('https://d.example', 'a/'), 'https://d.example/_ls/a/');
assert.equal(fileUrl('https://d.example', 'a/', 'x y#1.tar'), 'https://d.example/a/x%20y%231.tar');
assert.equal(dirPath('a/', 'b c'), 'a/b%20c/');
// distfiles.gentoozh.org pages and directories open here, as its nginx sends browsers; files stay there.
const D = 'https://distfiles.gentoozh.org';
for (const [href, path] of [
  [D, '/files/'],
  [`${D}/`, '/files/'],
  [`${D}/?lang=zh-tw`, '/files/'],
  [`${D}/index.html`, '/files/'],
  [`${D}/files/`, '/files/'],
  [`${D}/binpkgs/x86-64/`, '/files/binpkgs/x86-64/'],
  [`${D}/files/distfiles/`, '/files/distfiles/'],
  [`${D}/mirrors?lang=en`, '/mirrorlist/'],
  [`${D}/mirror`, '/mirrorlist/'],
  [`${D}/packages`, '/packages/'],
  [`${D}/packages?q=x&lang=en`, '/packages/?q=x'],
  [`${D}/faq.html#binpkg`, '/faq/#binpkg'],
  [`${D}/iso/`, '/files/iso/'],
]) {
  assert.deepEqual(distfilesLink(href), {kind: 'page', path}, href);
}
for (const href of [`${D}/packages.txt`, `${D}/binpkgs/x86-64/Packages`, `${D}/gentoo-zh-binhost.asc`, `${D}/binpkgs`]) {
  assert.deepEqual(distfilesLink(href), {kind: 'file', url: href}, href);
}
for (const href of ['https://distfiles.gentoozh.org.example/', 'https://gentoozh.org/files/', '/files/']) {
  assert.equal(distfilesLink(href), null, href);
}
assert.equal(formatSize(512, 'en'), '512 B');
assert.equal(formatSize(1021231104, 'zh-CN'), '973.9 MiB');
// check:seo's image rule: a srcset never lets an oversized source through (scripts/lib/image-check.mjs).
const IMAGE_WIDTHS = {'/large.png': 2048, '/small.png': 64, '/s.png': 128, '/m.png': 256, '/l.png': 384, '/xl.png': 600};
const intrinsic = async url => (url.pathname in IMAGE_WIDTHS ? {width: IMAGE_WIDTHS[url.pathname]} : null);
const imageProblems = attrs => imageFailures({attrs: new Map(Object.entries(attrs))}, '/p/', intrinsic);
for (const attrs of [
  {src: '/small.png', width: '64'},
  {src: '/small.png', srcset: '/small.png 1x, /s.png 2x', width: '64'},
  {src: '/small.png', srcset: '/small.png', width: '64'},
  {src: '/small.png', srcset: '/small.png 64w', sizes: '64px', width: '64'},
  {src: '/s.png', srcset: '/s.png 128w, /m.png 256w', sizes: '(min-width: 48em) 4rem, 2rem'},
  {src: '/s.png', srcset: '/s.png 128w, /m.png 256w, /l.png 384w', sizes: '100vw', width: '128'},
  {src: '/s.png', srcset: '/s.png 128w, /m.png 256w', sizes: 'min(100vw - 3rem, 75rem)', width: '128'},
]) {
  assert.deepEqual(await imageProblems(attrs), [], JSON.stringify(attrs));
}
for (const [attrs, problem] of [
  [{src: '/large.png', width: '64'}, /is 2048px wide but displayed at 64px/],
  [{src: '/large.png', srcset: '/large.png invalid', width: '64'}, /invalid descriptor "invalid"/],
  [{src: '/large.png', srcset: '/large.png 1x', width: '64'}, /over 96px for 64px at 1x/],
  [{src: '/large.png', srcset: '/large.png', width: '64'}, /over 96px for 64px at 1x/],
  [{src: '/small.png', srcset: '/small.png 1x, /large.png 2x', width: '64'}, /large\.png is 2048px wide, over 192px/],
  [{src: '/large.png', srcset: '/large.png 2048w', sizes: '64px', width: '64'}, /over 96px for 64px at 1x/],
  [{src: '/small.png', srcset: '/small.png 64w, /large.png 2048w', sizes: '100vw', width: '64'}, /over 288px for 64px at 3x/],
  [{src: '/s.png', srcset: '/s.png 128w, /xl.png 600w', sizes: '(min-width: 48em) 4rem, 2rem'}, /over 288px for 64px at 3x/],
  [{src: '/s.png', srcset: '/s.png 128w, /m.png 256w', sizes: '100vw'}, /neither a width nor a fixed-length sizes/],
  [{src: '/small.png', srcset: '/small.png 64w, /s.png 128w', width: '64'}, /width descriptors but no sizes/],
  [{src: '/small.png', srcset: '/small.png 64w, /s.png 2x', sizes: '64px', width: '64'}, /mixes w and x descriptors/],
  [{src: '/small.png', srcset: '/small.png, /s.png 1x', width: '64'}, /repeats a descriptor/],
  [{src: '/small.png', srcset: '/small.png 64w, /s.png 64w', sizes: '64px', width: '64'}, /repeats a descriptor/],
  [{src: '/small.png', srcset: '/small.png 0x', width: '64'}, /invalid descriptor "0x"/],
  [{src: '/small.png', srcset: '/small.png 0w', sizes: '64px', width: '64'}, /invalid descriptor "0w"/],
  [{src: '/small.png', srcset: '/small.png 1.5w', sizes: '64px', width: '64'}, /invalid descriptor "1.5w"/],
  [{src: '/small.png', srcset: '/small.png 1x 2x', width: '64'}, /malformed candidate/],
  [{src: '/small.png', srcset: '/small.png 100w', sizes: '64px', width: '64'}, /is 64px wide, not 100w/],
]) {
  const found = await imageProblems(attrs);
  assert.ok(found.some(text => problem.test(text)), `${JSON.stringify(attrs)}: ${found.join('; ') || 'no failure'}`);
}
// Feed bodies resolve every URL against the post, srcset candidates included, and keep sizes only beside a srcset.
const post = new URL('https://gentoozh.org/posts/p/');
assert.equal(
  feedHtml('<p class="x"><img src="a.webp" srcset="/_astro/a-400w.webp 400w, a.webp?v=1&amp;q 800w,https://cdn.example/b.webp 900w" sizes="(min-width: 768px) 752px, 100vw" data-image-widths="400"/><a href="#top">t</a><img src="/c.png" sizes="100vw"/></p>', post),
  '<p><img src="https://gentoozh.org/posts/p/a.webp" srcset="https://gentoozh.org/_astro/a-400w.webp 400w, https://gentoozh.org/posts/p/a.webp?v=1&amp;q 800w, https://cdn.example/b.webp 900w" sizes="(min-width: 768px) 752px, 100vw"/><a href="#top">t</a><img src="https://gentoozh.org/c.png"/></p>',
);
console.log('check:code: ok');
