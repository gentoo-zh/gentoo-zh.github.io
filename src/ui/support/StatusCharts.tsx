// Adapted from Astryx dashboard-alert-rail (MIT, Meta Platforms, Inc.).
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {SPACE, TEMPLATE} from '../../theme/scale';
import type {StatusSite, StatusLevel} from './StatusBoard';

export const STATUS_STROKE: Record<StatusLevel, string> = {
  up: 'var(--color-success)', down: 'var(--color-error)', unknown: 'var(--color-text-secondary)',
};
const LINE_PROPS = {type: 'linear', strokeLinejoin: 'miter', strokeLinecap: 'butt', isAnimationActive: false} as const;
const AXIS_TICK = {fontSize: 'var(--font-size-sm)', fill: 'var(--color-text-secondary)'};
const GRID_STROKE = 'var(--color-border)';

/** Insert missing calendar days as gaps; a missing probe is never zero availability. */
export function dailyHistory(site: StatusSite, days = 90) {
  const history = new Map((site.history ?? []).map(day => [day.date, day.up]));
  const last = [...history.keys()].sort().at(-1);
  if (!last) return [];
  const end = Date.parse(`${last}T00:00:00Z`);
  if (!Number.isFinite(end)) return [];
  return Array.from({length: days}, (_, i) => {
    const date = new Date(end - (days - i - 1) * 86_400_000).toISOString().slice(0, 10);
    const up = history.get(date);
    return {date, value: up == null ? null : up * 100};
  });
}

function AvailabilityTooltip({active, payload, label, languageTag}: {
  active?: boolean;
  payload?: ReadonlyArray<{value?: number | string | ReadonlyArray<number | string>; name?: string | number}>;
  label?: string | number;
  languageTag: string;
}) {
  if (!active || !payload?.length) return null;
  const percent = new Intl.NumberFormat(languageTag, {style: 'percent', maximumFractionDigits: 2});
  return <Card padding={SPACE.inline}>
    <VStack gap={SPACE.hairline}>
      <Text type="supporting" color="secondary">{label}</Text>
      {payload.map(entry => <Text key={entry.name} type="supporting" hasTabularNumbers>
        {entry.name} · {typeof entry.value === 'number' ? percent.format(entry.value / 100) : '—'}
      </Text>)}
    </VStack>
  </Card>;
}

// A line cannot draw an isolated valid day between gaps; keep that sample visible as a dot.
function isolated(points: ReturnType<typeof dailyHistory>, index: number) {
  return points[index]?.value != null && points[index - 1]?.value == null && points[index + 1]?.value == null;
}

export function ServiceSparkline({site, color, name, languageTag}: {site: StatusSite; color: string; name: string; languageTag: string}) {
  const points = dailyHistory(site);
  return <ResponsiveContainer width="100%" height={TEMPLATE.sparkHeight} minWidth={0}>
    <LineChart data={points} margin={TEMPLATE.sparkMargin} accessibilityLayer aria-label={name}>
      <XAxis hide dataKey="date" />
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Tooltip content={<AvailabilityTooltip languageTag={languageTag} />} />
      <Line {...LINE_PROPS} dataKey="value" name={name} stroke={color} strokeWidth={1.25}
        dot={({cx, cy, index}) => <circle key={index} cx={cx} cy={cy} r={isolated(points, index) ? TEMPLATE.chartPointRadius : 0} fill={color} />} />
    </LineChart>
  </ResponsiveContainer>;
}

export function AvailabilityChart({site, days, name, languageTag}: {site: StatusSite; days: number; name: string; languageTag: string}) {
  const date = new Intl.DateTimeFormat(languageTag, {month: 'short', day: 'numeric', timeZone: 'UTC'});
  const percent = new Intl.NumberFormat(languageTag, {style: 'percent', maximumFractionDigits: 2});
  const points = dailyHistory(site, days);
  return <ResponsiveContainer width="100%" height={TEMPLATE.chartHeight} minWidth={0}>
    <LineChart data={points} margin={TEMPLATE.chartMargin} accessibilityLayer aria-label={name}>
      <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
      <XAxis dataKey="date" tickFormatter={value => date.format(new Date(`${value}T00:00:00Z`))}
        minTickGap={32} tick={AXIS_TICK} axisLine={false} tickLine={false} />
      <YAxis domain={[(minimum: number) => Math.max(0, Math.min(99, Math.floor(minimum))), 100]} width={TEMPLATE.chartAxisWidth}
        tickFormatter={value => percent.format(value / 100)} tick={AXIS_TICK} axisLine={false} tickLine={false} />
      <Tooltip content={<AvailabilityTooltip languageTag={languageTag} />} cursor={{stroke: GRID_STROKE}} />
      <Line {...LINE_PROPS} dataKey="value" name={name} stroke="var(--color-border-blue)" strokeWidth={1.5}
        dot={({cx, cy, index}) => <circle key={index} cx={cx} cy={cy} r={isolated(points, index) ? TEMPLATE.chartPointRadius : 0} fill="var(--color-border-blue)" />} />
    </LineChart>
  </ResponsiveContainer>;
}
