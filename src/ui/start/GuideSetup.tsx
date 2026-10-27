// Remember mirror/channel/arch/sudo choices across guides; keep manual/quick selection local to the page.
import {useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {useMessage} from '../../i18n/useMessage';
import type {MessageKey} from '../../i18n/locales';
import {SPACE} from '../../theme/scale';
import {container} from '../../theme/layout.stylex';
import {rewriteCode, STORAGE, type GuideArch, type GuideChannel, type GuideChoice, type GuideKind, type GuideMirror} from './guideSetup';

export const GUIDE_SETUP_ID_PREFIX = 'gz-guide-';

export interface GuideSetupProps {
  kind: GuideKind;
  languageTag: string;
  messages: Record<string, string>;
  mirrors: GuideMirror[];
  /** The language default's id, rendered on the server. */
  initial: string;
  /** Whether the page has manual and quick panes (`[data-gz-pane]`); manual is the first tab. */
  tabs?: boolean;
  hint?: string;
  protocolSources?: boolean;
  sudo?: boolean;
}

export type GuidePane = 'manual' | 'quick';
const PANES: GuidePane[] = ['manual', 'quick'];

const CHANNELS: GuideChannel[] = ['stable', 'unstable'];
const ARCHES: GuideArch[] = ['amd64', 'arm64'];

const styles = stylex.create({
  setup: {containerType: 'inline-size', width: '100%', minWidth: 0},
  row: {
    minHeight: 'calc(var(--size-element-md) + var(--spacing-1) + var(--border-width))',
    paddingBlockEnd: {default: 'var(--spacing-1)', [container.guideCompact]: 0},
    borderBottomWidth: {default: 'var(--border-width)', [container.guideCompact]: 0},
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
  },
  tabs: {
    flexShrink: 0,
    width: {default: 'auto', [container.guideCompact]: '100%'},
    borderBottomWidth: {default: 0, [container.guideCompact]: 'var(--border-width)'},
    paddingBlockEnd: {default: 0, [container.guideCompact]: 'var(--spacing-1)'},
  },
  controls: {
    flexGrow: 1,
    flexBasis: {default: 0, [container.guideCompact]: '100%'},
    flexWrap: {default: 'nowrap', [container.guideCompact]: 'wrap'},
    justifyContent: {default: 'flex-end', [container.guideCompact]: 'flex-start'},
    maxWidth: '100%',
    minWidth: 0,
  },
  segmented: {flexShrink: 0},
});

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage that cannot be written keeps the choice for this page only.
  }
}

/** The stored choice, where this page offers it; anything else keeps the default. */
function stored(key: string, mirrors: ReadonlyArray<GuideMirror>, fallback: GuideChoice): GuideChoice {
  const mirror = read(key);
  const channel = read(STORAGE.channel);
  const arch = read(STORAGE.arch);
  return {
    mirror: mirrors.find(item => item.id === mirror || item.uri === mirror)?.id ?? fallback.mirror,
    channel: channel === 'unstable' || channel === 'stable' ? channel : fallback.channel,
    arch: arch === 'arm64' || arch === 'amd64' ? arch : fallback.arch,
    sudo: read(STORAGE.sudo) !== 'off',
  };
}

/** Each text node retains its server source across mirror, channel and sudo changes. */
const originals = new WeakMap<Text, string>();

function apply(kind: GuideKind, mirrors: ReadonlyArray<GuideMirror>, choice: GuideChoice) {
  const rewrite = (text: string, sudo = choice.sudo) => rewriteCode(text, kind, mirrors, {...choice, sudo});
  for (const line of document.querySelectorAll('.astryx-code-block code [data-line]')) {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const base = nodes.map(node => {
      if (!originals.has(node)) originals.set(node, node.data);
      return originals.get(node)!;
    });
    const prompt = line.querySelector('[class*="astryx-token-prompt-"]');
    const promptIndex = nodes.findIndex(node => node.parentElement === prompt);
    const firstCommand = promptIndex + 1;
    const target = rewrite(base.join(''));
    const root = target.trimStart()[0] === '#';
    const pieces = base.map((text, index) => index === promptIndex
      ? root ? '# ' : text
      : rewrite(text, choice.sudo || index !== firstCommand));
    // Whole-line rules such as GENTOO_MIRRORS ordering can span several tokens.
    if (pieces.join('') !== target) {
      pieces.splice(firstCommand, pieces.length, target.slice(pieces.slice(0, firstCommand).join('').length));
    }
    if (prompt != null) prompt.className = `astryx-token-prompt-${root ? 'root' : 'user'}`;
    nodes.forEach((node, index) => {
      node.data = pieces[index] ?? '';
    });
  }
}

/** Shows one pane and hides the other; GuideSetupScript does the same before hydration. */
function show(pane: GuidePane) {
  for (const element of document.querySelectorAll<HTMLElement>('[data-gz-pane]')) element.hidden = element.dataset.gzPane !== pane;
}

