# External Artwork Batch Prompts

Build one complete copy-paste prompt per requested asset. Replace bracketed fields only with facts supported by the references or the user's request. Do not deliver a base prompt plus separate lines the user must assemble.

## Reference Priority

Use this priority inside every delivered prompt:

```text
- Identity reference: owns character identity, hair, face, outfit, accessories, and canonical colors.
- Target-sticker reference: owns only sticker proportions, crop, rendering, and border treatment.
- Sticker-pose reference: owns only the sticker camera angle, body arrangement, hands, clothing motion, and props.
- Background-composition reference: owns only the background pose, crop, subject placement, silhouette, and visual direction.
```

If one attached image serves multiple roles, name every role explicitly. Never blend identities.

## Sticker Batch Prompt

Deliver one fenced block following this structure:

```text
Generate FOUR separate sticker candidates of [character] from [franchise/form/skin].

EXECUTION:
Run four independent image-generation jobs in parallel. Return four separate files named Candidate 01, Candidate 02, Candidate 03, and Candidate 04. Do not create a collage, grid, contact sheet, multi-panel image, or one canvas containing several characters.

OUTPUT FOR EVERY CANDIDATE:
- One standalone PNG, exactly 700x700.
- Genuine RGBA transparency outside the complete sticker contour, including all four corners.
- One character and one pose only.

REFERENCE MAPPING:
[Identify every attached image and its exact role. State which image owns identity, sticker treatment, and pose.]

COMMON IDENTITY INVARIANTS:
[Hair silhouette and colors]; [eyes and expression cues]; [outfit pieces and color relationships]; [signature accessories or prop]; [other unmistakable silhouette cues]. Preserve these exactly through simplification. Do not redesign, omit, recolor, or borrow identity details from another reference.

COMMON PERSONALITY DIRECTION:
Present [character] as [supported personality traits] through a clear, age-appropriate expression and gesture. [User-specific gesture exclusions, such as no heart gesture.] Keep the depiction wholesome and non-suggestive.

COMMON COMPOSITION:
Centered compact [waist-up/three-quarter] chibi or semi-chibi; oversized expressive head; complete readable silhouette; all hair, hands, ears, ribbons, weapons, and accessories inside a 28-35 px transparent safe area. No clipped contour.

COMMON ANATOMY:
Keep every pose natural and coherent, with exactly the intended limbs, hands, fingers, and props. No duplicated, fused, missing, or malformed anatomy.

COMMON RENDERING:
Flat graphic anime construction, crisp clean linework, clean cel shading, two or three intentional tone levels per material, controlled highlights, and simplified precise details. No painterly texture, haze, blur, bloom, photorealism, or 3D rendering.

COMMON PALETTE:
Preserve the canonical character colors and use theme accent [#hex] only for compatible details and the inner keyline. Keep adjacent dark or similar colors visibly distinct.

COMMON STICKER EDGE:
Add a clean 12-18 px white die-cut outer rim following the complete character contour, plus a subtle 4-7 px inner keyline in [accent #hex]. The rim is not a square, circle, badge, frame, or background panel.

COMMON EXCLUSIONS:
No floor, scenery, colored backdrop, fake checkerboard, shadow field, glow cloud, text, logo, signature, watermark, UI, border frame, unrelated characters, or [user-specific exclusions].

CANDIDATE DIRECTIONS:
- Candidate 01: [complete gesture, expression, hand placement, head angle, and body direction].
- Candidate 02: [complete gesture, expression, hand placement, head angle, and body direction].
- Candidate 03: [complete gesture, expression, hand placement, head angle, and body direction].
- Candidate 04: [complete gesture, expression, hand placement, head angle, and body direction].

FINAL DELIVERY:
Return Candidate 01, Candidate 02, Candidate 03, and Candidate 04 as four separate 700x700 transparent PNG files. Generate all four jobs in parallel and never combine them into one image.
```

When an exact sticker-pose reference exists, repeat that same pose for all four candidates and let only normal rendering variation differ. Otherwise write four controlled personality-appropriate gestures.

## Background Batch Prompt

Deliver one fenced block following this structure:

