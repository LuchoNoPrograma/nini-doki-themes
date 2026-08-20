# Repository Guidelines

## Commit Messages

Use Conventional Commit-style messages:

```text
<type>(optional-scope): <imperative summary>
```

Keep the summary concise, lowercase after the colon, and do not end it with a period.

Allowed types:

- `feat`: add a theme, command, runtime behavior, or other user-facing capability.
- `fix`: correct broken behavior, invalid output, installation, packaging, or a regression.
- `assets`: add or update stickers, wallpapers, palettes, or other visual-only resources.
- `docs`: change documentation only.
- `build`: change build scripts, package generation, or dependencies.
- `ci`: change GitHub Actions or other automation.
- `test`: add or update tests without changing production behavior.
- `refactor`: restructure code without changing externally observable behavior.
- `chore`: perform repository maintenance that fits no more specific type.
- `release`: prepare release metadata, versions, or changelogs.

Prefer `feat:` over the ambiguous `add:` type. Use a scope when it makes the affected surface clearer, such as
`assets(vexana)`, `fix(hyper)`, or `build(jetbrains)`.

Examples:

```text
feat(themes): add Dark Souls profiles
fix(hyper): keep custom backgrounds local
assets(vexana): refresh Aspirants sticker and wallpaper
ci(release): retry package publication
release: prepare v1.1.0
```

Each commit should contain one coherent change. Before committing theme or asset changes, run:

```bash
npm run validate
npm run build
npm run test:hyper
```

## Releases

- Use semantic version tags in the form `vMAJOR.MINOR.PATCH`.
- Increment `MAJOR` for breaking changes, `MINOR` for new themes or user-facing capabilities, and `PATCH` for fixes.
- Keep `package.json` aligned with the release tag without the leading `v`.
- Push the release commit to `main`, then push the annotated tag. The `Publish release` workflow builds and uploads the
  JetBrains and Hyper ZIP files.
