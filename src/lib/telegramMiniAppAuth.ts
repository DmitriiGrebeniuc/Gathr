import { supabase } from './supabase';
import { getTelegramMiniAppInitData } from './telegramMiniApp';

const DEFAULT_TELEGRAM_AUTH_BRIDGE_URL = 'https://auth.gathr-app.site';

type MiniAppAuthPayload = {
  email: string;
  token_hash: string;
  verification_type: string;
};

function getTelegramAuthBridgeUrl() {
  const envValue = import.meta.env.VITE_TELEGRAM_AUTH_BRIDGE_URL;

  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue.trim().replace(/\/+$/, '');
  }

  return DEFAULT_TELEGRAM_AUTH_BRIDGE_URL;
}

async function exchangeMiniAppTokenHash(payload: MiniAppAuthPayload) {
  const attemptedTypes = new Set<string>([
    payload.verification_type || 'magiclink',
    'signup',
    'email',
    'magiclink',
  ]);

  let lastError: Error | null = null;

  for (const type of attemptedTypes) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: payload.token_hash,
      type: type as never,
    });

    if (!error && data.user) {
      return data.user;
    }

    if (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('telegram_miniapp_session_exchange_failed');
}

export async function signInWithTelegramMiniApp() {
  const initData = getTelegramMiniAppInitData();

  if (!initData) {
    throw new Error('telegram_miniapp_init_data_missing');
  }

  const response = await fetch(`${getTelegramAuthBridgeUrl()}/api/miniapp-auth`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ initData }),
  });

  const payload = (await response.json()) as
    | ({ ok: true } & MiniAppAuthPayload)
    | { ok?: false; error?: string };

  if (!response.ok || !('ok' in payload) || payload.ok !== true) {
    throw new Error(
      'error' in payload && payload.error
        ? payload.error
        : 'telegram_miniapp_bridge_request_failed'
    );
  }

  return exchangeMiniAppTokenHash(payload);
}
