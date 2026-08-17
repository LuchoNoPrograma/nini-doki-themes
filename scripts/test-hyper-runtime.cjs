const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const pluginRoot = path.resolve(process.argv[2] || "dist/hyper/doki-theme-hyper-nini");
const themes = [
  ["72ce089e-658b-48f6-ab5c-98f042850f0b", "angela-aspirants"],
  ["da9c45a6-a643-466f-8f69-c6e2cd5f5643", "fanny-aspirants"],
  ["d8d207b7-28a1-42b8-903d-7ed914f663e4", "guinevere-aspirants"],
  ["de61b4ab-d261-4e15-848f-6d9ca1232424", "vexana-aspirants"],
  ["0d4c01bd-9b9f-4c45-92b6-4165d137f2c8", "nakano-itsuki-dark"],
  ["7a1ddcf8-0c52-4da6-bf83-3224c729303c", "nakano-miku-dark"],
];
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
  console.log(`${themes.length} Hyper custom themes keep their local PNG assets.`);
}

test()
  .finally(() => fs.rmSync(temp, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
