# Prompt Templates

Replace bracketed fields with evidence from the supplied references. Keep both prompts tied to the same identity notes and palette.

## Shared Identity Block

```text
Input images:
- Image 1: primary identity reference for face, hair silhouette, and canonical colors.
- Image 2: costume and accessory reference.
- Image 3: optional personality/pose reference.

Identity invariants: [hair shape and color]; [eye color for sticker only]; [canonical outfit pieces]; [signature accessory or weapon]; [body/silhouette cues]. Preserve these exactly. Do not merge traits from other characters or redesign the costume.
Theme palette: base [#hex], secondary [#hex], principal accent [#hex], supporting highlight [#hex].
No text, lettering, logo, signature, watermark, UI, or border frame.
```

## Wallpaper

```text
Use case: stylized-concept
Asset type: Doki Theme terminal wallpaper, final 16:9 landscape JPG
Primary request: Create a polished anime/semi-flat wallpaper of [character] from [franchise], faithfully based on every supplied identity and costume reference.
Scene/backdrop: quiet, flat professional background built from two or three large low-contrast shapes in [base and secondary colors]; almost no environmental detail; no scenery.
Subject: [character] in [rear three-quarter/back/face-obscuring action] pose using [signature prop or silhouette cue]. The character must remain recognizable through hair, clothing, silhouette, colors, and accessories, but no recognizable face may be visible.
Composition/framing: character anchored on the right third; preserve 55-65 percent calm negative space on the left for terminal text; keep important anatomy and props within frame.
Style/medium: clean high-end anime key art with restrained cel shading and simplified forms; flat editorial/enterprise clarity rather than cinematic scenery.
Lighting/mood: soft controlled lighting, [personality mood], restrained contrast.
Color palette: [palette hex values]; background stays quieter than the character.
Constraints: naturally hide the face using angle, crop, hair, helmet, hand, or prop; do not blur, erase, or leave a malformed blank face; exact 16:9 composition.
Avoid: visible facial features, detailed background, architecture, landscape, particles, bokeh, glow clouds, typography, logos, watermark, faux interface, busy left side.
```

## Sticker

```text
Use case: stylized-concept
Asset type: Doki Theme kawaii character sticker, final 700x700 transparent PNG
Primary request: Create a cute polished chibi sticker of [character] from [franchise], faithfully based on every supplied identity and costume reference.
Subject: [character] showing [personality trait] through [specific expression] and [specific hand/body gesture supported by references]. Keep the canonical hair, eyes, outfit, accessories, and color relationships recognizable after chibi simplification.
Composition/framing: centered compact waist-up or three-quarter chibi; oversized expressive head; readable silhouette; all hair, hands, ears, ribbons, weapons, and accessories inside a 28-35 px transparent safe area.
Style/medium: crisp anime chibi, clean cel shading, controlled highlights, simplified small details, polished at 700x700 and still readable when previewed at 200x200.
Color palette: canonical character colors plus theme principal accent [#hex].
Sticker edge: a clean 12-18 px white die-cut outer rim following the character contour, with a subtle 4-7 px inner keyline or shadow in [accent #hex].
Constraints: genuinely transparent canvas outside the contour; transparent corners; no floor, shape, badge, square, circle, scenery, or colored backdrop; no clipped contour.
Avoid: generic pose, costume redesign, extra limbs/fingers, realistic proportions, painterly haze, glow background, text, logo, watermark, opaque canvas.
```

## Prompt Record

Save `src/themes/<slug>/artwork-prompts.md` with:

```markdown
# Artwork Prompts

## References
- `references/01-identity.<ext>`: identity/face/hair; SHA-256 `<hash>`
- `references/02-costume.<ext>`: costume/accessories; SHA-256 `<hash>`

## Palette
- Base: `#...`
- Secondary: `#...`
- Accent: `#...`
- Highlight: `#...`

## Wallpaper
<final prompt exactly as sent>

## Sticker
<final prompt exactly as sent>
```
