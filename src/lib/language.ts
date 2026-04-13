import { DEFAULT_LANGUAGE, type LanguageCode } from '../app/constants/languages';
const LANGUAGE_STORAGE_KEY = 'gathr-language';

const isLanguageCode = (value: string | null): value is LanguageCode => {
  return value === 'ru' || value === 'en' || value === 'ro' || value === 'uk' || value === 'de';
};

export const getStoredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (isLanguageCode(storedValue)) {
    return storedValue;
  }

  return DEFAULT_LANGUAGE;
};

export const hasStoredLanguagePreference = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return isLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
};

export const setStoredLanguage = (language: LanguageCode) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};
