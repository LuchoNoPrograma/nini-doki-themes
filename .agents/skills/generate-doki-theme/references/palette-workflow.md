# Palette Workflow

Use the closest existing light/dark theme for structure, then replace its character-specific color families coherently. Do not change only `accentColor`, and do not globally replace every repeated hex value without checking its semantic role.

## Choose Four Anchors

Derive these from the character references and record them in `artwork-prompts.md`:

- Base: quiet editor background, normally the darkest neutral or tinted shadow.
- Surface: distinguishable panel/header background close to the base.
- Accent: principal readable UI accent and sticker inner keyline.
- Highlight: secondary character color for syntax, icons, gradients, and emphasis.

For a dark theme, keep base and surface low-chroma enough for long terminal sessions. For a light theme, invert the luminance strategy while preserving the same semantic roles.

## Update Semantic Families

Update all members of a family together.

- Base and surfaces: `baseBackground`, `textEditorBackground`, `headerColor`, `secondaryBackground`, `completionWindowBackground`, `buttonColor`, `caretRow`, `foldedTextBackground`, `nonProjectFileScopeColor`, `lightEditorColor`, `inactiveBackground`, and `contrastColor`.
- Primary accent: `accentColor`, `keyColor`, `dokiLogoAccent`, `iconAccentCompliment`, `iconDiversification`, and any UI entry intentionally pointing at those named keys.
- Accent alpha variants: `accentColorLessTransparent`, `accentColorMoreTransparent`, and `accentColorTransparent` must use the same RGB as `accentColor` with `9A`, `2A`, and `5A` alpha suffixes respectively.
- Secondary highlight: `editorAccentColor`, `iconAccent`, `startColor`, `stopColor`, `iconBlendCompliment`, and related icon colors. Keep enough separation from the primary accent.
- Selection and borders: tune `selectionBackground`, `selectionBackgroundTransparent`, `selectionInactive`, `highlightColor`, `identifierHighlight`, `searchBackground`, `borderColor`, and `disabledColor` from the base/surface family rather than copying the old character hue.
- Syntax identities: explicitly review `keywordColor`, `stringColor`, `constantColor`, `classNameColor`, `htmlTagColor`, `comments`, `lineNumberColor`, `foregroundColor`, and `foregroundColorEditor`.

Preserve semantic warning/error/diff colors unless the new palette can change them without reducing meaning or contrast.

## Update The Editor Scheme

Open `editor.xml` and map its background, foreground, comments, keyword, string, constant, class/type, tag, selection, caret, and line-number colors to the corresponding named colors in `definition.json`. Do not leave obvious hue families from the cloned character.

## Required Contrast

After editing, run:

```bash
node .agents/skills/generate-doki-theme/scripts/audit-palette.mjs \
  --definition src/themes/<slug>/definition.json
```

The audit enforces:

- Normal foregrounds: at least `4.5:1` against their background.
- Comments and line numbers: at least `3:1` against the editor background.
- UI accent: at least `3:1` against the base background.
- Exact consistency of the three accent alpha variants.

Also compare the completed theme against the base definition. The base, surface, primary accent, secondary highlight, selections, and core syntax roles should reflect the new character.

## Generated Background Integration

Record the selected background candidate and its single flat field color in `artwork-prompts.md`. Set `backgrounds.default.opacity` to exactly `22` and do not inherit, calculate, or tune another value from the base theme.

Normalize the selected background with `prepare-assets.mjs --wallpaper`. Use `--wallpaper-color` only when the user explicitly requests a perfectly flat, non-generated background. Do not replace `baseBackground` with an average wallpaper color unless it independently satisfies the editor palette and contrast requirements.
