// Serve scripts/fixtures/ls-*.json as distfiles' `/_ls/<dir>` for /files/ in development:
//   node scripts/fixtures/ls-server.mjs 8301
//   PUBLIC_DISTFILES_ORIGIN=http://127.0.0.1:8301 pnpm build
// `/_ls/a/b/` reads ls-a.b.json and `/_ls/` reads ls-root.json; `/_ls/slow/` never answers.
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';

const port = Number(process.argv[2] ?? 8301);
const fixtures = new URL('./', import.meta.url);

createServer(async (request, response) => {
  const {pathname} = new URL(request.url, 'http://fixture');
  const cors = {'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache'};
  if (pathname === '/_ls/slow/') return;
  const dir = /^\/_ls\/((?:[^/]+\/)*)$/.exec(decodeURIComponent(pathname))?.[1];
  const name = dir === '' ? 'root' : dir?.slice(0, -1).replaceAll('/', '.');
  try {
    if (name == null || name.includes('..')) throw new Error('not a listing');
    const body = await readFile(new URL(`ls-${name}.json`, fixtures));
    response.writeHead(200, {...cors, 'Content-Type': 'application/json'}).end(body);
  } catch {
    response.writeHead(404, {...cors, 'Content-Type': 'text/plain'}).end('404 Not Found\n');
  }
}).listen(port, '127.0.0.1', () => console.log(`ls fixtures on http://127.0.0.1:${port}`));
