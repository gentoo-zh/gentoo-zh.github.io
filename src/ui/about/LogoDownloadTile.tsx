import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {MediaTheme} from '@astryxdesign/core/theme';
import {BUTTON, ICON, SPACE, STACK, TEMPLATE} from '../../theme/scale';
import {Download} from '../chrome/icons';

const styles = stylex.create({
  transparent: {backgroundColor: 'var(--color-background-body)'},
  white: {backgroundColor: 'var(--color-background-surface)'},
  // The dark wordmark token is the same lavender used by the downloadable SVGs.
  lavender: {backgroundColor: 'var(--color-wordmark)'},
  // The logos are artwork, not photos: inset them so they do not fill the tile edge to edge.
  image: {boxSizing: 'border-box', padding: 'var(--spacing-6)'},
});

interface LogoDownloadTileProps {
  file: string;
  name: string;
  downloadLabel: string;
  background: 'transparent' | 'white' | 'lavender';
}

export function LogoDownloadTile({file, name, downloadLabel, background}: LogoDownloadTileProps) {
  const src = `/brand/${file}`;
  return (
    <VStack gap={SPACE.inline}>
      <MediaTheme mode={background === 'lavender' ? 'dark' : 'light'}>
        <Card padding={TEMPLATE.zero}>
          <AspectRatio ratio={TEMPLATE.productImageRatio} fit="contain" xstyle={styles[background]}>
            <img src={src} alt="" loading="lazy" {...stylex.props(styles.image)} />
          </AspectRatio>
        </Card>
      </MediaTheme>
      <HStack gap={SPACE.tight} vAlign="center">
        <StackItem size={STACK.fill}>
          <Text type="body" weight="medium">{name}</Text>
        </StackItem>
        <Button
          variant="ghost"
          size={BUTTON.toolbar}
          label={`${downloadLabel} ${file}`}
          tooltip={file}
          {...{title: file, download: file}}
          isIconOnly
          icon={<Icon icon={Download} size={ICON.inline} />}
          href={src}
        />
      </HStack>
    </VStack>
  );
}
