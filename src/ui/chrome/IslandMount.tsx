// Each island hydrates its server-rendered HTML from the props stored on this container.
import * as stylex from '@stylexjs/stylex';

export const ISLAND_ATTRIBUTE = 'data-gz-island';
export type IslandKind = 'nav' | 'contributors' | 'section' | 'costs' | 'guide';

const styles = stylex.create({
  // The container adds no box, so TopNav lays out as AppShell's own top-bar child.
  root: {display: 'contents'},
});

export interface IslandMountProps<T extends object = object> {
  html: string;
  props: T;
  island?: IslandKind;
}

export function IslandMount<T extends object>({html, props, island = 'nav'}: IslandMountProps<T>) {
  return (
    <div
      {...stylex.props(styles.root)}
      {...{[ISLAND_ATTRIBUTE]: island}}
      data-props={JSON.stringify(props)}
      dangerouslySetInnerHTML={{__html: html}}
    />
  );
}
