// Loaded on first open; CommandPalette owns grouping, keyboard selection and dialog geometry.
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {CommandPalette, CommandPaletteInput, useCommandPaletteContext} from '@astryxdesign/core/CommandPalette';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, SPACE} from '../../theme/scale';
import {createPagefindSource} from './pagefindSource';
import {PALETTE, SearchResultsSkeleton} from './SearchLoading';

const styles = stylex.create({
  match: {backgroundColor: 'var(--color-accent-muted)', color: 'inherit'},
  result: {minWidth: 0, width: '100%'},
  replacing: {animationName: 'none'},
});

/** Astryx shows the empty slot until a search commits; while one is in flight it shows result rows instead. */
function Pending({children}: {children: ReactNode}) {
  return useCommandPaletteContext()?.isBusy ? <SearchResultsSkeleton isEmbedded /> : children;
}

export default function SearchDialog({isOpen, onOpenChange, isReplacing}: {isOpen: boolean; onOpenChange: (open: boolean) => void; isReplacing: boolean}) {
  const t = useMessage();
  const locale = document.documentElement.lang.toLowerCase() as Locale;
  const [failed, setFailed] = useState(false);
  const source = useMemo(() => createPagefindSource(locale, t, setFailed), [locale, t]);
  useEffect(() => () => source.cancel?.(), [source]);
  const failure = <VStack gap={SPACE.inline} role="alert">
    <Text>{t('gz.search.failed')}</Text>
    <Button label={t('gz.search.reload')} variant="primary" size={BUTTON.cta} onClick={() => window.location.reload()} />
  </VStack>;

  // The desktop trigger's hidden ancestor must not hide the palette opened from mobile navigation.
  return createPortal(
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={source}
      label={t('gz.search.label')}
      width={PALETTE.width}
      maxHeight={PALETTE.maxHeight}
      xstyle={isReplacing ? styles.replacing : undefined}
      input={<CommandPaletteInput label={t('gz.search.label')} placeholder={t('gz.search.placeholder')} />}
      emptySearchText={<Pending>{failed ? failure : t('gz.search.emptyTitle')}</Pending>}
      emptyBootstrapText={<Pending>{failed ? failure : t('gz.search.loading')}</Pending>}
      onValueChange={url => window.location.assign(url)}
      renderItem={item => <VStack gap={SPACE.toolbar} xstyle={styles.result}>
        <Text type="body" maxLines={2}>{item.label}</Text>
        <Text type="supporting" color="secondary" maxLines={2}>
          {item.auxiliaryData.excerpt.map((part, index) => part.match
            // eslint-disable-next-line no-restricted-syntax -- Astryx has no semantic mark component.
            ? <mark key={index} {...stylex.props(styles.match)}>{part.text}</mark>
            : part.text)}
        </Text>
      </VStack>}
    />,
    document.body,
  );
}
