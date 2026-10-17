import {z} from 'astro/zod';
import {LOCALES} from '../i18n/locales';

export const GUIDE_SLUGS = [
  'overlay', 'binpkg-setup', 'binpkg-signing', 'distfiles-setup',
  'gentoo-repo-setup', 'gentoo-distfiles-setup', 'gentoo-binpkg-setup', 'gentoo-prefix-setup',
] as const;

export type GuideSlug = typeof GUIDE_SLUGS[number];

export function isGuideSlug(slug: string): slug is GuideSlug {
  return GUIDE_SLUGS.some(guide => guide === slug);
}

const guideStepSchema = z.object({id: z.string(), title: z.string(), body: z.string()}).strict();
const guidePanesSchema = z.object({manual: z.string().optional(), quick: z.string()}).strict();
const steps = z.array(guideStepSchema);
const anchors = z.record(z.string(), z.string());
const guide = z.object({
  locale: z.enum(LOCALES),
  title: z.string(),
  description: z.string(),
  steps: steps.optional(),
  anchors: anchors.optional(),
  manual: z.string().optional(),
  quick: z.string().optional(),
  setupHint: z.string().optional(),
}).strict();

export const guideSchema = z.discriminatedUnion('slug', [
  guide.extend({slug: z.literal('overlay'), steps, anchors}),
  guide.extend({slug: z.literal('binpkg-setup'), steps, anchors, quick: z.string()}),
  guide.extend({slug: z.literal('binpkg-signing')}),
  guide.extend({slug: z.literal('distfiles-setup'), manual: z.string(), quick: z.string()}),
  guide.extend({slug: z.literal('gentoo-repo-setup'), setupHint: z.string()}),
  guide.extend({slug: z.literal('gentoo-distfiles-setup'), setupHint: z.string()}),
  guide.extend({slug: z.literal('gentoo-binpkg-setup'), setupHint: z.string()}),
  guide.extend({slug: z.literal('gentoo-prefix-setup'), setupHint: z.string()}),
]);

export type GuideData = z.infer<typeof guideSchema>;
export type GuideStep = z.infer<typeof guideStepSchema>;
export type GuidePanes = z.infer<typeof guidePanesSchema>;
