import {hydrateIsland} from '../chrome/hydrateIsland';
import {GUIDE_SETUP_ID_PREFIX, GuideSetup} from './GuideSetup';

export const mount = () => hydrateIsland('guide', GuideSetup, GUIDE_SETUP_ID_PREFIX);
