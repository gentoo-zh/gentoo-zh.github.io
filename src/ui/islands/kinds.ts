// The attribute that marks an island's container, and every island kind. No imports, so a startup
// module can name an island without pulling React or a component into the page's first scripts.

export const ISLAND_ATTRIBUTE = 'data-gz-island';

export type IslandKind = 'nav' | 'section' | 'chapters' | 'guide' | 'contributors' | 'costs' | 'status' | 'files' | 'packages' | 'mirror-health';

/** Scripts the scheduler starts that update server markup in place and have no island container. */
export type EnhancementKind = 'home-live' | 'home-status' | 'outline';

/** Matches every container of one island kind. */
export const islandSelector = (island: IslandKind) => `[${ISLAND_ATTRIBUTE}="${island}"]`;

/** Props that mark an element as the container of `island`. */
export const islandProps = (island: IslandKind) => ({[ISLAND_ATTRIBUTE]: island});
