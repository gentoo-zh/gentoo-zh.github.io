// Keep the command name for callers; cutover replaces byte parity with URL compatibility.
import {existsSync, readFileSync} from 'node:fs';
import {fileFor, readPage, refreshTarget, report} from './lib/html.mjs';
import {RETIRED_REDIRECTS} from './lib/retired-posts.mjs';

const ORIGIN = 'https://gentoozh.org';
const baseline = JSON.parse(readFileSync(new URL('./baseline/hugo.json', import.meta.url), 'utf8'));
const assets = JSON.parse(readFileSync(new URL('./baseline/historical-assets.json', import.meta.url), 'utf8'));
const failures = [];

for (const url of new Set([...baseline.pages, ...assets.files])) {
  if (!existsSync(fileFor('dist', url))) failures.push(`missing historical URL ${url}`);
  else if (Object.hasOwn(RETIRED_REDIRECTS, url)) {
    // A retired post survives as a permanent redirect, not as the page Hugo served.
    const actual = refreshTarget(readPage('dist', url));
    const expected = new URL(RETIRED_REDIRECTS[url], ORIGIN).href;
    if (actual == null || new URL(actual, ORIGIN).href !== expected) failures.push(`retired post ${url}: expected redirect to ${expected}, got ${actual ?? 'none'}`);
  }
}

report('check:content-parity', failures);
