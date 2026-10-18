// check:runtime: one sample page per page type (scripts/lib/budgets.mjs) in a browser, on fixed data. The
// status API answers with scripts/fixtures/status.json, distfiles' `/_ls/` with the ls-server fixtures and
// its package index with a generated one, all after a fixed delay, so the real fetch, parsing and rendering
// run without the live services. Asserts the scripts requested before `load` on every type, and on status,
// files and packages, whose content is data, that status and files start before `load` rather than in idle
// time, and that the layout does not shift from the server markup until the data and the idle islands have
// arrived. Wall-clock render times are not asserted: they measure the runner as much as the page.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {brotliCompressSync} from 'node:zlib';
import type {Page, Request} from '@playwright/test';
import {listing} from '../../scripts/fixtures/ls-server.mjs';
import {PAGE_TYPES} from '../../scripts/lib/budgets.mjs';
import {PACKAGES_SOURCE} from '../../src/ui/download/packagesData';
import {STATUS_API} from '../../src/ui/support/statusApi';
import {expect, test} from './fixture';
import {live} from './hold';

/** Both services answer after this delay, roughly a cross-continent round trip. */
const LATENCY_MS = 300;
/** How long to wait for the data to render; a ceiling for slow runners, not a performance bound. */
const CONTENT_TIMEOUT_MS = 15_000;
/** Islands whose content is data and that must start at once, not in idle time. */
const STARTS_AT_ONCE = new Set(['status', 'files']);

const status = readFileSync('scripts/fixtures/status.json', 'utf8');
/** One minute after the fixture's last probe, so relative times render the same on every run. */
const NOW = (JSON.parse(status) as {updated: number}).updated * 1000 + 60_000;

/**
 * A package index in the schema build/gen-packages.py writes, long enough that the table outgrows the first
 * screen as the hourly index (about 520 packages) does; a shorter one would let the footer rise into view.
 */
function packageIndex(count: number) {
  const whys = [undefined, 'nobuild', 'prebuilt', 'live', 'candidate'];
  const packages = Array.from({length: count}, (_, index) => ({
    cp: `app-misc/fixture-${String(index).padStart(3, '0')}`,
    binhost: index % 5 === 0,
    dist: index % 3 === 0 ? ['amd64'] : [],
    ...(index % 5 === 0 ? {} : {why: whys[index % 5]}),
    ...(index % 7 === 0 ? {policy: 'weekly'} : {}),
    ver: `1.${index}.0`,
    size: 20_480 * (index + 1),
  }));
  const deps = Array.from({length: count / 4}, (_, index) => ({cp: `dev-libs/fixture-dep-${index}`, ver: `2.${index}`, slot: '0', size: 40_960}));
  return JSON.stringify({schema: 5, generated: (JSON.parse(status) as {updated: number}).updated, packages, deps});
}
const packages = packageIndex(80);

/** Text that only the data renders: a mirror host from the status fixture, a directory from ls-root.json, a package. */
const CONTENT: Record<string, {island: 'status' | 'files' | 'packages'; text: string}> = {
  status: {island: 'status', text: 'mirror.nju.edu.cn'},
  files: {island: 'files', text: 'gentoo-cjk-livecd'},
  packages: {island: 'packages', text: 'app-misc/fixture-000'},
};

/**
 * Layout shift allowed until the data and the idle islands have arrived: none, except on /files/, where the
 * loading placeholder (SKELETON_ROWS in src/ui/data/LoadingRows.tsx, 12 rows) is taller than the 5-entry root
 * listing, so the page footer rises into view when the listing replaces it (2026-10-18). Lower these when
 * fixing that.
 */
const SHIFT: Record<string, number> = {
  'status@1280': 0,
  'status@390': 0,
  'files@1280': 0.03,
  'files@390': 0.07,
  'packages@1280': 0.01,
  'packages@390': 0.01,
};

const delay = () => new Promise(resolve => setTimeout(resolve, LATENCY_MS));

async function useFixtures(page: Page) {
  await page.route(STATUS_API, async route => {
    await delay();
    await route.fulfill({status: 200, headers: {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, body: status});
  });
  await page.route(
    url => url.pathname.startsWith('/_ls/') && url.hostname !== '127.0.0.1',
    async route => {
      const answer = await listing(new URL(route.request().url()).pathname);
      if (answer == null) return;
      await delay();
      await route.fulfill(answer);
    },
  );
  for (const url of Object.values(PACKAGES_SOURCE)) {
    await page.route(url, async route => {
      await delay();
      await route.fulfill({status: 200, headers: {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, body: packages});
    });
  }
  // Freeze Date only: Playwright's clock also replaces `performance`, whose marks the scheduler sets
  // and these checks read, so the page keeps the real one.
  await page.addInitScript(() => {
    window.realPerformance = performance;
  });
  await page.clock.setFixedTime(NOW);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'performance', {value: window.realPerformance, configurable: true, writable: true});
    // Room for every resource timing, so a page with many images cannot push out the scripts counted below.
    performance.setResourceTimingBufferSize(100_000);
    // Layout shifts without recent input, summed from the first paint.
    window.layoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & {value: number; hadRecentInput: boolean})[]) {
        if (!entry.hadRecentInput) window.layoutShift += entry.value;
      }
    }).observe({type: 'layout-shift', buffered: true});
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '*, *::before, *::after { animation-play-state: paused !important; }';
      document.head.append(style);
    });
  });
}

