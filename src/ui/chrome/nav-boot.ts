// The server-rendered nav works without JS, so React and the nav chunk load on first use or when idle.
// A press before then would follow a stand-in link or hit a disabled button; it is held and repeated.
import {forwardCardClicks} from './cardLinks';
import {rememberLanguageChoice} from './languageChoice';
import {buttons, marked, shortcut} from '../islands/intent';
import {islandSelector} from '../islands/kinds';
import {schedule} from '../islands/schedule';

forwardCardClicks();
rememberLanguageChoice();

/** Marks the nav controls that need the script; hydration may replace the element, but not the mark. */
const CONTROL = 'data-nav-control';

const root = document.querySelector(islandSelector('nav'));
if (root != null) {
  void schedule(
    'nav',
    // useSearchShortcut decides on the repeated key, so a "/" typed into a field stays text.
    [{kind: 'intent', on: buttons(root, marked(CONTROL))}, {kind: 'intent', on: shortcut('/')}, {kind: 'idle'}],
    () => import('./nav-client').then(({mount}) => mount()),
  );
}
