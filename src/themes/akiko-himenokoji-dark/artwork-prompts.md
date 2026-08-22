# Artwork Generation Record

## References

- `references/01-identity-primary.png`: primary identity and pose reference; SHA-256 `72a288aa6b29c009fa484dfd67bdd697d3fb32df01305d81380ba818601290bf`.
- `references/02-identity-secondary.png`: full outfit and proportions reference; SHA-256 `0328ce6374befada2896a74d6e9b54e103b6f7a8cf3b42ab6ed71c5628d6328e`.
- `references/03-selected-sticker.png`: user-selected sticker source; SHA-256 `c59b35e0f142b5cfbbfa4e317dfd6cafc705546cfdced6146b29853f279121f2`.
- `references/04-selected-background.png`: user-selected background source; SHA-256 `321e65b8b0368e7b3d7b9569ca4dea58341de3dabcd9b66d9a9b351e74a9ba77`.

## Palette

- Base: `#181317`
- Surface: `#22191e`
- Accent: `#c83f54`
- Highlight: `#e0aa52`
- Background opacity: `22%` (fixed)

## Sticker Batch Prompt

```text
Generate FOUR separate sticker candidates of Akiko Himenokoji from OniAi.

EXECUTION:
Run four independent image generations in parallel. Produce four separate image files named Candidate 01, Candidate 02, Candidate 03, and Candidate 04. Do not create a collage, contact sheet, grid, multi-panel composition, or a single image containing four characters.

OUTPUT FOR EVERY CANDIDATE:
- One standalone PNG, exactly 700x700.
- Genuine alpha transparency outside the complete sticker contour, including all four corners.
- One character and one pose only.

REFERENCE MAPPING:
- Image 1 is the primary identity reference. Preserve Akiko's face, very long hair, red ornaments, canonical colors, uniform, and lively confidence. Use its identity and visual energy, but do not reproduce its background or exact pointing pose.
- Image 2 confirms her complete uniform, skirt trim, tights, shoes, body proportions, and composed appearance.
- Both references depict Akiko Himenokoji. Never merge her identity with another character.

COMMON CHARACTER DIRECTION:
Create a polished kawaii semi-chibi anime sticker of Akiko. Present her as cute, refined, self-assured, outspoken, and playfully mischievous. Give her a bright confident smile and lively rose-magenta eyes. Keep everything wholesome, age-appropriate, and non-suggestive.

IDENTITY INVARIANTS:
- Very long, straight near-black hair extending below the waist.
- Blunt forehead bangs and long face-framing sidelocks.
- Clean separated flowing hair locks.
- Fair warm skin and rose-magenta eyes.
- Matching deep-red ribbon ornaments on both sides of her hair with small golden bell details.
- Fitted black double-breasted school blazer with warm-brass buttons and white-trimmed cuffs.
- Crisp white rounded collar and narrow deep-red ribbon tie.
- Short black pleated skirt with two clean white edge stripes.
- Opaque charcoal-black tights and simple black loafers where visible.

Preserve all identity features and canonical color relationships through chibi simplification. Do not add glasses, animal ears, alternate clothing, jewelry, props, or features belonging to another character.

Never form a heart with her fingers, hands, arms, hair, ribbons, or surrounding effects. Do not add floating hearts or romantic symbols.

ANATOMY:
Each candidate must show exactly two arms and two hands. Every visible hand must have five correctly separated fingers. No duplicated, fused, missing, or malformed limbs or fingers.

COMPOSITION:
Use centered compact three-quarter semi-chibi framing, approximately from head to mid-thigh. Give her an oversized expressive head and a small elegant body. Keep every hair tip, ribbon, hand, finger, elbow, and skirt edge inside a 32-pixel transparent safe area. Do not clip any part of the character.

RENDERING:
Use polished flat graphic anime construction, crisp dark linework, clean cel shading, two or three intentional tone levels per material, restrained highlights, and simplified but precise uniform details. No photorealism, 3D rendering, painterly texture, haze, blur, bloom, or excessive lighting effects.

PALETTE:
Preserve Akiko's near-black hair and uniform, white collar and trim, deep-red ribbons and tie, warm-brass buttons and bells, fair skin, and rose-magenta eyes. Use `#c83f54` as the theme accent.

STICKER BORDER:
Add a clean 15-pixel white die-cut outer rim following the complete character contour, plus a subtle 5-pixel inner keyline in `#c83f54`. The border must not become a square, circle, badge, frame, or background panel.

