// Check list order and offline updater parity, including pruning and hand-written-page preservation.
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseFrontmatter} from 'astro/markdown';
import {CONTRIBUTOR_GROUPS, contributorGroup, groupContributors} from '../src/content/contributorOrder.ts';
import {contributorRolesSchema} from '../src/data/schemas.ts';
import {listFiles, report} from './lib/html.mjs';

const LOCALES = ['zh-cn', 'zh-tw', 'en'];
const SCRIPT = fileURLToPath(new URL('./update-contributors.py', import.meta.url));
const baseline = JSON.parse(readFileSync(new URL('./baseline/p3-contributors.json', import.meta.url), 'utf8'));
const failures = [];

const policy = contributorRolesSchema.parse(JSON.parse(readFileSync(new URL('../data/contributor-roles.json', import.meta.url), 'utf8')));
const same = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
};
same('group display order', CONTRIBUTOR_GROUPS, policy.groupOrder);
same('unknown role', contributorGroup(['unknown']), policy.fallback.group);
const translations = {};
for (const [index, role] of policy.roles.entries()) {
  const tags = [...Object.entries(role.labels), ...role.aliases.map(alias => [alias.locale, alias.label])];
  for (const [locale, tag] of tags) {
    same(`role ${tag}`, contributorGroup([tag]), role.group);
    translations[tag] = Object.fromEntries(LOCALES.map(target => [target, target === locale ? tag : role.labels[target]]));
    for (const lower of policy.roles.slice(index + 1)) {
      for (const other of [...Object.values(lower.labels), ...lower.aliases.map(alias => alias.label)]) {
        same(`precedence ${tag} / ${other}`, contributorGroup([other, tag]), role.group);
        same(`precedence ${other} / ${tag}`, contributorGroup([tag, other]), role.group);
      }
    }
  }
}
const pythonRoles = JSON.parse(execFileSync('python3', ['-I', '-c', `
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
from contributors.roles import DEFAULT_TAGS, SPECIAL_TAGS, canonical_tag
print(json.dumps({"defaults": DEFAULT_TAGS, "translations": {
    tag: {lang: canonical_tag(tag, lang) for lang in ('zh-cn', 'zh-tw', 'en')}
    for tag in sorted(SPECIAL_TAGS)
}}))
`, dirname(SCRIPT)], {encoding: 'utf8'}));
same('Python default labels', pythonRoles.defaults, policy.fallback.labels);
same('Python role translations', pythonRoles.translations, Object.fromEntries(Object.entries(translations).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)));

// Only HTTP 404 from /users/<login> means the account is gone; rate limits, 5xx and timeouts leave the page alone.
const accountChecks = JSON.parse(execFileSync('python3', ['-I', '-c', `
import contextlib, json, subprocess, sys
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
from contributors import github
github.time.sleep = lambda seconds: None
calls = []
def answer(error):
    def run(cmd, check=True, timeout=None):
        calls.append(cmd)
        if error == 'timeout':
            raise subprocess.TimeoutExpired(cmd, timeout)
        if error:
            raise subprocess.CalledProcessError(1, cmd, output='{}', stderr=error)
        return subprocess.CompletedProcess(cmd, 0, stdout='{"login": "gz"}', stderr='')
    return run
result = {}
for name, error in [('found', None), ('404', 'gh: Not Found (HTTP 404)'), ('403', 'gh: API rate limit exceeded (HTTP 403)'),
                    ('502', 'gh: Bad Gateway (HTTP 502)'), ('timeout', 'timeout')]:
    calls.clear()
    github.run_command = answer(error)
    with contextlib.redirect_stdout(sys.stderr):
        exists = github.account_exists('gz')
        attempts = len(calls)
        gone = bool(github.fetch_user_info_online('gz').get('gone'))
    result[name] = {'exists': exists, 'calls': attempts, 'gone': gone}
print(json.dumps(result))
`, dirname(SCRIPT)], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}));
same('account check', accountChecks, {
  found: {exists: true, calls: 1, gone: false},
  404: {exists: false, calls: 1, gone: true},
  403: {exists: null, calls: 4, gone: false},
  502: {exists: null, calls: 4, gone: false},
  timeout: {exists: null, calls: 4, gone: false},
});

