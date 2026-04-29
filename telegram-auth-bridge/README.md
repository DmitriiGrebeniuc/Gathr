# Telegram Auth Bridge

> Temporary fallback scaffold.
>
> Keep this service only if direct Telegram OIDC integration with Supabase
> turns out to be blocked by platform limitations.
>
> If Telegram works as a native Supabase custom OIDC provider, delete:
> - the `telegram-auth-bridge/` folder from this repository
> - the separate `telegram-auth-bridge` Vercel project
> - the DNS record for `auth.gathr-app.site`

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
