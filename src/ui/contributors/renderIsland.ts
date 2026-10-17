import {createElement} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {ContributorProfile, type ContributorProfileProps} from './ContributorProfile';
import {LANGUAGE_TAG, providerMessages, type Locale} from '../../i18n/locales';
import {IslandMount} from '../chrome/IslandMount';
import {renderStatic} from '../renderStatic';
import {CONTRIBUTORS_ISLAND_ID_PREFIX, ContributorsIsland, type ContributorsIslandProps} from './ContributorsIsland';
import {ContributorsPage} from './ContributorsPage';

type Page = {kind: 'library'; page: ContributorsIslandProps['page'] & {title: string; body: string}} | {kind: 'profile'; page: ContributorProfileProps};

export async function renderContributors(locale: Locale, page: Page) {
  const languageTag = LANGUAGE_TAG[locale];
  if (page.kind === 'profile') {
    return createElement(InternationalizationProvider, {locale: languageTag, messages: providerMessages(locale),
      children: createElement(ContributorProfile, page.page)});
  }
  const messages = Object.fromEntries(Object.entries(providerMessages(locale)[languageTag]).filter(([key]) => key.startsWith('gz.contributors.') || /^@astryx\.(avatar|button|collapsible|dialog|dropdownMenu|layer|layout|metadataList|overflowList|popover|tabList|textInput|toggleButton|tooltip)\./.test(key)));
  const {title, body, ...library} = page.page;
  const props: ContributorsIslandProps = {kind: 'library', page: library, languageTag, messages};
  const html = await renderStatic(createElement(ContributorsIsland, props), {identifierPrefix: CONTRIBUTORS_ISLAND_ID_PREFIX});
  return createElement(ContributorsPage, {title, body, children: createElement(IslandMount, {html, props, island: 'contributors'})});
}
