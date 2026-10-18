// Fixture pages for the island loaders, served from a made-up origin through request interception.
// page.ts (the loaders plus a React test control) is bundled once per worker; no site build is needed.
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {test as base, type Page} from '@playwright/test';
import {build, type Rolldown} from 'vite';

export {expect} from '@playwright/test';

const ORIGIN = 'http://islands.test';
// The smallest GIF; /slow.gif?ms=N answers after N ms and so holds the page's load event back.
const GIF = Buffer.from('R0lGODlhAQABAAAAACw=', 'base64');

async function bundle(): Promise<string> {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: fileURLToPath(new URL('.', import.meta.url)),
    // React reads NODE_ENV; library builds leave `process.env` alone.
    define: {'process.env.NODE_ENV': JSON.stringify('production')},
    build: {write: false, minify: false, lib: {entry: fileURLToPath(new URL('page.ts', import.meta.url)), formats: ['es'], fileName: 'page'}},
  });
  const [{output}] = (Array.isArray(result) ? result : [result]) as Rolldown.RolldownOutput[];
  return output[0].code;
}

interface Fixtures {
  /** Opens a page whose body is `body`; its module scripts import the loaders from '/page.js'. */
  open: (body: string) => Promise<void>;
}

export const test = base.extend<Fixtures, {bundle: string}>({
  bundle: [async ({}, use) => use(await bundle()), {scope: 'worker'}],
  open: async ({page, bundle}, use) => {
    let html = '';
    await page.route(`${ORIGIN}/**`, async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/page.js') return route.fulfill({contentType: 'text/javascript', body: bundle});
      if (url.pathname === '/slow.gif') {
        await delay(Number(url.searchParams.get('ms') ?? 0));
        return route.fulfill({contentType: 'image/gif', body: GIF});
      }
      return route.fulfill({contentType: 'text/html; charset=utf-8', body: html});
    });
    await use(async body => {
      html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>fixture</title></head><body>${body}</body></html>`;
      await page.goto(`${ORIGIN}/`);
    });
  },
});

/** A module script with page.ts's exports in scope. */
export const script = (code: string) =>
  `<script type="module">import {schedule, buttons, links, textInput, shortcut, marked, hydrated, record, manualStart, track, hydrateSearch, hydrateToggle, hydrateIsland, Throws} from '/page.js';\n${code}\n</script>`;

export const events = (page: Page) => page.evaluate(() => window.events);

/** Settles the pending start() and waits until the schedule has acted on it. */
export const finish = (page: Page, ok = true) =>
  page.evaluate(async ok => {
    await window.finish(ok);
    await window.done;
  }, ok);

/** Waits for one idle period in the page. */
export const idle = (page: Page) => page.evaluate(() => new Promise(resolve => requestIdleCallback(resolve)));
