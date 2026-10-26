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
import type {ReactNode} from 'react';
import type {PostSummary} from '../../content/posts';
import type {Locale} from '../../i18n/locales';
import {chapterRoute, routes} from '../../i18n/routes';
import {tagKey} from '../../i18n/tags';
import {useMessage} from '../../i18n/useMessage';
import {pageGroups, pageHashResolver, type PageGroupSpec, type PostPages} from '../../markdown/chapters';
import {outlineItems} from '../../markdown/outline';
import {PostMarkdown} from '../../markdown/PostMarkdown';
import {layout, media} from '../../theme/layout.stylex';
import {sectionHref, sectionOf} from '../chrome/sections';
import {LinkCard} from '../LinkCard';
import {MobileOutline, OutlineRow} from '../section/PageOutline';
import {AuthorByline} from './AuthorByline';
import {MobileChapters, type PageListProps} from './PostChapters';
import {PostCover} from './PostCover';
import css from '../../markdown/MarkdownBody.module.css';
import {BUTTON, CHIP, GRID, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import {PROSE_IMAGE} from '../../theme/images';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
  },
  // Beside the outline rail the row centres the pair, so the article only has to shrink.
  sectionInRow: {
    marginInline: 0,
    width: '100%',
    flexShrink: 1,
    minWidth: 0,
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
  // A section page's trail ends at the post, whose long title wraps a phone's trail into a stray `/`; phones
  // get the short trail and reach the overview from the page list below.
  wideOnly: {display: {default: null, [media.mobile]: 'none'}},
  narrowOnly: {display: {default: 'none', [media.mobile]: null}},
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
  const outline = outlineItems(body);
  const hasOutline = outline.length > 0;
  const article = (
    <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={hasOutline ? styles.sectionInRow : styles.section}>
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

        <Cover post={post} />

        {hasOutline ? <MobileOutline items={outline} /> : null}

        <VStack className={css.body}>
          <PostMarkdown locale={locale} pages={pages}>
            {body}
          </PostMarkdown>
        </VStack>

        <PostFooter locale={locale} post={post} newer={newer} older={older} />
      </VStack>
    </Section>
  );
  return hasOutline ? <OutlineRow items={outline}>{article}</OutlineRow> : article;
}

function Cover({post}: {post: PostSummary}) {
  return post.cover ? (
    <AspectRatio ratio={TEMPLATE.coverRatio} fit="contain" xstyle={styles.cover}>
      <PostCover image={post.cover} dark={post.coverDark} data-image-widths={PROSE_IMAGE.widths} sizes={PROSE_IMAGE.sizes} decoding="async" />
    </AspectRatio>
  ) : null;
}

/** Tags, the neighbouring posts and the way back to the list; a paged post shows it on its last page. */
function PostFooter({locale, post, newer, older, chapterPager}: Pick<BlogArticleProps, 'locale' | 'post'> & {newer: PostSummary | null; older: PostSummary | null; chapterPager?: ReactNode}) {
  const t = useMessage();
  return (
    <>
      {post.tags.length > 0 ? (
        <HStack gap={SPACE.hairline} xstyle={styles.tagRow} data-pagefind-ignore>
          {post.tags.map(tag => (
            <Token key={tag} label={t(tagKey(tag))} size={CHIP.small} href={routes.tag(locale, tag)} />
          ))}
        </HStack>
      ) : null}

      <VStack gap={SPACE.block} data-pagefind-ignore>
        <Divider />
        {chapterPager}
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
    </>
  );
}

export interface PagedArticleProps extends BlogArticleProps {
  /** The post cut into pages (splitPages on `body`). */
  split: PostPages;
  /** Front matter `paged.groups`. */
  groups?: ReadonlyArray<PageGroupSpec>;
  /** The page shown: 0 for the overview, otherwise a section number. */
  page: number;
}

/** The page list for a paged post's sidebar (Base's `sideNav`) and its phone header. */
export function pageList({locale, post, split, groups, page}: Pick<PagedArticleProps, 'locale' | 'post' | 'split' | 'groups' | 'page'>): PageListProps {
  return {locale, slug: post.slug, groups: pageGroups(split, groups), current: page};
}

