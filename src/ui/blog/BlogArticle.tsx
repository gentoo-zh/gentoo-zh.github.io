// Adapted from the Astryx docsite (components/blog/BlogArticle.tsx, MIT, Meta Platforms, Inc.).
import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';
import type {PostSummary} from '../../content/posts';
import type {Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {tagKey} from '../../i18n/tags';
import {useMessage} from '../../i18n/useMessage';
import {PostMarkdown} from '../../markdown/PostMarkdown';
import {layout} from '../../theme/layout.stylex';
import {sectionHref, sectionOf} from '../chrome/sections';
import {LinkCard} from '../LinkCard';
import {AuthorByline} from './AuthorByline';
import {PostCover} from './PostCover';
import css from '../../markdown/MarkdownBody.module.css';
import {BUTTON, CHIP, GRID, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {PROSE_IMAGE} from '../../theme/images';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  tagRow: {
    flexWrap: 'wrap',
  },
  cover: {
    width: '100%',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    // Covers are transparent; the frame takes the card colour the home cards use.
    backgroundColor: 'var(--color-home-card)',
  },
});

export interface BlogArticleProps {
  locale: Locale;
  post: PostSummary;
  body: string;
  /** Post paths that exist in this locale. */
  pages: ReadonlySet<string>;
  /** Neighbours in the index order (newest first): `newer` is the next post, `older` the previous. */
  newer?: PostSummary | null;
  older?: PostSummary | null;
}

export function BlogArticle({locale, post, body, pages, newer = null, older = null}: BlogArticleProps) {
  const t = useMessage();
  return (
    <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={styles.section}>
      <VStack gap={SPACE.section} data-pagefind-body>
        <VStack gap={SPACE.block}>
          <Breadcrumbs data-pagefind-ignore>
            <BreadcrumbItem href={sectionHref(locale, sectionOf('community'))}>{t('gz.nav.community')}</BreadcrumbItem>
            <BreadcrumbItem href={routes.posts(locale)}>{t('gz.nav.posts')}</BreadcrumbItem>
            {post.tags.length > 0 ? <BreadcrumbItem href={routes.tag(locale, post.tags[0])}>{t(tagKey(post.tags[0]))}</BreadcrumbItem> : null}
          </Breadcrumbs>
          <Heading level={1} type="display-1">
            {post.title}
          </Heading>
          <Text type="large" weight="normal" color="secondary">
            {post.description}
          </Text>
          <VStack data-pagefind-ignore>
            <AuthorByline authors={post.authors} date={post.date} variant="full" />
          </VStack>
          <Divider />
        </VStack>

        {post.cover ? (
          <AspectRatio ratio={TEMPLATE.coverRatio} fit="contain" xstyle={styles.cover}>
            <PostCover image={post.cover} dark={post.coverDark} data-image-widths={PROSE_IMAGE.widths} sizes={PROSE_IMAGE.sizes} decoding="async" />
          </AspectRatio>
        ) : null}

        <VStack className={css.body}>
          <PostMarkdown locale={locale} pages={pages}>
            {body}
          </PostMarkdown>
        </VStack>

        {post.tags.length > 0 ? (
          <HStack gap={SPACE.hairline} xstyle={styles.tagRow} data-pagefind-ignore>
            {post.tags.map(tag => (
              <Token key={tag} label={t(tagKey(tag))} size={CHIP.small} href={routes.tag(locale, tag)} />
            ))}
          </HStack>
        ) : null}

        <VStack gap={SPACE.block} data-pagefind-ignore>
          <Divider />
          {older != null || newer != null ? (
            <Grid columns={{minWidth: GRID.card, repeat: 'fit'}} gap={SPACE.inline} role="navigation" aria-label={t('gz.post.pager')}>
                {older != null ? (
                  <LinkCard title={older.title} sub={`${t('gz.post.prev')} · ${older.date}`} link={{href: routes.post(locale, older.slug), isExternal: false}} />
                ) : null}
                {newer != null ? (
                  <LinkCard title={newer.title} sub={`${t('gz.post.next')} · ${newer.date}`} link={{href: routes.post(locale, newer.slug), isExternal: false}} />
                ) : null}
            </Grid>
          ) : null}
          <HStack>
            <Button
              variant="ghost"
              size={BUTTON.toolbar}
              label={t('gz.post.allPosts')}
              href={routes.posts(locale)}
              icon={<Icon icon="chevronLeft" size={ICON.inline} />}
            />
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