declare global {
  interface Window {
    layoutShift: number;
    realPerformance: Performance;
  }
}

/**
 * Records the same-origin scripts `page` requests; call before `page.goto`. After `load`, the returned function
 * waits for every script requested so far to finish, since a dynamic import does not hold up `load` and its
 * resource timing appears only once its body has arrived, then returns those whose request started before
 * `loadEventStart`, both read from the page's own clock.
 */
function recordScripts(page: Page, origin: string) {
  const requests: Request[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname.endsWith('.js')) requests.push(request);
  });
  return async () => {
    // Read the list after the page has reached `load`, so every request it made before then is in it.
    await page.evaluate(() => performance.getEntriesByType('navigation')[0]);
    const urls: string[] = [];
    await Promise.all(
      requests.map(async request => {
        const response = await request.response();
        if (response != null && (await response.finished()) == null) urls.push(request.url());
      }),
    );
    await expect.poll(() => page.evaluate(names => names.every(name => performance.getEntriesByName(name).length > 0), urls), {message: 'resource timings of the finished scripts'}).toBe(true);
    return page.evaluate(() => {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return performance
        .getEntriesByType('resource')
        .filter(entry => entry.startTime < navigation.loadEventStart && new URL(entry.name).origin === location.origin && new URL(entry.name).pathname.endsWith('.js'))
        .map(entry => new URL(entry.name).pathname);
    });
  };
}

const brotli = new Map<string, number>();
const brotliSize = (path: string) => {
  if (!brotli.has(path)) brotli.set(path, brotliCompressSync(readFileSync(join('dist', path))).length);
  return brotli.get(path)!;
};

for (const viewport of [
  {width: 1280, height: 800},
  {width: 390, height: 844},
]) {
  test.describe(`@${viewport.width}`, () => {
    test.use({viewport, contextOptions: {reducedMotion: 'reduce'}});

    for (const type of PAGE_TYPES) {
      test(`${type.name} (${type.sample})`, async ({page, siteURL}) => {
        await useFixtures(page);
        const scriptsBeforeLoad = recordScripts(page, new URL(siteURL).origin);
        await page.goto(type.sample, {waitUntil: 'load'});

        const content = CONTENT[type.name];
        if (content != null && STARTS_AT_ONCE.has(content.island)) {
          const startedBeforeLoad = await page.evaluate(island => {
            const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            const [start] = performance.getEntriesByName(`gz-island:${island}:start`);
            return start != null && start.startTime < navigation.loadEventStart;
          }, content.island);
          expect(startedBeforeLoad, `${content.island} starts before load`).toBe(true);
        }

        const scripts = [...new Set(await scriptsBeforeLoad())];
        const bytes = scripts.reduce((sum, path) => sum + brotliSize(path), 0);
        const cap = type.beforeLoad ?? type.startup;
        expect(bytes, `scripts before load (brotli): ${scripts.join(', ')}`).toBeLessThanOrEqual(cap);

        if (content == null) return;
        await expect(page.locator(`[data-gz-island="${content.island}"]`).getByText(content.text).filter({visible: true}).first()).toBeVisible({timeout: CONTENT_TIMEOUT_MS});
        // The navigation and the sidebar hydrate when idle, after the data on a fast connection.
        await live(page, 'nav');
        await live(page, 'section');
        await page.evaluate(() => new Promise(requestAnimationFrame));
        expect(await page.evaluate(() => window.layoutShift)).toBeLessThanOrEqual(SHIFT[`${type.name}@${viewport.width}`]);
      });
    }
  });
}

// Negative control: a dynamic import started before `load` and still downloading when it fires is counted.
test('a script still downloading at load counts as requested before it', async ({page, siteURL}) => {
  const late = '/__runtime-control/late.js';
  await page.route(new URL('/__runtime-control/', siteURL).href, route =>
    route.fulfill({contentType: 'text/html', body: `<!doctype html><title>control</title><script type="module">import('${late}');</script>`}),
  );
  await page.route(new URL(late, siteURL).href, async route => {
    await new Promise(resolve => setTimeout(resolve, 1_000));
    await route.fulfill({contentType: 'text/javascript', body: 'export {};'});
  });
  const scriptsBeforeLoad = recordScripts(page, new URL(siteURL).origin);
  await page.goto('/__runtime-control/', {waitUntil: 'load'});
  // The response is still pending at `load`, so a sample taken now has no timing for it.
  expect(await page.evaluate(name => performance.getEntriesByName(name).length, new URL(late, siteURL).href)).toBe(0);
  expect(await scriptsBeforeLoad()).toEqual([late]);
});
