import type { VercelRequestLike, VercelResponseLike } from './_lib/vercel.js';

export default function handler(_req: VercelRequestLike, res: VercelResponseLike) {
  res.status(200).json({
    ok: true,
    service: 'telegram-auth-bridge',
    status: 'scaffold-ready',
  });
}
