const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const Module = require("node:module");
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

  const customizations = require(path.join(pluginRoot, "build", "NiniCustomizations.js"));
  customizations.install();
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
  const customizationsSource = fs.readFileSync(path.join(pluginRoot, "build", "NiniCustomizations.js"), "utf8");
  const pickerPreloadSource = fs.readFileSync(path.join(pluginRoot, "build", "CarouselPickerPreload.js"), "utf8");
  assert.match(decoratorSource, /stickerHovered/);
  assert.match(decoratorSource, /handleStickerMouseMove/);
  assert.match(decoratorSource, /getBoundingClientRect/);
  assert.match(decoratorSource, /addEventListener\("mousemove"/);
  assert.match(decoratorSource, /ref: this\.stickerRef/);
  assert.match(decoratorSource, /stickerHoverOpacity/);
  assert.match(decoratorSource, /transition: "opacity "/);
  assert.match(settingsSource, /Hide Sticker on Hover/);
  assert.match(settingsSource, /TOGGLE_STICKER_HOVER/);
  assert.match(settingsSource, /Startup Carousel/);
  assert.match(settingsSource, /Choose Themes/);
  assert.match(settingsSource, /showCarouselPicker/);
  assert.doesNotMatch(settingsSource, /Select All|Clear All/);
  assert.doesNotMatch(settingsSource, /definition\.information\.group/);
  assert.match(configSource, /hideStickerOnHover: true/);
  assert.match(configSource, /startupCarouselEnabled: false/);
  assert.match(customizationsSource, /Choose Startup Themes/);
  assert.match(customizationsSource, /setCarouselThemes/);
  assert.match(pickerPreloadSource, /contextBridge\.exposeInMainWorld/);

  const allThemeIds = customizations.getCarouselThemeIds({});
  assert.ok(allThemeIds.length > themes.length);
  const [firstThemeId, secondThemeId, thirdThemeId] = allThemeIds;

  const ipcMain = new EventEmitter();
  let pickerWindow;
  class FakeBrowserWindow extends EventEmitter {
    constructor() {
      super();
      this.webContents = {};
      this.destroyed = false;
      pickerWindow = this;
    }
    isDestroyed() { return this.destroyed; }
    loadURL(url) { this.url = url; }
    show() {}
    focus() {}
    close() {
      this.destroyed = true;
      this.emit("closed");
    }
  }
  const originalModuleLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === "electron") return { BrowserWindow: FakeBrowserWindow, ipcMain };
    return originalModuleLoad.call(this, request, parent, isMain);
  };
  try {
    customizations.showCarouselPicker();
  } finally {
    Module._load = originalModuleLoad;
  }
  const pickerHtml = decodeURIComponent(pickerWindow.url.split(",").slice(1).join(","));
  assert.match(pickerHtml, /Choose Startup Themes/);
  assert.equal((pickerHtml.match(/"selected":/g) || []).length, allThemeIds.length);
  ipcMain.emit("nini-doki-carousel:save", { sender: pickerWindow.webContents }, [firstThemeId, secondThemeId]);
  assert.equal(pickerWindow.destroyed, true);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(configFile, "utf8")).startupCarouselThemeIds,
    [firstThemeId, secondThemeId],
  );

  customizations.setCarouselThemes([firstThemeId, secondThemeId, "not-a-theme"]);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(configFile, "utf8")).startupCarouselThemeIds,
    [firstThemeId, secondThemeId],
  );
  fs.writeFileSync(configFile, JSON.stringify({
    themeId: firstThemeId,
    startupCarouselEnabled: true,
    startupCarouselThemeIds: [firstThemeId, secondThemeId, thirdThemeId],
  }));
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    assert.equal(customizations.selectStartupTheme(), secondThemeId);
    assert.equal(customizations.selectStartupTheme(), firstThemeId);
  } finally {
    Math.random = originalRandom;
  }
  const carouselConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));
  assert.equal(carouselConfig.themeId, firstThemeId);
  assert.equal(carouselConfig.startupCarouselQueue, undefined);

  console.log(`${themes.length} Hyper custom themes keep local assets, sticker hover, and random startup carousel behavior.`);
}

test()
  .finally(() => fs.rmSync(temp, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
