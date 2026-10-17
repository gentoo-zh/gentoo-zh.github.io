// Adapted from the Astryx docsite (components/blog/AuthorByline.tsx, MIT, Meta Platforms, Inc.).
import * as stylex from '@stylexjs/stylex';
import {Fragment} from 'react';
import {ContributorAvatar} from '../contributors/ContributorAvatar';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import type {PostSummary} from '../../content/posts';
import {SPACE} from '../../theme/scale';
import {layout, media} from '../../theme/layout.stylex';

const styles = stylex.create({
  row: {flexWrap: {default: 'nowrap', [media.mobile]: 'wrap'}},
  date: {flexShrink: {default: null, [media.mobile]: 0}, whiteSpace: {default: null, [media.mobile]: 'nowrap'}},
  divider: {
    display: {default: 'inline-flex', [media.mobile]: 'none'},
    height: layout.bylineDividerHeight,
  },
});

export interface AuthorBylineProps {
  authors: PostSummary['authors'];
  date: string;
  variant?: 'compact' | 'full';
  className?: string;
}

export function AuthorByline({authors, date, variant = 'compact', className}: AuthorBylineProps) {
  const textType = variant === 'full' ? 'body' : 'supporting';
  const linkAuthors = variant === 'full';

  return (
    <HStack gap={variant === 'full' ? SPACE.block : SPACE.tight} align="center" className={className} xstyle={styles.row}>
      {authors.length > 0 ? (
        <>
          <HStack gap={SPACE.hairline}>
            {authors.map(author => (
              <ContributorAvatar key={author.name} src={author.image} name={author.name} byline={variant} />
            ))}
          </HStack>
          <Text type={textType} color="secondary">
            {authors.map((author, i) => (
              <Fragment key={author.name}>
                {i > 0 ? ', ' : ''}
                {linkAuthors && author.link ? (
                  <Link href={author.link} type={textType} color="secondary" target="_blank" rel="noopener noreferrer">
                    {author.name}
                  </Link>
                ) : (
                  author.name
                )}
              </Fragment>
            ))}
          </Text>
          <Divider orientation="vertical" xstyle={styles.divider} />
        </>
      ) : null}
      <Text type={textType} color="secondary" xstyle={styles.date}>
        <Timestamp value={date} format="date" />
      </Text>
    </HStack>
  );
}
