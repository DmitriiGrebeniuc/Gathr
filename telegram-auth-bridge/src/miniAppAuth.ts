import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN = 'telegram.gathr.invalid';
const TELEGRAM_INIT_DATA_MAX_AGE_SECONDS = 15 * 60;

type TelegramMiniAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

type SupabaseAdminUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<Record<string, unknown>> | null;
};

type MiniAppAuthConfig = {
  botToken: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  appUrl: string;
};

type MiniAppAuthResult = {
  email: string;
  tokenHash: string;
  verificationType: string;
};

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/\/+$/, '');
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

function isTelegramPlaceholderEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  return normalized.endsWith(`@${TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN}`);
}

function hasUsableContactEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized) && !isTelegramPlaceholderEmail(normalized);
}

function buildTelegramPlaceholderEmail(telegramUserId: number) {
  return `tg-user-${telegramUserId}@${TELEGRAM_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function buildTelegramDisplayName(user: TelegramMiniAppUser) {
  const parts = [user.first_name?.trim(), user.last_name?.trim()].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  if (user.username?.trim()) {
    return user.username.trim();
  }

  return `Telegram ${user.id}`;
}

function getMiniAppAuthConfig(): MiniAppAuthConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const appUrl = normalizeBaseUrl(process.env.GATHR_WEB_APP_URL, 'https://gathr-app.site');

  if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_URL');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    botToken,
    supabaseUrl,
    supabaseServiceRoleKey,
    appUrl,
  };
}

function parseInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const authDateRaw = params.get('auth_date');
  const userRaw = params.get('user');

  if (!hash) {
    throw new Error('telegram_init_data_hash_missing');
  }

  if (!authDateRaw) {
    throw new Error('telegram_init_data_auth_date_missing');
  }

  if (!userRaw) {
    throw new Error('telegram_init_data_user_missing');
  }

  const authDate = Number(authDateRaw);

  if (!Number.isFinite(authDate)) {
    throw new Error('telegram_init_data_auth_date_invalid');
  }

  const user = JSON.parse(userRaw) as TelegramMiniAppUser;

  if (!user?.id) {
    throw new Error('telegram_init_data_user_invalid');
  }

  return {
    hash,
    authDate,
    user,
    params,
  };
}

function validateInitData(initData: string, botToken: string) {
  const parsed = parseInitData(initData);
  const now = Math.floor(Date.now() / 1000);

  if (now - parsed.authDate > TELEGRAM_INIT_DATA_MAX_AGE_SECONDS) {
    throw new Error('telegram_init_data_expired');
  }

  const dataCheckString = Array.from(parsed.params.entries())
    .filter(([key]) => key !== 'hash')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const providedBuffer = Buffer.from(parsed.hash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error('telegram_init_data_hash_invalid');
  }

  return parsed.user;
}

function buildTelegramUserMetadata(user: TelegramMiniAppUser, hasMissingContactEmail: boolean) {
  return {
    name: buildTelegramDisplayName(user),
    telegram_user_id: String(user.id),
    telegram_username: user.username?.trim() || null,
    telegram_language_code: user.language_code?.trim() || null,
    telegram_photo_url: user.photo_url?.trim() || null,
    telegram_placeholder_email: hasMissingContactEmail,
    contact_email_missing: hasMissingContactEmail,
  };
}

function getIdentityCandidates(identity: Record<string, unknown>) {
  const identityData =
    typeof identity.identity_data === 'object' && identity.identity_data
      ? (identity.identity_data as Record<string, unknown>)
      : {};

  return {
    provider:
      typeof identity.provider === 'string'
        ? identity.provider
        : typeof identityData.provider === 'string'
          ? identityData.provider
          : null,
    subjectCandidates: [
      identity.sub,
      identity.id,
      identity.provider_id,
      identityData.sub,
      identityData.id,
      identityData.user_id,
      identityData.telegram_user_id,
    ]
      .map((value) => (typeof value === 'string' || typeof value === 'number' ? String(value) : null))
      .filter((value): value is string => Boolean(value)),
  };
}

function matchesTelegramIdentity(
  user: SupabaseAdminUser,
  telegramUserId: string,
  placeholderEmail: string
) {
  if (normalizeEmail(user.email) === placeholderEmail) {
    return true;
  }

  const metadataTelegramUserId = user.user_metadata?.telegram_user_id;

  if (
    typeof metadataTelegramUserId === 'string' &&
    metadataTelegramUserId.trim() === telegramUserId
  ) {
    return true;
  }

  const identities = Array.isArray(user.identities) ? user.identities : [];

  return identities.some((identity) => {
    const { provider, subjectCandidates } = getIdentityCandidates(identity);
    const looksLikeTelegramProvider = provider?.toLowerCase().includes('telegram') ?? false;

    return looksLikeTelegramProvider && subjectCandidates.includes(telegramUserId);
  });
}

async function findSupabaseUserByTelegramIdentity(
  adminClient: ReturnType<typeof createClient>,
  telegramUserId: string,
  placeholderEmail: string
) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users = (data.users ?? []) as SupabaseAdminUser[];
    const matchedUser = users.find((user) =>
      matchesTelegramIdentity(user, telegramUserId, placeholderEmail)
    );

    if (matchedUser) {
      return matchedUser;
    }

    const hasNextPage =
      typeof data.nextPage === 'number' && Number.isFinite(data.nextPage) && data.nextPage > page;

    if (!hasNextPage) {
      return null;
    }

    page = data.nextPage;
  }
}

async function ensureSupabaseUserForTelegram(
  adminClient: ReturnType<typeof createClient>,
  telegramUser: TelegramMiniAppUser
) {
  const placeholderEmail = buildTelegramPlaceholderEmail(telegramUser.id);
  const telegramUserId = String(telegramUser.id);
  const existingUser = await findSupabaseUserByTelegramIdentity(
    adminClient,
    telegramUserId,
    placeholderEmail
  );

  if (!existingUser) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: placeholderEmail,
      email_confirm: true,
      user_metadata: buildTelegramUserMetadata(telegramUser, true),
    });

    if (error) {
      throw error;
    }

    return {
      userId: data.user.id,
      email: placeholderEmail,
      hasMissingContactEmail: true,
    };
  }

  const currentEmail = existingUser.email?.trim() || '';
  const hasRealContactEmail = hasUsableContactEmail(currentEmail);
  const nextEmail = hasRealContactEmail ? currentEmail : placeholderEmail;
  const nextMetadata = {
    ...(existingUser.user_metadata ?? {}),
    ...buildTelegramUserMetadata(telegramUser, !hasRealContactEmail),
  };

  const shouldPatchEmail = !currentEmail;
  const shouldPatchMetadata =
    JSON.stringify(existingUser.user_metadata ?? {}) !== JSON.stringify(nextMetadata);

  if (shouldPatchEmail || shouldPatchMetadata) {
    const { error } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      ...(shouldPatchEmail
        ? {
            email: nextEmail,
            email_confirm: true,
          }
        : {}),
      ...(shouldPatchMetadata ? { user_metadata: nextMetadata } : {}),
    });

    if (error) {
      throw error;
    }
  }

  return {
    userId: existingUser.id,
    email: nextEmail,
    hasMissingContactEmail: !hasRealContactEmail,
  };
}

export async function exchangeTelegramMiniAppInitDataForSupabaseOtp(initData: string) {
  const config = getMiniAppAuthConfig();
  const telegramUser = validateInitData(initData, config.botToken);
  const adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const resolvedUser = await ensureSupabaseUserForTelegram(adminClient, telegramUser);
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: resolvedUser.email,
    options: {
      redirectTo: config.appUrl,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.properties?.hashed_token) {
    throw new Error('supabase_magiclink_hashed_token_missing');
  }

  return {
    email: resolvedUser.email,
    tokenHash: data.properties.hashed_token,
    verificationType: data.properties.verification_type || 'magiclink',
  } satisfies MiniAppAuthResult;
}
