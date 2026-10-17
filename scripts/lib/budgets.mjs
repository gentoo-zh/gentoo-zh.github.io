import {htmlElements} from './html-elements.mjs';

// Initial Brotli budgets include idle-loaded imports; first matching route wins.
// CHROME covers navigation and shared scripts with dependency headroom.
// It includes the search placeholder dialog, which must open before the palette chunk arrives.
export const CHROME = 147_000;

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
  // Loading placeholders, the sticky table header and the phone mirror list add about 1.7 kB.
  // Sharing LoadingRows with /files/ splits it into its own chunk (274,308 B measured); the TabList
  // chunk shared by the guides and /packages/ moves the shared boundaries again (274,531 B measured).
  // The TAB scale constant for the packages view tabs lands in the shared chrome chunk (274,601 B measured).
  {route: /^(\/zh-tw|\/en)?\/status\/$/, extra: 274_800 - CHROME},
  // Home reserves headroom for its shared navigation closure; its content renders statically.
  {route: /^(\/zh-tw|\/en)?\/$/, extra: 156_000 - CHROME},
  // Mirror health updates and legacy fragment resolution extend the section scripts.
  {route: /^(\/zh-tw|\/en)?\/mirrorlist\/$/, extra: 2560 + OUTLINE_SPY},
  // Packages adds a sortable, filterable table and its search controls.
  // The merged search placeholder, table skeleton and sticky header add up across branches; the
  // fact grids and focus reveal brought it to 219,786 B; row expansion, the yes/no marks and the
  // size formatter shared with /files/ bring it to 221,925 B measured; the TabList that switches
  // between the packages and the ::gentoo dependencies brings it to 226,038 B measured; the
  // table-filter toolbar (lists DropdownMenu, tab count Badges, reload ProgressBar) brings it to 228,243 B;
  // the off-list Switch, the frame shared with the loading state and its tab script bring it to 230,329 B.
  // The home rework adds the large IconTile variant to the shared chrome chunk: 230,424 B.
  {route: /^(\/zh-tw|\/en)?\/packages\/$/, extra: 230_600 - CHROME},
  // The file browser adds a sortable table, breadcrumbs and its listing states.
  // The merged search placeholder plus the shared table skeleton and sticky header (161,433 B measured).
  {route: /^(\/zh-tw|\/en)?\/files\/$/, extra: 162_000 - CHROME},
  // Setup guides add mirror/channel/sudo controls, pane switching and code rewriting. Sharing the
  // TabList with /packages/ splits it into its own chunk (167,542 B measured).
  {route: /^(\/zh-tw|\/en)?\/(?:overlay|binpkg-setup|distfiles-setup|gentoo-(?:repo|distfiles|binpkg|prefix)-setup)\/$/, extra: 167_600 - CHROME},
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
