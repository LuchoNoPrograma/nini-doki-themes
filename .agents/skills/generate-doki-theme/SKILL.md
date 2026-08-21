---
name: generate-doki-theme
description: Create a new character theme for nini-doki-themes from visual references, including a faithful low-detail wallpaper, a transparent 700x700 kawaii sticker, palette adaptation, project scaffolding, and validation. Use for adding or regenerating character themes in this repository, not for unrelated image generation.
---

# Generate Doki Theme

Create the complete theme in the repository; do not stop after drafting prompts or previewing images.

## Inputs

Require at least one clear character reference. Prefer several references that collectively show the face, hair silhouette, outfit, signature accessories, and canonical colors. If references are local files, inspect them with `view_image` before generation. If none are available, ask for them rather than guessing the character design.

Determine the character, franchise/group, slug, visible names, dark or light mode, base theme, and target palette from the request and repository. Infer ordinary metadata when safe. Do not invent identity-defining details hidden by every reference.

## Establish The Local Style

Run:

```bash
node .agents/skills/generate-doki-theme/scripts/inspect-hyper-style.mjs
```

Inspect the reported `activeTheme` and useful entries in `referenceThemes` with `view_image`. Use them as composition and rendering references only. Never copy another character's identity, clothing, props, or pose. If Hyper is unavailable, use the repository examples summarized in [references/visual-style.md](references/visual-style.md).

The current house style is not one rigid drawing style. Preserve these shared traits: readable anime/chibi silhouette, clean cel shading, expressive pose, compact framing, crisp cutout edges, and strong legibility over a terminal. Prefer the Fanny-like chibi treatment for a new sticker unless the user's references clearly demand a different proportion.

## Scaffold And Palette

Check the worktree and do not overwrite an existing theme unless the user requested replacement. Choose the closest existing theme as a structural and light/dark base, then run the creator non-interactively:

```bash
npm run new-theme -- \
  --from "<base-slug>" \
  --slug "<slug>" \
  --name "<name>" \
  --display "<display-name>" \
  --group "<group>" \
  --category "<category>" \
  --file "<File_Name>"
```

Make the references durable after scaffolding and before generating. Conversation-only labels are not reproducible; obtain local files in the workspace, then run:

```bash
node .agents/skills/generate-doki-theme/scripts/capture-references.mjs \
  --output-dir "src/themes/<slug>/references" \
  --reference "identity=/path/to/identity.png" \
  --reference "costume=/path/to/costume.png" \
  --reference "pose=/path/to/pose.png"
```

Pass only the roles that exist. The helper creates stable copies and a SHA-256 manifest. Use those copied files for both image-generation calls.

Read [references/palette-workflow.md](references/palette-workflow.md), then adapt `definition.json` and `editor.xml` by semantic color family. Keep neutral backgrounds quiet, update primary and secondary accent families coherently, remove obvious hues inherited from the old character, and preserve all required Doki color keys. Use `colors.accentColor` as the sticker's inner keyline.

Run the palette audit before image generation and again after final edits:

```bash
node .agents/skills/generate-doki-theme/scripts/audit-palette.mjs \
  --definition "src/themes/<slug>/definition.json"
```

## Build The Two Prompts

Read [references/prompt-templates.md](references/prompt-templates.md). Create two independent, production-oriented prompts from the same identity notes and reference list:

- Wallpaper source: landscape JPG, character recognizable without showing a face, restrained flat background, low visual noise, subject toward the right, and generous empty terminal space on the left.
- Sticker source: kawaii/chibi character PNG with genuine transparency, a personality-specific expression and gesture, faithful costume, and a die-cut border designed for a final 700x700 canvas. Use a white outer rim plus a thin inner keyline in `accentColor`; the canvas outside the contour stays transparent.

Record the final prompts in `src/themes/<slug>/artwork-prompts.md`. Reference each durable filename and SHA-256 from `references/manifest.json`, and include the selected palette hex values so later regeneration is reproducible.

## Generate Independently

Use the built-in `image_gen` tool by default. Feed the same captured repository references to both calls with `referenced_image_paths`, explicitly labeling them as identity/costume references. If a conversation image cannot be saved as a durable file, ask the user to provide the file rather than claiming the theme is reproducible.

Issue one image call per asset. Start the wallpaper and sticker calls concurrently when the execution environment supports concurrent tool calls; otherwise run them sequentially without making either prompt depend on the other. Do not combine both assets in one canvas and do not use one generated asset as the other's character reference.

Save selected generation sources under `.cache/theme-generation/<slug>/` as `wallpaper-source.<ext>` and `sticker-source.png`; do not save a source directly over a final theme asset. Inspect each with `view_image`. Iterate only on the failing asset and restate all identity invariants on every retry.

## Normalize And Install Assets

The two creative deliverables are `wallpaper.jpg` and `sticker.png`. The repository runtime also requires a PNG adapter copy of the wallpaper. Normalize them with:

```bash
command -v ffmpeg
```

Stop with a clear dependency message if FFmpeg is unavailable; do not silently substitute a lossy or non-transparent workflow. Then run:

```bash
node .agents/skills/generate-doki-theme/scripts/prepare-assets.mjs \
  --wallpaper "<generated-wallpaper>" \
  --sticker "<generated-sticker>" \
  --output-dir "src/themes/<slug>" \
  --force
```

This produces:

- `wallpaper.jpg`: 1920x1080 RGB source deliverable.
- `sticker.png`: 700x700 RGBA with transparent padding.
- `wallpaper.png`: 1920x1080 RGB compatibility asset consumed by this repository.

The helper validates the source PNG's alpha before adding padding, stages every output, validates the complete set, and commits with rollback protection. It safely handles a source path that matches a final output path. Do not simulate transparency with black, white, checkerboard, or colored pixels.

Inspect all normalized outputs with `view_image`, not only the generation sources. Confirm that the 16:9 crop preserves the character and that the 700x700 contour remains clean. Also create and inspect a temporary display-size preview:

```bash
ffmpeg -hide_banner -loglevel error -y \
  -i "src/themes/<slug>/sticker.png" \
  -vf "scale=200:200" \
  "/tmp/<slug>-sticker-preview-200.png"
```

The preview is QA-only and must not be committed.

## Acceptance Check

Reject or regenerate when any of these is true:

- The wallpaper shows recognizable eyes, nose, and mouth together; contains detailed scenery; competes with terminal text; places the subject across the left workspace; or contains text, logos, UI, or watermarks.
- The sticker changes canonical hair, costume, signature accessories, or color relationships; is generic rather than personality-specific; has clipped extremities; has a square backdrop; or loses readability in the 200x200 QA preview.
- The outer border is an opaque frame instead of a contour around the character.
- Either asset was generated without the supplied identity references.

For a genuinely new theme, add its stable ID to `CUSTOM_THEMES.md`, update the theme inventory/count in `README.md`, and extend `ASSET-NOTICE.md` when introducing a franchise, mark, studio, publisher, or rights holder not already covered. Do not change release versions unless the user is preparing a release.

Finally run the repository-required checks:

```bash
npm run validate
npm run build
npm run test:hyper
```

Also run `npm run test:vscode` when the generated wallpaper changed. Report the saved prompts, source deliverables, compatibility asset, chosen base theme, palette accent, and verification results.
