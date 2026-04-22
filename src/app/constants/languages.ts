export const LANGUAGES = [
  { value: 'ru', label: 'Русский', emoji: '🇷🇺', shortLabel: 'RU' },
  { value: 'en', label: 'English', emoji: '🇬🇧', shortLabel: 'EN' },
  { value: 'ro', label: 'Română', emoji: '🇷🇴', shortLabel: 'RO' },
  { value: 'uk', label: 'Українська', emoji: '🇺🇦', shortLabel: 'UA' },
  { value: 'de', label: 'Deutsch', emoji: '🇩🇪', shortLabel: 'DE' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['value'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const getLanguageMeta = (value?: string | null) => {
  return (
    LANGUAGES.find((language) => language.value === value) ||
    LANGUAGES.find((language) => language.value === DEFAULT_LANGUAGE)!
  );
};
