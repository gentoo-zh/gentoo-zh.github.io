import type {ReactNode} from 'react';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {SPACE} from '../theme/scale';

export function PageHeader({title, description, align = 'start'}: {title: ReactNode; description?: ReactNode; align?: 'start' | 'center'}) {
  return <VStack gap={SPACE.block}>
    <Heading level={1} type="display-1" justify={align}>{title}</Heading>
    {description == null ? null : typeof description === 'string'
      ? <Text type="large" weight="normal" color="secondary" justify={align}>{description}</Text>
      : description}
  </VStack>;
}
