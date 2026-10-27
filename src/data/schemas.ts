import {z} from 'astro/zod';

/** Same list as `src/i18n/locales.ts`; repeated so this layer runs in plain Node (`check:data`). */
export const DATA_LOCALES = ['zh-cn', 'zh-tw', 'en'] as const;
export type DataLocale = (typeof DATA_LOCALES)[number];
export type Localized = Record<DataLocale, string>;

const text = z.string().min(1);
const sitePath = z.string().startsWith('/');
/** A calendar date as `YYYY-MM-DD`. readYaml keeps unquoted dates as strings, so `2026-02-30` fails here instead of rolling over. */
const day = z.iso.date();
const localized = (zhCN: string, zhTW: string, en: string): Localized => ({'zh-cn': zhCN, 'zh-tw': zhTW, en});

function unique<T>(label: string, keyOf: (item: T) => string) {
  return (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();
    for (const item of items) {
      const key = keyOf(item);
      if (seen.has(key)) ctx.addIssue({code: 'custom', message: `duplicate ${label} "${key}"`});
      seen.add(key);
    }
  };
}

const contributorGroup = z.enum(['founders', 'siteMaintainers', 'liveosDevelopers', 'siteContent', 'overlayMaintainers', 'overlayContributors']);
const roleLabels = z.object({'zh-cn': text, 'zh-tw': text, en: text}).strict();
export const contributorRolesSchema = z.object({
  groupOrder: z.array(contributorGroup).length(contributorGroup.options.length).superRefine(unique('group', group => group)),
  fallback: z.object({group: contributorGroup, labels: roleLabels}).strict(),
  roles: z.array(z.object({
    id: text,
    group: contributorGroup,
    labels: roleLabels,
    aliases: z.array(z.object({label: text, locale: z.enum(DATA_LOCALES)}).strict()),
  }).strict()).min(1).superRefine(unique('role', role => role.id)),
}).strict().superRefine((policy, ctx) => {
  const groups = [...policy.roles.map(role => role.group), policy.fallback.group];
  unique<string>('role group', group => group)(groups, ctx);
  if (groups.length !== policy.groupOrder.length) ctx.addIssue({code: 'custom', message: 'roles and fallback must cover every group'});
  const labels = [
    ...Object.values(policy.fallback.labels),
    ...policy.roles.flatMap(role => [...Object.values(role.labels), ...role.aliases.map(alias => alias.label)]),
  ];
  unique<string>('role label', label => label)(labels, ctx);
});

const costItem = z
  .object({
    key: z.string().regex(/^[a-z0-9_]+$/),
    spec: text,
    spec_tw: text,
    spec_en: text,
    amount: z.number().nonnegative(),
    currency: z.enum(['USD', 'EUR']),
    period: z.enum(['monthly', 'yearly']),
    approx: z.boolean().optional(),
    sponsored: z.boolean().optional(),
    start: day,
    end: day.optional(),
    expires: day.optional(),
    paid_amounts: z.array(z.number().positive()).min(1).optional(),
    usd_month: z.number().nonnegative(),
    note: z.string().optional(),
  })
  .strict()
  .refine(item => item.end == null || item.end >= item.start, {message: 'end is before start', path: ['end']})
  .transform(item => ({
    key: item.key,
    spec: localized(item.spec, item.spec_tw, item.spec_en),
    amount: item.amount,
    currency: item.currency,
    period: item.period,
    approx: item.approx ?? false,
    sponsored: item.sponsored ?? false,
    start: item.start,
    end: item.end,
    expires: item.expires,
    paidAmounts: item.paid_amounts,
    usdMonth: item.usd_month,
  }));

const rate = z.number().positive();

/** `data/gz_costs.yaml`. Rates: USD per EUR, and CNY, TWD, HKD per USD. */
export const costsSchema = z
  .object({
    rates: z.object({eur_usd: rate, usd_cny: rate, usd_twd: rate, usd_hkd: rate}).strict(),
    items: z.array(costItem).min(1).superRefine(unique('cost key', item => item.key)),
  })
  .strict();

