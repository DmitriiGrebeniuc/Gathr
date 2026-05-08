import type { VercelRequestLike, VercelResponseLike } from './_lib/vercel.js';
import { exchangeTelegramMiniAppInitDataForSupabaseOtp } from '../src/miniAppAuth.js';

const DEFAULT_ALLOWED_ORIGIN = 'https://gathr-app.site';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getAllowedOrigin() {
  const configuredOrigin = process.env.GATHR_WEB_APP_URL?.trim();

  if (!configuredOrigin) {
    return DEFAULT_ALLOWED_ORIGIN;
  }

  return configuredOrigin.replace(/\/+$/, '');
}

function applyCorsHeaders(res: VercelResponseLike) {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin());
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Vary', 'Origin');
}

function getHeaderValue(req: VercelRequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getClientRateLimitKey(req: VercelRequestLike) {
  const forwardedFor = getHeaderValue(req, 'x-forwarded-for');
  const firstForwardedIp = forwardedFor.split(',')[0]?.trim();

  if (firstForwardedIp) {
    return firstForwardedIp;
  }

  return getHeaderValue(req, 'x-real-ip') || 'unknown';
}

function isRateLimited(req: VercelRequestLike) {
  const now = Date.now();
  const key = getClientRateLimitKey(req);

  for (const [storedKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(storedKey);
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;

  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  applyCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'telegram-miniapp-auth',
      endpoint: '/api/miniapp-auth',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  if (isRateLimited(req)) {
    res.status(429).json({ ok: false, error: 'rate_limit_exceeded' });
    return;
  }

  try {
    const initData =
      typeof req.body?.initData === 'string'
        ? req.body.initData.trim()
        : '';

    if (!initData) {
      res.status(400).json({ ok: false, error: 'init_data_missing' });
      return;
    }

    const authPayload = await exchangeTelegramMiniAppInitDataForSupabaseOtp(initData);

    res.status(200).json({
      ok: true,
      email: authPayload.email,
      token_hash: authPayload.tokenHash,
      verification_type: authPayload.verificationType,
    });
  } catch (error) {
    console.error('Telegram Mini App auth error:', error);
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'telegram_miniapp_auth_failed',
    });
  }
}
