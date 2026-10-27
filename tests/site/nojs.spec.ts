// Without JavaScript every page still reads in full and its links still go where they say.
import {expect, test} from './fixture';

test.use({javaScriptEnabled: false, viewport: {width: 1280, height: 800}});

const PAGES = ['/', '/faq/', '/binpkg-setup/', '/contributors/', '/costs/', '/status/', '/packages/', '/files/', '/mirrorlist/', '/posts/2014-08-24-gentoo-zh-community-under-construction/'];

for (const path of PAGES) {
  test(`${path} is readable`, async ({page}) => {
    await page.goto(path);
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    expect((await main.innerText()).trim().length).toBeGreaterThan(100);
  });
}

test('both guide panes show, one after the other', async ({page}) => {
  await page.goto('/binpkg-setup/');
  await expect(page.locator('[data-gz-pane="manual"]')).toBeVisible();
  await expect(page.locator('[data-gz-pane="quick"]')).toBeVisible();
});

test('a sidebar group header and a sidebar page link navigate', async ({page}) => {
  await page.goto('/faq/');
  await page.locator('[data-gz-section-group="docs"]:visible').click();
  await expect(page).toHaveURL(/\/docs\/$/);
  // On /docs/ the docs group is the open one.
  await page.locator('[data-gz-island="section"] a[href="/overlay/"]:visible').first().click();
  await expect(page).toHaveURL(/\/overlay\/$/);
});

test('contributor cards are listed', async ({page}) => {
  await page.goto('/contributors/');
  expect(await page.locator('[data-gz-island="contributors"] h3 a:visible').count()).toBeGreaterThan(10);
});

test('a section page of a paged post renders its subsections one level up, the overview does not', async ({page}) => {
  await page.goto('/posts/2025-10-02-gentoo-m-series-mac/10/');
  await expect(page.locator('h2[id="85-睡眠"]')).toHaveCount(1);
  await page.goto('/posts/2025-10-02-gentoo-m-series-mac/');
  await expect(page.locator('h3[id="硬件需求"]')).toHaveCount(1);
});
