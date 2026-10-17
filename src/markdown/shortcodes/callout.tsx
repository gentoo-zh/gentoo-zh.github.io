import {Banner} from '@astryxdesign/core/Banner';
import {useMessage} from '../../i18n/useMessage';
import {defineShortcode, type ShortcodeContext} from './types';

/** Hugo callout levels this site accepts; each maps to an Astryx Banner status. */
export const CALLOUT_TYPES = ['info', 'warning', 'error'] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

function Callout({type, body, context}: {type: CalloutType; body: string; context: ShortcodeContext}) {
  const t = useMessage();
  return <Banner status={type} title={t(`gz.callout.${type}`)} description={context.renderMarkdown(body)} collapsible={false} />;
}

/** `{{< callout type="info|warning|error" >}}`: a Banner titled from `gz.callout.*`. */
export const callout = defineShortcode<{type: CalloutType; body: string}>({
  name: 'callout',
  isPaired: true,
  parse: (attrs, body) => {
    const type = attrs.type as CalloutType;
    return CALLOUT_TYPES.includes(type) ? {type, body: body.trim()} : undefined;
  },
  render: (data, context) => <Callout type={data.type} body={data.body} context={context} />,
  toText: data => data.body,
});
