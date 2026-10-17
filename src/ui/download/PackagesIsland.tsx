// Mount point for the live package table; packages-client renders it once the index loads.
import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {PACKAGES_ISLAND, type PackagesIslandProps} from './packagesData';

const styles = stylex.create({
  root: {display: 'block'},
});

export function PackagesIsland({props}: {props: PackagesIslandProps}) {
  return <VStack xstyle={styles.root} data-pagefind-ignore data-gz-island={PACKAGES_ISLAND} data-props={JSON.stringify(props)} />;
}
