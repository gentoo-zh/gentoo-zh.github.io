import {createElement} from 'react';
import {LANGUAGE_TAG, providerMessages} from '../../i18n/locales';
import {IslandMount} from '../chrome/IslandMount';
import {renderStatic} from '../renderStatic';
import {SECTION_NAV_ID_PREFIX, SectionNavIsland, type SectionNavIslandProps} from './SectionNavIsland';
import type {SectionSideNavProps} from './SectionNavGroups';
import {SectionSideNav} from './SectionSideNav';

export async function renderSectionSideNav(nav: SectionSideNavProps) {
  const languageTag = LANGUAGE_TAG[nav.locale];
  const messages = Object.fromEntries(Object.entries(providerMessages(nav.locale)[languageTag]).filter(([key]) => /^gz\.nav\.|^gz\.section\.overview$|^@astryx\.(sideNav|sideNavItem|popover|tooltip|layer)\./.test(key)));
  const props: SectionNavIslandProps = {...nav, languageTag, messages};
  const html = await renderStatic(createElement(SectionNavIsland, props), {identifierPrefix: SECTION_NAV_ID_PREFIX});
  return createElement(SectionSideNav, {children: createElement(IslandMount, {html, props, island: 'section'})});
}
