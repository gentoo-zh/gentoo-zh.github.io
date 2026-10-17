// Build with `pnpm build`, serve with `pnpm preview --host 127.0.0.1 --port 4430`,
// then run `node scripts/tests/card-clicks.mjs` (optional PREVIEW_URL).
// Browser tests are not part of `pnpm check`; Playwright comes from the desktop runtime.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';

const {chromium} = createRequire('/opt/chatgpt-desktop/resources/cua_node/lib/node_modules/x.js')('playwright');
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4430';
const gestures = {
  plain: {},
  ctrl: {modifiers: ['Control']},
  meta: {modifiers: ['Meta']},
  shift: {modifiers: ['Shift']},
  middle: {button: 'middle'},
};

await test('built preview card clicks', async t => {
  const browser = await chromium.launch({executablePath: '/usr/bin/google-chrome-stable', args: ['--no-sandbox']});
  try {
    for (const gesture of [...Object.keys(gestures), 'inner button', 'inner link', 'text selection']) {
      await t.test(`static: ${gesture}`, async () => {
        const context = await browser.newContext();
        try {
          const activations = [];
          await context.exposeBinding('recordCardActivation', (_, type) => activations.push(type));
          await context.addInitScript(() => {
            const open = window.open;
            window.open = function (...args) {
              window.recordCardActivation('open');
              return open.apply(this, args);
            };
            const click = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () {
              if (this.matches('.astryx-card > a')) window.recordCardActivation('anchor');
              return click.call(this);
            };
          });
          const page = await context.newPage();
          await page.goto(base, {waitUntil: 'networkidle'});
          const card = page.locator('[aria-labelledby="home-posts"] .astryx-clickable-card').first();
          await card.waitFor();
          const href = await card.locator(':scope > a').evaluate(link => link.href);
          const pages = [];
          const navigations = [];
          context.on('page', popup => pages.push(popup));
          page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) navigations.push(frame.url());
          });
          // Keep destination requests local while exercising real browser navigation and tabs.
          await context.route('**/*', route => route.request().isNavigationRequest()
            ? route.fulfill({contentType: 'text/html', body: '<!doctype html><title>Card destination</title>'})
            : route.continue());

          if (gesture.startsWith('inner ')) {
            const tag = gesture === 'inner button' ? 'button' : 'a';
            await card.evaluate((node, tag) => {
              const control = document.createElement(tag);
              control.textContent = 'Inner control';
              control.dataset.testControl = '';
              if (tag === 'a') control.href = '#inner-control';
              control.addEventListener('click', () => window.recordCardActivation('control'));
              node.append(control);
            }, tag);
            await card.locator('[data-test-control]').click();
          } else if (gesture === 'text selection') {
            await card.evaluate(node => {
              const text = document.createTextNode('Selectable card text');
              node.append(text);
              const range = document.createRange();
              range.selectNode(text);
              window.getSelection().removeAllRanges();
              window.getSelection().addRange(range);
              node.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
            });
            assert.equal(await page.evaluate(() => window.getSelection().toString()), 'Selectable card text');
          } else {
            // The corner is card padding, away from the visually hidden anchor and inner controls.
            await card.click({position: {x: 8, y: 8}, ...gestures[gesture]});
          }

          // Allow late duplicate opens to arrive before counting all browser outcomes.
          await new Promise(resolve => setTimeout(resolve, 350));
          if (gesture.startsWith('inner ') || gesture === 'text selection') {
            assert.deepEqual(activations, gesture.startsWith('inner ') ? ['control'] : []);
            assert.equal(pages.length, 0);
            assert.deepEqual(navigations, gesture === 'inner link' ? [new URL('/#inner-control', base).href] : []);
          } else {
            assert.equal(activations.length, 1, `forwarded activations: ${activations}`);
            assert.equal(navigations.length + pages.length, 1, `navigations: ${navigations}; tabs: ${pages.length}`);
            if (gesture === 'plain') assert.equal(navigations.length, 1);
            if (['ctrl', 'meta', 'middle'].includes(gesture)) assert.equal(pages.length, 1);
            if (pages.length) {
              await pages[0].waitForLoadState('domcontentloaded');
              assert.equal(pages[0].url(), href);
            } else {
              assert.deepEqual(navigations, [href]);
            }
          }
        } finally {
          await context.close();
        }
      });
    }
  } finally {
    await browser.close();
  }
});