const root = locale => join('content', locale, 'contributors');
const logins = locale =>
  readdirSync(root(locale), {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
const frontmatter = source => parseFrontmatter(source).frontmatter;

for (const locale of LOCALES) {
  const entries = logins(locale).map(login => ({
    slug: login.toLowerCase(),
    data: frontmatter(readFileSync(join(root(locale), login, 'index.md'), 'utf8')),
  }));
  const actual = groupContributors(entries).map(({contributors}) => contributors.map(({slug}) => slug));
  baseline.order[locale].forEach((expected, section) => {
    const index = expected.findIndex((slug, position) => actual[section]?.[position] !== slug);
    if (index !== -1 || actual[section].length !== expected.length) {
      failures.push(`${locale} section ${section + 1}: expected ${expected[index] ?? 'end'} at ${index}, got ${actual[section]?.[index] ?? 'end'}`);
    }
  });
  if (actual.length !== baseline.order[locale].length) failures.push(`${locale}: ${actual.length} sections, Hugo has ${baseline.order[locale].length}`);
}

/** Every Markdown file under content/*\/contributors/, keyed by its path below content/. */
function markdown(base) {
  return new Map(
    LOCALES.flatMap(locale =>
      listFiles(join(base, root(locale)))
        .filter(url => url.endsWith('.md'))
        .map(url => [`${locale}/contributors${url}`, readFileSync(join(base, root(locale), url), 'utf8')]),
    ),
  );
}

/** Runs the script in a sandbox copy of the Markdown, answering GitHub API calls from `fixture`. */
function runScript(current, fixture, mode = ['--commits-only']) {
  const sandbox = mkdtempSync(join(tmpdir(), 'gz-contributors-'));
  const write = (path, data) => {
    mkdirSync(dirname(join(sandbox, path)), {recursive: true});
    writeFileSync(join(sandbox, path), typeof data === 'string' ? data : JSON.stringify(data));
  };
  try {
    for (const [path, source] of current) write(join('content', path), source);
    write('fixture/repos.json', fixture.repos);
    for (const [repo, list] of Object.entries(fixture.contributors)) write(`fixture/contributors/${repo}.json`, list);
    for (const [login, user] of Object.entries(fixture.users)) write(`fixture/users/${login}.json`, user);
    const args = ['-I', SCRIPT, ...mode, '--fixture', join(sandbox, 'fixture'), '--now', fixture.now];
    execFileSync('python3', args, {cwd: sandbox, encoding: 'utf8', stdio: 'pipe'});
    return markdown(sandbox);
  } catch (error) {
    failures.push(`update-contributors.py failed: ${(error.stdout ?? '').split('\n').slice(-5).join(' / ')}${error.stderr ?? error.message}`);
    return new Map();
  } finally {
    rmSync(sandbox, {recursive: true, force: true});
  }
}

function compare(label, actual, expected) {
  for (const [path, source] of expected) {
    if (!actual.has(path)) failures.push(`${label}: ${path} was removed`);
    else if (actual.get(path) !== source) failures.push(`${label}: ${path} differs`);
  }
  for (const path of actual.keys()) {
    if (!expected.has(path)) failures.push(`${label}: ${path} was added`);
  }
}

const current = markdown('.');
const stamp = /最后更新时间 (\d{4})\s*年\s*(\d{2})\s*月\s*(\d{2})\s*日 (\d{2}:\d{2}) UTC/.exec(current.get('zh-cn/contributors/_index.md'));
const now = stamp == null ? '' : `${stamp[1]}-${stamp[2]}-${stamp[3]}T${stamp[4]}`;
if (stamp == null) failures.push('zh-cn/contributors/_index.md: no update time');

// The GitHub answer that produced the current files: each page's commits per repository.
const page = login => frontmatter(current.get(`zh-cn/contributors/${login}/index.md`));
const person = (login, contributions, type = 'User') => ({login, contributions, type, avatar_url: 'file:///nonexistent'});
const answer = {};
for (const login of logins('zh-cn')) {
  for (const {repo, commits} of page(login).contributions?.repos ?? []) (answer[repo] ??= []).push(person(login, commits));
}
const repo = (name, flags = {}) => ({name, fork: false, archived: false, private: false, ...flags});
const repos = Object.keys(answer).map(name => repo(name));
compare('same data', runScript(current, {repos, contributors: answer, users: {}, now}), current);
compare('dry run', runScript(current, {repos, contributors: answer, users: {}, now}, ['--dry-run']), current);

// A deleted account loses its GitHub link on existing pages; one that exists again gets it back where the script writes it.
const linked = login => /^externalUrl: /m.test(current.get(`zh-cn/contributors/${login}/index.md`));
const gone = Object.values(answer).flat().find(({login}) => linked(login) && page(login).weight != null).login;
const restored = Object.values(answer).flat().find(({login}) => !linked(login) && page(login).weight != null)?.login;
const relinked = new Map(current);
for (const locale of LOCALES) {
  const path = login => `${locale}/contributors/${login}/index.md`;
  relinked.set(path(gone), current.get(path(gone)).replace(/^externalUrl: .*\n/m, ''));
  if (restored != null) relinked.set(path(restored), current.get(path(restored)).replace(/^weight: /m, `externalUrl: https://github.com/${restored}\nweight: `));
}
const linkUsers = {[gone]: {login: gone, gone: true}, ...(restored == null ? {} : {[restored]: {login: restored}})};
compare('deleted account', runScript(current, {repos, contributors: answer, users: linkUsers, now}), relinked);

const scripted = Object.values(answer).flat();
const dropped = scripted.find(({login}) => contributorGroup(page(login).tags) === 'overlayContributors');
const droppedRole = scripted.find(({login}) => contributorGroup(page(login).tags) !== 'overlayContributors');
const handWritten = logins('zh-cn').find(login => page(login).weight == null);
const without = list => list.filter(({login}) => login !== dropped.login && login !== droppedRole.login);
const user = {login: 'gz-fixture', name: 'Fixture: "name" ---', blog: 'example.org', social_accounts: []};
const ignored = [person('gz-ignored', 50)];
const changed = runScript(current, {
  repos: [...repos, repo('gz-repo'), repo('gz-fork', {fork: true}), repo('gz-archived', {archived: true})],
  contributors: {
    ...Object.fromEntries(Object.entries(answer).map(([name, list]) => [name, without(list)])),
    overlay: [...without(answer.overlay), person('gz-fixture', 1), person('gz-single', 1), person('gzcase', 2)],
    'gz-repo': [
      person('gz-fixture', 2),
      person('gz-helper[bot]', 40),
      person('gz-app', 40, 'Bot'),
      person('github-actions', 30),
      person('aieu', 20),
      person(handWritten.toLowerCase(), 5),
      // Logins are case-insensitive: a blocked or bot login in another case stays out, and
      // one person spelt two ways in two repositories is one page under the first spelling.
      person('claude', 7),
      person('GITHUB-ACTIONS', 4),
      person('GzCase', 3),
      {type: 'Anonymous', name: 'Nobody', email: 'nobody@example.org', contributions: 9},
    ],
    'gz-fork': ignored,
    'gz-archived': ignored,
  },
  users: {[user.login]: user},
  now,
});
const expected = new Map([...current].filter(([path]) => !path.includes(`/contributors/${dropped.login}/`)));
const newPages = {
  'gz-fixture': {title: user.name, weight: 9997, total: 3, repos: ['gz-repo', 'overlay']},
  'gz-single': {title: 'gz-single', weight: 9999, total: 1, repos: ['overlay']},
  GzCase: {title: 'GzCase', weight: 9995, total: 5, repos: ['gz-repo', 'overlay']},
};
for (const locale of LOCALES) {
  for (const [login, want] of Object.entries(newPages)) {
    const path = `${locale}/contributors/${login}/index.md`;
    const source = changed.get(path);
    const data = source == null ? {} : frontmatter(source);
    const got = {title: data.title, weight: data.weight, total: data.contributions?.total, repos: data.contributions?.repos.map(entry => entry.repo)};
    if (JSON.stringify(got) !== JSON.stringify(want)) failures.push(`new contributor: ${path} has ${JSON.stringify(data)}`);
    if (login === 'gz-fixture' && data.links?.[0]?.url !== 'https://example.org') failures.push(`new contributor: ${path} links ${JSON.stringify(data.links)}`);
    if (source != null) expected.set(path, source);
  }
}
compare('changed data', changed, expected);

// Hand-written or role pages survive pruning; updates preserve prose and accept negative weights.
const plain = scripted.filter(({login}) => contributorGroup(page(login).tags) === 'overlayContributors').map(({login}) => login);
const [bio, secondRole, big] = plain.filter(login => login !== dropped.login).slice(-3);
const edited = new Map(current);
const zhPage = login => `zh-cn/contributors/${login}/index.md`;
edited.set(zhPage(bio), current.get(zhPage(bio)).replace(/\n\n\d+ 次提交\n$/, '\n\n手写的简介\n'));
edited.set(zhPage(secondRole), current.get(zhPage(secondRole)).replace(/^tags: \[(.*)\]$/m, "tags: [$1, '社区创始人']"));
for (const locale of LOCALES) {
  const path = `${locale}/contributors/${big}/index.md`;
  edited.set(path, current.get(path).replace(/^weight: \d+$/m, 'weight: -1'));
}
const roleOwners = logins('zh-cn').filter(login => page(login).weight != null && contributorGroup(page(login).tags) !== 'overlayContributors');
const handWrittenAll = logins('zh-cn').filter(login => !/\n\n\d+ 次提交\n$/.test(current.get(zhPage(login))));
const keptAnswer = Object.fromEntries(
  Object.entries(answer).map(([name, list]) => [
    name,
    list.filter(({login}) => login !== bio && login !== secondRole).map(entry => (entry.login === big && name === 'overlay' ? {...entry, contributions: entry.contributions + 10002 - page(big).contributions.total} : entry)),
  ]),
);
const kept = runScript(edited, {repos, contributors: keptAnswer, users: {}, now});
const bigAfter = new Map();
for (const [path, source] of kept) {
  if (path.includes(`/contributors/${big}/`)) bigAfter.set(path, source);
}
compare('hand-written and role pages', new Map([...kept].filter(([path]) => !bigAfter.has(path))), new Map([...edited].filter(([path]) => !path.includes(`/contributors/${big}/`))));
for (const locale of LOCALES) {
  const source = bigAfter.get(`${locale}/contributors/${big}/index.md`) ?? '';
  const data = source === '' ? {} : frontmatter(source);
  if (data.weight !== -2 || data.contributions?.total !== 10002 || !/\n10002 (?:次提交|commits)\n$/.test(source)) {
    failures.push(`weight below zero: ${locale}/${big} has weight ${data.weight}, total ${data.contributions?.total}`);
  }
}
// A full update must preserve both hand-written prose and assigned roles.
const fullAnswer = {overlay: [...handWrittenAll, ...roleOwners].map(login => person(login, page(login).contributions?.total ?? 5))};
const fullUsers = Object.fromEntries([...handWrittenAll, ...roleOwners].map(login => [login, {login, name: `renamed ${login}`}]));
const full = runScript(current, {repos: [repo('overlay')], contributors: fullAnswer, users: fullUsers, now}, ['--skip-avatars']);
for (const login of handWrittenAll) {
  for (const locale of LOCALES) {
    const path = `${locale}/contributors/${login}/index.md`;
    const before = frontmatter(current.get(path));
    const after = full.has(path) ? frontmatter(full.get(path)) : {};
    const body = source => source.replace(/^---\n[\s\S]*?\n---\n/, '');
    if (after.title !== before.title || JSON.stringify(after.tags) !== JSON.stringify(before.tags) || JSON.stringify(after.links) !== JSON.stringify(before.links) || !full.has(path) || body(full.get(path)) !== body(current.get(path))) {
      failures.push(`full update: hand-written ${path} was rewritten`);
    }
  }
}
for (const login of roleOwners) {
  const after = full.get(zhPage(login));
  if (after == null || JSON.stringify(frontmatter(after).tags) !== JSON.stringify(page(login).tags)) failures.push(`full update: role page ${zhPage(login)} lost its role`);
}

report('check:contributors', failures);
