// src/ui/islands/schedule.ts: when an island starts.
import {events, expect, finish, idle, script, test} from './fixture';

test('several conditions race and the island starts once', async ({open, page}) => {
  await open(`<div id="root"><button data-control="menu">Menu</button></div>${script(`
    const root = document.getElementById('root');
    track(schedule('nav', [
      {kind: 'visible', target: [root]},
      {kind: 'idle'},
      {kind: 'intent', on: buttons(root, marked('data-control'))},
    ], manualStart()));`)}`);
  // The button is in view, so `visible` wins; idle time and a press while loading must not start it again.
  await expect.poll(() => events(page)).toEqual(['start']);
  await idle(page);
  await page.hover('button');
  await finish(page);
  expect(await events(page)).toEqual(['start', 'ready']);
});

for (const variant of ['requestIdleCallback', 'its timer fallback'] as const) {
  test(`idle never starts before the load event, with ${variant}`, async ({open, page}) => {
    // An idle callback that fires at once would start the island while the slow image still holds `load` back.
    const stub = variant === 'requestIdleCallback' ? 'window.requestIdleCallback = callback => setTimeout(callback, 0);' : 'delete window.requestIdleCallback; delete Window.prototype.requestIdleCallback;';
    await open(`<script>${stub}</script><img src="/slow.gif?ms=600" alt="">${script(`
      track(schedule('status', [{kind: 'idle'}], () => {
        record('start ' + document.readyState);
        window.startedAt = performance.now();
        return Promise.resolve();
      }));`)}`);
    await page.evaluate(() => window.done);
    expect(await events(page)).toEqual(['start complete', 'ready']);
    const [startedAt, loadEventStart] = await page.evaluate(() => [
      (window as unknown as {startedAt: number}).startedAt,
      (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventStart,
    ]);
    expect(startedAt).toBeGreaterThanOrEqual(loadEventStart);
  });
}

// An island root is `display: contents` and never intersects; the schedule watches its children instead.
const belowTheFold = `<div style="height: 300vh"></div><div id="root" style="display: contents"><section id="pane" style="height: 4em">Pane</section></div>`;

test('visible observes the layout boxes inside a display: contents root', async ({open, page}) => {
  await open(`${belowTheFold}${script(`
    track(schedule('guide', [{kind: 'visible', target: [document.getElementById('root')]}], manualStart()));`)}`);
  await idle(page);
  expect(await events(page)).toEqual([]);
  await page.locator('#pane').scrollIntoViewIfNeeded();
  await expect.poll(() => events(page)).toEqual(['start']);
  await finish(page);
  expect(await events(page)).toEqual(['start', 'ready']);
});

test('visible with no layout box to watch starts in idle time', async ({open, page}) => {
  await open(`<div id="root" style="display: contents"></div>${script(`
    window.requestIdleCallback = callback => setTimeout(() => { record('idle'); callback(); }, 0);
    track(schedule('outline', [{kind: 'visible', target: [document.getElementById('root')]}], manualStart()));`)}`);
  await expect.poll(() => events(page)).toEqual(['idle', 'start']);
});

test('visibleThenIdle waits for the view, then for idle time', async ({open, page}) => {
  await open(`${belowTheFold}${script(`
    window.requestIdleCallback = callback => setTimeout(() => { record('idle'); callback(); }, 0);
    track(schedule('packages', [{kind: 'visibleThenIdle', target: [document.getElementById('root')]}], manualStart()));`)}`);
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
  expect(await events(page)).toEqual([]);
  await page.locator('#pane').scrollIntoViewIfNeeded();
  await expect.poll(() => events(page)).toEqual(['idle', 'start']);
});

test('a failed start releases what it held and replays nothing', async ({open, page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => void (message.type() === 'error' && errors.push(message.text())));
  await open(`<div id="root"><a href="#next" data-control="menu">Menu</a></div>${script(`
    const root = document.getElementById('root');
    document.addEventListener('click', event => record('click ' + (event.isTrusted ? 'native' : 'replayed')));
    track(schedule('nav', [{kind: 'intent', on: buttons(root, marked('data-control'))}], manualStart()));`)}`);
  await page.click('a');
  await expect.poll(() => events(page)).toEqual(['start']);
  expect(await page.evaluate(() => location.hash)).toBe('');
  await finish(page, false);
  expect(await events(page)).toEqual(['start', 'failed']);
  // The link works natively again, and the schedule does not retry.
  await page.click('a');
  expect(await events(page)).toEqual(['start', 'failed', 'click native']);
  expect(await page.evaluate(() => location.hash)).toBe('#next');
  // Logged once by the schedule, with no unhandled rejection although nothing else awaits it.
  expect(errors).toEqual([expect.stringContaining('gz-island:nav: failed to start')]);
});

test.describe('hydrateIsland', () => {
  test('a component that throws while hydrating fails the start, which releases held input', async ({open, page}) => {
    await open(`<div id="root" data-gz-island="section" data-props="{}"><a href="#group" data-group="docs">Docs</a></div>${script(`
      const root = document.getElementById('root');
      // Hydration waits for the test, so the click is held before the island breaks.
      track(schedule('section', [{kind: 'intent', on: links(root, marked('data-group'))}], () => {
        record('start');
        return new Promise(go => { window.finish = go; }).then(() => hydrateIsland('section', Throws, 'x-'));
      }));`)}`);
    await page.click('a');
    await expect.poll(() => events(page)).toEqual(['start']);
    expect(await page.evaluate(() => location.hash)).toBe('');
    await finish(page);
    expect(await events(page)).toEqual(['start', 'failed']);
    // Released: the held click followed its link, although the failed root removed it.
    expect(await page.evaluate(() => location.hash)).toBe('#group');
  });

  test('a missing container fails the start', async ({open, page}) => {
    await open(`<p>No island</p>${script(`
      track(schedule('costs', [{kind: 'now'}], () => hydrateIsland('costs', Throws, 'x-')));`)}`);
    await page.evaluate(() => window.done);
    expect(await events(page)).toEqual(['failed']);
  });
});
