# Telegram Bot Backend

> This folder originally started as a temporary Telegram auth bridge scaffold.
> Direct Telegram OIDC in Supabase worked, so the service was repurposed into
> a lightweight Telegram bot backend.

Why it lives separately:
- keeps the Telegram bot token out of the frontend runtime
- allows a dedicated Vercel project with its own environment variables
- isolates Telegram bot logic from the main SPA deployment

Current responsibilities:
- respond to `/start`, `/help`, `/support`
- open Gathr from Telegram via Mini App / web links
- serve bot webhook endpoints from a dedicated Vercel project

Recommended environment variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `GATHR_WEB_APP_URL`
- `GATHR_SUPPORT_URL`

Webhook endpoints:
- `GET /api/health`
- `GET /api/webhook`
- `POST /api/webhook`
