// Keep the command name for callers; cutover replaces byte parity with URL compatibility.
import {existsSync, readFileSync} from 'node:fs';
import {fileFor, report} from './lib/html.mjs';

const baseline = JSON.parse(readFileSync(new URL('./baseline/hugo.json', import.meta.url), 'utf8'));
const assets = JSON.parse(readFileSync(new URL('./baseline/historical-assets.json', import.meta.url), 'utf8'));
const failures = [];

for (const url of new Set([...baseline.pages, ...assets.files])) {
  if (!existsSync(fileFor('dist', url))) failures.push(`missing historical URL ${url}`);
}

report('check:content-parity', failures);
