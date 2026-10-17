// Records the costs page of a Hugo build of master into scripts/baseline/costs.json, cell by cell.
// Usage: node scripts/baseline-costs.mjs <hugo-output-dir> <master-sha>
import {writeFileSync} from 'node:fs';
import {decodeEntities, readPage} from './lib/html.mjs';

const [root, masterSha] = process.argv.slice(2);
if (root == null || !/^[0-9a-f]{40}$/.test(masterSha ?? '')) {
  console.error('usage: node scripts/baseline-costs.mjs <hugo-output-dir> <master-sha>');
  process.exit(2);
}

const PAGES = {'zh-cn': '/costs/', 'zh-tw': '/zh-tw/costs/', en: '/en/costs/'};
/** Tables are told apart by column count: specs 4, ledger 5, retired 6. */
const TABLES = {4: 'specs', 5: 'ledger', 6: 'retired'};

const textOf = html => decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const cells = (html, tag) => [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(match => textOf(match[1]));
const rows = (html, tag) => [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(match => cells(match[1], tag));
const section = (html, tag) => new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(html)?.[1] ?? '';

const pages = {};
for (const [locale, url] of Object.entries(PAGES)) {
  const html = readPage(root, url);
  if (html == null) throw new Error(`${url} missing under ${root}`);
  const page = {
    asOf: /gz-stats-note">[^<]*?(\d{4}-\d{2}-\d{2})/.exec(html)[1],
    stats: [...html.matchAll(/<div class="gz-stat">([\s\S]*?)<\/div>/g)].map(match =>
      cells(match[1], 'span').filter((_, index) => index > 0),
    ),
  };
  for (const table of html.match(/<table>[\s\S]*?<\/table>/g)) {
    const name = TABLES[cells(section(table, 'thead'), 'th').length];
    page[name] = {rows: rows(section(table, 'tbody'), 'td'), foot: rows(section(table, 'tfoot'), 'th')[0] ?? null};
  }
  pages[locale] = page;
}

writeFileSync(new URL('./baseline/costs.json', import.meta.url), `${JSON.stringify({masterSha, pages}, null, 2)}\n`);
