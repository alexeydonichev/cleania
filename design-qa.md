# Design QA — blue brand and monochrome calculator

final result: passed

## Target and intentional adaptation

Source visual truth: `/var/folders/kc/06vqk2713mn_k0cp4kpm60680000gn/T/TemporaryItems/NSIRD_screencaptureui_eQjfPt/Снимок экрана — 2026-09-25 в 18.42.06.png` (actual filename includes nonbreaking spaces, as attached in this task), 588 × 692 pixels.

The owner requested this menu's soft translucent surfaces, thin outlines and highlighted controls **on a light background with monochrome buttons/text**, inside the existing calculator. Blue gradient background, menu commands and menu icons are intentionally not copied. Existing calculator content, responsive grid and typography are retained. This is a component-style adaptation, not a pixel-identical menu clone.

Implementation: `http://127.0.0.1:3001/#calculator`, compiled Next production build.

Implementation screenshot evidence: inline browser captures in this task, titled “Визуальная проверка выбранных и обычных кнопок калькулятора”, “Проверить дополнительную услугу и закреплённую мобильную кнопку” and “Сравнить настольные кнопки с референсом перед публикацией”. The browser capture API returned inline images rather than filesystem paths; no nonexistent screenshot file is claimed.

## Comparison evidence and normalization

- Source image and implementation were emitted together in the same comparison call for mobile first-step controls and desktop first-step controls.
- Desktop comparison: 1008 × 700 CSS viewport, displayed capture approximately 993 × 690 image pixels after tool presentation; the image is scaled uniformly. Judged control treatment and spacing, not absolute source-menu widths. The form and summary occupy separate non-overlapping columns.
- Mobile: 320 × 1648 CSS viewport, captured through the normal in-app browser surface. A narrower presentation image is tool-scaled; geometry assertions use actual CSS coordinates. First step, selected city, selected cleaning type, counters and extra-service state were inspected.
- An initial explicit-viewport capture was tiled/blank due to browser capture scaling and was discarded as visual evidence. Resetting the viewport and capturing again produced readable complete controls. No application change was inferred from that capture artifact.
- Focused comparison: the readable first-step selection cards and highlighted city above; no separate crop is needed because text, radii, borders, inset highlights and selected radio marks are legible in these captures.
- Additional hero check: 1440 × 900 CSS viewport, both phrase tops 393.30px (one baseline), with no horizontal overflow. At 375px the readable two-line mobile treatment remains, also without horizontal overflow.

## Findings and required fidelity surfaces

No actionable P0/P1/P2 mismatch remains within the requested component-style adaptation.

- **Typography:** existing Manrope, dark neutral text, smaller muted explanations and clear heading hierarchy. Cyrillic content remains live text; no screenshot text is rasterized. Mobile wrapping stays inside controls.
- **Spacing/layout:** 12px control radii, 22px outer panels, consistent existing form spacing, 44 × 44px counter buttons. At 320px the area/sanuzel section stacks to avoid squeezing larger targets. Desktop form and summary remain separate. The mobile action stays inside the viewport (top 1568px, bottom 1639px in the 1648px-high check).
- **Colours/tokens:** section background `rgb(247,247,247)`; selected cards light gray; primary action `rgb(41,41,41)` with white text; disabled final action `rgb(227,227,227)`. Thin gray outlines and inset white highlights adapt the source's soft surface treatment. Focus outline and radio mark distinguish selection without relying on colour alone. Header/branding outside the calculator deliberately remain blue.
- **Image quality/assets:** supplied logo edited via built-in image generation; blue lettering and orbital symbol were inspected before integration. New delivery variants use lossless WebP and correct intrinsic dimensions. Calculator reference contains UI, not a missing photo asset; no new decorative image or invented icon was introduced. Existing semantic form controls were reused.
- **Copy/content:** all existing service names, prices, units, explanations and truthful demo limits retained. No unrelated “Copy/Paste” menu text imported from the reference.

## Interaction and runtime proof

- Selected Бердск; changed area from 50 to 60 m² and bathrooms from 1 to 2: total became 6250 ₽.
- Next step opened; added one “Духовка внутри” for 650 ₽: total became 6900 ₽ and selected card/counter updated.
- Final step showed 6900 ₽, monochrome Telegram/MAX links, no personal-data inputs, and disabled demo submission. Returned to the first step with selected parameters retained.
- Browser warning/error log empty at inspection.
- Production build, TypeScript, ESLint and 23 unit tests passed. HTTP brand verifier checked nine page routes, five current blue assets, contacts, canonical sitemap and preview robots policy.
- No real order, message or notification was sent. CRM and order backend remain outside this presentation deployment.

## Comparison history

1. Discarded invalid tiled browser capture; obtained readable captures after normalizing the browser surface. This was an evidence issue, not an app-design finding.
2. Mobile and desktop source/implementation comparisons found no actionable P0/P1/P2 differences after accounting for the explicitly requested light monochrome adaptation. No visual-fix loop is claimed where none was needed.

## Implementation checklist

- [x] Scope monochrome styling to calculator only.
- [x] Verify selected, focused, hover CSS, disabled and final-estimate states.
- [x] Verify three-step calculation and preserved preview guard.
- [x] Inspect desktop/mobile captures and browser console.
- [x] Verify single-line desktop slogan and blue branding.

## Follow-up polish / remaining test gaps

No blocking polish item. Physical-device testing, real notification delivery and authenticated CRM views were not exercised. This QA does not claim literal pixel fidelity to a menu whose content and colours the owner explicitly asked to adapt.
