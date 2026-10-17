import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';

const response = execFileSync('gh', ['api', '-i', 'repos/gentoo-zh/overlay/commits?per_page=1'], {encoding: 'utf8', timeout: 15000});
const link = /^link:\s*(.+)$/im.exec(response)?.[1];
const last = link?.split(',').find(part => /rel="last"/.test(part));
const url = last?.match(/<([^>]+)>/)?.[1];
const commits = url ? Number(new URL(url).searchParams.get('page')) : NaN;
if (!Number.isSafeInteger(commits) || commits < 1) throw new Error('GitHub did not return a valid last-page commit count');
const stats = {commits, updated: new Date().toISOString()};
writeFileSync(new URL('../src/data/overlay-stats.json', import.meta.url), `${JSON.stringify(stats, null, 2)}\n`);
console.log(`${commits} overlay commits (${stats.updated})`);
