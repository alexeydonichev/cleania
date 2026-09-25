# Design QA — customer flow update, 25 September 2026

## Latest comparison: mobile quote and process photos

Source truth: saved production screenshot
`/Users/donichevalexey/Documents/Codex/2026-08-24/crm/outputs/audit-mobile-before-2026-09-25.png`.
Implementation: local production build at http://127.0.0.1:3001/,
`/Users/donichevalexey/Documents/Codex/2026-08-24/crm/outputs/audit-mobile-after-2026-09-25.png`.
Both exports are 360 × 816 pixels from the same requested 375 × 850 CSS viewport.
The equally sized browser exports were compared without further rescaling. Both images were
opened together in one comparison input after the entrance animation completed.
The quote controls are readable at this size, so no additional crop was necessary.

History: P2 selected service truncation → mobile full-width service row. P2 newly
exposed four-digit area clipping → 96px area input on phones. A subsequent 320px
capture showed 4000 fully, a complete 440000 ₽ total and no horizontal overflow.
The narrow CTA horizontal padding was then reduced for more separation from price,
verified in `../outputs/audit-320-area-final-2026-09-25.png` (relative to repo root).
New object choice and the increased card height are requested functional changes,
not drift from the previous two-field reference.

Five surfaces: Manrope, dark readable text and existing optical hierarchy retained;
field spacing/radii consistent with the monochrome select system; blue hero CTA
and messenger palettes retained; original room/process/brand assets unchanged;
new text accurately describes preliminary estimates and customer-confirmed sending.
No full-page design replacement, new imagery or invented case studies.

Process result screenshot:
`/Users/donichevalexey/Documents/Codex/2026-08-24/crm/outputs/audit-process-after-2026-09-25.png`
(1425 × 990 exported pixels, requested CSS viewport 1440 × 1000). All three photos
are unobstructed and no longer carry the visible AI badges. Section headings stay
on one line at desktop size.

Runtime: all four limits exercised in browser; changing 4000 industrial to apartment
clamps to 482; both encoded messenger texts equal the copied receipt; mobile menu
open/close names verified; console errors empty. No message sent. Native messenger
clients, full assistive-technology testing and clipboard-denial UI remain untested.
35 automated checks, lint, production build and public route/asset checks succeeded.
Full evidence and caveats: `docs/customer-flow-audit-2026-09-25.md`.

## Earlier custom-menu comparison (retained audit trail)

final result: passed

## Scope and visual truth

Source menu: /var/folders/kc/06vqk2713mn_k0cp4kpm60680000gn/T/TemporaryItems/NSIRD_screencaptureui_4bz2R3/Снимок экрана — 2026-09-25 в 19.36.28.png (1222 × 1298 pixels).
Original broken state: user attachment at 19.36.19, native OS select.
Additional annotations: 19.36.52 messenger colors; 19.38.07, 19.38.30,
19.39.07, 19.39.32, 19.39.50 section headings; 19.40.09 redundant
before/after notices; 19.40.34 footer slogan.

Intentional adaptation: use the menu's translucent panel, rounded selected rows,
fine outline icons and soft border/shadow, but in the previously requested light
monochrome palette. Application commands are replaced with real cleaning choices.
This is a component style adaptation, not a pixel-identical reproduction of the
blue screenshot. No raster artwork required; icons are from Radix Icons.

Implementation: http://127.0.0.1:3001/ (Next production-mode build).
Desktop screenshot: /Users/donichevalexey/Documents/Codex/2026-08-24/crm/outputs/bleskpro-menu-desktop-2026-09-25.png
Screenshot metadata: 1440 × 1000 pixels; CSS viewport 1440 × 1000.
Menu geometry: 290 × 235 CSS pixels, four 52px items.
Reference and rendered open-state screenshot emitted together in the browser
comparison call. A second paired comparison inspected the focused menu region.
The reference is enlarged; compare panel/row proportions and visual language,
not absolute font size against the enlarged reference pixels.

## Findings and comparison history

- Original P1: visible menu still belonged to the operating system despite the
  styled closed control. Fixed by shared Radix Select with a portal, collision
  avoidance, focus management, typeahead and monochrome menu styles.
- Original P2: forced BR tags split all five headings. Removed those breaks and
  added compact responsive typography. At 1440px every heading measured 44.17px
  high against 44.18px line-height: exactly one line.
- Original P2: footer slogan was 14px. Now 36px at 1440px, weight 600, 1.2 line
  height, tighter tracking and blue second phrase. Browser screenshot verified
  two balanced lines under the logo.
- Redundant image badge and long paragraph removed. The section eyebrow now
  says “Демонстрационные примеры”; accessible image descriptions retain provenance.

No actionable P0/P1/P2 findings remain after implementation.

## Required fidelity surfaces

- Typography: existing Manrope retained; 14px menu labels, 12px secondary
  descriptions; long closed values may ellipsize on narrow phones, while all
  open options remain completely readable. Footer and headings checked above.
- Rhythm: 18px outer radius, 11px inner rows, 12px icon/text gap and 8px menu
  offset. Portal is not clipped by hero photo or animated calculator containers.
- Colors: neutral translucent surface and dark text intentionally replace the
  blue reference. Telegram #229ED9 uses dark navy text for readable contrast;
  MAX #471AFF uses white text, also inside the monochrome calculator.
- Assets: existing photos and brand logos untouched; authentic library icons
  used instead of handmade drawings.
- Content: four real service choices, accurate pricing, named calculator
  controls, and existing contact URLs preserved.

Brand references: https://go.max.ru/brandbook (official MAX palette);
https://telegram.org/tour/screenshots (official Telegram logo resources).
These are locally styled contact links, not official embedded widgets.

## Runtime evidence

- Mouse: selecting Генеральная changes 50m² quote from 4750 to 8000 RUB.
- Keyboard: ArrowDown opens; Home + Enter selects Поддерживающая and restores
  4750 RUB. Escape closes after exit animation and returns focus to combobox.
- Clicking outside dismisses menu.
- Condition selection “Давно не убирали” updates regular quote to 5605 RUB,
  matching the existing 18% multiplier.
- 320px menu left/right bounds 18/308; 375px bounds 47/337. No viewport overflow.
- 320, 375, 851, 1024, 1280 and 1440px layouts checked. All desktop annotated
  headings occupy one line; mobile wraps naturally without overflow.
- Before/after retains its comparison controls and its demonstration identity.
- Browser console error log empty during local checks.
- 28 automated tests passed; ESLint and production build succeeded.
- npm audit --omit=dev reports zero production vulnerabilities. npm install
  reported existing/development-tree advisories; no unrelated dependency upgrade.
- No order submission or messenger message performed. Preview safety untouched.

## Test limitations and follow-up

The real-order time selector shares the same component and compiles but is
not reachable on the Vercel presentation deployment; no production order was
submitted. Native mobile-device and screen-reader hardware were not available.
No remaining blocking visual findings. Review the published dropdown and footer
for subjective preference before expanding the same menu style to unrelated CRM.
