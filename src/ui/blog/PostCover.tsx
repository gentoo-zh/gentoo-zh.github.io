// A post cover: one image, or, when the post has `coverDark`, a light and a dark image that follow the active theme
// (the site toggle's `data-theme` as well as the OS preference) the way the home thanks logos do.
import * as stylex from '@stylexjs/stylex';
import type {ImgHTMLAttributes} from 'react';
import type {PostSummary} from '../../content/posts';
import {homeMedia} from '../../theme/layout.stylex';

type CoverImage = NonNullable<PostSummary['cover']>;

export interface PostCoverProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  image: CoverImage;
  dark?: CoverImage;
  /** Mark each image for the build's fixed-size list thumbnails (scripts/lib/image-variants.mjs). */
  thumbnail?: boolean;
}

export function PostCover({image, dark, thumbnail = false, ...props}: PostCoverProps) {
  const variants = dark ? [[image, homeMedia.light], [dark, homeMedia.dark]] as const : [[image, null]] as const;
  return <>{variants.map(([{src, alt}, mode]) => <img key={src} src={src} alt={alt} data-blog-cover={thumbnail ? src : undefined} {...props} {...stylex.props(mode)} />)}</>;
}
