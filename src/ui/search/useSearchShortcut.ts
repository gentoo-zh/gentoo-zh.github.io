import {useEffect} from 'react';

/** Opens site search on "/", as the Astryx docsite does, unless the reader is typing in a field. */
export function useSearchShortcut(open: (trigger: HTMLElement | null) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target != null && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      open(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    };
    const onClick = (event: MouseEvent) => {
      const trigger = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-search-open]:not(:disabled):not([aria-disabled="true"])') : null;
      if (trigger) open(trigger);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  });
}
