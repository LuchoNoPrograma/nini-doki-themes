# Installed Hyper Visual Style

Use this reference only when the active Hyper installation cannot be inspected dynamically.

## Observed Custom Stickers

The installed Nini examples use 200x200 non-interlaced RGBA PNGs with genuine transparent space around the character. Treat those files as composition references. New stickers use a 700x700 RGBA master so contours, costume cues, and facial expressions survive high-density displays and future resizing.

- Fanny is the strongest default reference: compact chibi proportions, oversized head, waist-up crop, wink and confident gesture, simplified but recognizable outfit, clean cel shading, white die-cut rim, and a subtle darker separation line.
- Angela uses a centered semi-chibi bust, large readable eyes, a pose tied to her personality, soft cel shading, generous transparent corners, and a pale outer rim.
- Guinevere uses a playful wink and two-handed gesture, with a warm palette-colored contour that reinforces her theme.
- Vexana is less chibi but retains the same compact bust, expressive gesture, crisp cutout, transparent canvas, and light outer rim.

The common style matters more than copying one exact rendering: faithful silhouette and costume, expressive anime face, clean cutout, compact composition, and immediate readability at icon scale.

## Recommended Sticker Treatment

- Canvas: exactly 700x700 RGBA, plus a temporary 200x200 preview for legibility QA.
- Transparency: real alpha outside the character; transparent corners and breathing room on every side.
- Framing: head and upper body, normally waist-up; head approximately 40-55 percent of the character height.
- Pose: one clear gesture that communicates personality. Prefer a wink, smile, determined look, shy glance, or signature hand pose supported by canon/reference evidence.
- Rendering: polished anime chibi, clean cel shading, controlled highlights, no painterly background effects.
- Border: 12-18 px white outer die-cut rim for terminal contrast, plus a 4-7 px inner keyline or soft shadow using the theme's principal accent. The border follows hair, clothing, and accessories; it is never a square or circle behind the character.
- Safe area: keep roughly 28-35 px of transparent padding; do not clip hair spikes, ribbons, weapons, hands, or ears.

## Observed Wallpaper Composition

The active Fanny wallpaper is a useful house reference: a 1920x1080 RGB landscape, dark low-detail navy field, large action silhouette anchored to the right, and broad quiet space on the left for terminal content. The face is obscured naturally by angle and hair rather than erased.

Apply that logic, not its exact pose:

- Use a back view, rear three-quarter view, face covered by hair/helmet/prop, or a deliberate crop that excludes facial features.
- Keep 55-65 percent of the left side visually quiet.
- Use two or three large flat tonal regions with only subtle texture or sparse line motifs.
- Limit background contrast. Character detail may be higher, but it should still sit behind terminal text at the configured opacity.
- Preserve signature silhouette, outfit, weapon, or accessory cues so the character remains identifiable without a face.
- Avoid scenery, rooms, landscapes, particles, bokeh, typography, emblems, watermarks, and faux UI.

## Installed Paths

The active theme ID lives in `~/.doki-theme-hyper-config/.hyper.doki.config.json`. Installed Nini assets normally live below:

```text
~/.hyper_plugins/local/doki-theme-hyper-nini/assets/nini/
~/.doki-theme-hyper-config/stickers/nini/
~/.doki-theme-hyper-config/wallpapers/nini/
```

Treat these as read-only references. Generate and edit the repository copies under `src/themes/<slug>/`.
