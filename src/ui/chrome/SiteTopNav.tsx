// Adapted from the Astryx docsite (components/SharedTopNav.tsx, MIT, Meta Platforms, Inc.).
// Menu triggers remain links until hydration for no-script navigation.

import {useState, useSyncExternalStore, type MouseEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {TopNav, TopNavHeading, TopNavItem, TopNavRenderContext} from '@astryxdesign/core/TopNav';
import {LANGUAGE_TAG, LOCALES, type Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import {SITE} from '../../site';
import {media} from '../../theme/layout.stylex';
import {BUTTON, ICON, SPACE} from '../../theme/scale';
import {SearchButton} from '../search/SearchButton';
import {FOOTER_ID} from './footerId';
import {GitHubLogo, Languages, LayoutGrid, Moon, Sun} from './icons';
import {menuEntries, SECTIONS, sectionHref, services, type SectionId} from './sections';
import {useThemeMode} from './themeMode';
import {Wordmark} from './Wordmark';

const styles = stylex.create({
  desktopNav: {
    display: {
      default: 'flex',
      [media.mobile]: 'none',
    },
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  desktopOnly: {
    display: {
      default: 'flex',
      [media.mobile]: 'none',
    },
    alignItems: 'center',
  },
  frost: {
    backgroundColor: 'color-mix(in srgb, var(--color-background-surface) 80%, transparent)',
    backdropFilter: 'blur(var(--spacing-3))',
  },
  frostHome: {
    backgroundColor: 'color-mix(in srgb, var(--color-background-body) 80%, transparent)',
  },
  solid: {backgroundColor: 'var(--color-background-surface)'},
  mobileOnly: {
    display: {
      default: 'none',
      [media.mobile]: 'flex',
    },
    alignItems: 'center',
  },
  // CSS chooses the system icon until hydration resolves the saved theme.
  moonWhenSystem: {
    display: {
      default: 'inline-flex',
      '@media (prefers-color-scheme: dark)': 'none',
    },
  },
  sunWhenSystem: {
    display: {
      default: 'none',
      '@media (prefers-color-scheme: dark)': 'inline-flex',
    },
  },
  iconShown: {display: 'inline-flex'},
  iconHidden: {display: 'none'},
});

const subscribeNever = () => () => {};

/** Keep navigation links usable until React attaches the menu handlers. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

function LanguageMenu({locale, alternates}: {locale: Locale; alternates: Partial<Record<Locale, string>>}) {
  const t = useMessage();
  const isHydrated = useIsHydrated();
  // Before the script runs the button is a link to the next language that has this page.
  const order = [...LOCALES.slice(LOCALES.indexOf(locale) + 1), ...LOCALES.slice(0, LOCALES.indexOf(locale))];
  const next = order.find(target => alternates[target] != null);
  const label = t('gz.language.choose');
  return (
    <DropdownMenu
      alignment="end"
      renderTrigger={trigger =>
        // DropdownMenu's press model needs a real <button> (it sets `popovertarget` on it).
        isHydrated ? (
          <Button label={label} tooltip={label} variant="ghost" isIconOnly icon={<Languages />} {...trigger} />
        ) : (
          <Button
            label={label}
            variant="ghost"
            isIconOnly
            icon={<Languages />}
            href={next == null ? undefined : alternates[next]}
            {...(next == null ? {} : {hrefLang: LANGUAGE_TAG[next]})}
          />
        )
      }>
      {LOCALES.map(target => (
        <DropdownMenuItem
          key={target}
          label={t(`gz.language.${target}`)}
          href={alternates[target]}
          isDisabled={alternates[target] == null}
          endContent={target === locale ? <Icon icon="check" size={ICON.inline} color="secondary" /> : undefined}
          {...{lang: LANGUAGE_TAG[target], hrefLang: LANGUAGE_TAG[target]}}
        />
      ))}
    </DropdownMenu>
  );
}

function ServiceMenu({locale}: {locale: Locale}) {
  const t = useMessage();
  const isHydrated = useIsHydrated();
  const label = t('gz.service.label');
  return (
    <DropdownMenu
      alignment="end"
      renderTrigger={trigger =>
        isHydrated ? (
          <Button label={label} tooltip={label} variant="ghost" isIconOnly icon={<LayoutGrid />} {...trigger} />
        ) : (
          // Without the script, the button jumps to the footer, which lists the same sites.
          <Button label={label} variant="ghost" isIconOnly icon={<LayoutGrid />} href={`#${FOOTER_ID}`} />
        )
      }>
      {services(locale).map(service => (
        <DropdownMenuItem
          key={service.id}
          label={t(`gz.service.${service.id}`)}
          href={service.href}
          endContent={service.id === 'main' ? <Icon icon="check" size={ICON.inline} color="secondary" /> : undefined}
        />
      ))}
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const t = useMessage();
  const isHydrated = useIsHydrated();
  const {mode, themeMode, toggleMode} = useThemeMode();
  // The server cannot know the OS scheme; keep its label neutral and disable the no-script toggle.
  const label = themeMode === 'system' ? t('gz.theme.toggle') : mode === 'light' ? t('gz.theme.toDark') : t('gz.theme.toLight');
  return (
    <Button
      label={label}
      tooltip={label}
      variant="ghost"
      isIconOnly
      isDisabled={!isHydrated}
      icon={
        <>
          <Moon {...stylex.props(themeMode === 'system' ? styles.moonWhenSystem : mode === 'light' ? styles.iconShown : styles.iconHidden)} />
          <Sun {...stylex.props(themeMode === 'system' ? styles.sunWhenSystem : mode === 'dark' ? styles.iconShown : styles.iconHidden)} />
        </>
      }
      onClick={toggleMode}
    />
  );
}

function DrawerLinks({locale, section, onNavigate}: {locale: Locale; section?: SectionId; onNavigate: () => void}) {
  const t = useMessage();
  const sections = SECTIONS.map(entry => (
    <VStack key={entry.id} gap={SPACE.toolbar} paddingBlockStart={SPACE.tight}>
      <TopNavItem label={t(`gz.nav.${entry.id}`)} href={sectionHref(locale, entry)} isSelected={section === entry.id} onClick={onNavigate} />
      <VStack gap={SPACE.toolbar} paddingInlineStart={SPACE.inline}>
        {menuEntries(locale, entry).map(({entry: page, link}) => (
          <TopNavItem
            key={page.id}
            label={t(`gz.nav.${page.id}`)}
            href={link.href}
            icon={link.isExternal ? <Icon icon="externalLink" size={ICON.inline} color="inherit" /> : undefined}
            onClick={onNavigate}
          />
        ))}
      </VStack>
    </VStack>
  ));
  return (
    <>
      {sections}
      <VStack gap={SPACE.toolbar} paddingBlockStart={SPACE.tight}>
        {services(locale)
          .filter(service => service.id !== 'main')
          .map(service => (
            <TopNavItem
              key={service.id}
              label={t(`gz.service.${service.id}`)}
              href={service.href}
              icon={<Icon icon="externalLink" size={ICON.inline} color="inherit" />}
              onClick={onNavigate}
            />
          ))}
        <TopNavItem label={t('gz.service.github')} href={SITE.github} icon={<GitHubLogo />} onClick={onNavigate} />
      </VStack>
    </>
  );
}

export interface SiteTopNavProps {
  locale: Locale;
  /** The category the page belongs to, shown as the selected item. */
  section?: SectionId;
  /** The same page in each locale; a missing locale has no translation of this page. */
  alternates: Partial<Record<Locale, string>>;
  isHome?: boolean;
}

export function SiteTopNav({locale, section, alternates, isHome = false}: SiteTopNavProps) {
  const t = useMessage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHydrated = useIsHydrated();
  const logo = <Wordmark />;
  const docs = SECTIONS.find(entry => entry.id === 'docs');

  return (
    <>
      <TopNav
        label={t('gz.nav.label')}
        xstyle={[styles.frost, section == null && styles.frostHome, isHome && styles.solid]}
        heading={<TopNavHeading logoLabel={t('gz.site.title')} headingHref={routes.home(locale)} logo={logo} />}
        centerContent={
          <div {...stylex.props(styles.desktopNav)}>
            {SECTIONS.map(entry => (
              <TopNavItem key={entry.id} label={t(`gz.nav.${entry.id}`)} href={sectionHref(locale, entry)} isSelected={section === entry.id} />
            ))}
          </div>
        }
        endContent={
          <HStack gap={SPACE.cluster}>
            <HStack gap={SPACE.toolbar}>
              <HStack xstyle={styles.desktopOnly}>
                <SearchButton isHydrated={isHydrated} />
              </HStack>
              <ThemeToggle />
              <LanguageMenu locale={locale} alternates={alternates} />
              <div {...stylex.props(styles.desktopOnly)}>
                <ServiceMenu locale={locale} />
              </div>
              <div {...stylex.props(styles.desktopOnly)}>
                <Button label={t('gz.service.github')} tooltip={t('gz.service.github')} variant="ghost" isIconOnly icon={<GitHubLogo size={ICON.toolbarPx} />} href={SITE.github} />
              </div>
            </HStack>
            {docs == null ? null : <HStack xstyle={styles.desktopOnly}><Button label={t('gz.nav.cta')} variant="primary" size={BUTTON.toolbar} href={sectionHref(locale, docs)} /></HStack>}
            <div {...stylex.props(styles.mobileOnly)}>
              <Button
                label={t('gz.nav.open')}
                tooltip={t('gz.nav.open')}
                variant="ghost"
                isIconOnly
                icon={<Icon icon="menu" color="inherit" />}
                data-mobile-nav-open
                aria-expanded={isMenuOpen}
                // Before the script runs, the menu button is a link to the footer's site map.
                {...(isHydrated ? {} : {href: `#${FOOTER_ID}`})}
                onClick={(event: MouseEvent<HTMLElement>) => {
                  event.preventDefault();
                  setIsMenuOpen(true);
                }}
              />
            </div>
          </HStack>
        }
      />
      <MobileNav isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} side="end" label={t('gz.nav.label')} header={logo}>
        <TopNavRenderContext value="drawer">
          <VStack gap={SPACE.toolbar}>
            <Button
              variant="ghost"
              label={t('gz.search.open')}
              icon={<Icon icon="search" color="inherit" />}
              data-search-open
              onClick={() => setIsMenuOpen(false)}
            />
            <DrawerLinks locale={locale} section={section} onNavigate={() => setIsMenuOpen(false)} />
          </VStack>
        </TopNavRenderContext>
      </MobileNav>
    </>
  );
}
