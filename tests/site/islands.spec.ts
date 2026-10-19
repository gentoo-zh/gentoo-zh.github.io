// Islands that mount on use, on view or when idle: what a reader does to the server markup before then
// must end the way it would have on the live island, and nothing the browser does natively is taken over.
import type {Page} from '@playwright/test';
import {expect, test} from './fixture';
import {hasMark, holdLateScripts, holdScript, live} from './hold';

test.use({viewport: {width: 1280, height: 800}});

test.describe('sidebar on /faq/', () => {
  // /faq/ is in the support section, so the docs group starts folded.
  const header = (page: Page) => page.locator('[data-gz-section-group="docs"]:visible');
  const chevron = (page: Page) => page.locator('[data-gz-section-group="docs"]:visible + button');

  test('a plain click on a group header is held, then folds the group open', async ({page}) => {
    const held = await holdLateScripts(page);
    await page.goto('/faq/');
    held.loaded();
    await expect(chevron(page)).toHaveAttribute('aria-expanded', 'false');
    await header(page).click();
    await expect.poll(() => hasMark(page, 'section', 'start')).toBe(true);
    expect(await hasMark(page, 'section', 'ready')).toBe(false);
    held.release();
    await live(page, 'section');
    await expect(chevron(page)).toHaveAttribute('aria-expanded', 'true');
    expect(new URL(page.url()).pathname).toBe('/faq/');
  });

  test('the chevron is held, then folds the group open', async ({page}) => {
    const held = await holdLateScripts(page);
    await page.goto('/faq/');
    held.loaded();
    await chevron(page).click();
    held.release();
    await live(page, 'section');
    await expect(chevron(page)).toHaveAttribute('aria-expanded', 'true');
  });

  for (const {name, options} of [
    {name: 'modified', options: {modifiers: ['ControlOrMeta' as const]}},
    {name: 'middle', options: {button: 'middle' as const}},
  ]) {
    test(`a ${name} click on a group header opens its page in a new tab`, async ({page, context}) => {
      const held = await holdLateScripts(page);
      await page.goto('/faq/');
      held.loaded();
      const [opened] = await Promise.all([context.waitForEvent('page'), header(page).click(options)]);
      await opened.waitForURL(/\/docs\/$/);
      held.release();
      await live(page, 'section');
      // Nothing was held, so nothing folds.
      await expect(chevron(page)).toHaveAttribute('aria-expanded', 'false');
      expect(new URL(page.url()).pathname).toBe('/faq/');
    });
  }
});

test('GuideSetup follows a hash change to the quick pane before it mounts', async ({page}) => {
  const held = await holdScript(page, 'guide-setup-client');
  await page.goto('/binpkg-setup/');
  const pane = (name: string) => page.locator(`[data-gz-pane="${name}"]`);
  await expect(pane('manual')).toBeVisible();
  await expect(pane('quick')).toBeHidden();
  await page.evaluate(() => void (location.hash = '#quick'));
  await expect(pane('quick')).toBeVisible();
  await expect(pane('manual')).toBeHidden();
  await expect(pane('quick')).toBeInViewport();
  expect(await hasMark(page, 'guide', 'ready')).toBe(false);
  held.release();
  await live(page, 'guide');
  // The live island takes over from the first-paint listener.
  await page.evaluate(() => void (location.hash = '#manual'));
  await expect(pane('manual')).toBeVisible();
  await expect(pane('quick')).toBeHidden();
  await expect(page.locator('[role="tab"][data-tab-value="manual"]')).toHaveAttribute('aria-selected', 'true');
});

test.describe('contributors search', () => {
  const field = (page: Page) => page.locator('[data-gz-island="contributors"] input');
  const cards = (page: Page) => page.locator('[data-gz-island="contributors"] h3 a:visible');

  /** A query that matches some contributors but not all, and how many cards the live island shows for it. */
  async function expected(page: Page) {
    await page.goto('/contributors/');
    const total = await cards(page).count();
    const query = (await cards(page).first().innerText()).trim().slice(0, 3).toLowerCase();
    await field(page).focus();
    await live(page, 'contributors');
    await field(page).fill(query);
    await expect.poll(() => cards(page).count()).toBeLessThan(total);
    return {query, count: await cards(page).count()};
  }

  test('text typed before mounting filters the cards, keeping focus and the caret', async ({page}) => {
    const {query, count} = await expected(page);
    const held = await holdLateScripts(page);
    await page.goto('/contributors/');
    held.loaded();
    await field(page).click();
    await page.keyboard.type(query);
    expect(await hasMark(page, 'contributors', 'ready')).toBe(false);
    held.release();
    await live(page, 'contributors');
    await expect.poll(() => cards(page).count()).toBe(count);
    await expect(field(page)).toHaveValue(query);
    await expect(field(page)).toBeFocused();
    expect(await field(page).evaluate((input: HTMLInputElement) => [input.selectionStart, input.selectionEnd])).toEqual([query.length, query.length]);
  });

  test('an IME composition open while mounting is written once it commits', async ({page}) => {
    const {query, count} = await expected(page);
    const held = await holdLateScripts(page);
    await page.goto('/contributors/');
    held.loaded();
    await field(page).click();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.imeSetComposition', {text: query, selectionStart: query.length, selectionEnd: query.length});
    held.release();
    await live(page, 'contributors');
    await cdp.send('Input.insertText', {text: query});
    await expect(field(page)).toHaveValue(query);
    await expect.poll(() => cards(page).count()).toBe(count);
  });
});

