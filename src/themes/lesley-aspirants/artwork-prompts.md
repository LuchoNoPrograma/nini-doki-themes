# Artwork Prompts

## References

- `references/01-pose.png`: official action artwork, mechanical wings, rifle, outfit and silhouette; SHA-256 `3057d679ecac43411c9c571e3b90766a2da019d117eacb4df44ff66744864de9`
- `references/02-identity.png`: face, hair, visor, costume and wing colors; SHA-256 `114aad6e356c5a9378da0770b3e3830c858cba6e5476fe8ebd90cc63f5b5d90b`

## Palette

- Base: `#151719`
- Secondary: `#202326`
- Accent: `#5cc8cf`
- Highlight: `#d65b56`

## Wallpaper

Input images:
- Image 1 (`references/01-pose.png`): primary official action pose, costume, rifle, mechanical wings, and silhouette reference.
- Image 2 (`references/02-identity.png`): identity, face, hair, visor, outfit construction, and canonical color reference.

Identity invariants: Lesley in the Mobile Legends: Bang Bang Aspirants "Deadeye Spectre" skin; long layered golden-blonde hair with a vivid red forelock over one side of her face, small black angular side visor/headpiece, blue eye for sticker only, white sleeveless tailored armored coat over a charcoal bodysuit, wine-red corset and shoulder armor, black long gloves, gold trim, enormous angular dark red mechanical wing units with slim cyan light channels, and a futuristic dark red sniper rifle. Preserve these exactly. Do not merge traits from another Aspirant or redesign the costume.
Theme palette: base #151719, secondary #202326, principal accent #5cc8cf, supporting highlight #d65b56, warm gold #e7b86b.
No text, lettering, logo, signature, watermark, UI, or border frame.

Use case: stylized-concept.
Asset type: Doki Theme terminal wallpaper, final 16:9 landscape JPG.
Primary request: Create a polished anime/semi-flat wallpaper of Lesley from Mobile Legends: Bang Bang in her Aspirants "Deadeye Spectre" skin, faithfully based on both supplied references. Retain the forward airborne energy of the official artwork while making it quiet enough for terminal use.
Scene/backdrop: quiet flat professional background built from two or three very large low-contrast charcoal, muted wine-red, and dark gray fields with one restrained thin cyan technical arc; almost no environmental detail and no scenery.
Subject: Lesley anchored on the right third in a rear three-quarter airborne marksman pose, rifle held diagonally and the two dark red mechanical wing units creating her recognizable silhouette. Her face is naturally fully hidden by the rear angle, long hair, red forelock, and rifle stock; no recognizable facial features may be visible.
Composition/framing: preserve 58-62 percent calm negative space on the left for terminal text; keep the central body, hair silhouette, rifle, and both wing roots within frame; compact the far wing tips rather than filling the left workspace.
Style/medium: clean high-end anime key art with restrained cel shading, simplified mechanical detail, crisp silhouette, and flat editorial clarity rather than cinematic scenery.
Lighting/mood: soft controlled studio lighting; poised, precise, self-assured; restrained cyan rim light and no bright bloom.
Color palette: #151719, #202326, #5cc8cf, #d65b56, #e7b86b; background stays quieter and darker than Lesley.
Constraints: naturally hide the face using pose, hair, visor, and rifle; do not blur, erase, or leave a malformed blank face; exact 16:9 composition.
Avoid: visible facial features; detailed city, architecture, or landscape; explosions; debris; particles; bokeh; glow clouds; typography; logos; watermark; faux interface; busy left side; duplicated wings or rifles; malformed hands.

## Sticker

Input images:
- Image 1 (`references/01-pose.png`): official action costume, rifle, mechanical wings, hair silhouette, and canonical colors.
- Image 2 (`references/02-identity.png`): primary face, hair, visor, tailored coat, gloves, and color reference.

Identity invariants: Lesley in the Mobile Legends: Bang Bang Aspirants "Deadeye Spectre" skin; long layered golden-blonde hair with a vivid red forelock over one side, one visible blue eye, small black angular side visor/headpiece, white sleeveless tailored armored coat over a charcoal bodysuit, wine-red corset and shoulder armor, black long gloves, gold trim, compact dark red mechanical wing shapes with cyan light channels, and a futuristic dark red sniper rifle. Preserve these exactly. Do not merge traits from another Aspirant or redesign the costume.
Theme palette: base #151719, secondary #202326, principal accent #5cc8cf, supporting highlight #d65b56, warm gold #e7b86b.
No text, lettering, logo, signature, watermark, UI, or border frame.

