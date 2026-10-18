// src/ui/islands/intent.ts: what a reader does before an island mounts, held and repeated afterwards.
import type {Page} from '@playwright/test';
import {events, expect, finish, script, test} from './fixture';

test.describe('buttons', () => {
  // Mounting replaces the stand-in, as hydration may; the document logs every click that gets through.
  const markup = `<div id="root"><button data-control="menu" data-state="stand-in" aria-disabled="true">Menu</button></div>${script(`
    const root = document.getElementById('root');
    document.addEventListener('click', event => record('click ' + event.target.dataset.state + ' detail=' + event.detail));
    track(schedule('nav', [{kind: 'intent', on: buttons(root, marked('data-control'))}], manualStart(() => {
      root.innerHTML = '<button data-control="menu" data-state="live">Menu</button>';
    })));`)}`;
  const replayed = ['start', 'click live detail=0', 'ready'];

  test('a click is held and replayed once on the replacement', async ({open, page}) => {
    await open(markup);
    // force: a reader can press an aria-disabled stand-in; Playwright would wait for it to enable.
    await page.click('button', {force: true});
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    expect(await events(page)).toEqual(replayed);
  });

  for (const key of ['Enter', ' ']) {
    test(`${key === ' ' ? 'Space' : key} is one activation, and focus moves to the replacement`, async ({open, page}) => {
      await open(markup);
      await page.focus('button');
      await page.keyboard.press(key);
      await expect.poll(() => events(page)).toEqual(['start']);
      await finish(page);
      expect(await events(page)).toEqual(replayed);
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.state)).toBe('live');
    });
  }

  test('Space released after mounting does not click again', async ({open, page}) => {
    await open(markup);
    await page.focus('button');
    await page.keyboard.down(' ');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    await page.keyboard.up(' ');
    expect(await events(page)).toEqual(replayed);
  });

  test('presses on two controls are replayed in the order they came', async ({open, page}) => {
    await open(`<div id="root"><button data-control="a">A</button><button data-control="b">B</button></div>${script(`
      const root = document.getElementById('root');
      document.addEventListener('click', event => record('click ' + event.target.dataset.control + (event.isTrusted ? '' : ' replayed')));
      track(schedule('nav', [{kind: 'intent', on: buttons(root, marked('data-control'))}], manualStart(() => {
        root.innerHTML = '<button data-control="a">A</button><button data-control="b">B</button>';
      })));`)}`);
    await page.click('[data-control="b"]');
    await page.click('[data-control="a"]');
    await page.focus('[data-control="b"]');
    await page.keyboard.press('Enter');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    expect(await events(page)).toEqual(['start', 'click b replayed', 'click a replayed', 'click b replayed', 'ready']);
  });

  test('a press on a control the live island moved is applied by name, and its stand-in takes the focus', async ({open, page}) => {
    await open(`<div id="root"><button data-control="a">A</button><button data-control="b">B</button></div>${script(`
      const root = document.getElementById('root');
      document.addEventListener('click', event => record('click ' + event.target.dataset.control));
      const controls = {
        ...marked('data-control'),
        moved: key => ({activate: () => record('moved ' + key), focus: document.getElementById('more')}),
      };
      track(schedule('contributors', [{kind: 'intent', on: buttons(root, controls)}], manualStart(() => {
        // Like an overflow list: B folds into a menu whose trigger stands in for it.
        root.innerHTML = '<button data-control="a">A</button><button id="more">More</button>';
      })));`)}`);
    await page.focus('[data-control="b"]');
    await page.keyboard.press(' ');
    await page.click('[data-control="a"]');
    await page.focus('[data-control="b"]');
    await page.keyboard.press('Enter');
    await finish(page);
    expect(await events(page)).toEqual(['start', 'moved b', 'click a', 'moved b', 'ready']);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('more');
  });

  test('hover and focus start loading without being replayed', async ({open, page}) => {
    await open(markup);
    await page.hover('button');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    expect(await events(page)).toEqual(['start', 'ready']);
  });
});

