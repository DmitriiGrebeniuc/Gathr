import type { LanguageCode } from './languages';
import { t } from './translations';

export const ACTIVITY_TYPES = [
  { value: 'sports', translationKey: 'activity.sports', emoji: '⚽' },
  { value: 'networking', translationKey: 'activity.networking', emoji: '🤝' },
  { value: 'study', translationKey: 'activity.study', emoji: '📚' },
  { value: 'entertainment', translationKey: 'activity.entertainment', emoji: '🎮' },
  { value: 'food_drinks', translationKey: 'activity.foodDrinks', emoji: '☕' },
  { value: 'outdoors', translationKey: 'activity.outdoors', emoji: '🌿' },
  { value: 'tech', translationKey: 'activity.tech', emoji: '💻' },
  { value: 'other', translationKey: 'activity.other', emoji: '✨' },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];

export const getActivityTypeMeta = (
  value?: string | null,
  language: LanguageCode = 'en'
) => {
  const type =
    ACTIVITY_TYPES.find((item) => item.value === value) ||
    ACTIVITY_TYPES.find((item) => item.value === 'other')!;

  return {
    ...type,
    label: t(language, type.translationKey),
  };
};