CANDIDATE DIRECTIONS:
- Candidate 01: Akiko raises her right index finger beside her cheek as if confidently presenting a clever idea, rests her left hand on her hip, tilts her head slightly, and gives a bright playful wink.
- Candidate 02: Akiko holds her right index finger vertically near her lips in a cute mischievous secret gesture, lightly holds her blazer lapel with her left hand, and smiles with composed confidence.
- Candidate 03: Akiko gives a small elegant open-palm wave beside her face, keeps her other hand on her hip, leans subtly toward the viewer, and closes one eye in a cheerful wink.
- Candidate 04: Akiko clasps both hands behind her back, leans forward slightly, tilts her head, and wears a sweet but knowingly mischievous smile.

Do not include scenery, floor, colored backdrop, shadow field, glow cloud, text, logo, signature, watermark, UI, frame, hearts, or romantic symbols.

FINAL DELIVERY:
Return Candidate 01, Candidate 02, Candidate 03, and Candidate 04 as four separate 700x700 transparent PNG files. Generate all four candidates in parallel and never combine them into one image.
```

## Background Batch Prompt

```text
Generate FOUR separate Doki Theme background candidates featuring Akiko Himenokoji from OniAi.

EXECUTION:
Run four independent image-generation jobs in parallel. Return four separate files named Candidate 01, Candidate 02, Candidate 03, and Candidate 04. Never create a collage, grid, contact sheet, multi-panel composition, or one image containing several versions.

OUTPUT FOR EVERY CANDIDATE:
- One standalone fully opaque landscape image, exactly 1920x1080, RGB, 16:9.
- Do not bake transparency or 22% opacity into the image. The theme applies 22% opacity during installation.
- One character composition over one flat dark field.

OFFICIAL REFERENCE:
The attached official image of Akiko Himenokoji is the sole identity, outfit, pose, anatomy, and silhouette reference. Preserve her very long straight near-black hair, blunt bangs, deep-red ribbon ornaments and bells, black double-breasted school blazer, brass buttons, white collar and trim, red ribbon tie, short pleated skirt, dark tights, shoes, body pose, hand placement, clothing motion, hair movement, proportions, and overall silhouette.

Do not redesign, sexualize, recolor, mirror, rotate, stretch, squash, or convert Akiko into chibi proportions. Do not add alternate clothing, accessories, jewelry, props, or identity details absent from the official reference.

COMPOSITION:
Adapt the official character illustration to a professional 1920x1080 landscape wallpaper. Place Akiko primarily on the right third and preserve approximately 60% empty dark space on the left for terminal and editor text. Keep all important hair, hands, clothing, legs, ribbons, and accessories inside the frame.

FACE TREATMENT:
Show no recognizable detailed eyes, nose, and mouth together. Preserve the head shape, bangs, hair framing, and official head angle, but reduce the face to minimal flat shadow and contour cues. The result must feel intentional, elegant, anonymous, and graphic.

CHARACTER STYLE:
Render Akiko as simplified flat editorial anime artwork suitable for a professional IDE background. Use crisp graphic shapes, minimal internal linework, restrained cel shading, two or three flat tones per material, and very limited highlights. Keep original anime proportions.

BACKGROUND RULE:
Use a quiet dark burgundy-charcoal field with no scenery, architecture, room, furniture, floor, horizon, particles, bokeh, typography, logo, signature, watermark, UI, or border frame.

CANDIDATE DIRECTIONS:
- Candidate 01: dark charcoal-plum field `#171217`, strongest silhouette readability.
- Candidate 02: muted blackened burgundy field `#1c1519`, softer internal contrast.
- Candidate 03: neutral graphite-plum field `#151619`, minimal internal lines.
- Candidate 04: deep wine-charcoal field `#21161b`, simplest corporate flat-anime treatment.

FINAL DELIVERY:
Return Candidate 01, Candidate 02, Candidate 03, and Candidate 04 as four separate 1920x1080 image files. Generate all four candidates in parallel and never combine them into one image.
```

## User Selection

- Sticker: `references/03-selected-sticker.png`; accepted as the final creative source and normalized from `1254x1254` to `700x700` RGBA.
- Background: `references/04-selected-background.png`; accepted as the final creative source and normalized from `1672x941` to `1920x1080` RGB.
