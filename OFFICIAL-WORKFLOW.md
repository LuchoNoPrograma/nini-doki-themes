# Official Doki Compatibility

The official Doki architecture uses `doki-master-theme` as the central theme definition repository. Product repositories
clone it as `masterThemes`, keep application definitions under `buildSrc/assets/themes`, and generate their runtime
themes from both inputs.

This project stores only its custom source and emits an overlay with the four relevant definition shapes:

```text
official/
├── definitions/          *.master.definition.json
├── apps/jetbrains/       *.jetbrains.definition.json and editor templates
├── apps/hyper/           *.hyper.definition.json
├── apps/vscode/          *.vsCode.definition.json
└── assets/               custom sticker and wallpaper files
```

The interactive creator is a maintained wrapper around the official scaffolding conventions. Unlike the historical
`AppThemeTemplateGenerator.ts`, it does not require manually changing `appName` and the selected template function for
each product. It generates JetBrains, Hyper and VS Code definitions together and keeps IDs consistent.

`npm run upstream:prepare` copies this overlay into clean, commit-pinned clones so changes can be compared against the
real upstream builders or prepared for upstream contributions.

Official references:

- https://github.com/doki-theme/doki-master-theme
- https://github.com/doki-theme/doki-theme-jetbrains/blob/main/CONTRIBUTING.md
- https://github.com/doki-theme/doki-theme-hyper/blob/master/CONTRIBUTING.md
- https://github.com/doki-theme/doki-theme-vscode/blob/main/CONTRIBUTING.md