/**
 * One page of a paged post. The overview at the post's address carries the post's header and cover; a
 * section page's title is its `## N.` heading, which keeps its whole-post id. Links to headings on other
 * pages go there. Every page keeps the outline rail, empty or not, so the article column stays put while
 * the reader moves between pages.
 */
export function PagedArticle({locale, post, body, pages, newer = null, older = null, split, groups, page}: PagedArticleProps) {
  const t = useMessage();
  const href = (number: number) => chapterRoute(locale, post.slug, number);
  const at = split.pages.findIndex(entry => entry.number === page);
  const shown = split.pages[at];
  const section = shown?.id == null ? null : shown;
  const text = shown?.body ?? body;
  const outline = outlineItems(text);
  const prev = split.pages[at - 1];
  const next = split.pages[at + 1];
  const pager = prev == null && next == null ? null : (
    <Grid columns={{minWidth: GRID.card, repeat: 'fit'}} gap={SPACE.inline} role="navigation" aria-label={t('gz.post.chapters')}>
      {prev == null ? null : <LinkCard title={prev.title ?? t('gz.section.overview')} sub={t('gz.post.prevChapter')} link={{href: href(prev.number), isExternal: false}} />}
      {next == null ? null : <LinkCard title={next.title ?? t('gz.section.overview')} sub={t('gz.post.nextChapter')} link={{href: href(next.number), isExternal: false}} />}
    </Grid>
  );
  return (
    <OutlineRow items={outline}>
      <Section maxWidth={layout.proseMaxWidth} padding={SPACE.page} xstyle={styles.sectionInRow}>
        <VStack gap={SPACE.section} data-pagefind-body>
          <VStack gap={SPACE.block}>
            <Breadcrumbs xstyle={section == null ? undefined : styles.wideOnly} data-pagefind-ignore>
              <BreadcrumbItem href={sectionHref(locale, sectionOf('community'))}>{t('gz.nav.community')}</BreadcrumbItem>
              <BreadcrumbItem href={routes.posts(locale)}>{t('gz.nav.posts')}</BreadcrumbItem>
              {section != null ? (
                <BreadcrumbItem href={href(0)}>{post.title}</BreadcrumbItem>
              ) : post.tags.length > 0 ? (
                <BreadcrumbItem href={routes.tag(locale, post.tags[0])}>{t(tagKey(post.tags[0]))}</BreadcrumbItem>
              ) : null}
            </Breadcrumbs>
            {section != null ? (
              <Breadcrumbs xstyle={styles.narrowOnly} data-pagefind-ignore>
                <BreadcrumbItem href={sectionHref(locale, sectionOf('community'))}>{t('gz.nav.community')}</BreadcrumbItem>
                <BreadcrumbItem href={routes.posts(locale)}>{t('gz.nav.posts')}</BreadcrumbItem>
              </Breadcrumbs>
            ) : null}
            <Heading level={1} type="display-1" id={section?.id}>
              {section?.title ?? post.title}
            </Heading>
            {section == null ? (
              <Text type="large" weight="normal" color="secondary">
                {post.description}
              </Text>
            ) : null}
            <VStack data-pagefind-ignore>
              <AuthorByline authors={post.authors} date={post.date} variant="full" />
            </VStack>
            <Divider />
          </VStack>

          {section == null ? <Cover post={post} /> : null}

          {/* On phones the page list sits right above the sticky outline, which still spans the body. */}
          <VStack gap={SPACE.block}>
            <MobileChapters {...pageList({locale, post, split, groups, page})} />
            <VStack gap={SPACE.section}>
              {outline.length > 0 ? <MobileOutline items={outline} /> : null}

              <VStack className={css.body}>
                <PostMarkdown locale={locale} pages={pages} resolveHash={pageHashResolver(split, page, href)} assetBase={href(0)}>
                  {text}
                </PostMarkdown>
              </VStack>

              {next == null ? (
                <PostFooter locale={locale} post={post} newer={newer} older={older} chapterPager={pager} />
              ) : (
                <VStack gap={SPACE.block} data-pagefind-ignore>
                  <Divider />
                  {pager}
                </VStack>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Section>
    </OutlineRow>
  );
}
