// What a reader does to an island before its script mounts: hold it, and repeat it on the live control.
// One adapter per kind of control, because a repeated plain click cannot stand in for a modified link
// click or for typed text. Every adapter also starts loading on the first sign of use.

/** An `intent` condition of ./schedule. */
export interface Intent {
  /** Listens for use; `trigger` starts loading the island and may be called again. */
  arm(trigger: () => void): void;
  /** The island is live: stops listening and repeats what was held, in order; settles once it has. */
  replay(): void | Promise<void>;
  /** Loading failed: stops listening and lets what was held act natively, or drops it; the next press acts natively. */
  release(): void;
}

/** Finds a control again after mounting replaced its element. */
export interface Controls {
  selector: string;
  /** Names the control; the replacement carries the same name. */
  key(control: Element): string | null;
  /**
   * Where a named control went when the live island no longer renders it, such as a toggle that an
   * overflow list folded into its menu: `activate` applies a held press by name, and `focus` takes the
   * focus in its place. Without this, a press on a control that is gone is not repeated.
   */
  moved?(key: string): Moved;
}

export interface Moved {
  activate(): void;
  focus: HTMLElement | null;
}

/** Controls marked by `attribute`, whose value names each one. */
export const marked = (attribute: string): Controls => ({selector: `[${attribute}]`, key: control => control.getAttribute(attribute)});

/**
 * Controls of a hydrated island, matched by `selector`. Hydration keeps the server's elements, so each
 * element is its own name; a control that a mismatch re-rendered has no match and is not repeated.
 */
export function hydrated(selector: string): Controls {
  const names = new WeakMap<Element, string>();
  let next = 0;
  return {
    selector,
    key(control) {
      let name = names.get(control);
      if (name == null) names.set(control, (name = String(next++)));
      return name;
    },
  };
}

/** These start loading but are never held. */
const USE = ['pointerdown', 'keydown', 'focusin', 'mouseover'] as const;

function listeners() {
  const removers: (() => void)[] = [];
  return {
    on<E extends Event>(target: EventTarget, type: string, handler: (event: E) => void, options: AddEventListenerOptions = {}) {
      target.addEventListener(type, handler as EventListener, options);
      removers.push(() => target.removeEventListener(type, handler as EventListener, options));
    },
    off: () => {
      for (const remove of removers.splice(0)) remove();
    },
  };
}

const isPlain = (event: MouseEvent | KeyboardEvent) => !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);

/** Of responsive duplicates (phone and desktop variants), the rendered one; inert copies kept for measuring never count. */
function find(root: Element, controls: Controls, key: string | null) {
  if (key == null) return null;
  const matches = [...root.querySelectorAll<HTMLElement>(controls.selector)].filter(control => control.closest('[inert]') == null && controls.key(control) === key);
  return matches.find(control => control.getClientRects().length > 0) ?? matches[0] ?? null;
}

/**
 * Plain primary clicks on `controls`, plus the `keys` that activate each control: each one held as an
 * activation and repeated as one click, in the order they came. A held key's default is prevented, so it
 * produces no click of its own to count twice. `keys` returns null for a matched element that is never
 * held. If loading fails, `onRelease` decides what held presses do.
 */
function activations(root: Element, controls: Controls, keys: (control: Element) => readonly string[] | null, onRelease: 'native' | 'drop'): Intent {
  const events = listeners();
  const held: {key: string; control: HTMLElement}[] = [];
  // Replacing a focused stand-in drops focus to the body; the replacement takes it back.
  let focused: Element | null = null;
  const controlOf = (target: EventTarget | null) => {
    const control = target instanceof Element ? target.closest<HTMLElement>(controls.selector) : null;
    return control != null && root.contains(control) ? control : null;
  };
  const hold = (event: Event, control: HTMLElement, trigger: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    const key = controls.key(control);
    if (key != null) held.push({key, control});
    trigger();
  };
  return {
    arm(trigger) {
      for (const type of USE) events.on(root, type, trigger, {passive: true});
      events.on<FocusEvent>(root, 'focusin', event => {
        focused = controlOf(event.target);
      });
      // Removing a focused element fires focusout towards nothing, so only a move elsewhere forgets it.
      events.on<FocusEvent>(root, 'focusout', event => {
        if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) focused = null;
      });
      events.on<MouseEvent>(
        root,
        'click',
        event => {
          const control = controlOf(event.target);
          if (control != null && keys(control) != null && event.button === 0 && isPlain(event)) hold(event, control, trigger);
        },
        {capture: true},
      );
      events.on<KeyboardEvent>(
        root,
        'keydown',
        event => {
          const control = controlOf(event.target);
          if (control != null && keys(control)?.includes(event.key) === true && !event.repeat && isPlain(event)) hold(event, control, trigger);
        },
        {capture: true},
      );
    },
    async replay() {
      events.off();
      const active = document.activeElement;
      const key = focused == null ? null : controls.key(focused);
      if (focused != null && !focused.isConnected && key != null && (active == null || active === document.body)) {
        (find(root, controls, key) ?? controls.moved?.(key).focus)?.focus({preventScroll: true});
      }
      focused = null;
      for (const {key} of held.splice(0)) {
        const control = find(root, controls, key);
        if (control != null) control.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, composed: true, view: window, detail: 0}));
        else controls.moved?.(key).activate();
        // React handles a dispatched click as a discrete event and commits its update in a microtask that
        // the dispatch queued, so after one more microtask the next press meets the state and controls
        // this one produced. Microtasks also keep a real press from slipping in between held ones.
        await Promise.resolve();
      }
    },
    release() {
      events.off();
      // The island's handlers never arrived, so the click reaches the browser's own activation.
      if (onRelease === 'native') for (const {key, control} of held) follow(find(root, controls, key) ?? control);
      held.length = 0;
    },
  };
}

