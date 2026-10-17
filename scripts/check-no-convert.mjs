// Locale text is authored directly; reject script-conversion dependencies.
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {report} from './lib/html.mjs';

const BANNED = /opencc|sync_to_tw/i;
// Posts may discuss these tools; documentation names the rule itself.
const EXEMPT = /^(content|docs)\/|^scripts\/check-no-convert\.mjs$/;

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {encoding: 'utf8'})
  .split('\n')
  .filter(path => path && !EXEMPT.test(path) && existsSync(path));
const failures = files.filter(path => BANNED.test(path) || BANNED.test(readFileSync(path, 'utf8'))).map(path => `${path}: mentions a conversion tool`);

report('check:no-convert', failures);