/** Select the pane containing the URL fragment target. */
function paneOfHash(): {pane: GuidePane; element: HTMLElement} | null {
  let id = window.location.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  const element = id === '' ? null : document.getElementById(id);
  const pane = element?.closest<HTMLElement>('[data-gz-pane]')?.dataset.gzPane;
  return element != null && PANES.includes(pane as GuidePane) ? {pane: pane as GuidePane, element} : null;
}

function Controls({kind, mirrors, initial, tabs = false, hint, protocolSources = true, sudo = true}: Omit<GuideSetupProps, 'languageTag' | 'messages'>) {
  const t = useMessage();
  const [choice, setChoice] = useState<GuideChoice>({mirror: initial, channel: 'stable', arch: 'amd64', sudo: true});
  const mirrorKey = kind === 'official' ? 'official-mirror-source' : STORAGE.mirror;
  const selected = mirrors.find(mirror => mirror.id === choice.mirror) ?? mirrors[0]!;
  const [pane, setPane] = useState<GuidePane>('manual');

  useEffect(() => {
    if (!tabs) return;
    // A link to a pane, or to an anchor inside one, opens that pane and then scrolls, since the
    // browser cannot scroll to an element that was hidden.
    const follow = () => {
      const hit = paneOfHash();
      if (hit == null) return;
      show(hit.pane);
      setPane(hit.pane);
      hit.element.scrollIntoView();
    };
    follow();
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, [tabs]);

  useEffect(() => {
    if (tabs) show(pane);
  }, [tabs, pane]);

  useEffect(() => {
    const restore = () => setChoice(current => stored(mirrorKey, mirrors, current));
    restore();
    // A page restored from the back-forward cache reads the choice again; another guide may have changed it.
    const onShow = (event: PageTransitionEvent) => event.persisted && restore();
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [mirrors, mirrorKey]);

  useEffect(() => {
    apply(kind, mirrors, choice);
  }, [kind, mirrors, choice]);

  const pick = (next: Partial<GuideChoice>) => {
    if (next.mirror != null) write(mirrorKey, next.mirror);
    if (next.channel != null) write(STORAGE.channel, next.channel);
    if (next.arch != null) write(STORAGE.arch, next.arch);
    if (next.sudo != null) write(STORAGE.sudo, next.sudo ? 'on' : 'off');
    setChoice(current => ({...current, ...next}));
  };
  const name = (id: string) => (id === 'github' ? 'GitHub' : t(`gz.mirror.name.${id}` as MessageKey));

  const controls = (
    <HStack gap={SPACE.inline} vAlign="center" wrap="wrap" hAlign={tabs ? undefined : 'start'} xstyle={tabs ? styles.controls : undefined}>
      {kind === 'binpkg' ? (
        <SegmentedControl label={t('gz.guide.channel')} value={choice.channel} onChange={value => pick({channel: value as GuideChannel})} xstyle={styles.segmented}>
          {CHANNELS.map(channel => <SegmentedControlItem key={channel} value={channel} label={channel} />)}
        </SegmentedControl>
      ) : null}
      {kind === 'overlay' ? (
        <SegmentedControl label={t('gz.guide.arch')} value={choice.arch} onChange={value => pick({arch: value as GuideArch})} xstyle={styles.segmented}>
          {ARCHES.map(arch => <SegmentedControlItem key={arch} value={arch} label={arch} />)}
        </SegmentedControl>
      ) : null}
      <Selector
        label={kind === 'distfiles' ? t('gz.guide.preferred') : t('gz.guide.mirror')}
        isLabelHidden
        options={mirrors.map(mirror => ({value: mirror.id, label: mirror.label ?? name(mirror.id)}))}
        value={choice.mirror}
        onChange={mirror => pick({mirror})}
        hasSearch={kind === 'official'}
        placement="below"
        {...{title: hint, 'aria-description': hint}}
      />
      {sudo ? <Switch label={t('gz.guide.sudo')} value={choice.sudo} onChange={sudo => pick({sudo})} /> : null}
      {kind === 'official' && protocolSources ? <Text type="label" weight="normal" color="secondary" aria-live="polite">{t('gz.guide.protocolSources', {git: selected.git!.label, rsync: selected.rsync!.label})}</Text> : null}
    </HStack>
  );
  return (
    <VStack gap={SPACE.inline} paddingBlock={SPACE.block} xstyle={styles.setup}>
      {tabs ? (
        <HStack gap={SPACE.inline} vAlign="center" wrap="wrap" xstyle={styles.row}>
          <TabList value={pane} onChange={value => setPane(value as GuidePane)} role="tablist" hasDivider xstyle={styles.tabs}>
            {PANES.map(item => <Tab key={item} value={item} label={item === 'manual' ? t('gz.guide.manual') : t('gz.guide.quick')} panelId={item} />)}
          </TabList>
          {controls}
        </HStack>
      ) : controls}
    </VStack>
  );
}

export function GuideSetup({languageTag, messages, ...props}: GuideSetupProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <Controls {...props} />
    </InternationalizationProvider>
  );
}
