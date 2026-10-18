import {hydrateIsland} from '../chrome/hydrateIsland';
import {COSTS_SUMMARY_ID_PREFIX, CostsSummary} from './CostsSummary';

export const mount = () => hydrateIsland('costs', CostsSummary, COSTS_SUMMARY_ID_PREFIX);
