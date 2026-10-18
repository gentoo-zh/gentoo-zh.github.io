// Result-shaped placeholders: the opening dialog uses them before its chunk arrives, the palette while a search is in flight.
import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {Dialog} from '@astryxdesign/core/Dialog';
import {VStack} from '@astryxdesign/core/Layout';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {useMessage} from '../../i18n/useMessage';
import {SPACE} from '../../theme/scale';

/** CommandPalette's default dialog geometry, so the palette replaces the placeholder in place. */
export const PALETTE = {width: 640, maxHeight: 480} as const;
const ROWS = 6;
const TITLE_WIDTHS = ['45%', '60%', '38%', '52%', '66%', '42%'];

const styles = stylex.create({
  // CommandPaletteEmpty pads and centres its message; the rows bleed out to the list's own item inset.
  embedded: {
    flexGrow: 1,
    marginBlock: 'calc(-1 * var(--spacing-8))',
    marginInline: 'calc(-1 * var(--spacing-4))',
  },
  list: {minWidth: 0, width: '100%', padding: 'var(--spacing-1)'},
  row: {paddingBlock: 'var(--spacing-2)', paddingInline: 'var(--spacing-3)'},
  input: {paddingBlock: 'var(--spacing-3)', paddingInline: 'var(--spacing-4)', borderBlockEndColor: 'var(--color-border)', borderBlockEndStyle: 'solid', borderBlockEndWidth: 'var(--border-width)'},
});

export function SearchResultsSkeleton({isEmbedded = false}: {isEmbedded?: boolean}) {
  const t = useMessage();
  return <VStack role="status" aria-label={t('gz.search.loading')} xstyle={[styles.list, isEmbedded && styles.embedded]}>
    {TITLE_WIDTHS.slice(0, ROWS).map((width, row) => <VStack key={row} gap={SPACE.toolbar} aria-hidden xstyle={styles.row}>
      <Skeleton width={width} height={16} radius={1} index={row * 3} />
      <Skeleton height={12} radius={1} index={row * 3 + 1} />
      <Skeleton width="70%" height={12} radius={1} index={row * 3 + 2} />
    </VStack>)}
  </VStack>;
}

/** Opens at once on click and holds the palette's shape until the dialog chunk has loaded; portalled like the palette. */
export function SearchDialogFallback({isOpen, onOpenChange, onShow}: {isOpen: boolean; onOpenChange: (open: boolean) => void; onShow: () => void}) {
  const t = useMessage();
  useEffect(onShow, [onShow]);
  return createPortal(<Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={PALETTE.width} maxHeight={PALETTE.maxHeight} purpose="info" aria-label={t('gz.search.label')} aria-busy>
    <VStack aria-hidden xstyle={styles.input}>
      <Skeleton width="40%" height={20} radius={1} />
    </VStack>
    <SearchResultsSkeleton />
  </Dialog>, document.body);
}
