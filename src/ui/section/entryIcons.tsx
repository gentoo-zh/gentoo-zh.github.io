import type {ComponentType} from 'react';
import {ICON} from '../../theme/scale';
import {
  Activity,
  CircleHelp,
  Clipboard,
  Disc,
  Disc3,
  FileArchive,
  FileText,
  Folder,
  FolderTree,
  GitBranch,
  GitPullRequest,
  HeartHandshake,
  Globe,
  Heart,
  History,
  Image,
  Info,
  KeyRound,
  Layers,
  MessageCircle,
  Package,
  PackageCheck,
  SearchRounded,
  Tag,
  Users,
  Wallet,
  Wrench,
  type SvgProps,
} from '../chrome/icons';
import {DiscourseLogo} from '../chrome/channelLogos';
import type {SectionPageId} from '../chrome/sections';

const GLYPHS: Record<SectionPageId, ComponentType<SvgProps>> = {
  overlayTroubleshooting: Wrench,
  binpkgTroubleshooting: Wrench,
  distfilesTroubleshooting: Wrench,
  binpkgSigning: KeyRound,
  overlay: Layers,
  binpkg: Package,
  distfilesSetup: FileArchive,
  overlayContributing: GitPullRequest,
  websiteContributing: GitPullRequest,
  gentooRepoSetup: GitBranch,
  gentooDistfilesSetup: FileArchive,
  gentooBinpkgSetup: PackageCheck,
  gentooPrefixSetup: FolderTree,
  liveIso: Disc,
  officialMedia: Disc3,
  mirrorlist: Globe,
  gentooMirrors: Globe,
  packages: SearchRounded,
  files: Folder,
  posts: FileText,
  tags: Tag,
  changelog: History,
  contributors: Users,
  channels: MessageCircle,
  faq: CircleHelp,
  status: Activity,
  paste: Clipboard,
  forum: DiscourseLogo,
  contributing: HeartHandshake,
  costs: Wallet,
  thanks: Heart,
  logo: Image,
  about: Info,
};

/** The card glyph for a page of a category, decorative (`aria-hidden`). */
export function EntryIcon({id, large = false}: {id: SectionPageId; large?: boolean}) {
  const Glyph = GLYPHS[id];
  return <Glyph size={large ? ICON.channelPx : ICON.toolbarPx} />;
}
