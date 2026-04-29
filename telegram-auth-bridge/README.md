# Telegram Auth Bridge

This folder is reserved for the Telegram authentication bridge service.

Why it lives separately:
- keeps the Telegram bot token out of the frontend runtime
- allows a dedicated Vercel project with its own environment variables
- isolates OAuth/OIDC bridge logic from the main SPA deployment

Planned responsibilities:
- validate Telegram login payloads
- expose OAuth/OIDC-compatible endpoints for Supabase custom provider
- serve from a separate subdomain such as `auth.gathr-app.site`

Suggested Vercel setup later:
- create a second Vercel project from the same Git repository
- set its Root Directory to `telegram-auth-bridge`
- configure its own environment variables

Current status:
- scaffold only
- no production auth logic yet
