# Doki Artwork Style

Use repository artwork or user-supplied examples as treatment references, never as identity sources.

## Sticker Master

- Canvas: exactly `700x700` RGBA. A `200x200` resize is QA-only after generation, never a second requested output.
- Transparency: real alpha outside the die-cut contour, including all four corners.
- Framing: compact head-and-upper-body or three-quarter composition with every extremity inside a `28-35 px` safe area.
- Proportions: chibi or semi-chibi chosen from the user's target sticker; when absent, use an oversized expressive head and compact waist-up crop.
- Pose: preserve a supplied pose faithfully. Without one, use a clear personality-specific gesture.
- Rendering: flat graphic forms, crisp linework, clean cel shading, controlled highlights, and simplified small details.
- Border: `12-18 px` white die-cut outer rim plus a `4-7 px` inner keyline in the theme accent.
- Identity: canonical hair, face, costume, accessories, props, and color relationships remain recognizable after simplification.

Fanny is a useful fallback for compact framing and small-scale readability. Angela, Guinevere, and Vexana show that the degree of chibi simplification may vary. A user-supplied target sticker takes precedence for proportions and finish.

## Background Master

- Canvas: exactly `1920x1080`, fully opaque, landscape RGB.
- Reference fidelity: when the user designates an official image as the background reference, preserve its pose, silhouette, clothing motion, outfit, and identity cues while adapting it to the landscape canvas.
- Composition: place the subject mainly on the right third and reserve `55-65%` quiet negative space on the left for terminal content, unless the user explicitly requests another layout.
- Face policy: show no recognizable eyes, nose, and mouth together. Prefer a back or rear three-quarter angle, a deliberate crop, or natural hair occlusion. If part of the face remains visible, reduce it to minimal flat shadow or contour cues; never erase it into a malformed blank face.
- Backdrop: one perfectly flat solid color derived from the theme palette. No second color region, gradient, texture, pattern, geometry, vignette, scenery, floor, shadow field, or noise.
- Character rendering: simplified flat editorial anime illustration with crisp shapes, minimal internal lines, restrained cel shading, and very limited highlights. Aim for a quiet corporate or enterprise illustration impression rather than detailed key art, a poster, or a cinematic scene.
- Identity: recognition comes from hair silhouette, outfit, accessories, pose, and canonical color relationships, not detailed facial features.
- Exclusions: no typography, logos, watermarks, faux UI, detailed face, busy left side, bokeh, particles, glow clouds, architecture, environment, or unrelated characters.

Set `backgrounds.default.opacity` to exactly `22`. Treat `22%` as a fixed installation invariant, not a range or a value to tune per theme.

## Candidate Consistency

Each external batch prompt requests four separate files for one asset type. The user selects one sticker and one background and returns only that final pair for installation. When a supplied reference fixes the pose or composition, candidate variation comes from rendering only, not from changing the requested arrangement.
