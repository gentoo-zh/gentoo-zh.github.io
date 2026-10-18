// Serve scripts/fixtures/ls-*.json as distfiles' `/_ls/<dir>` for /files/ in development:
//   node scripts/fixtures/ls-server.mjs 8301
//   PUBLIC_DISTFILES_ORIGIN=http://127.0.0.1:8301 pnpm build
// `/_ls/a/b/` reads ls-a.b.json and `/_ls/` reads ls-root.json; `/_ls/slow/` never answers.
// check:runtime answers the built site's distfiles requests with `listing` in the browser.
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';

const fixtures = new URL('./', import.meta.url);
const cors = {'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache'};

/** The response to `pathname`: a listing, a 404, or `null` for `/_ls/slow/`, which never answers. */
export async function listing(pathname) {
  if (pathname === '/_ls/slow/') return null;
  const dir = /^\/_ls\/((?:[^/]+\/)*)$/.exec(decodeURIComponent(pathname))?.[1];
  const name = dir === '' ? 'root' : dir?.slice(0, -1).replaceAll('/', '.');
  try {
    if (name == null || name.includes('..')) throw new Error('not a listing');
    const body = await readFile(new URL(`ls-${name}.json`, fixtures));
    return {status: 200, headers: {...cors, 'Content-Type': 'application/json'}, body};
  } catch {
    return {status: 404, headers: {...cors, 'Content-Type': 'text/plain'}, body: '404 Not Found\n'};
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 8301);
  createServer(async (request, response) => {
    const answer = await listing(new URL(request.url, 'http://fixture').pathname);
    if (answer != null) response.writeHead(answer.status, answer.headers).end(answer.body);
  }).listen(port, '127.0.0.1', () => console.log(`ls fixtures on http://127.0.0.1:${port}`));
}
