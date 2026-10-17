// The frame around the package tables: view tabs, one toolbar, the results line, then the tables.
// PackagesTable draws it live; PackagesIsland draws the same frame on the server as the loading state,
// so swapping in the loaded table moves nothing above the table header.
// The header follows the table-filter template: view tabs, then one toolbar, then a results line.
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Search} from './PackagesIcons';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, GRID, ICON, SPACE, STACK, TAB} from '../../theme/scale';
import {FileText} from '../chrome/icons';
import {PACKAGES_TEXT} from './packagesData';

/** Channel names are Portage terms and stay untranslated in every locale. */
export const CHANNELS = ['stable', 'unstable'] as const;
export type Channel = (typeof CHANNELS)[number];

/** The two views of the table area: the overlay's packages, and the `::gentoo` dependencies. */
export const VIEWS = ['packages', 'deps'] as const;
export type View = (typeof VIEWS)[number];
const PANEL_ID = 'gz-packages-panel';
const tabId = (view: View) => `gz-packages-tab-${view}`;

const styles = stylex.create({
  // The table-filter template's search slot: it takes the free width and wraps under the channel on phones.
  // 10rem keeps channel, off-list switch, search and actions on one line at 1024px (17.5rem wrapped them).
  search: {flexBasis: '10rem'},
  // The actions keep to the end of the toolbar, also after wrapping (the template's toolbarEnd).
  toolbarEnd: {marginInlineStart: 'auto'},
});

const ignore = () => {};

export interface PackagesFrameProps {
  view: View;
  channel: Channel;
  isUnstableReady: boolean;
  query: string;
  hideOffList: boolean;
  /** The status reference page, linked from the toolbar. */
  statusHref: string;
  /** The results line; null while the index loads, which draws a placeholder of the same height. */
  summary: string | null;
  /** The loading frame: no ids or handlers; only the tabs respond (PackagesScript), the rest is inert until the live table replaces it. */
  isStatic?: boolean;
  onView?: (view: View) => void;
  onChannel?: (channel: Channel) => void;
  onQuery?: (query: string) => void;
  onHideOffList?: (hide: boolean) => void;
  children: ReactNode;
}

export function PackagesFrame(props: PackagesFrameProps) {
  const {view, channel, isUnstableReady, query, hideOffList, statusHref, summary, isStatic = false, children} = props;
  const t = useMessage();
  const listsButton = {label: t('gz.packages.lists'), variant: 'secondary', size: BUTTON.toolbar, icon: <FileText size={ICON.inlinePx} />} as const;
  const panel = isStatic ? {} : {id: PANEL_ID, role: 'tabpanel', 'aria-labelledby': tabId(view)};
  return (
    <VStack gap={SPACE.inline}>
      <TabList value={view} onChange={value => props.onView?.(value as View)} role="tablist" size={TAB.view} hasDivider>
        {VIEWS.map(name => (
          <Tab
            key={name}
            id={isStatic ? undefined : tabId(name)}
            value={name}
            label={name === 'deps' ? t('gz.packages.deps.title') : t('gz.packages.view.packages')}
            panelId={isStatic ? undefined : PANEL_ID}
          />
        ))}
      </TabList>
      <VStack gap={SPACE.inline} inert={isStatic || undefined} {...panel}>
        <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
          <SegmentedControl label={t('gz.packages.scope')} value={channel} onChange={value => props.onChannel?.(value as Channel)}>
            {CHANNELS.map(name => (
              <SegmentedControlItem key={name} value={name} label={name} isDisabled={name === 'unstable' && !isUnstableReady} />
            ))}
          </SegmentedControl>
          {/* The rows' other scope, so it sits beside the channel and shares its line on phones. It filters
              the packages view only; the deps view keeps it in place, disabled, so the toolbar does not reflow. */}
          <Switch label={t('gz.packages.hideOffList')} value={hideOffList} onChange={props.onHideOffList ?? ignore} isDisabled={view === 'deps'} />
          <StackItem size={STACK.fill} xstyle={styles.search}>
            <TextInput
              label={t('gz.packages.search')}
              isLabelHidden
              value={query}
              onChange={props.onQuery ?? ignore}
              placeholder={t('gz.packages.searchPlaceholder')}
              startIcon={<Icon icon={Search} size={ICON.inline} />}
            />
          </StackItem>
          <HStack gap={SPACE.cluster} vAlign="center" xstyle={styles.toolbarEnd}>
            <Button variant="ghost" size={BUTTON.toolbar} label={t('gz.packages.statusHelp')} href={statusHref} icon={<Icon icon="info" />} />
            {isStatic ? (
              // The menu's trigger as DropdownMenu draws it, without a popup no script would open yet.
              <Button {...listsButton} endContent={<Icon icon="chevronDown" size={ICON.inline} color="inherit" />} />
            ) : (
              <DropdownMenu button={listsButton} items={PACKAGES_TEXT.map(({name, href}) => ({id: name, label: name, href}))} alignment="end" />
            )}
          </HStack>
        </HStack>
        {summary == null ? (
          // The line box of the live text, holding a bar in place of the counts.
          <HStack gap={SPACE.hairline} vAlign="center">
            <Skeleton width={GRID.card} height={12} radius={1} />
            <Text type="supporting">{'\u00a0'}</Text>
          </HStack>
        ) : (
          <Text type="supporting" color="secondary" hasTabularNumbers>{summary}</Text>
        )}
        {children}
      </VStack>
    </VStack>
  );
}