/**
 * Clicks a link natively. One that a failed mount removed can no longer navigate, so its address is
 * followed in the browsing context its target names.
 */
function follow(link: HTMLElement) {
  if (link.isConnected) return link.click();
  if (!(link instanceof HTMLAnchorElement) || link.href === '') return;
  if (link.target === '' || link.target === '_self') location.assign(link.href);
  else window.open(link.href, link.target, 'noopener');
}

/** A checkbox or radio button, a switch included, toggles on Space only; Enter does nothing. */
const isCheckable = (control: Element) => control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio');

/** A field that takes text: Space and Enter are typing there, not activation. */
const isTextField = (control: Element) => control instanceof HTMLTextAreaElement || (control instanceof HTMLInputElement && !isCheckable(control) && !['button', 'submit', 'reset'].includes(control.type));

/**
 * Buttons, and stand-in links for them: a click, Enter or Space is one activation, repeated as a
 * `detail: 0` click (native buttons ignore synthetic key events). Checkboxes and switches hold Space
 * alone, as they react natively, and text fields are never held. Controls with their own keyboard protocol
 * need an adapter of their own. If loading fails, held presses are dropped: a button has no native
 * action to fall back to.
 */
export const buttons = (root: Element, controls: Controls) =>
  activations(root, controls, control => (isTextField(control) ? null : isCheckable(control) ? [' '] : ['Enter', ' ']), 'drop');

/**
 * Links whose plain click the island takes over (sidebar group headers fold their group). Only a plain
 * primary click is held; modified and middle clicks open the link natively. Enter on a link already
 * clicks it, so no key is held. If loading fails, held clicks follow their links natively.
 */
export const links = (root: Element, controls: Controls) => activations(root, controls, () => [], 'native');

interface Typed {
  value: string;
  edited: boolean;
  start: number | null;
  end: number | null;
  direction: 'forward' | 'backward' | 'none' | null;
}

/**
 * A text field, matched by `selector` inside `root`. Typing is never held; the latest value is written
 * back after mounting, outside any IME composition, and the selection and focus too while the field
 * still has focus: a reader who moved on keeps the focus where it went.
 */
export function textInput(root: Element, selector: string): Intent {
  const events = listeners();
  const field = () => root.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
  let typed: Typed | null = null;
  let composing = false;
  // Whether the field has focus now; mounting may drop it to the body, which does not count as leaving.
  let focused = false;
  const snapshot = (edited: boolean) => {
    const input = field();
    if (input == null || composing) return;
    typed = {
      value: input.value,
      edited: edited || (typed?.edited ?? false),
      start: input.selectionStart,
      end: input.selectionEnd,
      direction: input.selectionDirection,
    };
  };
  const write = () => {
    const input = field();
    if (input == null || typed == null) return;
    const {value, edited, start, end, direction} = typed;
    typed = null;
    if (edited) {
      // React compares the value it last set, through the element's own `value` setter, with the DOM.
      // Clearing through that setter and writing through the prototype's makes `input` read as a change.
      input.value = '';
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set?.call(input, value);
      input.dispatchEvent(new Event('input', {bubbles: true}));
    }
    const active = document.activeElement;
    if (!focused || (active !== input && active != null && active !== document.body)) return;
    if (active !== input) input.focus({preventScroll: true});
    if (start != null && end != null) input.setSelectionRange(start, end, direction ?? undefined);
  };
  return {
    arm(trigger) {
      for (const type of [...USE, 'input']) events.on(root, type, trigger, {passive: true});
      events.on(root, 'input', () => snapshot(true));
      focused = document.activeElement === field();
      events.on(root, 'focusin', event => {
        if (event.target === field()) focused = true;
      });
      // A removed field fires focusout while detached; only a field still in the page has been left.
      events.on(root, 'focusout', event => {
        if (event.target === field() && (event.target as Node).isConnected) focused = false;
      });
      events.on(root, 'compositionstart', () => {
        composing = true;
      });
      events.on(root, 'compositionend', () => {
        composing = false;
        snapshot(true);
      });
      events.on(document, 'selectionchange', () => {
        if (document.activeElement === field()) snapshot(false);
      });
    },
    replay() {
      events.off();
      if (!composing) return write();
      // Writing mid-composition would cancel the IME; write the text it commits.
      root.addEventListener(
        'compositionend',
        () => {
          composing = false;
          snapshot(true);
          write();
        },
        {once: true},
      );
    },
    release() {
      events.off();
      typed = null;
    },
  };
}

/**
 * A page-wide shortcut key, repeated on its target once the island is live. Nothing is held, and the
 * island's handler decides on the repeat, so a "/" typed into a field stays text.
 */
export function shortcut(key: string): Intent {
  const events = listeners();
  let repeat: (() => void) | null = null;
  return {
    arm(trigger) {
      events.on<KeyboardEvent>(document, 'keydown', event => {
        if (event.key !== key) return;
        const {target, ctrlKey, metaKey, altKey} = event;
        const node = target instanceof Node && target.isConnected ? target : document.body;
        repeat = () => (node.isConnected ? node : document.body).dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey, metaKey, altKey, bubbles: true, cancelable: true}));
        trigger();
      });
    },
    replay() {
      events.off();
      repeat?.();
      repeat = null;
    },
    release() {
      events.off();
      repeat = null;
    },
  };
}
