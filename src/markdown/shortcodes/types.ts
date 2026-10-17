import type {ReactNode} from 'react';
import type {Locale} from '../../i18n/locales';

/** What a shortcode renderer gets besides its own data. */
export interface ShortcodeContext {
  locale: Locale;
  /** Renders Markdown with the same plugins and components as the page, for shortcode bodies. */
  renderMarkdown: (source: string) => ReactNode;
}

/** JSON-shaped data, as Astryx Markdown requires for extension nodes. */
export type ShortcodeData = null | boolean | number | string | ReadonlyArray<ShortcodeData> | {readonly [key: string]: ShortcodeData};

/**
 * One Hugo shortcode. `parse` turns the attributes and body into data, or returns undefined to
 * leave the source as text (check:urls then reports it as a leftover shortcode).
 */
export interface ShortcodeDefinition<Data extends ShortcodeData = ShortcodeData> {
  name: string;
  /** `{{< x >}}…{{< /x >}}` when true; a single `{{< x … >}}` when false. */
  isPaired: boolean;
  // Method syntax keeps definitions with different data assignable to the registry's type.
  parse(attributes: Record<string, string>, body: string): Data | undefined;
  render(data: Data, context: ShortcodeContext): ReactNode;
  /** Plain-text form, used by Markdown's text extraction (feeds, summaries). */
  toText(data: Data): string;
}

export function defineShortcode<Data extends ShortcodeData>(definition: ShortcodeDefinition<Data>): ShortcodeDefinition<Data> {
  return definition;
}
