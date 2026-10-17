import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Popover} from '@astryxdesign/core/Popover';
import {formatAmount, type Converted} from '../../data/costs';
import {useMessage} from '../../i18n/useMessage';
import {BUTTON, GRID, ICON, SPACE} from '../../theme/scale';

export const COSTS_SUMMARY_ID_PREFIX = 'gz-costs-';
export interface CostsSummaryProps {
  languageTag: string;
  messages: Record<string, string>;
  total: Converted;
  monthlyUsd: number;
  asOf: string;
}

function SummaryTiles({languageTag, total, monthlyUsd, asOf}: Omit<CostsSummaryProps, 'messages'>) {
  const t = useMessage();
  const converted = t('gz.cost.converted', {
    cny: formatAmount(total.CNY, 'CNY', languageTag),
    twd: formatAmount(total.TWD, 'TWD', languageTag),
    hkd: formatAmount(total.HKD, 'HKD', languageTag),
  });
  const tiles = [
    {label: t('gz.cost.stat.total'), help: t('gz.cost.help.total'), icon: 'calendar' as const, value: total.USD, note: t('gz.cost.stat.all'), converted},
    {label: t('gz.cost.stat.monthly'), help: t('gz.cost.help.monthly'), icon: 'clock' as const, value: monthlyUsd, note: t('gz.cost.stat.monthlyNote')},
  ];
  return <VStack gap={SPACE.inline}>
    <Grid columns={{minWidth: GRID.costSummary, repeat: 'fit'}} gap={SPACE.block}>
      {tiles.map(tile => <Card key={tile.icon} padding={SPACE.block}>
        <VStack gap={SPACE.tight}>
          <HStack gap={SPACE.tight} vAlign="center" hAlign="between">
            <HStack gap={SPACE.tight} vAlign="center">
              <Icon icon={tile.icon} size={ICON.inline} color="secondary" />
              <Text type="label" color="secondary">{tile.label}</Text>
            </HStack>
            <Popover placement="below" alignment="end" label={tile.label} isModal={false} content={
              <VStack gap={SPACE.hairline}>
                <Text type="supporting" color="inherit">{tile.note}</Text>
                {tile.converted ? <Text type="supporting" color="inherit" hasTabularNumbers>{tile.converted}</Text> : null}
              </VStack>
            }>
              <Button variant="ghost" size={BUTTON.inline} isIconOnly label={tile.help} tooltip={tile.help} icon={<Icon icon="info" color="secondary" />} />
            </Popover>
          </HStack>
          <Text type="metric" display="block" hasTabularNumbers>{t('gz.cost.usd', {approx: 'false', amount: formatAmount(tile.value, 'USD', languageTag)})}</Text>
        </VStack>
      </Card>)}
    </Grid>
    <Text type="supporting" color="secondary">{t('gz.cost.stat.asOf', {date: asOf})}</Text>
  </VStack>;
}

export function CostsSummary({messages, ...props}: CostsSummaryProps) {
  return <InternationalizationProvider locale={props.languageTag} messages={{[props.languageTag]: messages}}>
    <SummaryTiles {...props} />
  </InternationalizationProvider>;
}
