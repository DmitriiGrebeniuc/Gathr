import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyThemeToDocument,
  getStoredThemeMode,
  getSystemTheme,
  resolveEffectiveTheme,
  setStoredThemeMode,
  type EffectiveTheme,
  type ThemeMode,
} from '../../lib/theme';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
  effectiveTheme: EffectiveTheme;
  systemTheme: EffectiveTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode());
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme());

  useEffect(() => {
    setStoredThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  const effectiveTheme = useMemo<EffectiveTheme>(() => {
    return resolveEffectiveTheme(themeMode, systemTheme);
  }, [themeMode, systemTheme]);

  useEffect(() => {
    applyThemeToDocument(effectiveTheme);
  }, [effectiveTheme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      themeMode,
      setThemeMode: setThemeModeState,
      effectiveTheme,
      systemTheme,
    };
  }, [themeMode, effectiveTheme, systemTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
