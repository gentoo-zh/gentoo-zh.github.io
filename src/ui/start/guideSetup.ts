// Share code rewriting between server defaults and client selections to keep their commands identical.

/** Fired on window once GuideSetup is live and follows hash changes itself. */
export const GUIDE_LIVE_EVENT = 'gz-guide-live';

export type GuideKind = 'overlay' | 'binpkg' | 'distfiles' | 'official';
export type GuideChannel = 'stable' | 'unstable';

export interface GuideMirror {
  /** The mirror's source (`cernet`), `origin` for the distfiles server, `github` for the overlay origin. */
  id: string;
  uri: string;
  label?: string;
  git?: {uri: string; label: string};
  rsync?: {uri: string; label: string};
}

export interface GuideChoice {
  mirror: string;
  channel: GuideChannel;
  sudo: boolean;
}

/** The binhost path of each channel, appended to the mirror in `sync-uri`. */
export const CHANNEL_PATH: Record<GuideChannel, string> = {
  stable: '/binpkgs/x86-64',
  unstable: '/unstable/binpkgs/x86-64',
};

/** Preserve the download site's storage keys so existing choices remain valid. */
export const STORAGE = {mirror: 'mirror-source', channel: 'mirror-channel', sudo: 'mirror-sudo'} as const;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Rewrite mirror/channel URLs and sudo prefixes; preserve unrelated URLs and Distfiles fallbacks. */
export function rewriteCode(code: string, kind: GuideKind, mirrors: ReadonlyArray<GuideMirror>, choice: GuideChoice): string {
  const chosen = mirrors.find(mirror => mirror.id === choice.mirror) ?? mirrors[0]!;
  const any = `(?:${mirrors.map(mirror => escape(mirror.uri)).sort((a, b) => b.length - a.length).join('|')})`;
  let text = code;
  if (kind === 'official') {
    const replace = (line: string, uris: string[], target: string) => {
      const pattern = uris.map(escape).sort((a, b) => b.length - a.length).join('|');
      return line.replace(new RegExp(`(?:${pattern})(?=[/"\\s]|$)`, 'g'), target);
    };
    text = text.split('\n').map(line => {
      // Keep the documented Distfiles fallbacks, with the selected mirror first.
      if (/GENTOO_MIRRORS="/.test(line)) return line.replace(/(GENTOO_MIRRORS=")([^"]+)(")/g, (_, open: string, value: string, close: string) => {
        const urls = value.trim().split(/\s+/);
        return open + (urls.length === 1 ? chosen.uri : [chosen.uri, ...urls.filter(uri => uri !== chosen.uri)].join(' ')) + close;
      });
      line = replace(line, mirrors.flatMap(mirror => mirror.git ? [mirror.git.uri] : []), chosen.git!.uri);
      line = replace(line, mirrors.flatMap(mirror => mirror.rsync ? [mirror.rsync.uri] : []), chosen.rsync!.uri);
      return replace(line, mirrors.map(mirror => mirror.uri), chosen.uri);
    }).join('\n');
  }
  if (kind === 'overlay') text = text.replace(new RegExp(any, 'g'), chosen.uri);
  if (kind === 'binpkg') text = text.replace(new RegExp(`${any}(?:/unstable)?/binpkgs/x86-64`, 'g'), chosen.uri + CHANNEL_PATH[choice.channel]);
  if (kind === 'distfiles') {
    const ordered = [chosen, ...mirrors.filter(mirror => mirror !== chosen)].map(mirror => mirror.uri).join(' ');
    text = text.replace(new RegExp(`${any}(?: ${any})*`, 'g'), ordered);
  }
  return choice.sudo ? text : text.replace(/^([ \t]*)\$ sudo /gm, '$1# ').replace(/^([ \t]*)sudo /gm, '$1');
}

/** Applies `rewrite` to the content of every fenced code block of a Markdown text. */
export function rewriteFences(markdown: string, rewrite: (code: string) => string): string {
  return markdown.replace(/^(\s*```[^\n]*\n)([\s\S]*?)(^\s*```)/gm, (_, open: string, code: string, close: string) => open + rewrite(code) + close);
}
