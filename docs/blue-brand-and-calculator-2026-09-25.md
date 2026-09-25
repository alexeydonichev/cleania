# Blue brand, one-line hero and monochrome calculator

## Requested changes

1. Put the hero slogan on one line on a wide screen; preserve readable mobile wrapping.
2. Replace turquoise in the supplied logo with the site's vivid blue palette, retaining the navy wordmark and orbital symbol.
3. Restyle the existing calculator using the supplied translucent menu reference, explicitly adapted to a light background and monochrome controls/text. This is not a clone of the blue menu, nor a request to add its unrelated menu commands.

## Implementation and root causes

The hero phrases were separate block-level `.hero-line` elements. Above 700 CSS pixels they now share a flex baseline and a smaller responsive type scale, keeping the existing individual reveal animations. Mobile layout remains two readable lines.

The turquoise was baked into the raster asset, not the site stylesheet. Edited the existing logo using the built-in image generator, then mechanically cropped/resized the selected output into lossless WebP, favicons and social preview. New `-blue` filenames prevent reuse of cached turquoise icons. The old approved source and delivery files remain recoverable and unreferenced by the live app.

Calculator blue accents were spread between CSS variables and hard-coded selected/focus/range styles. `calculator-theme.css` scopes a monochrome skin to `#calculator`, preserving shared form semantics, quote state, pricing, keyboard controls, step transitions and preview guards. No new service icons or decorative raster assets were needed for the calculator. Existing Manrope typography is retained. The fixed mobile action must not be placed under a backdrop-filter/transform containing block; translucent fills and inset highlights supply the light surface without that regression.

## Generated asset provenance

Mode: built-in image generation/editing, not CLI fallback.

- Edit input: `public/brand/bleskpro-logo.webp` (previous approved turquoise version).
- Generated source: `public/brand/bleskpro-blue-source.png`, 2170 × 725.
- Website asset: `public/brand/bleskpro-logo-blue.webp`, 1786 × 406.
- Delivery script: `scripts/prepare-brand-assets.mjs`.
- Other outputs: `public/brand/favicon-32-blue.png`, `favicon-64-blue.png`, `apple-touch-icon-blue.png`, `social-preview-blue.png`.

Final prompt, verbatim:

> Use case: precise-object-edit. Asset: existing Cyrillic cleaning-company logo for website. Image 1 is the EDIT TARGET, not a loose reference. Perform a colour-only edit. Replace every turquoise/cyan part (letters ПРО, cyan orbital ribbon, cyan sparkle stars) with flat vivid royal/electric blue exactly #284BFF, matching the website buttons and headline. Preserve all dark navy parts unchanged. Preserve the exact wordmark text "БлескПРО", the existing font shapes, weight, kerning, baseline, spacing, orbital emblem geometry and sparkle positions. Do NOT redesign the logo or invent a different orbital symbol. Keep the whole mark and wordmark fully visible on clean pure white background with a small safe margin. Single horizontal logo, no mockup, no shadows, no gradients, no extra text. Crisp high-resolution edges. Text must remain exactly БлескПРО in Cyrillic. Change only turquoise to #284BFF.

Generation produces a raster with small colour/shape variations; this is not claimed to be a pixel-exact recolour. The visible accent is royal blue, not cyan. The delivery test checks pixel equality against the selected generated crop/resize, not against the old turquoise source, plus substantial blue-dominant lettering.

Runtime and visual verification are recorded in the project-root `design-qa.md`; deployment status and commit are reported after publication.