Use case: stylized-concept.
Asset type: Doki Theme kawaii character sticker, final 700x700 transparent PNG.
Primary request: Create a cute polished chibi sticker of Lesley from Mobile Legends: Bang Bang in her Aspirants "Deadeye Spectre" skin, faithfully based on both supplied references.
Subject: Lesley gives a confident closed-mouth half-smile and a playful wink with the visible blue eye, raising two gloved fingers in a crisp salute beside her visor. Her other hand safely supports a compact simplified version of the dark red sniper rifle behind one shoulder; small folded mechanical wing units frame her without overpowering her face.
Composition/framing: centered compact waist-up chibi in the Fanny-like house proportion; oversized expressive head; readable hair, visor, rifle, and wing silhouette; all fingers, hair tips, rifle ends, and wing tips inside a 30 px transparent safe area.
Style/medium: crisp anime chibi, clean cel shading, controlled highlights, simplified small mechanical details, polished at 700x700 and readable at 200x200.
Color palette: canonical blonde, red forelock, white, charcoal, wine-red, gold, and cyan plus theme principal accent #5cc8cf.
Sticker edge: clean 14-16 px white die-cut outer rim following only Lesley's full contour, with a subtle 5 px inner keyline in #5cc8cf.
Constraints: genuinely transparent canvas outside the contour and transparent corners; exactly two arms and two hands; no floor, shape, badge, square, circle, scenery, or colored backdrop; no clipped contour.
Avoid: generic pose, costume redesign, extra limbs or fingers, multiple rifles, realistic adult proportions, painterly haze, glow background, text, logo, watermark, opaque canvas.

## Wallpaper Final Composition Pass

The first wallpaper pass put a wing inside the terminal workspace. The selected replacement was generated from the same durable references with this final prompt:

```text
Input images:
- Image 1: primary official action pose, costume, rifle, mechanical wings, and silhouette reference.
- Image 2: identity, face, hair, visor, outfit construction, and canonical color reference.

Identity invariants: Lesley in the Mobile Legends: Bang Bang Aspirants "Deadeye Spectre" skin; long layered golden-blonde hair with a vivid red forelock; small black angular side visor/headpiece; white sleeveless tailored armored coat over a charcoal bodysuit; wine-red corset and shoulder armor; black long gloves; gold trim; two enormous angular dark red mechanical wing units with slim cyan light channels; one futuristic dark red sniper rifle. Preserve these exactly. Do not merge traits from another Aspirant or redesign the costume.
Theme palette: base #151719, secondary #202326, principal accent #5cc8cf, supporting highlight #d65b56, warm gold #e7b86b.
No text, lettering, logo, signature, watermark, UI, or border frame.

Use case: stylized-concept.
Asset type: Doki Theme terminal wallpaper, exact 16:9 landscape.
Create a polished clean anime/semi-flat wallpaper. Lesley is in a compact rear three-quarter airborne marksman pose, rifle held diagonally, with both mechanical wings folded closer behind her. Her face is naturally fully hidden by rear angle, long hair, red forelock, and rifle stock; show no recognizable facial features.
STRICT COMPOSITION: confine every character, hair, rifle, wing, and armor pixel to the rightmost 38-40 percent of the canvas. Nothing belonging to Lesley may enter the left 60 percent. Scale the whole subject down enough that both wing tips and rifle remain inside the right-side region. Preserve at least 60 percent completely calm negative space from the left edge for terminal text.
Backdrop: quiet flat professional background using two or three very large low-contrast charcoal and muted wine-red geometric fields. A single thin cyan technical arc may appear only behind Lesley on the right. Almost no detail, no scenery.
Style: high-end anime key art, restrained cel shading, simplified mechanical detail, crisp silhouette, flat editorial clarity. Soft controlled studio light, poised and precise, no bright bloom.
Avoid: visible face; subject or wing crossing into left workspace; city; architecture; landscape; explosions; debris; particles; bokeh; glow clouds; typography; logos; watermark; faux UI; duplicated wings, limbs, hands, or rifles.
```

## Production Alpha Pass

The generator returned the selected sticker with a painted checkerboard, so the same artwork and durable references were sent through this final matte prompt before alpha extraction:

```text
The image generator has twice painted a checkerboard instead of emitting alpha. Perform a production chroma-matte pass on Image 1 only. Preserve the character artwork, expression, pose, anatomy, costume, colors, clean white die-cut outer rim, and thin colored inner keyline exactly. Images 2 and 3 are identity references; do not redesign or alter the character.

Replace every checkerboard/background pixel outside the white die-cut contour with one perfectly flat, uniform, fully opaque chroma green #00FF00. No gradient, no texture, no checkerboard, no shadow, no glow, no green spill, and no green inside the character contour. Keep at least 28 px of solid #00FF00 around the complete contour on all four sides. Square PNG. No text, logo, watermark, badge, floor, or scenery.

Lesley identity invariants: Mobile Legends: Bang Bang Aspirants "Deadeye Spectre"; golden-blonde hair with red forelock, one visible blue eye, black side visor, white/charcoal/wine-red/gold tailored armor, dark red cyan-lit rifle and folded wing units. Keep her confident closed-mouth smile, wink, exactly two hands, and two-finger salute. Exactly one rifle.
```

The uniform matte was converted to genuine RGBA with FFmpeg `colorkey=0x09ec14:0.28:0`; the normalized asset has four transparent corners and 242440 transparent pixels.
