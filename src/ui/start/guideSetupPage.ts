// Server defaults and rewritten fences must match the setup island's initial controls.
import {createElement} from 'react';
import {defaultMirror, officialMirrors} from '../../data/mirrors';
import type {Mirror, Mirrors} from '../../data/schemas';
import {LANGUAGE_TAG, providerMessages, type Locale} from '../../i18n/locales';
import {IslandMount} from '../chrome/IslandMount';
import {renderStatic} from '../renderStatic';
import type {GuidePanes, GuideStep} from './GuidePage';
import {GUIDE_SETUP_ID_PREFIX, GuideSetup, type GuideSetupProps} from './GuideSetup';
import {rewriteCode, rewriteFences, type GuideKind, type GuideMirror} from './guideSetup';

export async function guideSetup(locale: Locale, kind: GuideKind, all: Mirrors, body: string, steps: ReadonlyArray<GuideStep>, panes?: GuidePanes, hint?: string, controls: Pick<GuideSetupProps, 'protocolSources' | 'sudo'> = {}) {
  let mirrors: GuideMirror[];
  let initial: string;
  if (kind === 'official') {
    const choices = officialMirrors(all);
    const defaults = {git: defaultMirror(all, 'gentoo_git', locale), rsync: defaultMirror(all, 'gentoo_rsync', locale)};
    const label = (mirror: Mirror, protocol: 'git' | 'rsync') => mirror.origin ? 'GitHub' : choices.find(choice => choice[protocol]?.source === mirror.source)?.name[locale] ?? mirror.source;
    const endpoints = (git: Mirror = defaults.git, rsync: Mirror = defaults.rsync) => ({
      git: {uri: git.uri, label: label(git, 'git')},
      rsync: {uri: rsync.uri, label: label(rsync, 'rsync')},
    });
    mirrors = choices.map(mirror => ({
      id: mirror.id,
      uri: mirror.uri,
      label: `${mirror.name[locale]} · ${mirror.region[locale]}`,
      ...endpoints(mirror.git, mirror.rsync),
    }));
    const origin = all.gentoo_dist.find(mirror => mirror.origin)!;
    mirrors.push({id: origin.source, uri: origin.uri, ...endpoints(all.gentoo_git.find(mirror => mirror.origin))});
    initial = defaultMirror(all, 'gentoo_dist', locale).source;
  } else {
    const set = kind === 'overlay' ? 'git' : 'dist';
    const list = [...all[set].filter(mirror => !mirror.origin), ...all[set].filter(mirror => mirror.origin)];
    const id = (mirror: Mirror) => (!mirror.origin ? mirror.source : set === 'git' ? 'github' : 'origin');
    mirrors = list.map(mirror => ({id: id(mirror), uri: mirror.uri}));
    initial = id(defaultMirror(all, set, locale));
  }
  const rewrite = (markdown: string) => rewriteFences(markdown, code => rewriteCode(code, kind, mirrors, {mirror: initial, channel: 'stable', sudo: true}));
  const languageTag = LANGUAGE_TAG[locale];
  const messages = Object.fromEntries(Object.entries(providerMessages(locale)[languageTag]!).filter(([key]) => /^gz\.(guide|mirror\.name)\.|^@astryx\.(selector|switch|layer|tabList|field|input|textInput|iconButton|button)\./.test(key)));
  const props: GuideSetupProps = {kind, languageTag, messages, mirrors, initial, tabs: panes != null, hint, ...controls};
  const html = await renderStatic(createElement(GuideSetup, props), {identifierPrefix: GUIDE_SETUP_ID_PREFIX});
  return {
    body: rewrite(body),
    steps: steps.map(step => ({...step, body: rewrite(step.body)})),
    panes: panes == null ? undefined : {manual: panes.manual == null ? undefined : rewrite(panes.manual), quick: rewrite(panes.quick)},
    slots: {setup: createElement(IslandMount<GuideSetupProps>, {html, props, island: 'guide'})},
  };
}
