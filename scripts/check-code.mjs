// Run with pnpm check:code.
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {codeTokenizer} from '../src/markdown/codeTokenizer.ts';
import {rewriteCode} from '../src/ui/start/guideSetup.ts';
import {crumbsOf, dirPath, directoryOf, fileUrl, formatSize, listingUrl, parentOf} from '../src/ui/download/filesData.ts';

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
assert.equal(formatSize(512, 'en'), '512 B');
assert.equal(formatSize(1021231104, 'zh-CN'), '973.9 MiB');
console.log('check:code: ok');
