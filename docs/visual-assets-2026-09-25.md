# Visual assets and disclosure

All paths below are relative to the repository root. Generated images are editorial illustrations, not evidence of completed Cleania jobs. The process photos carry an AI badge. The comparison section has both an image badge and a full explanatory disclosure.

| Files | Purpose | Method |
| --- | --- | --- |
| `public/images/cleania-home-retouched.webp` | Hero interior | Built-in image generation, followed by explicitly user-approved local retouch |
| `public/images/process/agree.webp` | Agreeing the scope and estimate | Built-in image generation |
| `public/images/process/clean.webp` | Cleaning a kitchen surface | Built-in image generation |
| `public/images/process/check.webp` | Joint inspection of the result | Built-in image generation |
| `public/images/cases/kitchen-before.webp`, `kitchen-after.webp` | Demonstration kitchen comparison | Built-in image generation/editing |
| `public/images/cases/office-before.webp`, `office-after.webp` | Demonstration office comparison | Built-in image generation/editing |
| `public/images/cases/bathroom-before.webp`, `bathroom-after.webp` | Demonstration bathroom comparison | Built-in image generation/editing |

Image briefs: natural, photorealistic everyday middle-market interiors; realistic daylight and material texture; mechanically plausible furniture and tools; process scenes illustrating discussion, careful cleaning and final inspection. The comparison pairs show the same type of scene and viewpoint before/after surface cleaning, not renovation or replacement of furniture. No fabricated reviews, measured results, client names, timestamps or logos are embedded in these images. Generated pair details can differ and are not a pixel-registered photographic record.

The hero's original exact prompt is preserved in `docs/design-and-validation.md`. `scripts/retouch-hero.mjs` records the exact deterministic repair coordinates. The repaired result was inspected at enlarged scale: only two aligned handles, no ghost holes beneath the right handle.

Natalia: three early identity-based variants were rejected by the owner as not resembling her. A subsequent single portrait revision was shown for approval but was not approved. None of these portraits or the private reference photographs are used in the website or committed to the repository. Do not describe the generic process illustrations as Natalia or as real Cleania employee photographs.

Final assets were optimized to WebP and saved into this workspace. The built-in image tool was used, not an API-key/CLI generation workflow. Discarded intermediate hero outputs are recoverable in ignored `outputs/rejected-hero`; they are excluded from the Vercel upload.
