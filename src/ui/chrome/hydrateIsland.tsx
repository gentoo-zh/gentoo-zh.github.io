import {createElement, useEffect, useSyncExternalStore, type ComponentType, type ReactElement, type ReactNode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {islandSelector, type IslandKind} from '../islands/kinds';

const subscribeNever = () => () => {};

interface ReadyProps {
  children: ReactNode;
  onReady: () => void;
}

/**
 * Reports the commit that follows the server-snapshot pass (under createRoot, the first commit), when
 * controls show client state; one child keeps `useId` values unchanged.
 */
function Ready({children, onReady}: ReadyProps) {
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  useEffect(() => {
    if (isClient) onReady();
  }, [isClient, onReady]);
  return children;
}

export interface ReadySignal {
  /** Wraps every render of the root. */
  wrap: (node: ReactNode) => ReactElement;
  /** Resolves once the root is live; rejects if it throws first. */
  ready: Promise<void>;
  /**
   * The root's `onUncaughtError` option. An error before the root is live rejects `ready`, and the
   * scheduler reports it; a later one is reported as React does by default.
   */
  onUncaughtError: (error: unknown) => void;
}

/** Tracks one root: pass `wrap` every render and `onUncaughtError` to createRoot or hydrateRoot. */
export function readySignal(): ReadySignal {
  let settled = false;
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const ready = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  const onReady = () => {
    settled = true;
    resolve();
  };
  return {
    wrap: node => createElement(Ready, {onReady, children: node}),
    ready,
    onUncaughtError(error) {
      if (settled) return reportError(error);
      settled = true;
      reject(error);
    },
  };
}

/** Hydrates the island's server HTML from its container's props; resolves once it is live, and rejects without them. */
export function hydrateIsland<T extends object>(island: IslandKind, Component: ComponentType<T>, identifierPrefix: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(islandSelector(island));
  if (root?.dataset.props == null) return Promise.reject(new Error(`No ${island} island container with props`));
  const {wrap, ready, onUncaughtError} = readySignal();
  hydrateRoot(root, wrap(createElement(Component, JSON.parse(root.dataset.props) as T)), {identifierPrefix, onUncaughtError});
  return ready;
}
