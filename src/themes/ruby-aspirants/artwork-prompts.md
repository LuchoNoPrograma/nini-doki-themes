# Artwork Prompts

## References

- `references/01-pose.png`: official action artwork, mechanical scythe, outfit and silhouette; SHA-256 `118a220e5272ea526d5b480a32b2da30a2ded0be9b067dee497de230d867f516`
- `references/02-identity.png`: face, hair, headpiece, outfit colors and proportions; SHA-256 `4df2be400fded0e86b3e3b23201cba845fc2d57ef26e469cfe69cbb8a32ffdeb`

## Palette

- Base: `#12161c`
- Secondary: `#1b2028`
- Accent: `#e99a2e`
- Highlight: `#e76f8f`

## Wallpaper

Input images:
- Image 1 (`references/01-pose.png`): primary official pose, costume, mechanical scythe, and silhouette reference.
- Image 2 (`references/02-identity.png`): identity, hair, headpiece, and canonical color reference.

Identity invariants: Ruby in the Mobile Legends: Bang Bang Aspirants "Mecha Maiden" skin; blue-black bob and long dark hair sections with pink/lilac underside accents; angular orange-and-white mechanical headpiece; white, orange-gold, black, and gray armored dress with high collar, gauntlets, black tights, and sharp panel shapes; enormous articulated white/orange/graphite mechanical scythe. Preserve these exactly. Do not merge traits from another Aspirant or redesign the costume.
Theme palette: base #12161c, secondary #1b2028, principal accent #e99a2e, supporting highlight #e76f8f, small technology accent #5bc5d1.
No text, lettering, logo, signature, watermark, UI, or border frame.

Use case: stylized-concept.
Asset type: Doki Theme terminal wallpaper, final 16:9 landscape JPG.
Primary request: Create a polished anime/semi-flat wallpaper of Ruby from Mobile Legends: Bang Bang in her Aspirants "Mecha Maiden" skin, faithfully based on both supplied references. Reinterpret the official scythe-wielding action composition as a clean terminal wallpaper rather than inventing a different pose.
Scene/backdrop: quiet flat professional backdrop built from two or three very large low-contrast graphite, navy-black, and muted orange geometric fields that echo the official Aspirants key art; almost no environmental detail and no scenery.
Subject: Ruby anchored in the right third in a dynamic rear three-quarter scythe swing. Her face is naturally hidden by the rear angle, heavy bangs, and the scythe shaft; no recognizable facial features may be visible. The huge articulated scythe arcs behind and above her as the signature silhouette.
Composition/framing: preserve 58-62 percent calm negative space on the left for terminal text; keep her body and the most recognizable scythe sections within frame; let only a nonessential blade tip extend near an outer edge. Match the energy and readable diagonal of the official artwork without copying its checkerboard backdrop.
Style/medium: clean high-end anime key art with restrained cel shading, simplified mechanical detail, crisp silhouette, and flat editorial clarity rather than cinematic scenery.
Lighting/mood: controlled cool studio light with warm orange edge accents; determined, agile, heroic; restrained contrast.
Color palette: #12161c, #1b2028, #e99a2e, #e76f8f, #5bc5d1; background stays quieter and darker than Ruby.
Constraints: naturally hide the face using pose, hair, and weapon; do not blur, erase, or leave a malformed blank face; exact 16:9 composition.
Avoid: visible eyes, nose, and mouth together; detailed city or architecture; landscape; particles; bokeh; glow clouds; typography; logos; watermark; faux interface; busy left side; duplicated weapon parts; malformed hands.

## Sticker

Input images:
- Image 1 (`references/01-pose.png`): official costume, mechanical forms, hair movement, and canonical colors.
- Image 2 (`references/02-identity.png`): primary face, hair, headpiece, and outfit reference.

Identity invariants: Ruby in the Mobile Legends: Bang Bang Aspirants "Mecha Maiden" skin; blue-black hair with straight bangs, long dark side/back sections and pink/lilac underside accents; bright cyan-blue eyes; angular orange-and-white mechanical headpiece; white, orange-gold, black, and gray high-collar armored dress with white gauntlets and sharp panels. Preserve these exactly. Do not merge traits from another Aspirant or redesign the costume.
Theme palette: base #12161c, secondary #1b2028, principal accent #e99a2e, supporting highlight #e76f8f, small technology accent #5bc5d1.
No text, lettering, logo, signature, watermark, UI, or border frame.

Use case: stylized-concept.
Asset type: Doki Theme kawaii character sticker, final 700x700 transparent PNG.
Primary request: Create a cute polished chibi sticker of Ruby from Mobile Legends: Bang Bang in her Aspirants "Mecha Maiden" skin, faithfully based on both supplied references.
Subject: Ruby is unmistakably happy with bright friendly eyes and a small closed-mouth smile. Both white armored hands meet in front of her chest to form one clear tiny heart gesture with her fingers. The gesture must read instantly and remain anatomically correct. Do not include the scythe because both hands are devoted to the cute heart gesture.
Composition/framing: centered compact waist-up chibi in the Fanny-like house proportion; oversized expressive head; readable hair and headpiece silhouette; both full hands, elbows, hair tips, and outfit panels inside a 30 px transparent safe area.
Style/medium: crisp anime chibi, clean cel shading, controlled highlights, simplified small mechanical details, polished at 700x700 and readable at 200x200.
Color palette: canonical white, orange-gold, black, blue-black, pink/lilac, and cyan plus theme principal accent #e99a2e.
Sticker edge: clean 14-16 px white die-cut outer rim following only Ruby's contour, with a subtle 5 px inner keyline in #e99a2e.
Constraints: genuinely transparent canvas outside the contour and transparent corners; small closed mouth must remain visibly closed; exactly two arms and two hands; no floor, shape, badge, square, circle, scenery, or colored backdrop; no clipped contour.
Avoid: open mouth, visible teeth or tongue, generic pose, costume redesign, weapon, extra limbs or fingers, realistic adult proportions, painterly haze, glow background, text, logo, watermark, opaque canvas.

## Production Alpha Pass

The generator returned the selected sticker with a painted checkerboard, so the same artwork and durable references were sent through this final matte prompt before alpha extraction:

```text
The image generator has twice painted a checkerboard instead of emitting alpha. Perform a production chroma-matte pass on Image 1 only. Preserve the character artwork, expression, pose, anatomy, costume, colors, clean white die-cut outer rim, and thin colored inner keyline exactly. Images 2 and 3 are identity references; do not redesign or alter the character.

Replace every checkerboard/background pixel outside the white die-cut contour with one perfectly flat, uniform, fully opaque chroma green #00FF00. No gradient, no texture, no checkerboard, no shadow, no glow, no green spill, and no green inside the character contour. Keep at least 28 px of solid #00FF00 around the complete contour on all four sides. Square PNG. No text, logo, watermark, badge, floor, or scenery.

Ruby identity invariants: Mobile Legends: Bang Bang Aspirants "Mecha Maiden"; blue-black hair with pink/lilac underside accents, cyan-blue eyes, orange-white mechanical headpiece, white/orange-gold/black armored dress and gauntlets. Keep her bright happy eyes, tiny closed-mouth smile, and exactly two hands forming one small heart at her chest. No weapon.
```

The uniform matte was converted to genuine RGBA with FFmpeg `colorkey=0x14e51a:0.35:0`; the normalized asset has four transparent corners and 290646 transparent pixels.
