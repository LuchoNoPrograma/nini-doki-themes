const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pluginRoot = path.resolve(process.argv[2] || "dist/vscode/extension");
const themes = fs.readdirSync(path.join(root, "src", "themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const directory = path.join(root, "src", "themes", entry.name);
    return {
      slug: entry.name,
      definition: JSON.parse(fs.readFileSync(path.join(directory, "definition.json"), "utf8")),
    };
  });

const packageJson = JSON.parse(fs.readFileSync(path.join(pluginRoot, "package.json"), "utf8"));
assert.equal(packageJson.displayName, "Doki Theme + Nini");

const customIds = new Set(themes.map((theme) => theme.definition.id));
const contributions = packageJson.contributes.themes.filter((theme) => customIds.has(theme.id));
assert.equal(contributions.length, themes.length);

for (const theme of themes) {
  const contribution = contributions.find((candidate) => candidate.id === theme.definition.id);
  assert.ok(contribution, `${theme.slug}: missing color theme contribution`);
  assert.match(contribution.label, /^Nini Doki:/);
  const generated = JSON.parse(fs.readFileSync(path.join(pluginRoot, contribution.path), "utf8"));
  assert.equal(generated.type, theme.definition.dark ? "dark" : "light");
  assert.equal(generated.colors["editor.background"], theme.definition.colors.textEditorBackground);
  assert.equal(generated.colors["statusBar.background"], theme.definition.colors.accentColor);
  assert.equal(generated.colors["terminal.ansiBlue"], theme.definition.colors["terminal.ansiBlue"]);
  assert.equal(generated.semanticHighlighting, true);
  assert.ok(Object.keys(generated.colors).length > 150);
  assert.ok(generated.tokenColors.length > 15);
  for (const color of Object.values(generated.colors)) {
    assert.match(color, /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i, `${theme.slug}: invalid VS Code color ${color}`);
  }
  assert.ok(!JSON.stringify(generated).includes("&"), `${theme.slug}: unresolved official template token`);

  const assets = path.join(pluginRoot, "assets", "nini");
  for (const suffix of ["sticker", "wallpaper", "background"]) {
    const image = fs.readFileSync(path.join(assets, `${theme.slug}-${suffix}.png`));
    assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  }
  const transparentWallpaper = fs.readFileSync(path.join(assets, `${theme.slug}-wallpaper.png`));
  assert.equal(transparentWallpaper[25], 6, `${theme.slug}: wallpaper must be RGBA`);
}

const definitionsSource = fs.readFileSync(path.join(pluginRoot, "out", "DokiThemeDefinitions.js"), "utf8");
const updaterSource = fs.readFileSync(path.join(pluginRoot, "out", "StickerUpdateService.js"), "utf8");
const webBundle = fs.readFileSync(path.join(pluginRoot, "out", "web-extension.bundled.js"), "utf8");
for (const theme of themes) {
  assert.ok(definitionsSource.includes(theme.definition.id));
  assert.ok(webBundle.includes(theme.definition.id));
  assert.ok(packageJson.activationEvents.includes(`onCommand:doki-theme.theme.nini.${theme.slug}`));
  assert.ok(packageJson.activationEvents.includes(`onCommand:doki-theme.theme.wallpaper.nini.${theme.slug}`));
}
assert.match(updaterSource, /NiniLocalAssets/);
assert.match(updaterSource, /if \(localAssets\) return localAssets/);

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "vscode") {
    return { workspace: { getConfiguration: () => ({ get: () => "" }) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};
try {
  const localAssets = require(path.join(pluginRoot, "out", "NiniLocalAssets.js"));
  for (const theme of themes) {
    const resolved = localAssets.resolveLocalAssets(
      { id: theme.definition.id },
      { anchoring: "right center" },
      { extensionPath: pluginRoot },
    );
    assert.match(resolved.stickerDataURL, /^data:image\/png;base64,/);
    assert.match(resolved.wallpaperImageURL, /^data:image\/png;base64,/);
    assert.match(resolved.backgroundImageURL, /^data:image\/png;base64,/);
  }
} finally {
  Module._load = originalLoad;
}

console.log(`${themes.length} VS Code themes use official templates and bundled local assets.`);
