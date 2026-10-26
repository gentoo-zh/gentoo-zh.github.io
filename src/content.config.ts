import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {LOCALES, type Locale} from './i18n/locales';
import {CONTENT_ROOT, pagesLoader, postsLoader, sectionsLoader} from './content/loader';
import {yamlFile} from './data/loader';
import {channelsSchema, costsSchema, mirrorsSchema, sponsorsSchema, type DataLocale} from './data/schemas';
import {contributorsIndexLoader, contributorsLoader} from './content/contributorsLoader';
import {guideSchema, isGuideSlug} from './content/guides';

const locale = z.enum(LOCALES);

const postImage = z.union([z.string(), z.object({src: z.string(), alt: z.string().optional()})]);

const posts = defineCollection({
  loader: postsLoader,
  schema: z
    .object({
      locale,
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      lastmod: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      authors: z.array(z.object({name: z.string(), image: z.string().optional(), link: z.string().url().optional()})).default([]),
      aliases: z.array(z.string()).default([]),
      featured: z.boolean().optional(),
      image: postImage.optional(),
      cover: postImage.optional(),
      /** The cover's form for the dark theme, a path in the bundle; covers that read on both themes leave it out. */
      coverDark: z.string().optional(),
      /** Alt text for a string `cover`; an object cover carries its own. */
      coverAlt: z.string().optional(),
      /** A short label such as an announcement marker, shown on the home page's lead card. */
      tag: z.string().optional(),
      /** Lead the home page's latest posts regardless of date. */
      pinned: z.boolean().optional(),
      /** CSS object-position for the cover on the home lead card, which fills its frame. */
      coverPosition: z.string().optional(),
      summary: z.string().optional(),
      /**
       * Serve the post in pages, one per numbered `## N.` heading after an overview;
       * `groups` heads the sidebar list, each from the section it starts at.
       */
      paged: z
        .union([z.literal(true), z.object({groups: z.array(z.object({title: z.string(), from: z.number().int().positive()}).strict())}).strict()])
        .optional(),
    })
    .strict(),
});

const sections = defineCollection({
  loader: sectionsLoader,
  schema: z.object({locale, slug: z.string(), title: z.string(), description: z.string()}).passthrough(),
});

const pages = defineCollection({
  loader: pagesLoader,
  schema: z.object({locale, slug: z.string(), title: z.string(), description: z.string().optional()}).passthrough()
    .superRefine((page, context) => {
      if (!isGuideSlug(page.slug)) return;
      const result = guideSchema.safeParse(page);
      if (!result.success) {
        const source = `${CONTENT_ROOT}/${page.locale}/${page.slug}/_index.md`;
        for (const issue of result.error.issues) context.addIssue({...issue, message: `${source}: ${issue.message}`});
      }
    }),
});

// The data layer keeps its own language list; this fails to compile when the two drift apart.
const sameLocales: [DataLocale, Locale] extends [Locale, DataLocale] ? true : never = true;

const costs = defineCollection({loader: yamlFile('data/gz_costs.yaml'), schema: costsSchema});
const mirrors = defineCollection({loader: yamlFile('data/gz_mirrors.yaml'), schema: mirrorsSchema});
const channels = defineCollection({loader: yamlFile('data/gz_channels.yaml'), schema: channelsSchema});
const sponsors = defineCollection({loader: yamlFile('data/gz_sponsors.yaml'), schema: sponsorsSchema});

/** Written by scripts/update-contributors.py; hand-written pages use the same fields. */
const contributors = defineCollection({
  loader: contributorsLoader,
  schema: z
    .object({
      locale,
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()).min(1),
      /** The GitHub profile; absent once the account is deleted (`/users/<login>` answers 404). */
      externalUrl: z.string().url().optional(),
      // One page (DEVwXZ4Njdmo4hm) lists a blog with no address.
      links: z.array(z.object({name: z.string(), url: z.string().url().optional()}).strict()).default([]),
      /** `10000 - contributions.total`; absent on hand-written pages, which the script leaves alone. */
      weight: z.number().int().optional(),
      /** Commits per gentoo-zh repository, most first; written with `weight`. */
      contributions: z
        .object({
          total: z.number().int().positive(),
          repos: z.array(z.object({repo: z.string(), commits: z.number().int().positive()}).strict()).min(1),
        })
        .strict()
        .optional(),
    })
    .strict(),
});

const contributorsIndex = defineCollection({
  loader: contributorsIndexLoader,
  schema: z
    .object({
      locale,
      slug: z.string(),
      title: z.string(),
      date: z.coerce.date(),
      description: z.string(),
      // Hugo-only settings, kept because the content is copied byte for byte.
      outputs: z.array(z.string()).optional(),
      cascade: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .strict(),
});

export const collections = {posts, sections, pages, costs, mirrors, channels, sponsors, contributors, contributorsIndex};
