import { DEFAULT_LANGUAGE, type LanguageCode } from '../app/constants/languages';
const LANGUAGE_STORAGE_KEY = 'gathr-language';

export const getStoredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (
    storedValue === 'ru' ||
    storedValue === 'en' ||
    storedValue === 'ro' ||
    storedValue === 'uk' ||
    storedValue === 'de'
  ) {
    return storedValue;
  }

  return DEFAULT_LANGUAGE;
};

export const setStoredLanguage = (language: LanguageCode) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};