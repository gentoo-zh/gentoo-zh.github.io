// Library template search and filters with docsite typography, inside the category shell.
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {List} from '@astryxdesign/core/List';
import {Link} from '@astryxdesign/core/Link';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';
import {CollectionSearch, CollectionEmpty} from './CollectionSearch';
import type {PostSummary} from '../../content/posts';
import type {Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {tagKey} from '../../i18n/tags';
import {useMessage} from '../../i18n/useMessage';
import {layout, media} from '../../theme/layout.stylex';
import {BlogCard} from './BlogCard';
import {SPACE} from '../../theme/scale';

export const collectionStyles = stylex.create({
  section: {
    marginInline: {default: 'auto', [media.tablet]: 0},
    width: {default: 'auto', [media.tablet]: '100%'},
    marginBlockStart: spacingVars['--spacing-12'],
  },
});

export interface BlogIndexProps {
  locale: Locale;
  title: string;
  description?: string;
  count?: number;
  posts: PostSummary[];
  tags?: string[];
}

export function BlogIndex({locale, title, description, count, posts, tags = []}: BlogIndexProps) {
  const t = useMessage();
  return (
    <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={collectionStyles.section}>
      <VStack gap={SPACE.group} data-post-collection>
        <VStack gap={SPACE.tight}>
          {count != null ? <Link href={routes.tags(locale)} type="supporting">{t('gz.tags.title')}</Link> : null}
          <Heading level={1} type="display-1">{title}</Heading>
          <Text weight="normal" color="secondary">{count == null ? description : t('gz.tags.count', {count})}</Text>
        </VStack>
        <VStack gap={SPACE.block}>
          <CollectionSearch />
          {tags.length > 0 ? (
            <HStack gap={SPACE.tight} wrap="wrap" role="navigation" aria-label={t('gz.tags.title')}>
              {tags.map(tag => <Token key={tag} label={t(tagKey(tag))} href={routes.tag(locale, tag)} />)}
            </HStack>
          ) : null}
        </VStack>
        <CollectionEmpty isEmpty={posts.length === 0} />
        <List hasDividers aria-label={title}>
          {posts.map(post => <BlogCard key={post.slug} locale={locale} post={post} />)}
        </List>
      </VStack>
    </Section>
  );
}
