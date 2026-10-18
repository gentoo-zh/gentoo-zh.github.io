// The fixture pages' module: the island loaders under test, an event log, and a React controlled input.
import {createElement, Fragment, useEffect, useState} from 'react';
import {hydrateRoot} from 'react-dom/client';

export * from '../../src/ui/islands/schedule';
export * from '../../src/ui/islands/intent';
export {hydrateIsland} from '../../src/ui/chrome/hydrateIsland';

declare global {
  interface Window {
    events: string[];
    /** Settles the pending start(): mounts and resolves, or with `false` rejects. */
    finish: (ok?: boolean) => Promise<void>;
    /** The schedule's promise, after its outcome is recorded. */
    done: Promise<void>;
  }
}

window.events = [];
/** Appends to `window.events`, which the tests read. */
export const record = (entry: string) => void window.events.push(entry);

/** A start() that records 'start' and waits for the test to call `window.finish`; `mount` swaps in the live island. */
export const manualStart = (mount: () => unknown = () => {}) => () => {
  record('start');
  return new Promise<void>((resolve, reject) => {
    window.finish = async (ok = true) => {
      if (!ok) return reject(new Error('offline'));
      await mount();
      resolve();
    };
  });
};

/** Records how a schedule settles, as 'ready' or 'failed'. */
export const track = (ready: Promise<void>) => {
  window.done = ready.then(() => record('ready'), () => record('failed'));
};

function Search({onCommit}: {onCommit: () => void}) {
  const [query, setQuery] = useState('');
  useEffect(onCommit, [onCommit]);
  return createElement(
    Fragment,
    null,
    createElement('input', {id: 'q', value: query, onChange: event => setQuery(event.target.value)}),
    createElement('output', {id: 'out'}, query),
  );
}

/** Hydrates Search over its server markup, `<input id="q" value=""/><output id="out"></output>`; resolves after the first commit. */
export const hydrateSearch = (root: Element) => new Promise<void>(resolve => void hydrateRoot(root, createElement(Search, {onCommit: resolve})));

/**
 * A toggle whose handler flips the state it rendered with, as a plain React toggle does; hydrates
 * `<button id="toggle" aria-pressed="false">Toggle</button>` and resolves after the first commit.
 */
function Toggle({onCommit}: {onCommit: () => void}) {
  const [on, setOn] = useState(false);
  useEffect(onCommit, [onCommit]);
  return createElement('button', {id: 'toggle', 'aria-pressed': String(on), onClick: () => setOn(!on)}, 'Toggle');
}

export const hydrateToggle = (root: Element) => new Promise<void>(resolve => void hydrateRoot(root, createElement(Toggle, {onCommit: resolve})));

/** A component that throws on its first render, as a broken island does. */
export function Throws(): never {
  throw new Error('broken island');
}
