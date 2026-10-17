import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AVATAR} from '../../theme/scale';
import {media} from '../../theme/layout.stylex';

const styles = stylex.create({
  image: {
    display: 'block',
    flexShrink: 0,
    objectFit: 'cover',
    borderRadius: 'var(--radius-full)',
  },
  profile: (desktop: number, mobile: number) => ({
    width: {default: desktop, [media.mobile]: mobile},
    height: {default: desktop, [media.mobile]: mobile},
  }),
});

// Astryx Avatar does not expose width/height on its image; keep its fallback for missing photos.
export function ContributorAvatar({src, name, profile = false, byline}: {src?: string; name: string; profile?: boolean; byline?: 'compact' | 'full'}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const size = byline === 'compact' ? AVATAR.compactPx : byline === 'full' ? AVATAR.fullPx : profile ? AVATAR.profileDesktop : AVATAR.profile;
  const responsive = profile && styles.profile(AVATAR.profileDesktop, AVATAR.profile);
  if (src == null || src === failedSrc) {
    return <Avatar name={name} size={size} tooltip={false} xstyle={responsive} />;
  }
  const source = !import.meta.env.DEV && !profile && src.startsWith('/') && !src.startsWith('//') ? src : undefined;
  const normal = source ? `${source}.${size}.webp` : src;
  const srcSet = source ? `${normal} 1x, ${source}.${size * 2}.webp 2x` : undefined;
  return <img src={normal} srcSet={srcSet} data-avatar-source={source} alt={name} width={size} height={size} loading={profile ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSrc(src)} {...stylex.props(styles.image, responsive)} />;
}
