# Compact public layout — 25 September 2026

## Request and root cause

Remove decorative numbering across the public site and reduce large whitespace.
Move the hero star left into the same row as the headline and explanatory copy.
The original hero bottom-aligned a single-line heading against a tall vertical
star/copy/link stack. This created unnecessary empty space above the headline.

## Changes

- Horizontal star/copy assembly with centered alignment on wide screens.
- Hero top padding reduced from 42–86px to 24–36px.
- Shared section padding reduced from 64–126px to 36–64px; at 1440px it is
  57.6px instead of 106.56px. Section heading spacing is now 28px.
- Compact internal-page heroes, business cards and footer spacing.
- Removed ornamental section prefixes, service/process/contact/business card
  numbers, and calculator step badges. Named steps and aria-current remain.
- Prices, telephone numbers, quantities, dates, order IDs and CRM data untouched.
- Mobile calculator's bottom-action clearance retained for usability.

## Local evidence

Production-mode Next build completed; ESLint completed without errors.
Node test runner: 25 tests passed, including two new numbering regression tests.
Browser checks at actual widths 320, 375, 1024, 1101 and 1440px found no
horizontal overflow. At 1101px headline right edge was 631px, star left edge
711px: no collision. At 1440px the hero row height was 143.9px including its
28px bottom padding; star was 96px and beside the copy, not above it.

Visual inspection: desktop hero, 375px mobile hero, mobile calculator extras,
and desktop contacts page. Mobile calculator's named steps were each 44px high;
clicking “Дополнительно” changed the current step and displayed extra services.
Business DOM confirmed zero decorative number spans in proof/process cards.

Presentation-mode safety and quote logic unchanged. No real order was submitted.
