import type {ReactElement} from 'react';
import {prerender} from 'react-dom/static';

/**
 * Renders a React tree to finished HTML. Astryx loads tooltips lazily, so a first render
 * suspends; `prerender` waits for every boundary, and an unbounded chunk size makes React
 * write each boundary in place instead of streaming it in later with inline scripts.
 */
export async function renderStatic(element: ReactElement, options: {identifierPrefix?: string} = {}): Promise<string> {
  const {prelude} = await prerender(element, {...options, progressiveChunkSize: Number.POSITIVE_INFINITY});
  return new Response(prelude).text();
}
