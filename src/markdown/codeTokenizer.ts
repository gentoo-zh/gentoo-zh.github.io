import {tokenize, type SyntaxToken} from '@astryxdesign/core/CodeBlock';

const SHELL = new Set(['bash', 'sh', 'zsh', 'shell', 'console']);
// A hash before prose or a filename remains a comment, even in a shell fence.
const COMMANDS = new Set(('asahi-fwupdate blkid cat cd chmod chronyd chroot cp cryptsetup curl date dd diskutil dispatch-conf dmesg dracut echo eix emaint emerge emerge-webrsync env-update eselect etc-update exit export getuto gh git gpg grep grub-install grub-mkconfig gzpaste ip ld.so links ln locale-gen ls lsblk make mkdir mkfs.btrfs mkfs.ext4 mount nano nmcli nmtui passwd ping pkgdev pnpm printf pwd rc-service reboot rm rsync sha256sum sha512sum some-cmd source sudo systemctl tar tee umount update-m1n1 useradd wget').split(' '));

export function shellPrompt(line: string): RegExpExecArray | null {
  const match = /^([ \t]*)([$#] )/.exec(line);
  if (match == null) return null;
  const command = line.slice(match[0].length).split(/\s/, 1)[0]!;
  return match[2] === '$ ' || COMMANDS.has(command) || /^\.[./]/.test(command) || /^[A-Za-z_]\w*=/.test(command) ? match : null;
}

function configTokens(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const pattern = /[;#].*$|\[\[?[^\]]+\]\]?|"(?:[^"\\]|\\.)*"|'[^']*'|\$\{[^}]+\}|[\w.-]+(?=\s*=)|=|\b(?:true|false|yes|no)\b|\b\d+(?:\.\d+)?\b|[^\s=]+/g;
  for (const match of line.matchAll(pattern)) {
    const value = match[0];
    const start = match.index;
    const type = /^[;#]/.test(value) ? 'comment' : value.startsWith('[') ? 'keyword' : value.startsWith('${') ? 'variable' : /^\s*=/.test(line.slice(start + value.length)) ? 'property' : value === '=' ? 'operator' : /^(true|false|yes|no)$/.test(value) ? 'constant' : /^\d/.test(value) ? 'number' : 'string';
    let cursor = 0;
    // make.conf expands variables inside double-quoted values, but not single quotes.
    if (type === 'string' && value.startsWith('"')) {
      for (const variable of value.matchAll(/\$\{[^}]+\}/g)) {
        if (variable.index > cursor) tokens.push({type, start: start + cursor, end: start + variable.index});
        tokens.push({type: 'variable', start: start + variable.index, end: start + variable.index + variable[0].length});
        cursor = variable.index + variable[0].length;
      }
    }
    if (cursor < value.length) tokens.push({type, start: start + cursor, end: start + value.length});
  }
  return tokens;
}

/** Astryx custom tokenizers use absolute offsets and run synchronously during SSR, even for long blocks. */
export function codeTokenizer(code: string, language: string): SyntaxToken[] {
  const shell = SHELL.has(language);
  const fallback = tokenize(code, language === 'console' ? 'bash' : language);
  const tokens: SyntaxToken[] = [];
  let offset = 0;
  let heredoc: string | undefined;
  code.split('\n').forEach((line, index) => {
    let current = fallback[index] ?? [];
    if (shell && heredoc != null) {
      current = [{type: 'string', start: 0, end: line.length}];
      if (line.trim() === heredoc) heredoc = undefined;
    } else if (shell) {
      const prompt = shellPrompt(line);
      const start = prompt?.[0].length ?? 0;
      const command = line.slice(start);
      if (prompt != null) {
        current = [
          {type: prompt[2] === '# ' ? 'prompt-root' : 'prompt-user', start: prompt[1]!.length, end: start},
          ...(tokenize(command, 'bash')[0] ?? []).map(token => ({...token, start: token.start + start, end: token.end + start})),
        ];
        const word = /^(?:sudo[ \t]+)?\S+/.exec(command)?.[0];
        if (word != null && !word.includes('=') && !current.some(token => token.start < start + word.length && token.end > start)) {
          current.push({type: 'function', start, end: start + word.length});
        }
        // Whole URLs survive the setup guides' text-node mirror substitutions.
        for (const url of command.matchAll(/https?:\/\/[^\s"'<>|)]+/g)) {
          const begin = start + url.index;
          const end = begin + url[0].length;
          const overlaps = current.filter(token => token.start < end && token.end > begin);
          if (overlaps.some(token => token.type === 'string' || token.type === 'comment')) continue;
          current = current.filter(token => !overlaps.includes(token));
          current.push({type: 'string', start: begin, end});
        }
        current.sort((a, b) => a.start - b.start);
      }
      if (!command.trimStart().startsWith('#')) heredoc = /<<-?\s*['"]?(\w+)['"]?/.exec(command)?.[1];
    } else if (['ini', 'conf', 'toml'].includes(language)) {
      current = configTokens(line);
    } else if (language === 'diff') {
      current = [{type: line.startsWith('+') ? 'inserted' : line.startsWith('-') ? 'deleted' : line.startsWith('@@') ? 'keyword' : 'comment', start: 0, end: line.length}];
    } else if (language === 'fstab') {
      current = /^\s*#/.test(line) ? [{type: 'comment', start: 0, end: line.length}] : [...line.matchAll(/\S+/g)].map((match, column) => ({type: ['string', 'property', 'type', 'keyword', 'number', 'number'][column] ?? 'comment', start: match.index, end: match.index + match[0].length}));
    }
    tokens.push(...current.filter(token => token.end > token.start).map(token => ({...token, start: token.start + offset, end: token.end + offset})));
    offset += line.length + 1;
  });
  return tokens;
}
