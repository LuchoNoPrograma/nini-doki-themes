---
name: generate-doki-theme
description: Build reference-aware, copy-paste Doki artwork prompts that ask an external image AI for four separate sticker or background candidates, then install the user-selected sticker and background as a nini-doki-theme. Use for character-theme artwork and theme installation in this repository, not unrelated image generation.
---

# Generate Doki Theme

Default to an external-generation workflow. Create ready-to-paste batch prompts, let the user generate and select the artwork, and modify the theme only after the user supplies the selected sticker and background.

## Choose The Mode

- **Prompt only:** return one self-contained copy-paste prompt for each requested asset. Do not call image generation.
- **Sticker prompt:** return one prompt that directs the user's image AI to create 4 separate sticker files in parallel.
- **Background prompt:** return one prompt that directs the user's image AI to create 4 separate background files in parallel.
- **Install:** after the user supplies the selected sticker and background, validate and install that exact pair.
- **Internal generation:** call the built-in `image_gen` tool only when the user explicitly asks Codex to generate the candidates.
- **Partial asset:** when the user supplies one final asset, preserve it and provide a batch prompt only for the missing asset.

Do not scaffold, edit theme files, or compile while the user is still generating or choosing candidates.

## Read The References

One clear character image is enough to proceed. Prefer this compact input set when available:

1. Identity reference: face, hair, outfit, accessories, and canonical colors.
2. Optional target sticker: desired proportions, crop, border, rendering, or finish. Copy its treatment, never its identity.
3. Optional sticker pose: camera angle and exact body, hand, clothing, and prop arrangement.
4. Optional background composition: pose, crop, subject placement, and visual direction for the landscape artwork.

Inspect every supplied image before writing a prompt. Conversation attachments are valid inputs; do not ask for another upload merely because an attachment is not local. State which image owns each role. One image may own multiple roles when the user says so.

When evidence conflicts, identity comes from the identity reference, sticker treatment comes from the target sticker, sticker pose comes from the sticker-pose reference, and background composition comes from the background reference. Do not invent hidden identity-defining details.

## Build Copy-Paste Batch Prompts

Read [references/prompt-templates.md](references/prompt-templates.md) and [references/visual-style.md](references/visual-style.md). Build each requested deliverable as one complete fenced prompt block that can be pasted directly into an external image AI. Never make the user join a base prompt with separate candidate lines.

Each batch prompt must:

- order 4 independent image-generation jobs in parallel;
- require 4 separate files named Candidate 01 through Candidate 04;
- forbid collages, grids, contact sheets, multi-panel images, or several characters in one canvas;
- contain the full reference mapping, identity invariants, rendering rules, exclusions, and all four candidate variations;
- keep shared identity, palette, crop, and finish fixed across the batch;
- direct the external AI to return the four results for user selection.

Asset requirements:

- **Sticker:** every candidate is one `700x700` RGBA PNG with genuine transparency and a die-cut contour. A `200x200` resize is later QA only and must never be requested from the generator.
- **Background:** every candidate is one fully opaque `1920x1080` landscape image grounded in the requested pose reference. Use one perfectly flat solid-color field with no environment, texture, gradient, pattern, shapes, or effects. Render the character as simplified flat editorial anime art with no recognizable facial features.

If the user asks only for the sticker prompt, return only the complete sticker batch prompt. If the user asks only for the background prompt, return only the complete background batch prompt.

Export supplied prompts for reproducibility:

- Before a theme exists: `.cache/doki-theme-prompts/<slug>/artwork-prompts.md`.
- After scaffolding: `src/themes/<slug>/artwork-prompts.md`.

For local references, copy them beside the prompt and record hashes with:

```bash
node .agents/skills/generate-doki-theme/scripts/capture-references.mjs \
  --output-dir ".cache/doki-theme-prompts/<slug>/references" \
  --reference "identity=/path/to/identity.png" \
  --reference "sticker-style=/path/to/target-sticker.png" \
  --reference "sticker-pose=/path/to/sticker-pose.png" \
  --reference "background=/path/to/background-reference.png"
```

Pass only roles that exist. For conversation-only images, label them as attached images in the prompt record instead of claiming they were copied.

## Optional Internal Generation

Only when the user explicitly asks Codex to generate candidates, issue 8 independent `image_gen` calls in the same parallel wave: 4 sticker calls and 4 background calls. If only one asset was requested, issue 4 calls for that asset. Each call produces one standalone file; never ask one image call to render a collage.

Store internally generated candidates under separate `sticker/` and `background/` directories in `.cache/theme-generation/<slug>/`. Inspect and present them in two labeled groups. Do not select for the user.

## Receive The User's Selected Pair

When the user returns the chosen files, treat them as final creative inputs. Do not regenerate, reinterpret, or replace them unless validation fails and the user authorizes a repair.

Before installation:

- inspect both selected files visually;
- verify the sticker is a genuine RGBA PNG with visible artwork, transparent corners, and no fake checkerboard;
- verify the background contains the intended character and composition, uses one perfectly flat solid-color field, has no scenery or decorative background elements, keeps the character rendering simple and editorial, and can be normalized to `1920x1080` without losing important content;
- record the original filenames and SHA-256 hashes in `artwork-prompts.md`;
- copy the selected sources to `.cache/theme-generation/<slug>/selected-sticker.png` and `.cache/theme-generation/<slug>/selected-background.<ext>` when local durable inputs are available.

Ask for a replacement only when a selected file is unusable, such as fake transparency, corrupt data, irrecoverable clipping, wrong identity, or insufficient background framing.

## Install The Selected Pair

Check the worktree and do not overwrite an existing theme unless replacement was requested. Choose the closest light/dark theme as a structural base, then scaffold non-interactively:

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

Read [references/palette-workflow.md](references/palette-workflow.md), adapt `definition.json` and `editor.xml`, and run the palette audit. Set `backgrounds.default.opacity` to exactly `22` for every theme created through this skill.

Capture local references durably under `src/themes/<slug>/references`, then copy the exported prompt record to `src/themes/<slug>/artwork-prompts.md`. Normalize the exact selected pair:

```bash
node .agents/skills/generate-doki-theme/scripts/prepare-assets.mjs \
  --wallpaper ".cache/theme-generation/<slug>/selected-background.<ext>" \
  --sticker ".cache/theme-generation/<slug>/selected-sticker.png" \
  --output-dir "src/themes/<slug>" \
  --force
```

The helper creates `wallpaper.jpg`, `wallpaper.png`, and the final `700x700` RGBA `sticker.png`. Use `--wallpaper-color` instead of `--wallpaper` only when the user explicitly supplies or requests a flat, non-generated background.

Inspect the normalized background at `1920x1080`, the sticker at full size, and a temporary `200x200` sticker QA preview. Reject broken normalization, clipped contours, fake sticker transparency, unreadable sticker details, any wallpaper gradient, texture, scenery, pattern, decorative shape, detailed facial features, busy terminal space, or a background crop that loses the intended subject.

For a genuinely new theme, update `CUSTOM_THEMES.md`, the inventory/count in `README.md`, and `ASSET-NOTICE.md` only when a newly introduced rights holder requires it. Do not change release versions unless preparing a release.

Run:

```bash
npm run validate
npm run build
npm run test:hyper
npm run test:vscode
```

Report the prompt record path, selected source hashes, base theme, palette, fixed background opacity `22%`, normalized outputs, and verification results.
