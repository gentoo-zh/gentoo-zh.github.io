import {htmlElements} from './html-elements.mjs';

// Initial Brotli budgets include idle-loaded imports; first matching route wins.
// CHROME covers navigation and shared scripts with dependency headroom.
export const CHROME = 145_000;

/** Section pages include the outline scroll-spy. */
const OUTLINE_SPY = 1024;

/** Only imports reached on user action from onDemand owners use this separate budget. */
// CommandPalette adds grouped results and keyboard selection only after opening search.
export const ON_DEMAND = 28_000;

/** Fragment-aware redirects load only the inline map resolver. */
export const FRAGMENT_REDIRECT = 512;

export const BUDGETS = [
  // All routes include the copy delegate; section routes also include OUTLINE_SPY.
  // Status adds Recharts and interactive history; compact status uses a separate entry.
  {route: /^(\/zh-tw|\/en)?\/status\/$/, extra: 272_000 - CHROME},
  // Home reserves headroom for its shared navigation closure; its content renders statically.
  {route: /^(\/zh-tw|\/en)?\/$/, extra: 156_000 - CHROME},
  // Mirror health updates and legacy fragment resolution extend the section scripts.
  {route: /^(\/zh-tw|\/en)?\/mirrorlist\/$/, extra: 2560 + OUTLINE_SPY},
  // Packages adds a sortable, filterable table and its search controls.
  {route: /^(\/zh-tw|\/en)?\/packages\/$/, extra: 217_900 - CHROME},
  // Setup guides add mirror/channel/sudo controls, pane switching and code rewriting.
  {route: /^(\/zh-tw|\/en)?\/(?:overlay|binpkg-setup|distfiles-setup|gentoo-(?:repo|distfiles|binpkg|prefix)-setup)\/$/, extra: 167_200 - CHROME},
  // Contributor lists hydrate filters and cards; profiles share this route-family allowance.
  {route: /^(\/zh-tw|\/en)?\/contributors\/(?:[^/]+\/)?$/, extra: 166_700 - CHROME},
  // Posts need the copy delegate without the section outline.
  {route: /^(\/zh-tw|\/en)?\/posts\/[^/]+\/$/, extra: 1024},
  // Contributing combines the copy delegate with the section outline.
  {route: /^(\/zh-tw|\/en)?\/contributing\/$/, extra: 1024 + OUTLINE_SPY},
  // Other pages reserve the copy delegate and section outline.
  {route: /.*/, extra: 1024 + OUTLINE_SPY},
];

/** Redirect pages (Redirect.astro) have no site frame. */
export const isRedirect = html => htmlElements(html).some(({name, attrs}) => name === 'meta' && attrs.get('http-equiv')?.toLowerCase() === 'refresh');
