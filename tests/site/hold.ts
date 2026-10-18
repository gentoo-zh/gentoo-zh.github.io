// Keeps an island from mounting while a test acts on its server markup, then lets it mount.
import type {Page} from '@playwright/test';
import type {IslandKind} from '../../src/ui/islands/kinds';

export interface Held {
  /** Lets the held scripts through. */
  release: () => void;
}

/**
 * Holds every script requested after the load event, and turns idle loading off, so an island that
 * starts on use or when idle cannot mount until `release`. Call before `page.goto`; `loaded` marks
 * the moment from which requests are held.
 */
export async function holdLateScripts(page: Page): Promise<Held & {loaded: () => void}> {
  let isLoaded = false;
  let release!: () => void;
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  await page.addInitScript(() => {
    window.requestIdleCallback = () => 0;
  });
  await page.route('**/_astro/*.js', async route => {
    if (isLoaded) await gate;
    await route.continue();
  });
  return {release, loaded: () => void (isLoaded = true)};
}

/** Holds the script named `name.<hash>.js`, however early it is requested. */
export async function holdScript(page: Page, name: string): Promise<Held> {
  let release!: () => void;
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  await page.route(new RegExp(`/_astro/${name}\\.[\\w-]+\\.js$`), async route => {
    await gate;
    await route.continue();
  });
  return {release};
}

const mark = (island: IslandKind, phase: 'start' | 'ready') => `gz-island:${island}:${phase}`;

/** Whether the scheduler has marked `island` as started or live. */
export const hasMark = (page: Page, island: IslandKind, phase: 'start' | 'ready') =>
  page.evaluate(name => performance.getEntriesByName(name).length > 0, mark(island, phase));

/** Waits until `island` is live. */
export const live = (page: Page, island: IslandKind) =>
  page.waitForFunction(name => performance.getEntriesByName(name).length > 0, mark(island, 'ready'));
