import {hydrateIsland} from './hydrateIsland';
import {NAV_ISLAND_ID_PREFIX, NavIslandRoot} from './NavIsland';
import {forwardCardClicks} from './cardLinks';

forwardCardClicks();
hydrateIsland('nav', NavIslandRoot, NAV_ISLAND_ID_PREFIX);
