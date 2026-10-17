// Static ClickableCards need delegation; mounted Astryx handlers mark their own containers.
const CONTROLS = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"]';

function cardLink(target: EventTarget | null): {card: Element; link: HTMLAnchorElement} | null {
  if (!(target instanceof Element)) return null;
  const card = target.closest('.astryx-card');
  const link = card?.querySelector<HTMLAnchorElement>(':scope > a[href]');
  return card != null && link != null ? {card, link} : null;
}

export function forwardCardClicks() {
  const open = (event: MouseEvent) => {
    const hit = cardLink(event.target);
    if (hit == null || event.defaultPrevented || hit.card.hasAttribute('data-pressable-container')) return;
    if ((event.target as Element).closest(CONTROLS) != null) return;
    if (window.getSelection()?.toString()) return;
    const newTab = event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey;
    if (newTab || hit.link.target === '_blank') window.open(hit.link.href, '_blank', 'noopener');
    else hit.link.click();
  };
  document.addEventListener('click', event => { if (event.button === 0) open(event); });
  document.addEventListener('auxclick', event => { if (event.button === 1) open(event); });
}
