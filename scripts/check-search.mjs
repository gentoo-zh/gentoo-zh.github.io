// Search: Pagefind built one index per site language, each non-empty and within budget.
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {report} from './lib/html.mjs';

const PAGEFIND = 'dist/pagefind';
const LANGUAGES = ['zh-cn', 'zh-tw', 'en'];
/** Index chunks, fragments and metadata of one language; a reader downloads only the parts a query needs. */
const BUDGET = 512 * 1024;
const failures = [];

const entryFile = join(PAGEFIND, 'pagefind-entry.json');
const entry = existsSync(entryFile) ? JSON.parse(readFileSync(entryFile, 'utf8')) : {languages: {}};
if (!existsSync(entryFile)) failures.push(`${entryFile} is missing; run pnpm build`);

const languages = Object.keys(entry.languages).sort();
if (JSON.stringify(languages) !== JSON.stringify([...LANGUAGES].sort())) {
  failures.push(`indexed languages are ${languages.join(', ') || 'none'}, expected ${LANGUAGES.join(', ')}`);
}

const files = dir => (existsSync(join(PAGEFIND, dir)) ? readdirSync(join(PAGEFIND, dir)).map(name => join(dir, name)) : []);
const all = [...readdirSync(PAGEFIND), ...files('index'), ...files('fragment')];
for (const language of LANGUAGES) {
  const {page_count: pages = 0} = entry.languages[language] ?? {};
  if (pages === 0) failures.push(`${language}: no pages indexed`);
  const own = all.filter(path => /(^|\/)(pagefind\.)?([\w-]+)_[0-9a-f]+\.pf_\w+$/.exec(path)?.[3] === language);
  const bytes = own.reduce((sum, path) => sum + statSync(join(PAGEFIND, path)).size, 0);
  if (bytes > BUDGET) failures.push(`${language}: index is ${bytes} B, budget ${BUDGET} B`);
  console.log(`check:search: ${language} ${pages} pages, ${own.length} files, ${bytes} B`);
}

report('check:search', failures);
