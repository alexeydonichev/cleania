# Cleania

Public cleaning-service website, online price calculator and protected CRM for Novosibirsk.

## Product surfaces

- Editorial light landing page with a server-verified calculator.
- SEO pages for regular, deep, post-renovation and window cleaning.
- B2B brief for offices and commercial properties.
- D1-backed leads, orders, pricing, crews, activity and financial data.
- R2 uploads for customer object photos.
- Authenticated CRM with orders, schedule, crews, P&L, pricing and integration health.
- Server-side notifications for Telegram, MAX and an email webhook.

## Local development

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`. Local Sites authentication provides a development account for `/crm`.

## Validation

```bash
npm run lint
npm run db:generate
npm run build
```

## Vercel presentation deployment

`npm run build:vercel` builds the same frontend with Next.js for Vercel. This is currently a clearly marked **demonstration**: the calculator works, but bookings, uploads and CRM access are disabled until a durable backend and standalone authentication are connected. No personal data is collected in this mode. The existing Sites/Cloudflare deployment remains separate and unchanged. See [release evidence](docs/release-2026-09-25.md).

## Environment

Copy `.env.example` to `.env.local` and fill only the integrations you need. Never commit real tokens.

`CRM_OWNER_EMAILS` must be set before the production CRM can be used. Production denies owner bootstrap when the allowlist is absent; the one-time first-user bootstrap is available only in local development for smoke testing.

## Before commercial launch

1. Replace preview contact copy with the real phone, email, legal entity and personal-data operator details.
2. Confirm the service area, pricing rules, minimum order and public offer.
3. Add the real domain to `NEXT_PUBLIC_SITE_URL`, then regenerate and validate canonical URLs and the sitemap.
4. Configure at least one manager notification channel and place a real test order.
5. Add real crews and verify the order-to-profit workflow in CRM.
