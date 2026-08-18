# Nini Doki Themes

Public, unofficial extension pack for [The Doki Theme](https://github.com/doki-theme). It keeps one source palette and
fanmade asset set per theme, then generates working packages for JetBrains IDEs and Hyper.

The collection contains four Mobile Legends Aspirants themes (Angela, Guinevere, Vexana and Fanny), two
Quintessential Quintuplets dark themes (Nakano Miku and Nakano Itsuki), and two Dark Souls themes (Emerald Herald and
Firekeeper). Their stable IDs are documented in
[CUSTOM_THEMES.md](CUSTOM_THEMES.md).

## Quick Start

Requirements: Linux, Node.js 20+, `git`, `curl`, `zip` and `unzip`.

```bash
git clone https://github.com/LuchoNoPrograma/nini-doki-themes.git
cd nini-doki-themes
npm run bootstrap
npm run validate
npm run build
```

`bootstrap` downloads pinned official releases directly from JetBrains Marketplace and npm, verifies their SHA-256
checksums, and prepares the local runtime bases under `vendor/`. Third-party binaries are deliberately not stored in
Git history. The regular builder has no project-level npm dependencies.

Install locally:

```bash
npm run install:hyper
npm run install:idea
```

The JetBrains installer auto-detects the newest `IntelliJIdea*` directory. Another compatible JetBrains plugin directory
can be supplied with `npm run install:idea -- --target /path/to/doki-theme-jetbrains`.

### Hyper Sticker Transparency

The Nini Hyper plugin adds `Hide Sticker on Hover` directly to the `Doki-Theme Settings` menu. Stickers remain fully
opaque until the pointer enters them, then fade to 15% opacity over 160 ms. The preference is global, so newly added
custom profiles inherit it automatically.

The values are stored with Doki's other preferences in `.doki-theme-hyper-config/.hyper.doki.config.json`, rather than
being tied to a particular theme definition.

JetBrains IDEs already provide the equivalent behavior globally under `Settings | Appearance & Behavior | Doki Theme |
Hide on hover`, including a configurable delay. It applies to custom and official profiles without another runtime
patch.

## Create A Theme

Run the interactive creator:

```bash
npm run new-theme
```

It clones a selected theme as a visual starting point, assigns a new UUID, creates the common definition, preserves an
editable JetBrains editor scheme, and generates the official Doki master/JetBrains/Hyper definitions. Replace the two
placeholder images and edit the palette:

```text
src/themes/<slug>/
├── definition.json       shared metadata, named palette and JetBrains UI
├── theme.config.json     stable paths used by both adapters
├── editor.xml            JetBrains editor scheme
├── sticker.png
└── wallpaper.png
```

Then rebuild:

```bash
npm run validate
npm run sync:official
npm run build
```

The generated `official/` tree follows the schemas used by `doki-master-theme`, `doki-theme-jetbrains` and
`doki-theme-hyper`. `editor.xml` colors matching the named palette are converted to official `$colorName$` template
variables automatically.

## Work With Official Doki Sources

The upstream repositories and commits are pinned in `upstream.lock.json`.

```bash
npm run upstream:bootstrap
npm run upstream:prepare
```

This clones the official repositories under `.cache/upstream/` and overlays the custom master definitions and the two
application definitions into their expected `buildSrc/assets/themes` layouts. It gives contributors the same creation
surface described by Doki's official contributing guides without committing a duplicate of those repositories.

The local builder remains the reproducible path for this extension pack because the historical official toolchains use
different Node/JVM generations and external asset infrastructure.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run list` | List theme names and stable IDs |
| `npm run validate` | Validate definitions, paths, IDs and assets |
| `npm run sync:official` | Regenerate official-compatible overlay files |
| `npm run build` | Build JetBrains and Hyper packages |
| `npm run test:hyper` | Verify custom Hyper assets stay local and valid |
| `npm run install:idea` | Build and install the JetBrains package |
| `npm run install:hyper` | Build and install the Hyper package |
| `npm run export` | Create a fully portable local backup |

## Releases

Tags matching `v*` publish both generated packages as a GitHub Release. JetBrains users can install its ZIP with
`Plugins > Install Plugin from Disk`. Hyper users can extract its ZIP as the `doki-theme-hyper-nini` local plugin.

## Licensing

The generator code is MIT licensed. Upstream Doki notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Character artwork is unofficial AI-generated fan art; see [ASSET-NOTICE.md](ASSET-NOTICE.md).
