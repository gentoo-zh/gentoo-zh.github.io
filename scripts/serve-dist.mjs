// Serve the built site the way Workers static assets do (wrangler.jsonc: auto trailing slash, 404 page),
// Brotli-compressing text like the edge, for the browser tests and local Lighthouse runs.
// Usage: node scripts/serve-dist.mjs [port] [directory]; port 0 (the default) picks a free one.
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {brotliCompressSync, constants} from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};
const COMPRESSIBLE = /^(?:text\/|application\/(?:json|xml|wasm)|image\/svg\+xml)/;

async function fileAt(path) {
  try {
    return (await stat(path)).isFile() ? path : null;
  } catch {
    return null;
  }
}

/** Starts the server; resolves with its origin and a `close` that stops it. */
export async function serveDist({root = 'dist', port = 0, host = '127.0.0.1'} = {}) {
  const base = resolve(root);
  const compressed = new Map();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const path = join(base, pathname);
    if (path !== base && !path.startsWith(base + sep)) return response.writeHead(403).end();
    let file = pathname.endsWith('/') ? await fileAt(join(path, 'index.html')) : await fileAt(path);
    if (file == null && !pathname.endsWith('/') && (await fileAt(join(path, 'index.html'))) != null) {
      return response.writeHead(307, {location: `${url.pathname}/${url.search}`}).end();
    }
    const status = file == null ? 404 : 200;
    file ??= await fileAt(join(base, '404.html'));
    if (file == null) return response.writeHead(404).end();
    const type = TYPES[extname(file)] ?? 'application/octet-stream';
    const headers = {
      'content-type': type,
      'cache-control': pathname.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    };
    let body = await readFile(file);
    if (COMPRESSIBLE.test(type) && /\bbr\b/.test(request.headers['accept-encoding'] ?? '')) {
      if (!compressed.has(file)) compressed.set(file, brotliCompressSync(body, {params: {[constants.BROTLI_PARAM_QUALITY]: 11}}));
      body = compressed.get(file);
      headers['content-encoding'] = 'br';
      headers.vary = 'accept-encoding';
    }
    headers['content-length'] = body.length;
    response.writeHead(status, headers).end(request.method === 'HEAD' ? undefined : body);
  });
  await new Promise((done, fail) => server.once('error', fail).listen(port, host, done));
  const address = server.address();
  return {
    url: `http://${host}:${address.port}`,
    close: () =>
      new Promise(done => {
        server.close(() => done());
        server.closeAllConnections();
      }),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {url} = await serveDist({port: Number(process.argv[2] ?? 0), root: process.argv[3] ?? 'dist'});
  console.log(`serving ${resolve(process.argv[3] ?? 'dist')} at ${url}`);
}
