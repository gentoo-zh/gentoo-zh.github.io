// Mount point for the directory browser; files-client renders it from the address bar's path.
import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Text} from '@astryxdesign/core/Text';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, GRID, SPACE} from '../../theme/scale';
import {NoScriptNote} from '../data/NoScriptNote';
import {FilesSkeleton} from './FilesSkeleton';
import {FILES_ISLAND, type FilesIslandProps} from './filesData';

const styles = stylex.create({
  root: {display: 'block'},
});

/** The trail's fixed height (FilesTable `trail`), so the trail that replaces its placeholder moves nothing. */
const CRUMBS_HEIGHT = 36;

export function FilesIsland({props}: {props: FilesIslandProps}) {
  const t = useMessage();
  // Same frame as FilesTable: the breadcrumb trail, then the table; the island's first render replaces it.
  return (
    <>
      {/* The listing request starts after the script loads; open its connection now. */}
      <link rel="preconnect" href={props.origin} crossOrigin="anonymous" />
      <VStack xstyle={styles.root} data-pagefind-ignore data-gz-island={FILES_ISLAND} data-props={JSON.stringify(props)}>
        <NoScriptNote>
          <Text color="secondary">{t('gz.files.noscript')}</Text>
          <Button variant="secondary" size={BUTTON.cta} label={new URL(props.origin).host} href={`${props.origin}/`} />
        </NoScriptNote>
        <VStack gap={SPACE.inline} data-gz-skeleton>
          <Skeleton width={GRID.card} height={CRUMBS_HEIGHT} radius={1} />
          <FilesSkeleton />
        </VStack>
      </VStack>
    </>
  );
}
