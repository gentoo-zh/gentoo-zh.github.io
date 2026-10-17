import type {ReactNode} from 'react';
import {Layout, LayoutHeader, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Markdown} from '@astryxdesign/core/Markdown';
import {SPACE} from '../../theme/scale';
import {PageHeader} from '../PageHeader';
import {pageStart} from '../section/pageStart.stylex';

// Keep the library frame and update-script copy static; only filters and cards hydrate.
export function ContributorsPage({title, body, children}: {title: string; body: string; children: ReactNode}) {
  return (
    <Layout
      height="auto"
      data-pagefind-body
      xstyle={pageStart.start}
      header={
        <LayoutHeader hasDivider padding={SPACE.page}>
          <PageHeader title={title} description={
            <Markdown components={{paragraph: ({children}) => <Text as="p" display="block" type="large" weight="normal" color="secondary">{children}</Text>}}>{body}</Markdown>
          } />
        </LayoutHeader>
      }
      content={<LayoutContent padding={SPACE.page}>{children}</LayoutContent>}
    />
  );
}
