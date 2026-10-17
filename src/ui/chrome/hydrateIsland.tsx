import {createElement, type ComponentType} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {ISLAND_ATTRIBUTE, type IslandKind} from './IslandMount';

export function hydrateIsland<T extends object>(island: IslandKind, Component: ComponentType<T>, identifierPrefix: string) {
  const root = document.querySelector<HTMLElement>(`[${ISLAND_ATTRIBUTE}="${island}"]`);
  if (root?.dataset.props != null) {
    const props = JSON.parse(root.dataset.props) as T;
    hydrateRoot(root, createElement(Component, props), {identifierPrefix});
  }
}
