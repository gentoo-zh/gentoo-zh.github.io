// A note shown only without scripting, in place of a loading placeholder that nothing will replace.
// SiteHead's <noscript> style reveals it; an island's first render replaces it with the rest of the mount.
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {HStack} from '@astryxdesign/core/Layout';
import {SPACE} from '../../theme/scale';

const styles = stylex.create({
  root: {display: 'none'},
});

export function NoScriptNote({children}: {children: ReactNode}) {
  return (
    <HStack gap={SPACE.inline} vAlign="center" wrap="wrap" data-gz-noscript xstyle={styles.root}>
      {children}
    </HStack>
  );
}
