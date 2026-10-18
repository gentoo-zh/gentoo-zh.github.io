// The top navigation is server-rendered and loads its script on first use: a press that lands before
// the island mounts must still open what it would have opened, once, without leaving the page.
// Ten interactions on six page types, at phone and desktop widths.
import {setTimeout as delay} from 'node:timers/promises';
import type {Page} from '@playwright/test';
import {expect, test} from './fixture';

const PAGES = [
  '/',
  '/gentoo-repo-setup/',
  '/posts/2014-08-24-gentoo-zh-community-under-construction/',
  '/status/',
  '/packages/',
  '/files/',
];
const OPEN_TIMEOUT = 6000;

const control = (page: Page, name: string) => page.locator(`[data-nav-control="${name}"]:visible`).first();
// force: a reader can press an aria-disabled stand-in; Playwright would wait for it to enable.
const click = (name: string) => (page: Page) => control(page, name).click({force: true});
const press = (key: string) => (page: Page) => page.keyboard.press(key);
const tabEnter = (name: string) => async (page: Page) => {
  for (let step = 0; step < 40; step++) {
    await page.keyboard.press('Tab');
    const reached = await page.evaluate(name => document.activeElement?.closest('[data-nav-control]')?.getAttribute('data-nav-control') === name, name);
    if (reached) return page.keyboard.press('Enter');
  }
  throw new Error(`Tab never reached the ${name} control`);
};

const menuOpen = (page: Page) => expect(page.locator('[role="menu"]:visible').first()).toBeVisible({timeout: OPEN_TIMEOUT});
const dialogOpen = (page: Page) => expect(page.locator('[role="dialog"]:visible, dialog[open]').first()).toBeVisible({timeout: OPEN_TIMEOUT});
const drawerOpen = async (page: Page) => {
  await expect(page.locator('[data-mobile-nav-open]')).toHaveAttribute('aria-expanded', 'true', {timeout: OPEN_TIMEOUT});
  await dialogOpen(page);
};
const themeOf = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme ?? document.documentElement.className);
const themeChanged = async (page: Page, before: string) => expect.poll(() => themeOf(page), {timeout: OPEN_TIMEOUT}).not.toBe(before);

interface Interaction {
  name: string;
  act: (page: Page) => Promise<unknown>;
  opened: (page: Page, themeBefore: string) => Promise<unknown>;
}

const WIDTHS: {width: number; interactions: Interaction[]}[] = [
  {
    width: 390,
    interactions: [
      {name: 'click menu', act: click('menu'), opened: drawerOpen},
      {name: 'tab+enter menu', act: tabEnter('menu'), opened: drawerOpen},
      {name: 'key "/"', act: press('/'), opened: dialogOpen},
    ],
  },
  {
    width: 1440,
    interactions: [
      {name: 'click service', act: click('service'), opened: menuOpen},
      {name: 'click language', act: click('language'), opened: menuOpen},
      {name: 'tab+enter service', act: tabEnter('service'), opened: menuOpen},
      {name: 'tab+enter language', act: tabEnter('language'), opened: menuOpen},
      {name: 'click theme', act: click('theme'), opened: themeChanged},
      {name: 'click search', act: click('search'), opened: dialogOpen},
      {name: 'key "/"', act: press('/'), opened: dialogOpen},
    ],
  },
];

for (const {width, interactions} of WIDTHS) {
  test.describe(`@${width}`, () => {
    const mobile = width < 800;
    test.use({viewport: {width, height: mobile ? 844 : 900}, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile});

    for (const path of PAGES) {
      for (const {name, act, opened} of interactions) {
        test(`${path} ${name}`, async ({page}, testInfo) => {
          // Idle loading is off and scripts requested after `load` are held 1.5 s, so the press lands before the island mounts.
          // Headless Chromium also reports a mouseover at (0, 0), over the nav, once the page lays out, wherever
          // the pointer is; a reader's pointer is not there, so it is dropped before the page sees it.
          await page.addInitScript(() => {
            window.requestIdleCallback = () => 0;
            for (const type of ['pointerover', 'mouseover', 'pointerenter', 'mouseenter', 'pointermove', 'mousemove']) {
              window.addEventListener(type, event => {
                const {clientX, clientY} = event as MouseEvent;
                if (clientX === 0 && clientY === 0) event.stopImmediatePropagation();
              }, {capture: true});
            }
          });
          let loaded = false;
          await page.route('**/_astro/*.js', async route => {
            if (loaded) await delay(1500);
            await route.continue();
          });
          const errors: string[] = [];
          page.on('pageerror', error => errors.push(String(error)));
          const scripts: string[] = [];
          page.on('request', request => {
            if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname.split('/').pop()!);
          });

          await page.goto(path);
          loaded = true;
          const url = page.url();
          const themeBefore = await themeOf(page);
          const standIn = await page.locator('[data-nav-control="theme"]').first().getAttribute('aria-disabled');
          testInfo.annotations.push({type: 'scripts before the press', description: scripts.join(' ')});

          expect(standIn, 'the nav is still the server stand-in when pressed').toBe('true');
          await act(page);
          await opened(page, themeBefore);
          expect(page.url()).toBe(url);
          expect(errors).toEqual([]);
        });
      }
    }
  });
}
