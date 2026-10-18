// Loaded by nav-boot.ts on first use or when idle; the chrome chunk keeps React with the nav.
import {hydrateIsland} from './hydrateIsland';
import {NAV_ISLAND_ID_PREFIX, NavIslandRoot} from './NavIsland';

export const mount = () => hydrateIsland('nav', NavIslandRoot, NAV_ISLAND_ID_PREFIX);
