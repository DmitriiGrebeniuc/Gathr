export const ACTIVITY_TYPES = [
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'networking', label: 'Networking', emoji: '🤝' },
  { value: 'study', label: 'Study', emoji: '📚' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎮' },
  { value: 'food_drinks', label: 'Food & Drinks', emoji: '☕' },
  { value: 'outdoors', label: 'Outdoors', emoji: '🌿' },
  { value: 'tech', label: 'Tech', emoji: '💻' },
  { value: 'other', label: 'Other', emoji: '✨' },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];

export const getActivityTypeMeta = (value?: string | null) => {
  return (
    ACTIVITY_TYPES.find((type) => type.value === value) ||
    ACTIVITY_TYPES.find((type) => type.value === 'other')!
  );
};