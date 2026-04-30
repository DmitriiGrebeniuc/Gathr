import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exchangeTelegramMiniAppInitDataForSupabaseOtp } from '../src/miniAppAuth.js';

const DEFAULT_ALLOWED_ORIGIN = 'https://gathr-app.site';

function getAllowedOrigin() {
  const configuredOrigin = process.env.GATHR_WEB_APP_URL?.trim();

  if (!configuredOrigin) {
    return DEFAULT_ALLOWED_ORIGIN;
  }

  return configuredOrigin.replace(/\/+$/, '');
}

function applyCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin());
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
