import {isValidElement, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars, radiusVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Link} from '@astryxdesign/core/Link';
import {Code} from '@astryxdesign/core/Code';
import {Markdown, parseMarkdownAst, type MarkdownComponents} from '@astryxdesign/core/Markdown';
import {createMarkdownPlugin, type MarkdownPluginEntry} from '@astryxdesign/core/Markdown/plugins';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {Locale} from '../i18n/locales';
import {distfilesLink} from '../i18n/distfilesLink';
import {localizeHref} from '../i18n/routes';
import {useMessage} from '../i18n/useMessage';
import {headingAnchors, type AnchorNode} from './headingAnchors';
import {promotedLevel} from './outline';
import {inlineHtmlSyntax, type InlineHtmlNode} from './inlineHtml';
import {SHORTCODES} from './shortcodes';
import {shortcodeSyntax, type ShortcodeNode} from './shortcodes/syntax';
import {StaticCodeBlock} from './StaticCodeBlock';
import {fileCodeTitles} from './codeTitle';
import {anchorHeadingScope} from '../theme/markers.stylex';
import {SPACE} from '../theme/scale';
import {PROSE_IMAGE} from '../theme/images';
import {media} from '../theme/layout.stylex';

// Adapted from Astryx AnchorHeading (components/docs/AnchorHeading.tsx, MIT, Meta Platforms, Inc.).
const styles = stylex.create({
  // Replaces Markdown's image wrapper, so it carries that wrapper's block spacing.
  image: {display: 'block', maxWidth: '100%', height: 'auto', borderRadius: radiusVars['--radius-element'], marginBlock: spacingVars['--spacing-3']},
  // Keep short tokens together; only code wider than its container wraps internally.
  inlineCode: {
    display: 'inline-block',
    maxWidth: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
  },
  reveal: {
    minWidth: {default: 0, [media.mobile]: 'var(--spacing-6)'},
    minHeight: {default: 0, [media.mobile]: 'var(--size-element-md)'},
    justifyContent: 'center',
    opacity: {
      default: 0,
      '@media (hover: none)': 1,
      [stylex.when.ancestor(':hover', anchorHeadingScope)]: 1,
      [stylex.when.ancestor(':focus-within', anchorHeadingScope)]: 1,
    },
    transitionProperty: 'opacity',
    transitionDuration: {default: durationVars['--duration-fast'], '@media (prefers-reduced-motion: reduce)': '0s'},
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

const HEADING_TYPE = {2: 'display-3'} as const;

const EXTERNAL = /^https?:\/\//;
/** A relative address: no scheme, and not rooted at `/`, `#` or `?`. */
const RELATIVE = /^(?![a-z][a-z\d+.-]*:|[/#?])/i;

export interface PostMarkdownProps {
  locale: Locale;
  /** Existing localized post paths; other page links receive the locale prefix. */
  pages: ReadonlySet<string>;
  children: string;
  /** Replaces matching inline code, such as status names drawn as the tokens they name; undefined keeps the code. */
  renderInlineCode?: (text: string) => ReactNode | undefined;
  /** Rewrites `#fragment` links, such as to the chapter page that holds the heading; undefined keeps them. */
  resolveHash?: (fragment: string) => string;
  /** The page the post's relative images and files belong to, when the body renders elsewhere; undefined keeps them relative. */
  assetBase?: string;
  /** Renders `###` and deeper one level up, for a section page whose `## N.` heading is the page title; ids stay. */
  promoteHeadings?: boolean;
}

type PageOptions = Pick<PostMarkdownProps, 'resolveHash' | 'assetBase' | 'promoteHeadings'>;

interface Config {
  locale: Locale;
  plugins: MarkdownPluginEntry[];
  components: MarkdownComponents;
}

/** Fenced code in place of Astryx Markdown's default, which collapses long blocks. */
function FencedCode({code, language}: {code: string; language?: string}) {
  return (
    <VStack paddingBlock={SPACE.code}>
      <StaticCodeBlock code={code} language={language} />
    </VStack>
  );
}

/** Carries a heading's Hugo id from the transform to `PostHeading`; renders nothing. */
function HeadingId(_: {id: string}): null {
  return null;
}

/** The id held by the `HeadingId` among a heading's rendered children, through Astryx's plugin wrappers. */
function findHeadingId(node: ReactNode): string | undefined {
  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) {
      const id = findHeadingId(child);
      if (id != null) {
        return id;
      }
    }
    return undefined;
  }
  if (!isValidElement<{id?: string; children?: ReactNode}>(node)) {
    return undefined;
  }
  return node.type === HeadingId ? node.props.id : findHeadingId(node.props.children);
}

// Astryx derives its own heading ids; render explicitly to preserve Hugo ids and permalinks.
function PostHeading({level, children}: {level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode}) {
  const t = useMessage();
  const id = findHeadingId(children);
  if (id == null) {
    throw new Error('PostHeading: heading without a heading-anchors id');
  }
  return (
    <div {...stylex.props(anchorHeadingScope)}>
    <VStack paddingBlockStart={level === 2 ? SPACE.sectionHeading : SPACE.heading}>
      <Heading level={level} id={id} type={level === 2 ? HEADING_TYPE[2] : undefined}>
        {children}
        {level === 1 ? null : (
          <>
            {' '}
            <Link href={`#${id}`} label={t('gz.post.permalink')} color="secondary" xstyle={styles.reveal} data-pagefind-ignore>
              #
            </Link>
          </>
        )}
      </Heading>
    </VStack>
    </div>
  );
}

function Body({config, children}: {config: Config; children: string}) {
  return (
    <Markdown contentWidth="100%" autolink="gfm" plugins={config.plugins} components={config.components}>
      {children}
    </Markdown>
  );
}

function shortcode(node: ShortcodeNode) {
  const definition = SHORTCODES.find(entry => entry.name === node.data.name);
  if (definition == null) {
    throw new Error(`shortcode ${node.data.name} is not registered`);
  }
  return definition;
}

function createPlugins(config: Config): MarkdownPluginEntry[] {
  const context = {locale: config.locale, renderMarkdown: (source: string) => <Body config={config}>{source}</Body>};
  return [
    createMarkdownPlugin({name: 'file-code-titles', apiVersion: 1, transform: fileCodeTitles}),
    createMarkdownPlugin<'hugo-shortcodes', ShortcodeNode>({
      name: 'hugo-shortcodes',
      apiVersion: 1,
      parseKey: 'hugo-shortcodes@1',
      syntax: {block: [shortcodeSyntax(SHORTCODES)]},
      renderers: {
        shortcode: {
          render: ({node}) => shortcode(node).render(node.data.data, context),
          toText: node => shortcode(node).toText(node.data.data),
        },
      },
    }),
    createMarkdownPlugin<'inline-html', InlineHtmlNode>({
      name: 'inline-html',
      apiVersion: 1,
      parseKey: 'inline-html@1',
      syntax: {inline: [inlineHtmlSyntax]},
      renderers: {
        span: {
          render: ({node}) =>
            node.data.tag === 'del' ? (
              <Text type="inherit" hasStrikethrough>
                {node.data.text}
              </Text>
            ) : (
              <Text type="supporting">{node.data.text}</Text>
            ),
          toText: node => node.data.text,
        },
      },
    }),
    createMarkdownPlugin<'heading-anchors', AnchorNode>({
      name: 'heading-anchors',
      apiVersion: 1,
      transform: headingAnchors,
      renderers: {
        anchor: {
          render: ({node}) => <HeadingId id={node.data.id} />,
          toText: () => '',
        },
      },
    }),
  ];
}

function createConfig(locale: Locale, pages: ReadonlySet<string>, source: string, renderInlineCode?: PostMarkdownProps['renderInlineCode'], {resolveHash, assetBase, promoteHeadings}: PageOptions = {}): Config {
  const first = parseMarkdownAst(source).children[0];
  const lead = (first?.type === 'image' ? first.url : first?.type === 'paragraph' && first.children[0]?.type === 'image' ? first.children[0].url : undefined)?.trim();
  const isLocalPage = (path: string) => !/^\/(zh-tw\/|en\/)?posts\//.test(path) || pages.has(path);
  const address = (href: string) => {
    if (resolveHash != null && href.startsWith('#')) return resolveHash(href.slice(1));
    if (assetBase == null || !RELATIVE.test(href)) return href;
    const url = new URL(href, `https://base.invalid${assetBase}`);
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const config: Config = {
    locale,
    plugins: [],
    components: {
      image: ({src, alt}) => <img src={address(src)} alt={alt} data-image-widths={PROSE_IMAGE.widths} sizes={PROSE_IMAGE.sizes} loading={src.trim() === lead ? 'eager' : 'lazy'} decoding="async" {...stylex.props(styles.image)} />,
      code: FencedCode,
      inlineCode: ({children}) => renderInlineCode?.(children) ?? <Code xstyle={styles.inlineCode}>{children}</Code>,
      heading: promoteHeadings === true ? ({level, children}) => <PostHeading level={promotedLevel(level)}>{children}</PostHeading> : PostHeading,
      // Underlined because the theme's accent is near-black; inline so CJK punctuation after a link
      // stays on its line instead of wrapping alone.
      // Download-site pages and directories open here; its files stay on that host but read as
      // part of this site, so they open in place.
      link: ({href: written, children}) => {
        const href = address(written);
        const distfiles = distfilesLink(href);
        const target = distfiles?.kind === 'page' ? distfiles.path : href;
        return !distfiles && EXTERNAL.test(href) ? (
          <Link href={href} target="_blank" hasUnderline display="inline">
            {children}
          </Link>
        ) : (
          <Link href={localizeHref(locale, target, isLocalPage)} hasUnderline display="inline">{children}</Link>
        );
      },
    },
  };
  config.plugins = createPlugins(config);
  return config;
}

/** A post body: Astryx Markdown plus the Hugo constructs the posts use. */
export function PostMarkdown({locale, pages, children, renderInlineCode, resolveHash, assetBase, promoteHeadings}: PostMarkdownProps): ReactNode {
  return <Body config={createConfig(locale, pages, children, renderInlineCode, {resolveHash, assetBase, promoteHeadings})}>{children}</Body>;
}