test('a costs explanation pressed before mounting opens once the island is live', async ({page}) => {
  const held = await holdLateScripts(page);
  await page.goto('/costs/');
  held.loaded();
  // force: the trigger is a plain button before hydration; Playwright needs no wait for it.
  await page.locator('[data-gz-island="costs"] button').first().click({force: true});
  await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);
  held.release();
  await live(page, 'costs');
  await expect(page.locator('[role="dialog"]:visible')).toHaveCount(1);
});

test('a packages tab picked while the index loads is the view that appears', async ({page}) => {
  // A fixed index stands in for the hourly one on distfiles (R27).
  const index = {
    generated: 1_760_000_000,
    packages: [{cp: 'app-i18n/fcitx', binhost: true, dist: ['amd64'], ver: '5.1.0', size: 1024}],
    deps: [{cp: 'dev-libs/glib', ver: '2.84.0', slot: '2'}],
  };
  await page.route(/^https:\/\/distfiles\.gentoozh\.org\/packages(-unstable)?\.json$/, route => route.fulfill({json: index}));
  const held = await holdScript(page, 'packages-client');
  await page.goto('/packages/');
  await page.locator('[data-gz-view-skeleton]:not([hidden]) [role="tab"][data-tab-value="deps"]').click();
  expect(new URL(page.url()).searchParams.get('view')).toBe('deps');
  await expect(page.locator('[data-gz-view-skeleton="deps"]')).toBeVisible();
  held.release();
  await live(page, 'packages');
  await expect(page.locator('[role="tab"][data-tab-value="deps"][aria-selected="true"]:visible')).toHaveCount(1);
  await expect(page.getByText('dev-libs/glib').first()).toBeVisible();
  expect(new URL(page.url()).searchParams.get('view')).toBe('deps');
});

test.describe('contributors roles at 390 px', () => {
  test.use({viewport: {width: 390, height: 844}});
  const island = '[data-gz-island="contributors"]';

  test('a role pressed before mounting is selected after the live list folds its toggle into the overflow menu', async ({page}) => {
    const held = await holdLateScripts(page);
    await page.goto('/contributors/');
    held.loaded();
    // Before mounting every role is on the line; the last one is the first to fold on a phone.
    const toggle = page.locator(`${island} [aria-pressed]:visible`).last();
    const role = (await toggle.getAttribute('aria-label'))!;
    await toggle.focus();
    await page.keyboard.press('Enter');
    held.release();
    await live(page, 'contributors');
    await expect(page.locator(`${island} [aria-pressed][aria-label="${role}"]:visible`)).toHaveCount(0);
    await expect(page.locator(`${island} h2[id^="group-"]:visible`)).toHaveText([role]);
    await expect(page.locator(`${island} [aria-haspopup]:visible`).first()).toBeFocused();
  });
});

test.describe('language menu', () => {
  // The menu writes the cookie that the Worker reads on the next entry (src/worker/language.ts).
  const picked = async (page: Page) => (await page.context().cookies()).find(({name}) => name === 'gz-lang')?.value;
  const trigger = (page: Page) => page.locator('[data-nav-control="language"]:visible');

  // Headless Chromium reports a mouseover at (0, 0), over the nav, as the page lays out; it would start
  // the nav before the press, so it is dropped as in nav.spec.ts.
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      for (const type of ['pointerover', 'mouseover', 'pointerenter', 'mouseenter', 'pointermove', 'mousemove']) {
        window.addEventListener(type, event => {
          const {clientX, clientY} = event as MouseEvent;
          if (clientX === 0 && clientY === 0) event.stopImmediatePropagation();
        }, {capture: true});
      }
    });
  });

  test('a plain click on the stand-in is held to open the menu and picks nothing', async ({page}) => {
    const held = await holdLateScripts(page);
    await page.goto('/');
    held.loaded();
    await trigger(page).click();
    await expect.poll(() => hasMark(page, 'nav', 'start')).toBe(true);
    expect(await picked(page)).toBeUndefined();
    held.release();
    await live(page, 'nav');
    await expect(page.locator('[role="menu"]:visible')).toBeVisible();
    expect(await picked(page)).toBeUndefined();
  });

  for (const {name, options} of [
    {name: 'modified', options: {modifiers: ['ControlOrMeta' as const]}},
    {name: 'middle', options: {button: 'middle' as const}},
  ]) {
    test(`a ${name} click on the stand-in picks the language it opens`, async ({page, context}) => {
      const held = await holdLateScripts(page);
      await page.goto('/');
      held.loaded();
      await expect(trigger(page)).toHaveAttribute('href', '/zh-tw/');
      const [opened] = await Promise.all([context.waitForEvent('page'), trigger(page).click(options)]);
      await opened.waitForURL(/\/zh-tw\/$/);
      expect(await hasMark(page, 'nav', 'ready')).toBe(false);
      expect(await picked(page)).toBe('zh-tw');
    });
  }

  for (const {from, item, to, locale} of [
    {from: '/en/', item: '简体中文', to: '/', locale: 'zh-cn'},
    {from: '/', item: 'English', to: '/en/', locale: 'en'},
  ]) {
    test(`picking ${item} on ${from} remembers ${locale}`, async ({page}) => {
      await page.goto(from);
      await trigger(page).click();
      await live(page, 'nav');
      await page.getByRole('menuitem', {name: item}).click();
      await page.waitForURL(url => url.pathname === to);
      expect(await picked(page)).toBe(locale);
    });
  }
});
