export type EventContactDraft = {
  instagram: string;
  telegram: string;
  phone: string;
};

export type NormalizedEventContactMethods = {
  instagram_url: string | null;
  telegram_url: string | null;
  phone_number: string | null;
};

export type EventContactMethods = {
  event_id: string;
  instagram_url: string | null;
  telegram_url: string | null;
  phone_number: string | null;
};

export type EventContactValidationField = 'instagram' | 'telegram' | 'phone';

export function getEmptyEventContactDraft(): EventContactDraft {
  return {
    instagram: '',
    telegram: '',
    phone: '',
  };
}

function trimContactValue(value: string | null | undefined): string {
  return (value || '').trim();
}

function normalizeInstagram(input: string): string | null {
  const raw = trimContactValue(input);

  if (!raw) {
    return null;
  }

  const candidate = raw.startsWith('@') ? raw.slice(1) : raw;

  if (/^[A-Za-z0-9._]{1,30}$/.test(candidate)) {
    return `https://instagram.com/${candidate}`;
  }

  const urlCandidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(urlCandidate);
    const hostname = url.hostname.toLowerCase();

    if (!['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(hostname)) {
      return '__invalid__';
    }

    const username = url.pathname.split('/').filter(Boolean)[0] || '';

    if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) {
      return '__invalid__';
    }

    return `https://instagram.com/${username}`;
  } catch {
    return '__invalid__';
  }
}

function normalizeTelegram(input: string): string | null {
  const raw = trimContactValue(input);

  if (!raw) {
    return null;
  }

  const candidate = raw.startsWith('@') ? raw.slice(1) : raw;

  if (/^[A-Za-z0-9_]{4,32}$/.test(candidate)) {
    return `https://t.me/${candidate}`;
  }

  const urlCandidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(urlCandidate);
    const hostname = url.hostname.toLowerCase();

    if (!['t.me', 'www.t.me', 'telegram.me', 'www.telegram.me'].includes(hostname)) {
      return '__invalid__';
    }

    const username = url.pathname.split('/').filter(Boolean)[0] || '';

    if (!/^[A-Za-z0-9_]{4,32}$/.test(username)) {
      return '__invalid__';
    }

    return `https://t.me/${username}`;
  } catch {
    return '__invalid__';
  }
}

function normalizePhone(input: string): string | null {
  const raw = trimContactValue(input);

  if (!raw) {
    return null;
  }

  const sanitized = raw.replace(/[^\d+]/g, '');

  if (sanitized.includes('+') && !sanitized.startsWith('+')) {
    return '__invalid__';
  }

  const digits = sanitized.replace(/\D/g, '');

  if (digits.length < 6 || digits.length > 15) {
    return '__invalid__';
  }

  return raw.startsWith('+') ? `+${digits}` : digits;
}

export function normalizeEventContactDraft(draft: EventContactDraft): {
  data: NormalizedEventContactMethods;
  invalidField: EventContactValidationField | null;
} {
  const instagram = normalizeInstagram(draft.instagram);

  if (instagram === '__invalid__') {
    return {
      data: {
        instagram_url: null,
        telegram_url: null,
        phone_number: null,
      },
      invalidField: 'instagram',
    };
  }

  const telegram = normalizeTelegram(draft.telegram);

  if (telegram === '__invalid__') {
    return {
      data: {
        instagram_url: null,
        telegram_url: null,
        phone_number: null,
      },
      invalidField: 'telegram',
    };
  }

  const phone = normalizePhone(draft.phone);

  if (phone === '__invalid__') {
    return {
      data: {
        instagram_url: null,
        telegram_url: null,
        phone_number: null,
      },
      invalidField: 'phone',
    };
  }

  return {
    data: {
      instagram_url: instagram,
      telegram_url: telegram,
      phone_number: phone,
    },
    invalidField: null,
  };
}

export function hasAnyEventContactMethods(
  contacts:
    | NormalizedEventContactMethods
    | EventContactMethods
    | null
    | undefined
): boolean {
  return !!(
    contacts?.instagram_url ||
    contacts?.telegram_url ||
    contacts?.phone_number
  );
}

export function toEventContactDraft(
  contacts: EventContactMethods | null | undefined
): EventContactDraft {
  return {
    instagram: trimContactValue(contacts?.instagram_url),
    telegram: trimContactValue(contacts?.telegram_url),
    phone: trimContactValue(contacts?.phone_number),
  };
}

export function getInstagramHandleLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return `@${parsed.pathname.split('/').filter(Boolean)[0] || 'instagram'}`;
  } catch {
    return '@instagram';
  }
}

export function getTelegramHandleLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return `@${parsed.pathname.split('/').filter(Boolean)[0] || 'telegram'}`;
  } catch {
    return '@telegram';
  }
}

export function getPhoneLabel(phone: string): string {
  return phone;
}
