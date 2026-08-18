const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const pluginRoot = path.resolve(process.argv[2] || "dist/hyper/doki-theme-hyper-nini");
const metaDirectory = path.join(pluginRoot, "build", "nini-meta");
const themes = fs.readdirSync(metaDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => {
    const definition = JSON.parse(fs.readFileSync(path.join(metaDirectory, file), "utf8"));
    return [definition.id, path.basename(file, ".json")];
  });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "nini-doki-hyper-test-"));

async function test() {
  process.env.XDG_CONFIG_HOME = temp;
  const configDirectory = path.join(temp, "hyper", ".doki-theme-hyper-config");
  fs.mkdirSync(configDirectory, { recursive: true });
  const configFile = path.join(configDirectory, ".hyper.doki.config.json");
  const selectTheme = (themeId) => fs.writeFileSync(
    configFile,
    JSON.stringify({
      themeId,
      showSticker: true,
      showWallpaper: true,
      hideStickerOnHover: true,
      stickerHoverOpacity: 0.15,
      stickerTransitionMs: 160,
      stickerType: "DEFAULT",
      useFonts: false,
    }),
  );
  selectTheme(themes[0][0]);

  require(path.join(pluginRoot, "build", "NiniCustomizations.js")).install();
  const updater = require(path.join(pluginRoot, "build", "StickerUpdateService.js"));
  for (const [themeId, slug] of themes) {
    selectTheme(themeId);
    const result = await updater.attemptToUpdateSticker();
    const sticker = path.join(configDirectory, "stickers", "nini", `${slug}-sticker.png`);
    const wallpaper = path.join(configDirectory, "wallpapers", "nini", `${slug}-wallpaper.png`);

    assert.ok(result.stickerDataURL.endsWith(`${slug}-sticker.png`));
    assert.ok(result.wallpaperURL.endsWith(`${slug}-wallpaper.png`));
    assert.equal(fs.readFileSync(sticker).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(fs.readFileSync(wallpaper).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  }

  const decoratorSource = fs.readFileSync(path.join(pluginRoot, "build", "decorator.js"), "utf8");
  const settingsSource = fs.readFileSync(path.join(pluginRoot, "build", "settings.js"), "utf8");
  const configSource = fs.readFileSync(path.join(pluginRoot, "build", "config.js"), "utf8");
  assert.match(decoratorSource, /stickerHovered/);
  assert.match(decoratorSource, /handleStickerMouseMove/);
  assert.match(decoratorSource, /getBoundingClientRect/);
  assert.match(decoratorSource, /addEventListener\("mousemove"/);
  assert.match(decoratorSource, /ref: this\.stickerRef/);
  assert.match(decoratorSource, /stickerHoverOpacity/);
  assert.match(decoratorSource, /transition: "opacity "/);
  assert.match(settingsSource, /Hide Sticker on Hover/);
  assert.match(settingsSource, /TOGGLE_STICKER_HOVER/);
  assert.match(configSource, /hideStickerOnHover: true/);

  console.log(`${themes.length} Hyper custom themes keep local assets and native sticker hover behavior.`);
}

test()
  .finally(() => fs.rmSync(temp, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