test('a toggle pressed twice ends where it began, each replay seeing the state the last one committed', async ({open, page}) => {
  await open(`<div id="root"><button id="toggle" aria-pressed="false">Toggle</button></div>${script(`
    const root = document.getElementById('root');
    track(schedule('section', [{kind: 'intent', on: buttons(root, hydrated('button'))}], manualStart(() => hydrateToggle(root))));`)}`);
  await page.dblclick('#toggle');
  await finish(page);
  expect(await events(page)).toEqual(['start', 'ready']);
  await expect(page.locator('#toggle')).toHaveAttribute('aria-pressed', 'false');
  // The live toggle answers a third press, so the two replays did reach it.
  await page.click('#toggle');
  await expect(page.locator('#toggle')).toHaveAttribute('aria-pressed', 'true');
});

test('a text field among the buttons is typed into, never held', async ({open, page}) => {
  // GuideSetup holds `button, input`; Space and Enter in a text field are text.
  await open(`<div id="root"><input id="name" type="text"><button>Go</button></div>${script(`
    const root = document.getElementById('root');
    document.addEventListener('click', event => { if (!event.isTrusted) record('replayed ' + event.target.tagName); });
    track(schedule('guide', [{kind: 'intent', on: buttons(root, hydrated('button, input'))}], manualStart()));`)}`);
  await page.click('#name');
  await page.keyboard.type('a b');
  await finish(page);
  expect(await page.inputValue('#name')).toBe('a b');
  expect(await events(page)).toEqual(['start', 'ready']);
});

test.describe('switches', () => {
  // A native checkbox, the GuideSetup sudo switch included, toggles on Space and ignores Enter.
  const markup = `<div id="root"><input type="checkbox" role="switch" data-control="sudo" data-state="stand-in"></div>${script(`
    const root = document.getElementById('root');
    document.addEventListener('click', event => record('click ' + event.target.dataset.state + ' detail=' + event.detail));
    track(schedule('guide', [{kind: 'intent', on: buttons(root, marked('data-control'))}], manualStart(() => {
      root.innerHTML = '<input type="checkbox" role="switch" data-control="sudo" data-state="live">';
    })));`)}`;

  test('Space is held and replayed as one toggle', async ({open, page}) => {
    await open(markup);
    await page.focus('input');
    await page.keyboard.press(' ');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    expect(await events(page)).toEqual(['start', 'click live detail=0', 'ready']);
    expect(await page.isChecked('input')).toBe(true);
  });

  test('Enter starts loading and toggles nothing, as natively', async ({open, page}) => {
    await open(markup);
    await page.focus('input');
    await page.keyboard.press('Enter');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page);
    expect(await events(page)).toEqual(['start', 'ready']);
    expect(await page.isChecked('input')).toBe(false);
  });
});

test.describe('group header links', () => {
  // The live header toggles its group instead of navigating, like SectionNavGroups; a child link navigates.
  const markup = `<div id="root"><a href="#group" data-group="docs" data-state="stand-in">Docs</a><a href="#child" data-state="child">Child</a></div>${script(`
    const root = document.getElementById('root');
    for (const type of ['click', 'auxclick']) {
      document.addEventListener(type, event => {
        record(type + ' ' + event.target.dataset.state + ' prevented=' + event.defaultPrevented);
        event.preventDefault();
      });
    }
    track(schedule('section', [{kind: 'intent', on: links(root, marked('data-group'))}], manualStart(() => {
      const live = Object.assign(document.createElement('a'), {href: '#group', textContent: 'Docs'});
      Object.assign(live.dataset, {group: 'docs', state: 'live'});
      live.addEventListener('click', event => {
        event.preventDefault();
        record('toggle detail=' + event.detail);
      });
      root.firstElementChild.replaceWith(live);
    })));`)}`;

  test('a plain click is held and replayed', async ({open, page}) => {
    await open(markup);
    await page.click('[data-group]');
    await expect.poll(() => events(page)).toEqual(['start']);
    expect(await page.evaluate(() => location.hash)).toBe('');
    await finish(page);
    expect(await events(page)).toEqual(['start', 'toggle detail=0', 'click live prevented=true', 'ready']);
  });

  test('a plain click held while loading fails follows its link natively', async ({open, page}) => {
    await open(markup.replace("document.addEventListener(type, event => {", "document.addEventListener(type, event => {\n        if (!event.isTrusted) return;"));
    await page.click('[data-group]');
    await expect.poll(() => events(page)).toEqual(['start']);
    await finish(page, false);
    expect(await events(page)).toEqual(['start', 'failed']);
    expect(await page.evaluate(() => location.hash)).toBe('#group');
  });

  test('modified and middle clicks, and child links, act natively', async ({open, page}) => {
    await open(markup);
    await page.click('[data-group]', {modifiers: ['ControlOrMeta']});
    await page.click('[data-group]', {modifiers: ['Shift']});
    await page.click('[data-group]', {button: 'middle'});
    await page.click('[data-state="child"]');
    const native = ['click stand-in prevented=false', 'click stand-in prevented=false', 'auxclick stand-in prevented=false', 'click child prevented=false'];
    await expect.poll(() => events(page)).toEqual(['start', ...native]);
    await finish(page);
    expect(await events(page)).toEqual(['start', ...native, 'ready']);
  });
});

