export type ThemeMode = 'system' | 'dark' | 'light';
export type EffectiveTheme = 'dark' | 'light';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const THEME_STORAGE_KEY = 'gathr-theme-mode';

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'system' || value === 'dark' || value === 'light';
};

export const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_MODE;
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemeMode(storedValue) ? storedValue : DEFAULT_THEME_MODE;
};

export const setStoredThemeMode = (themeMode: ThemeMode) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
};

export const getSystemTheme = (): EffectiveTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveEffectiveTheme = (
  themeMode: ThemeMode,
  systemTheme: EffectiveTheme
): EffectiveTheme => {
  return themeMode === 'system' ? systemTheme : themeMode;
};

export const applyThemeToDocument = (effectiveTheme: EffectiveTheme) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  document.documentElement.style.colorScheme = effectiveTheme;
};