const mirror = z
  .object({
    uri: z.url(),
    label: z.string().regex(/^gz_src_[a-z_]+$/),
    default: z
      .string()
      .transform(value => value.split(' '))
      .pipe(z.array(z.enum(DATA_LOCALES)))
      .optional(),
    origin: z.boolean().optional(),
  })
  .strict()
  .transform(item => ({
    uri: item.uri,
    source: item.label.slice('gz_src_'.length),
    defaultFor: item.default ?? [],
    origin: item.origin ?? false,
  }));

const mirrorSet = z
  .array(mirror)
  .min(1)
  .superRefine(unique('mirror uri', item => item.uri))
  .superRefine((items, ctx) => {
    unique('default language', (locale: string) => locale)(items.flatMap(item => item.defaultFor), ctx);
    if (items.filter(item => item.origin).length > 1) ctx.addIssue({code: 'custom', message: 'more than one origin'});
  });

/** `data/gz_mirrors.yaml`: one list per mirror picker. */
export const mirrorsSchema = z
  .object({
    git: mirrorSet,
    dist: mirrorSet,
    gentoo_git: mirrorSet,
    gentoo_rsync: mirrorSet,
    gentoo_dist: mirrorSet,
    gentoo_bin: mirrorSet,
  })
  .strict();

const localizedText = z.object({'zh-cn': text, 'zh-tw': text, en: text}).strict();
const mirrorSource = z.string().regex(/^[a-z][a-z0-9_]*$/);

export const officialMirrorsSchema = z.object({
  columns: z.object({name: localizedText, region: localizedText, dist: localizedText, git: localizedText, rsync: localizedText}).strict(),
  items: z.array(z.object({
    id: mirrorSource,
    name: localizedText,
    region: localizedText,
    dist: z.union([
      z.object({source: mirrorSource}).strict(),
      z.object({uri: z.url({protocol: /^https?$/}), mediaOrder: z.number().int().nonnegative()}).strict(),
    ]),
    note: localizedText.optional(),
    git: mirrorSource.optional(),
    rsync: mirrorSource.optional(),
  }).strict()).min(1)
    .superRefine(unique('official mirror id', item => item.id))
    .superRefine(unique('official mirror distfiles', item => 'source' in item.dist ? item.dist.source : item.dist.uri))
    .superRefine((items, ctx) => unique('media order', (order: number) => String(order))(items.flatMap(item => 'mediaOrder' in item.dist ? [item.dist.mediaOrder] : []), ctx)),
}).strict();

const channel = z
  .object({
    name: z.string().regex(/^[a-z]+$/),
    suffix: sitePath,
    label: z.string(),
    default: z.boolean().optional(),
  })
  .strict()
  .refine(item => item.label === `gz_channel_${item.name}`, {message: 'label must be gz_channel_<name>', path: ['label']})
  .transform(item => ({name: item.name, suffix: item.suffix, isDefault: item.default ?? false}));

/** `data/gz_channels.yaml`: binary package channels, one default per set. */
export const channelsSchema = z
  .object({
    bin: z
      .array(channel)
      .min(1)
      .superRefine(unique('channel', item => item.name))
      .refine(items => items.filter(item => item.isDefault).length === 1, {message: 'exactly one channel is default'}),
  })
  .strict();

const sponsor = z
  .object({
    href: z.url(),
    img: sitePath,
    img_dark: sitePath.optional(),
    wide: z.boolean().optional(),
    scale: z.number().positive().max(1).optional(),
    individual: z.boolean().optional(),
    name: text,
    name_tw: text,
    name_en: text,
  })
  .strict()
  .transform(item => ({
    href: item.href,
    logo: item.img,
    logoDark: item.img_dark,
    wide: item.wide ?? false,
    scale: item.scale ?? 1,
    individual: item.individual ?? false,
    name: localized(item.name, item.name_tw, item.name_en),
  }));

/** `data/gz_sponsors.yaml` is a top-level list; the loader hands it over as `{items}`. */
export const sponsorsSchema = z.object({items: z.array(sponsor).min(1)}).strict();

export type Costs = z.output<typeof costsSchema>;
export type CostItem = Costs['items'][number];
export type Rates = Costs['rates'];
export type Mirrors = z.output<typeof mirrorsSchema>;
export type MirrorSet = keyof Mirrors;
export type Mirror = z.output<typeof mirror>;
export type Channels = z.output<typeof channelsSchema>;
export type Sponsor = z.output<typeof sponsorsSchema>['items'][number];
