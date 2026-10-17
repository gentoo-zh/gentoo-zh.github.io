// Load the dialog and Pagefind on first open; check:budget accounts for them as on-demand code.
import {lazy, Suspense, useEffect, useRef, useState, type LazyExoticComponent} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {useMessage} from '../../i18n/useMessage';
import {useSearchShortcut} from './useSearchShortcut';

export function SearchButton({isHydrated}: {isHydrated: boolean}) {
  const [SearchDialog, setSearchDialog] = useState<LazyExoticComponent<typeof import('./SearchDialog').default> | null>(null);
  const t = useMessage();
  const [isOpen, setIsOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (isOpen || opener.current == null) return;
    // Wait for the dialog's own close effect before restoring the pre-import focus.
    const frame = requestAnimationFrame(() => {
      const target = opener.current;
      const visible = (element: HTMLElement | null) => element !== document.body && element?.getClientRects().length;
      const fallback = [...document.querySelectorAll<HTMLElement>('[data-search-open],[data-mobile-nav-open]')].find(visible);
      (visible(target) ? target : fallback)?.focus({preventScroll: true});
      opener.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);
  const open = (trigger: HTMLElement | null) => {
    if (isOpen) return;
    opener.current = trigger;
    setSearchDialog((current: typeof SearchDialog) => current ?? lazy(() => import('./SearchDialog')));
    setIsOpen(true);
  };
  useSearchShortcut(open);
  return (
    <>
      <Button isDisabled={!isHydrated} label={t('gz.search.open')} tooltip={t('gz.search.shortcut')} variant="ghost" isIconOnly icon={<Icon icon="search" color="inherit" />} data-search-open />
      {SearchDialog != null ? (
        <Suspense fallback={null}>
          <SearchDialog isOpen={isOpen} onOpenChange={setIsOpen} />
        </Suspense>
      ) : null}
    </>
  );
}
