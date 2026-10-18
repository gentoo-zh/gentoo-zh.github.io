import {hydrateIsland} from '../chrome/hydrateIsland';
import {SECTION_NAV_ID_PREFIX, SectionNavIsland} from './SectionNavIsland';

export const mount = () => hydrateIsland('section', SectionNavIsland, SECTION_NAV_ID_PREFIX);
