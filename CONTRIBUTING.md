# Contributing

Create themes with `npm run new-theme`; do not duplicate an existing UUID. Keep source edits in `src/themes/`, then run:

```bash
npm run validate
npm run sync:official
npm run build
```

Commit both the source theme and regenerated `official/` overlay. Do not commit `dist/`, `.cache/` or `vendor/*.zip`.

Every new asset must be original, AI-generated fan art, or accompanied by a source and license that permits
redistribution. Add any required attribution to `ASSET-NOTICE.md`.