test.describe('text input', () => {
  // Search is a React controlled input; mounting hydrates it over the server markup.
  const markup = `<div id="root"><input id="q" value=""/><output id="out"></output></div>${script(`
    const root = document.getElementById('root');
    track(schedule('contributors', [{kind: 'intent', on: textInput(root, '#q')}], manualStart(() => hydrateSearch(root))));`)}`;
  const state = (page: Page) =>
    page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('#q')!;
      return {value: input.value, shown: document.querySelector('#out')!.textContent, start: input.selectionStart, end: input.selectionEnd, focused: document.activeElement === input};
    });
  // Composition events as an IME sends them; `text` is the field's value while composing.
  const compose = (page: Page, text: string, end: boolean) =>
    page.evaluate(
      ([text, end]) => {
        const input = document.querySelector<HTMLInputElement>('#q')!;
        input.dispatchEvent(new CompositionEvent('compositionstart', {bubbles: true}));
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
        input.dispatchEvent(new InputEvent('input', {bubbles: true, isComposing: true, inputType: 'insertCompositionText'}));
        if (end) input.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true, data: text}));
      },
      [text, end] as const,
    );

  test('typed text and the caret reach the React state after mounting', async ({open, page}) => {
    await open(markup);
    await page.click('#q');
    await page.keyboard.type('abc');
    await page.keyboard.press('ArrowLeft');
    await finish(page);
    expect(await state(page)).toEqual({value: 'abc', shown: 'abc', start: 2, end: 2, focused: true});
    // React now owns the field.
    await page.keyboard.type('d');
    expect(await state(page)).toEqual({value: 'abdc', shown: 'abdc', start: 3, end: 3, focused: true});
  });

  test('focus the reader moved elsewhere stays there', async ({open, page}) => {
    await open(markup.replace('<output id="out"></output></div>', '<output id="out"></output></div><button id="next">Next</button>'));
    await page.click('#q');
    await page.keyboard.type('abc');
    await page.keyboard.press('Tab');
    await finish(page);
    expect(await state(page)).toMatchObject({value: 'abc', shown: 'abc', focused: false});
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('next');
  });

  test('text an IME committed before mounting is kept', async ({open, page}) => {
    await open(markup);
    await page.click('#q');
    await page.keyboard.type('a');
    await compose(page, 'a字', true);
    await finish(page);
    expect(await state(page)).toMatchObject({value: 'a字', shown: 'a字', focused: true});
  });

  test('a composition in progress is not interrupted; its text is written back when it ends', async ({open, page}) => {
    await open(markup);
    await page.click('#q');
    await page.keyboard.type('a');
    await compose(page, 'a字', false);
    await finish(page);
    expect(await state(page)).toMatchObject({value: 'a字', shown: ''});
    await page.evaluate(() => document.querySelector('#q')!.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true, data: '字'})));
    expect(await state(page)).toMatchObject({value: 'a字', shown: 'a字'});
  });
});

test('the "/" shortcut is repeated once on its target', async ({open, page}) => {
  await open(`<p>Text</p>${script(`
    document.addEventListener('keydown', event => { if (!event.isTrusted) record('replayed ' + event.key + ' on ' + event.target.tagName); });
    track(schedule('nav', [{kind: 'intent', on: shortcut('/')}], manualStart()));`)}`);
  await page.keyboard.press('/');
  await expect.poll(() => events(page)).toEqual(['start']);
  await finish(page);
  expect(await events(page)).toEqual(['start', 'replayed / on BODY', 'ready']);
});
