// Editorial rows use the library template's content hierarchy without synthetic covers.
import * as stylex from '@stylexjs/stylex';
import {spacingVars, radiusVars, typeScaleVars} from '@astryxdesign/core/theme/tokens.stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {ListItem} from '@astryxdesign/core/List';
import {Link} from '@astryxdesign/core/Link';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import type {PostSummary} from '../../content/posts';
import type {Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {media} from '../../theme/layout.stylex';
import {CHIP, SPACE, TEMPLATE} from '../../theme/scale';

const styles = stylex.create({
  row: {
    display: {default: 'flex', ':is([hidden])': 'none'},
    paddingInline: 0,
    paddingBlock: spacingVars['--spacing-6'],
    paddingBlockStart: {default: spacingVars['--spacing-6'], ':first-child': 0},
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typeScaleVars['--text-heading-2-size'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
    overflowWrap: 'anywhere',
  },
  excerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cover: {
    width: {default: `calc(${spacingVars['--spacing-12']} * 2)`, [media.tablet]: `calc(${spacingVars['--spacing-12']} * 3)`},
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  image: {width: '100%', height: '100%', objectFit: 'cover'},
});

export function BlogCard({locale, post}: {locale: Locale; post: PostSummary}) {
  return (
    <ListItem
      data-post-search={[post.title, post.description, ...post.tags].join(' ')}
      xstyle={styles.row}
      label={
        <VStack gap={SPACE.tight}>
          <Text type="supporting" color="secondary"><Timestamp value={post.date} format="date" /></Text>
          <Heading level={2} xstyle={styles.title}>
            <Link href={routes.post(locale, post.slug)} color="inherit" type="inherit">{post.title}</Link>
          </Heading>
          <Text weight="normal" color="secondary" xstyle={styles.excerpt}>{post.description}</Text>
          <HStack gap={SPACE.hairline} wrap="wrap">
            {post.tags.map(tag => <Token key={tag} size={CHIP.small} label={tag} href={routes.tag(locale, tag)} />)}
          </HStack>
        </VStack>
      }
      endContent={post.image ? (
        <AspectRatio ratio={TEMPLATE.libraryImageRatio} xstyle={styles.cover}>
          <img src={post.image.src} alt={post.image.alt} data-blog-cover={post.image.src} width={TEMPLATE.libraryImageWidth} height={TEMPLATE.libraryImageHeight} loading="lazy" decoding="async" {...stylex.props(styles.image)} />
        </AspectRatio>
      ) : undefined}
    />
  );
}
