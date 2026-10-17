// Static Astryx field enhanced by BlogSearch.astro; no React hydration is needed.
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {VStack} from '@astryxdesign/core/Layout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, ICON, SPACE} from '../../theme/scale';

const styles = stylex.create({visibility: {display: {default: 'flex', ':is([hidden])': 'none'}}});

export function CollectionSearch() {
  const t = useMessage();
  return (
    <VStack data-collection-search hidden xstyle={styles.visibility}>
      {/* A seed materializes Astryx's conditional clear button in static HTML. The delegate
          empties the field and hides the button before revealing the search control. */}
      <TextInput value=" " label={t('gz.blog.search')} isLabelHidden placeholder={t('gz.blog.search')} hasClear startIcon={<Icon icon="search" size={ICON.inline} />} width="100%" />
    </VStack>
  );
}

export function CollectionEmpty({isEmpty}: {isEmpty: boolean}) {
  const t = useMessage();
  return (
    <VStack gap={SPACE.block} data-collection-empty hidden={!isEmpty} xstyle={styles.visibility}>
      <EmptyState title={t('gz.blog.empty')} description={t('gz.blog.emptyHelp')} role="status" actions={
        <Button label={t('gz.blog.clear')} variant="primary" size={BUTTON.cta} data-collection-reset hidden />
      } />
    </VStack>
  );
}
