# БлескПРО — branding and direct contacts

## Scope

- Reused the owner's approved logo with the orbital symbol. The delivered lossless WebP is an exact crop of the retained source PNG; no glyphs, colours or symbol geometry were redrawn.
- Shared `BrandLogo` now covers public headers, footers and CRM access/navigation. Updated titles, structured data, privacy copy, notification subjects, favicon and social preview.
- Hero: “Работу — нам,” / “а отдых — Вам”.
- Shared `ContactLinks` adds phone, Telegram and the exact MAX profile supplied by the owner to the home page, public footer, contacts, business preview and final calculator preview.
- Footer reveal transforms create stacking contexts, preventing image-level multiply blending against the footer. Applied blending to those logo containers too; visually verified that the white rectangles disappeared without changing the source asset.

## Contact destinations

- Phone: `tel:+79833216224`.
- Telegram: `https://t.me/+79833216224`, following the [official phone-number link format](https://core.telegram.org/api/links#phone-number-links). Recipient resolution depends on Telegram account privacy. No message was sent and delivery is not claimed.
- MAX: `https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0`. Opened in the browser: profile heading “Екатерина”, with “Отправить сообщение” and browser-opening actions. No message was sent.
- `NEXT_PUBLIC_MAX_PROFILE_URL` can override the owner's default link after HTTPS/host validation. No phone-derived MAX URL is guessed.

## Domain and deployment boundary

Canonical domain: `блескпро.рф` / `xn--90aipcrfhf.xn--p1ai`. This supersedes the earlier release note's Vercel-domain canonical and hero-image social preview.

Added the domain to the existing Vercel `cleania` project. Vercel reported DNS configuration still required: **A record `@` → `76.76.21.21`**. At inspection, public A was `193.164.149.179`, with `ns1.reg.ru` / `ns2.reg.ru`. Registrar DNS was not changed. The existing `cleania.vercel.app` address remains the available public preview until DNS is configured.

All original preview guards remain: Vercel is noindex; CRM, uploads and order creation are not connected. These contact links are direct human conversations, not automatic CRM orders. No customer data, credentials or private portraits are published. Original Cloudflare bindings and auth are unchanged; internal legacy runtime/storage identifiers are retained for compatibility.

## Local proof before push

- 22/22 tests passed, including exact approved-logo pixel equality, asset dimensions, brand/IDN, contact URLs, existing price calculations, motion and preview security tests.
- ESLint, TypeScript and optimized `npm run build:vercel` succeeded.
- Ran the compiled production server on `127.0.0.1:3001`.
- `node scripts/check-public-brand.mjs` verified nine HTML routes, five brand image assets, visible old-brand removal, contact destinations, canonical sitemap and noindex/robots preview policy.
- Browser checks: desktop 1440 and mobile 375/320 layouts; loaded logo, new headline, navigation and contact links without horizontal page overflow. Inspected mobile footer after blend fix. Earlier phone-copy fallback was removed after the owner provided the real MAX profile.
- These are browser viewport checks, not claims of physical-device testing or message-delivery tests.

After publication, repeat `node scripts/check-public-brand.mjs https://cleania.vercel.app` and report deployment status plus the exact commit in the handoff.
