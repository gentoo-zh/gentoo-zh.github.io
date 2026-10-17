// After pnpm build: TMPDIR=<external-artifact-directory> node scripts/tests/content-parity.mjs
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeEntities, fileFor} from '../lib/html.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'content-compatibility-'));
const baseline = JSON.parse(readFileSync(join(repo, 'scripts/baseline/hugo.json'), 'utf8'));
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const heading = '<h2 id="cutover-probe"><a href="#cutover-probe">Probe</a></h2>';
const pageFile = url => fileFor(join(temp, 'dist'), url);
const write = (path, text) => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, text);
};
const check = (script, expected, message = '') => {
  const result = spawnSync(process.execPath, [join(repo, `scripts/${script}.mjs`)], {cwd: temp, encoding: 'utf8'});
  assert.equal(result.status, expected, result.stdout + result.stderr);
  assert.ok(result.stderr.includes(message), result.stderr);
};
const pass = label => {
  check('check-content-parity', 0);
  check('check-urls', 0);
  console.log(`PASS ${label}`);
};
const reject = (path, mutate, script, message, label) => {
  const original = readFileSync(path);
  try {
    mutate(original.toString());
    check(script, 1, message);
    console.log(`PASS rejects ${label}`);
  } finally {
    writeFileSync(path, original);
  }
};
const withoutId = (html, id) => html.replace(/\sid="([^"]+)"/g, (attribute, value) => decodeEntities(value) === id ? '' : attribute);

try {
  for (const dir of ['content', 'dist']) cpSync(join(repo, dir), join(temp, dir), {recursive: true});
  pass('unmodified build');

  // These fixtures adapt built output and source together without rebuilding the UI.
  for (const [feed, channel] of Object.entries(baseline.feeds)) {
    const locale = channel.language.toLowerCase();
    const slug = '2099-01-01-cutover-probe';
    const link = new URL(`posts/${slug}/`, channel.link).href;
    write(join(temp, `content/${locale}/posts/${slug}/index.md`), '---\ntitle: Cutover probe\ndescription: Test fixture\ndate: 2099-01-01\n---\n\n## Probe {#cutover-probe}\n\nNew post.\n');
    write(pageFile(new URL(link).pathname), `<html><body><h1>Cutover probe</h1>${heading}<p>New post.</p></body></html>`);
    const item = `<item><title>Cutover probe</title><link>${link}</link><pubDate>Thu, 01 Jan 2099 00:00:00 GMT</pubDate><guid>${link}</guid><description>${escape(heading + '<p>New post.</p>')}</description></item>`;
    const path = pageFile(feed);
    writeFileSync(path, readFileSync(path, 'utf8').replace('<item>', `${item}<item>`));
    pass(`new ${locale} post`);
  }

  const old = '/en/posts/2026-09-30-distfiles-site-redo/';
  const source = join(temp, `content/en${old.slice(3)}index.md`);
  writeFileSync(source, readFileSync(source, 'utf8').replace(/^title:.*$/m, 'title: Edited title') + '\n## Probe {#cutover-probe}\n\nEdited text.\n');
  writeFileSync(pageFile(old), readFileSync(pageFile(old), 'utf8').replace('</body>', `${heading}<p>Edited text.</p></body>`));
  const feedFile = pageFile('/en/feed.xml');
  const oldLink = `https://gentoozh.org${old}`;
  writeFileSync(feedFile, readFileSync(feedFile, 'utf8').replace(/<item>[\s\S]*?<\/item>/g, item => item.includes(`<link>${oldLink}</link>`)
    ? item.replace(/<title>[\s\S]*?<\/title>/, '<title>Edited title</title>').replace('</description>', `${escape(heading + '<p>Edited text.</p>')}</description>`)
    : item));
  pass('old post title/text edit and added heading');

  reject(pageFile(old), () => unlinkSync(pageFile(old)), 'check-content-parity', `missing historical URL ${old}`, 'deleted old post URL');
  const attachment = baseline.pages.find(url => /\/posts\/.*\.webp$/.test(url));
  reject(pageFile(attachment), () => unlinkSync(pageFile(attachment)), 'check-content-parity', `missing historical URL ${attachment}`, 'deleted attachment');
  const asset = '/img/logo-horizontal.svg';
  reject(pageFile(asset), () => unlinkSync(pageFile(asset)), 'check-content-parity', `missing historical URL ${asset}`, 'deleted public image');
  const id = baseline.headings[old][0];
  reject(pageFile(old), html => writeFileSync(pageFile(old), withoutId(html, id)), 'check-urls', 'missing historical heading ids:', 'deleted Hugo heading anchor');
  const historical = JSON.parse(readFileSync(join(repo, 'scripts/baseline/historical-fragments.json'), 'utf8'));
  const [path, fragments] = Object.entries(historical.pages).find(([path]) => path === '/en/contributing/');
  reject(pageFile(path), html => writeFileSync(pageFile(path), withoutId(html, fragments[0])), 'check-urls', `missing historical fragment #${fragments[0]}`, 'deleted historical page anchor');

  const feedReject = (mutate, message, label) => reject(feedFile, xml => writeFileSync(feedFile, mutate(xml)), 'check-urls', message, label);
  feedReject(xml => xml.replace(/<item>[\s\S]*?<\/item>/, ''), 'items differ from current posts', 'missing feed post');
  feedReject(xml => xml.replace(/<item>[\s\S]*?<\/item>/g, item => item.includes(`<link>${oldLink}</link>`) ? '' : item), `Hugo feed item ${oldLink} is missing`, 'missing Hugo feed item');
  feedReject(xml => xml.replace(/<item>[\s\S]*?<\/item>/, '$&$&'), 'items differ from current posts', 'duplicate feed post');
  feedReject(xml => xml.replace(/(<item>[\s\S]*?<\/item>)(\s*)(<item>[\s\S]*?<\/item>)/, '$3$2$1'), 'items differ from current posts', 'feed order');
  feedReject(xml => xml.replace(/<pubDate>[^<]+/, '<pubDate>invalid'), 'pubDate missing or invalid', 'invalid feed date');
  feedReject(xml => xml.replace('<link>https://gentoozh.org/en/posts/', '<link>/en/posts/'), 'expected an absolute site URL', 'relative feed link');
  feedReject(xml => xml.replace(/(<item>[\s\S]*?<description>)[\s\S]*?<\/description>/, '$1</description>'), 'description is empty', 'empty feed body');
  feedReject(xml => xml.replace('id=&quot;cutover-probe&quot;', ''), 'description lacks #cutover-probe', 'missing new feed heading anchor');
  feedReject(xml => xml.replace('&lt;p&gt;New post.', '&lt;p&gt;&lt;img src=&quot;relative.png&quot;&gt;New post.'), 'relative address relative.png', 'relative feed body image');
  feedReject(xml => xml.replace('<language>en</language>', '<language>zh-CN</language>'), 'language: expected en', 'changed feed channel');
  pass('restored fixtures');
} finally {
  rmSync(temp, {recursive: true, force: true});
}
