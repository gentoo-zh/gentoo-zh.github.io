// The shortcode registry. To add one: write `<name>.tsx` exporting a `defineShortcode(...)`
// value, then list it here. check:urls fails on any `{{<`/`{{%` left in a built page.
import {callout} from './callout';
import {details} from './details';
import type {ShortcodeDefinition} from './types';

export const SHORTCODES: ReadonlyArray<ShortcodeDefinition> = [callout, details];
