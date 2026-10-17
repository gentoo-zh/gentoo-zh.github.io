// Adapted from the Astryx docsite (app/providers.tsx, MIT, Meta Platforms, Inc.).
// Persist data-theme across document navigation; ThemeScript restores it before paint.

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';

type ThemeMode = 'light' | 'dark';

/** localStorage key shared with ThemeScript.astro. */
export const THEME_STORAGE_KEY = 'gz-theme';

const ThemeModeContext = createContext<{
  /** Resolved colour mode for UI consumers (the toggle icon). */
  mode: ThemeMode;
  /** 'system' until the first effect resolves it, so the server HTML matches the first client render. */
  themeMode: 'system' | ThemeMode;
  toggleMode: () => void;
}>({
  mode: 'light',
  themeMode: 'system',
  toggleMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

function readChoice(): ThemeMode | null {
  const value = document.documentElement.getAttribute('data-theme');
  return value === 'light' || value === 'dark' ? value : null;
}

function writeChoice(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage can be blocked (private windows); the choice then lasts for this page only.
  }
}

function clearChoice() {
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Storage can be blocked; nothing was stored then.
  }
}

export function ThemeModeProvider({children}: {children: ReactNode}) {
  const [mode, setMode] = useState<'system' | ThemeMode>('system');
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const stored = readChoice();
    if (stored != null) {
      setIsManual(true);
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    // A stored choice wins over the OS; the effect above applies it in the same commit.
    if (isManual || readChoice() != null) {
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setMode(mq.matches ? 'dark' : 'light');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [isManual]);

  const resolvedMode: ThemeMode = mode === 'dark' ? 'dark' : 'light';

  const toggleMode = () => {
    const next: ThemeMode = resolvedMode === 'dark' ? 'light' : 'dark';
    // Toggling back to the OS scheme resets to 'system': the stored choice is dropped and the
    // page follows the OS again, so the toggle covers light, dark and system.
    const system: ThemeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (next === system) {
      clearChoice();
      setIsManual(false);
      setMode(next);
      return;
    }
    writeChoice(next);
    setIsManual(true);
    setMode(next);
  };

  return <ThemeModeContext value={{mode: resolvedMode, themeMode: mode, toggleMode}}>{children}</ThemeModeContext>;
}
