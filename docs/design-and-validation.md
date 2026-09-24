# Cleania — redesign, September 2026

## Design sources inspected

- [Format Furniture / Awwwards](https://www.awwwards.com/sites/format-furniture), Honorable Mention, 26 July 2022. Large sans-serif typography, generous photography and a strong footer identity. Live site: https://format.furniture/.
- [RIGAS Furniture / Awwwards](https://www.awwwards.com/sites/rigas-furniture), Honorable Mention, 30 May 2025. Restrained navigation, oversized type and editorial imagery. Live site: https://www.rigas-furniture.gr/.

These are design references, not cleaning-company recommendations, conversion evidence or an assertion that Cleania won an award. No source code, logos or photographs were copied from them.

## Adaptation

The design centres on a customer buying time back: a light page, dark readable type, cobalt accents, local Cyrillic-capable Manrope, wide content and a compact usable quote embedded in the hero. The CRM is available through a staff link, not promoted to cleaning customers.

Motion: restrained entrance sequence; one-time intersection reveals; animated calculator steps and price changes; card and button feedback; smoothly expanding FAQ where supported; scroll progress. Native scrolling is preserved. Reduced-motion preference disables animations and transitions. No motion library or animation video is downloaded. Below-the-fold elements remain visible if JavaScript or IntersectionObserver is unavailable.

## Pricing and geography

Existing editable CRM rates are preserved: regular 95 ₽/m² (minimum 2490), deep 160 (4490), renovation 230 (6990), office 110 (5990). These are Cleania's configured tariffs, not a measured market average. A 50 m² regular clean calculates to 4750 ₽ before options or recurring discounts.

Discovery sources (advertised starting prices, not comparable completed transactions):
- https://berdsk.klining-pro.ru/ — search index displayed apartment cleaning from 2000 ₽, deep from 4000 ₽, renovation from 5000 ₽.
- https://metelochka.com/nsk/cleaning/regular/ — search index displayed regular cleaning from 2220 ₽.

Full price pages could not be retrieved through the research tool, so no market-median claim is made and tariffs were not reset from search snippets. Owner should validate unit economics before a commercial launch.

Novosibirsk and Berdsk are explicit choices. The selected city, address, preferred time and wishes are stored using existing CRM columns. Dates/times are preferences, not inventory-backed reservations.

The hero and full calculator share state. Client and server import one quote function. Extras retain the existing array storage representation: repeated keys are quantities, bounded by the API. Minimum price is no longer rounded up from 2490 to 2500. The server recomputes the amount and returns 409 if it differs from the reviewed estimate.

## Original image

Built-in image_gen generated one original editorial interior, saved in public/images/cleania-home.webp (1672 × 941, about 193 kB). It is illustrative, not a photo of a real Cleania customer's apartment or proof of completed work.

Prompt: “Photorealistic editorial interior photograph of an ordinary but beautifully kept modern mid-price apartment in Novosibirsk. White walls, pale oak floor, linen curtains, inviting sky-blue fabric sofa right of centre, sculptural dark-blue side table with clear glass vase and one branch, a neatly placed book. Wide 16:9 eye-level composition, straight verticals, warm afternoon sunlight, tactile materials, restrained cobalt accent, calm lower corners for UI overlays. No mansion, people, cleaning products, text, logos, watermark, collage or UI.”

## Verification

Reproducible arithmetic suite: node --test tests/quote.test.mjs (Node with native TypeScript support). Covers exact minimum, itemised combined modifiers, CRM overrides, 144 service/area/condition/frequency combinations, phone validation and Novosibirsk date formatting.

Browser/API checks and publication result are reported in the delivery message. Production access remains owner-only. Telegram/MAX/email transports are preserved; this redesign does not provision credentials or claim those channels are connected.

### Local runtime evidence

- Browser journey: Berdsk, 50 m², 2 bathrooms, +18% condition, weekly −15%, 2 windows and 1 oven. Both the displayed calculation and saved order `CL-260924-CE63` equal **7908 ₽**. The success screen shows the same amount. Read-only SQLite inspection confirms the city, address, time preference, comment and repeated extras. This is synthetic local data, not a production booking.
- Empty contact submission reports a required name and focuses the field. Mobile action bar is fixed while the calculator is in view. Menu opens and closes on navigation.
- At 320 CSS pixels, the header initially overflowed. The shorter order label fixes it: document width and viewport both equal 320; menu right edge is 310. At 390, 1280 and 1440 CSS pixels no horizontal page overflow was observed. Mobile screenshots inspected. Large-viewport screenshots from the embedded browser contained capture artifacts; desktop DOM geometry and a partial viewport screenshot were checked, not a reliable full-page visual capture.
- API rejects a stale reviewed price with 409, unsupported city with 400 and a past date with 400; these requests do not create orders.
- Motion runs in the browser (`quiet-zoom` on the hero image). Reduced-motion CSS disables animation and transition; step navigation also checks the preference before smooth scrolling. The reduced-motion branch was inspected in source, not tested with an OS preference change.
- ESLint, TypeScript and all 6 arithmetic tests completed successfully. Final production build is part of the publish workflow.

## Commercial launch inputs still owned by the business

Public phone and messenger addresses, legal identity and privacy contact, retention policy, approved final tariff economics and operating promises. The existing privacy page explicitly describes the missing operator information. No invented reviews, ratings, staff counts, guarantees of instant response or reserved calendar slots were added.
