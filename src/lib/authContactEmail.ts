const TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN = 'telegram.gathr.invalid';

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

export function isTelegramPlaceholderEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  return normalized.endsWith(`@${TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN}`);
}

export function hasUsableContactEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  return !isTelegramPlaceholderEmail(normalized);
}

export function getUsableContactEmail(email: string | null | undefined) {
  return hasUsableContactEmail(email) ? email!.trim() : null;
}

export function getTelegramPlaceholderEmailDomain() {
  return TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN;
}
