// When an island's script loads. One module for every island, after Astro's client:load, client:idle and
// client:visible: the caller lists conditions, the first to occur starts the island, and nothing starts it
// twice. Held input (./intent) is repeated once the island reports it is live, or released if loading fails.
import type {Intent} from './intent';
import type {EnhancementKind, IslandKind} from './kinds';

export type When =
  /** Start at once: the island renders the page's content (status, files). */
  | {kind: 'now'}
  /** Start in idle time after the window's load event. */
  | {kind: 'idle'}
  /**
   * Start after the window's load event, as soon as any target is near the viewport; a `display: contents`
   * target is watched through its children. Targets with no layout box at all can never intersect, so they
   * start in idle time instead.
   */
  | {kind: 'visible'; target: Element[]}
  /** Wait for `visible`, then for idle time. */
  | {kind: 'visibleThenIdle'; target: Element[]}
  /** Start on first use, holding the input until the island is live. */
  | {kind: 'intent'; on: Intent};

/** Idle work runs within this many milliseconds of the load event. */
const IDLE_TIMEOUT = 3000;
/** Without requestIdleCallback (Safari), the delay after load instead. */
const IDLE_FALLBACK = 1000;
/**
 * How far outside the viewport `visible` fires, as a share of the viewport's height; one value for every
 * island. Calibrated on GuideSetup, the lowest `visible` island: on the guides its controls start at most
 * 74 px below the fold at 1280x800 and 439 px at 390x844 (/en/binpkg-setup/), so half a viewport (400
 * and 422 px) starts it with the page, or after the first few pixels of scrolling, rather than when a
 * fast flick has already brought it on screen.
 */
const VISIBLE_MARGIN = '50%';

type Cancel = () => void;
const none: Cancel = () => {};

function afterLoad(run: () => void): Cancel {
  if (document.readyState === 'complete') {
    run();
    return none;
  }
  window.addEventListener('load', run, {once: true});
  return () => window.removeEventListener('load', run);
}

// Idle time before `load` would let a background island compete with the page's own resources.
function idle(run: () => void): Cancel {
  let cancel = none;
  const cancelLoad = afterLoad(() => {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(run, {timeout: IDLE_TIMEOUT});
      cancel = () => window.cancelIdleCallback(handle);
    } else {
      const handle = setTimeout(run, IDLE_FALLBACK);
      cancel = () => clearTimeout(handle);
    }
  });
  return () => {
    cancelLoad();
    cancel();
  };
}

/** The elements that have a box: an island's `display: contents` container never intersects. */
const boxes = (element: Element): Element[] => (getComputedStyle(element).display === 'contents' ? [...element.children].flatMap(boxes) : [element]);

// Like idle time, nothing visible starts before `load`: an island near the first screen would otherwise
// compete with the page's own resources (on a slow CI runner the guide pulled 166 KB in before `load`).
// Input before then is held by an `intent` condition.
function visible(targets: Element[], run: () => void): Cancel {
  let cancel = none;
  const cancelLoad = afterLoad(() => {
    cancel = observe(targets, run);
  });
  return () => {
    cancelLoad();
    cancel();
  };
}

function observe(targets: Element[], run: () => void): Cancel {
  if (!('IntersectionObserver' in window)) {
    run();
    return none;
  }
  const observed = targets.flatMap(boxes);
  if (observed.length === 0) return idle(run);
  const observer = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    },
    {rootMargin: VISIBLE_MARGIN},
  );
  for (const box of observed) observer.observe(box);
  return () => observer.disconnect();
}

function wait(when: Exclude<When, {kind: 'intent'}>, run: () => void): Cancel {
  switch (when.kind) {
    case 'now':
      run();
      return none;
    case 'idle':
      return idle(run);
    case 'visible':
      return visible(when.target, run);
    case 'visibleThenIdle': {
      let cancelIdle = none;
      const cancelVisible = visible(when.target, () => {
        cancelIdle = idle(run);
      });
      return () => {
        cancelVisible();
        cancelIdle();
      };
    }
  }
}

/**
 * Starts `island` on the first of `whens`. The promise resolves after `start` has, which the mounting
 * layer does once the island is live, and held input has been repeated. It rejects with the error of a
 * failed start, which is logged here once, so a caller that only fires the schedule may ignore it.
 * Performance marks `gz-island:<kind>:start` and `gz-island:<kind>:ready` time each island.
 */
export function schedule(island: IslandKind | EnhancementKind, whens: When[], start: () => Promise<void>): Promise<void> {
  const intents = whens.flatMap(when => (when.kind === 'intent' ? [when.on] : []));
  const cancels: Cancel[] = [];
  let started = false;
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const ready = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });

  const begin = () => {
    if (started) return;
    started = true;
    for (const cancel of cancels.splice(0)) cancel();
    performance.mark(`gz-island:${island}:start`);
    // The executor turns a synchronous throw into a rejection.
    new Promise<void>(run => run(start())).then(
      async () => {
        performance.mark(`gz-island:${island}:ready`);
        try {
          for (const intent of intents) await intent.replay();
        } finally {
          resolve();
        }
      },
      (error: unknown) => {
        for (const intent of intents) intent.release();
        reject(error);
      },
    );
  };

  ready.catch((error: unknown) => console.error(`gz-island:${island}: failed to start`, error));
  // Intents first: they hold input for the whole load, whichever condition starts it.
  for (const intent of intents) intent.arm(begin);
  for (const when of whens) {
    if (started) break;
    if (when.kind !== 'intent') cancels.push(wait(when, begin));
  }
  return ready;
}
