export const LANGUAGES = [
  { value: 'ru', label: 'Русский', emoji: '🇷🇺' },
  { value: 'en', label: 'English', emoji: '🇬🇧' },
  { value: 'ro', label: 'Română', emoji: '🇷🇴' },
  { value: 'uk', label: 'Українська', emoji: '🇺🇦' },
  { value: 'de', label: 'Deutsch', emoji: '🇩🇪' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['value'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const getLanguageMeta = (value?: string | null) => {
  return (
    LANGUAGES.find((language) => language.value === value) ||
    LANGUAGES.find((language) => language.value === DEFAULT_LANGUAGE)!
  );
};