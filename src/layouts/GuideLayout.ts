import {createElement} from 'react';
import type {GuideRouteProps} from '../content/pages';
import {postPaths} from '../content/posts';
import {loadData} from '../data/entries';
import type {Mirrors} from '../data/schemas';
import {routes} from '../i18n/routes';
import {sectionOf, SETUP_PAGE_GROUPS, type SectionPageId} from '../ui/chrome/sections';
import {GuidePage, type GuidePageProps} from '../ui/start/GuidePage';
import {GuideGroupTabs} from '../ui/start/GuideGroupTabs';
import type {GuideSetupProps} from '../ui/start/GuideSetup';
import type {GuideKind} from '../ui/start/guideSetup';
import {guideSetup} from '../ui/start/guideSetupPage';

interface GuideLayoutOptions {
  current: SectionPageId;
  kind?: GuideKind;
  controls?: Pick<GuideSetupProps, 'protocolSources' | 'sudo'>;
  setupAnchor?: string;
  slots?: GuidePageProps['slots'];
}

export async function guideLayout(props: GuideRouteProps, options: GuideLayoutOptions) {
  const {locale, page, alternates} = props;
  const {current, kind, controls, setupAnchor, slots = {}} = options;
  const {title, description, slug, steps = [], manual, quick, setupHint} = page.data;
  const pages = await postPaths(locale);
  const group = SETUP_PAGE_GROUPS.find(group => group.includes(current));
  const navigation = group == null ? undefined : createElement(GuideGroupTabs, {
    locale, current, pages: sectionOf('docs').pages.filter(page => group.includes(page.id)),
  });
  const panes = quick == null ? undefined : {manual, quick};
  const setup = kind == null
    ? {body: page.body ?? '', steps, panes, slots: {}}
    : await guideSetup(locale, kind, await loadData('mirrors') as Mirrors, page.body ?? '', steps, panes, setupHint, controls);
  return {
    locale, title, description, path: routes.page(locale, slug), alternates,
    section: 'docs' as const, current,
    page: createElement(GuidePage, {
      locale, section: 'docs', title, description, headerNavigation: navigation, body: setup.body,
      steps: setup.steps, panes: setup.panes, slots: {...setup.slots, ...slots}, setupAnchor, pages,
    }),
  };
}