```text
Generate FOUR separate background candidates featuring [character] from [franchise/form/skin].

EXECUTION:
Run four independent image-generation jobs in parallel. Return four separate files named Candidate 01, Candidate 02, Candidate 03, and Candidate 04. Do not create a collage, grid, contact sheet, multi-panel image, or one canvas containing several versions.

OUTPUT FOR EVERY CANDIDATE:
- One standalone fully opaque landscape image, exactly 1920x1080, RGB, 16:9.
- One character composition over one perfectly flat solid-color field.

REFERENCE MAPPING:
[Identify every attached image and its exact role. State which image owns identity and which owns background pose, crop, subject placement, and visual direction.]

COMMON IDENTITY INVARIANTS:
[Hair silhouette and colors]; [canonical outfit pieces and color relationships]; [signature accessories or prop]; [other unmistakable silhouette cues]. Preserve these exactly through simplified flat construction. Recognition must come from silhouette, outfit, accessories, pose, and canonical colors rather than facial detail. Do not redesign the character or borrow identity details from another reference.

COMMON COMPOSITION:
[Faithfully preserve the designated background reference | use the candidate-specific direction]. Anchor the character mainly on the right third and preserve approximately 55-65 percent empty flat-color space on the left for terminal text, unless the user explicitly requests another layout. Keep important anatomy, hair, clothing, and props inside the frame.

COMMON FACE POLICY:
Show no recognizable eyes, nose, and mouth together. Prefer a back view, rear three-quarter angle, deliberate crop, or natural hair occlusion. If part of the face remains visible, reduce it to minimal flat shadow or contour cues. Do not draw detailed eyes, eyelashes, nose, lips, blush, or facial highlights, and do not erase the face into a malformed blank shape.

COMMON BACKDROP:
Fill the entire canvas with exactly one perfectly uniform solid color [flat background hex]. The field must have no gradient, texture, pattern, geometry, tonal division, vignette, lighting variation, floor, scenery, shadow field, or noise.

COMMON RENDERING:
Render the character as clean flat editorial anime artwork with crisp graphic shapes, minimal internal linework, restrained cel shading, two or three flat tones per material, and very limited highlights. Aim for a quiet corporate or enterprise illustration impression. Do not use detailed anime key art, painterly rendering, cinematic lighting, realistic rendering, or poster styling.

COMMON EXCLUSIONS:
No detailed facial features, gradient, texture, pattern, decorative shapes, second background color, scenery, architecture, room, landscape, floor, particles, bokeh, glow cloud, typography, logo, watermark, signature, faux UI, border frame, malformed anatomy, duplicated limbs, or unrelated characters.

CANDIDATE DIRECTIONS:
- Candidate 01: [exact referenced pose or controlled pose A], [crop and right-side placement], flat field [hex A], [minimal flat rendering emphasis].
- Candidate 02: [exact referenced pose or controlled pose B], [crop and right-side placement], flat field [hex B], [minimal flat rendering emphasis].
- Candidate 03: [exact referenced pose or controlled pose C], [crop and right-side placement], flat field [hex C], [minimal flat rendering emphasis].
- Candidate 04: [exact referenced pose or controlled pose D], [crop and right-side placement], flat field [hex D], [minimal flat rendering emphasis].

FINAL DELIVERY:
Return Candidate 01, Candidate 02, Candidate 03, and Candidate 04 as four separate 1920x1080 image files. Generate all four jobs in parallel and never combine them into one image.
```

When an exact background-composition reference exists, preserve it in all four candidates and vary only closely related flat field colors and normal flat-rendering interpretation. Otherwise write four controlled face-obscuring poses without changing identity or terminal-safe framing. Every candidate still uses one uniform solid field only.

## Prompt Record

Export this structure:

```markdown
# Artwork Generation Prompts

## References
- Image 1: identity; local file and SHA-256 when available, otherwise `conversation attachment`
- Image 2: target sticker style; local file and SHA-256 when available, otherwise `conversation attachment`
- Image 3: sticker pose; local file and SHA-256 when available, otherwise `conversation attachment`
- Image 4: background composition; local file and SHA-256 when available, otherwise `conversation attachment`

## Palette
- Base: `#...`
- Surface: `#...`
- Accent: `#...`
- Highlight: `#...`
- Background flat field: `#...`
- Background opacity: `22%` (fixed)

## Sticker Batch Prompt
<one complete copy-paste prompt requesting four separate sticker candidates>

## Background Batch Prompt
<one complete copy-paste prompt requesting four separate background candidates>

## User Selection
- Sticker source: `<pending | filename and SHA-256>`
- Background source: `<pending | filename and SHA-256>`
```
