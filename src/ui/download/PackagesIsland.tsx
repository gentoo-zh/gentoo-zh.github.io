// Mount point for the live package table and its dependency view; the server renders the loading skeletons.
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {VStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, ICON, TEMPLATE} from '../../theme/scale';
import {FileText} from '../chrome/icons';
import {useSkeletonColumns} from '../data/columns';
import {NoScriptNote} from '../data/NoScriptNote';
import {TableSkeleton, type SkeletonColumn} from '../data/TableSkeleton';
import {pixel} from '@astryxdesign/core/Table';
import {PackagesFrame, type View} from './PackagesFrame';
import {DEPS_COLUMNS, DEPS_COMPACT_COLUMNS, PACKAGE_COMPACT_COLUMNS, PACKAGES_ISLAND, PACKAGES_TEXT, packageColumns, type PackagesIslandProps} from './packagesData';

const styles = stylex.create({
  // Legacy `#overlay` lands on the island (id `lists`), below the navigation bar.
  root: {display: 'block', scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))'},
  // A plain block: a VStack's own `display: flex` would override the `hidden` the view swap sets.
  view: {minWidth: 0},
});

/** The row-expansion chevron column the live table puts first (Astryx draws it 40px wide); a control, so no bar. */
const CHEVRON: SkeletonColumn = {key: 'expand', header: '', width: pixel(40), lines: 0};
/** The skeleton cannot know the schema yet, so it draws the schema 4 columns. */
const WIDE_COLUMNS = packageColumns(false);

/** Measured on the loaded tables, divider included: 45px wide, 69px for a stacked phone row without tokens. */
const ROW_HEIGHT = 'calc(var(--spacing-12) - var(--spacing-1) + var(--border-width))';
const COMPACT_ROW_HEIGHT = 'calc(var(--spacing-12) + var(--spacing-4) + var(--spacing-1) + var(--border-width))';

export function PackagesIsland({props}: {props: PackagesIslandProps}) {
  const t = useMessage();
  const columns = [CHEVRON, ...useSkeletonColumns(WIDE_COLUMNS)];
  const compactColumns = [CHEVRON, ...useSkeletonColumns(PACKAGE_COMPACT_COLUMNS)];
  const depsColumns = useSkeletonColumns(DEPS_COLUMNS);
  const depsCompactColumns = useSkeletonColumns(DEPS_COMPACT_COLUMNS);
  // The live frame (PackagesFrame) with placeholder rows, one per view: tabs, toolbar and results
  // line keep their loaded size, so the table header does not move when the index arrives.
  // PackagesScript shows the dependency frame instead when the address asks for `?view=deps`.
  // Without scripting the note links the status reference and the plain-text lists instead.
  const frame = (view: View, table: ReactNode) => (
    <div {...stylex.props(styles.view)} data-gz-view-skeleton={view} hidden={view === 'deps'}>
      <PackagesFrame view={view} channel="stable" isUnstableReady query="" hideOffList statusHref={props.statusHref} summary={null} isStatic>
        {table}
      </PackagesFrame>
    </div>
  );
  return (
    <VStack id="lists" xstyle={styles.root} data-pagefind-ignore data-gz-island={PACKAGES_ISLAND} data-props={JSON.stringify(props)}>
      <NoScriptNote>
        <Text color="secondary">{t('gz.packages.noscript')}</Text>
        <Button variant="ghost" size={BUTTON.toolbar} label={t('gz.packages.statusHelp')} href={props.statusHref} icon={<Icon icon="info" />} />
        {PACKAGES_TEXT.map(({name, href}) => (
          <Button key={name} variant="secondary" size={BUTTON.toolbar} label={name} href={href} icon={<FileText size={ICON.inlinePx} />} />
        ))}
      </NoScriptNote>
      <VStack gap={TEMPLATE.zero} data-gz-skeleton>
        {frame('packages', <TableSkeleton columns={columns} compactColumns={compactColumns} rowHeight={ROW_HEIGHT} compactRowHeight={COMPACT_ROW_HEIGHT} />)}
        {frame('deps', <TableSkeleton columns={depsColumns} compactColumns={depsCompactColumns} rowHeight={ROW_HEIGHT} compactRowHeight={COMPACT_ROW_HEIGHT} />)}
      </VStack>
    </VStack>
  );
}
