export const INPUT_LIMITS = {
  profileName: 80,
  email: 254,
  password: 128,
  eventTitle: 100,
  eventDescription: 1000,
  eventLocation: 220,
  supportSubject: 120,
  supportMessage: 2000,
  search: 80,
} as const;

export function limitText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

export function trimAndLimitText(value: string, maxLength: number) {
  return limitText(value.trim(), maxLength);
}
