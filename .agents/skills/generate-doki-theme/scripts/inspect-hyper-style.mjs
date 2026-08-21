#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function findRepoRoot() {
  const starts = [process.cwd(), skillRoot];
  for (const start of starts) {
    let current = path.resolve(start);
    while (true) {
      if (fs.existsSync(path.join(current, "src", "themes")) && fs.existsSync(path.join(current, "package.json"))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return path.resolve(skillRoot, "..", "..", "..");
}

const repoRoot = findRepoRoot();
const home = os.homedir();
const configPath = path.join(home, ".doki-theme-hyper-config", ".hyper.doki.config.json");

function pngInfo(file) {
  if (!file || !fs.existsSync(file)) return null;
  const source = fs.readFileSync(file);
  if (source.length < 33 || source.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  const colorType = source[25];
  return {
    width: source.readUInt32BE(16),
    height: source.readUInt32BE(20),
    bitDepth: source[24],
    colorType,
    hasAlphaChannel: colorType === 4 || colorType === 6,
  };
}

function findTheme(themeId) {
  const themesRoot = path.join(repoRoot, "src", "themes");
  if (!themeId || !fs.existsSync(themesRoot)) return null;
  for (const slug of fs.readdirSync(themesRoot)) {
    const definitionPath = path.join(themesRoot, slug, "definition.json");
    if (!fs.existsSync(definitionPath)) continue;
    const definition = JSON.parse(fs.readFileSync(definitionPath, "utf8"));
    if (definition.id === themeId) return { slug, definition };
  }
  return null;
}

function firstExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function installedThemeSummary(theme) {
  if (!theme) return null;
  const { slug, definition } = theme;
  const stickerPath = firstExisting([
    path.join(home, ".doki-theme-hyper-config", "stickers", "nini", `${slug}-sticker.png`),
    path.join(home, ".hyper_plugins", "local", "doki-theme-hyper-nini", "assets", "nini", `${slug}-sticker.png`),
    path.join(repoRoot, "src", "themes", slug, "sticker.png"),
  ]);
  const wallpaperPath = firstExisting([
    path.join(home, ".doki-theme-hyper-config", "wallpapers", "nini", `${slug}-wallpaper.png`),
    path.join(home, ".hyper_plugins", "local", "doki-theme-hyper-nini", "assets", "nini", `${slug}-wallpaper.png`),
    path.join(repoRoot, "src", "themes", slug, "wallpaper.png"),
  ]);
  const colors = definition.colors || {};
  return {
    id: definition.id,
    slug,
    name: definition.name,
    displayName: definition.displayName,
    group: definition.group,
    dark: definition.dark,
    palette: {
      base: colors.baseBackground,
      secondary: colors.secondaryBackground,
      accent: colors.accentColor,
      editorAccent: colors.editorAccentColor,
      foreground: colors.foregroundColor,
    },
    sticker: stickerPath ? { path: stickerPath, ...pngInfo(stickerPath) } : null,
    wallpaper: wallpaperPath ? { path: wallpaperPath, ...pngInfo(wallpaperPath) } : null,
  };
}

if (!fs.existsSync(configPath)) {
  console.log(JSON.stringify({ available: false, reason: `Missing ${configPath}` }, null, 2));
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const theme = findTheme(config.themeId);
const activeTheme = installedThemeSummary(theme);
const referenceThemeIds = [...new Set([config.themeId, ...(config.startupCarouselThemeIds || [])])];
const referenceThemes = referenceThemeIds
  .map((themeId) => installedThemeSummary(findTheme(themeId)))
  .filter(Boolean);

console.log(JSON.stringify({
  available: true,
  configPath,
  activeThemeId: config.themeId,
  activeTheme,
  referenceThemes,
  note: theme
    ? "Inspect activeTheme and referenceThemes images with view_image; use them for composition/style, never character identity."
    : "The active ID is not a custom repository theme; use references/visual-style.md.",
}, null, 2));
