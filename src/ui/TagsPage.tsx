import {BlogIndex, collectionStyles} from './blog/BlogIndex';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {PostSummary} from '../content/posts';
import type {Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {useMessage} from '../i18n/useMessage';
import {layout} from '../theme/layout.stylex';
import {SPACE} from '../theme/scale';

function TitleBlock({title, sub}: {title: string; sub: string}) {
  return (
    <VStack gap={SPACE.tight}>
      <Heading level={1} type="display-1">
        {title}
      </Heading>
      <Text weight="normal" color="secondary">
        {sub}
      </Text>
    </VStack>
  );
}

export interface TagsPageProps {
  locale: Locale;
  tags: Array<{tag: string; count: number}>;
}

export function TagsPage({locale, tags}: TagsPageProps) {
  const t = useMessage();
  return (
    <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={collectionStyles.section}>
      <VStack gap={SPACE.section}>
        <TitleBlock title={t('gz.tags.title')} sub={t('gz.tags.description')} />
        <List hasDividers density="spacious" edgeCompensation="inline" aria-label={t('gz.tags.title')}>
          {tags.map(({tag, count}) => (
            <ListItem key={tag} label={tag} href={routes.tag(locale, tag)} endContent={<Badge label={count} aria-label={t('gz.tags.count', {count})} />} />
          ))}
        </List>
      </VStack>
    </Section>
  );
}

export interface TagPostsProps {
  locale: Locale;
  tag: string;
  posts: PostSummary[];
}

export function TagPosts({locale, tag, posts}: TagPostsProps) {
  return <BlogIndex locale={locale} title={tag} count={posts.length} posts={posts} />;
}
