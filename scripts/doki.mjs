#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const THEMES_DIR = path.join(ROOT, "src", "themes");
const DIST_DIR = path.join(ROOT, "dist");
const IDEA_VERSION = "88.5-1.16.1-nini-pack.3";
const HYPER_VERSION = "88.1.2-nini-pack.3";
const VSCODE_UPSTREAM_VERSION = "88.1.18";
const VSCODE_VERSION = `${VSCODE_UPSTREAM_VERSION}-nini-pack.1`;
const IDEA_JAR = "doki-theme-jetbrains-88.5-1.16.1.jar";
const REQUIRED_FILES = [
  "definition.json",
  "theme.config.json",
  "editor.xml",
  "sticker.png",
  "wallpaper.png",
];
const REPOSITORY = "LuchoNoPrograma/nini-doki-themes";
const JETBRAINS_BASE_URL = "https://plugins.jetbrains.com/plugin/download?updateId=727487";
const JETBRAINS_BASE_SHA256 = "580224064acdcd7a3b27a322d7b1e74fb1b56028ed1980c5acdfcf5f719cc058";
const HYPER_BASE_URL = "https://registry.npmjs.org/doki-theme-hyper/-/doki-theme-hyper-88.1.2.tgz";
const HYPER_BASE_SHA256 = "16589235238f68f5e3cf604f6c465b84fce881f60e864bb1d1952fa7b1a5abd4";
const VSCODE_BASE_URL = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/unthrottled/vsextensions/doki-theme/${VSCODE_UPSTREAM_VERSION}/vspackage`;
const VSCODE_BASE_SHA256 = "ec38adc23ed4dbab77bf8a1fa6ac3fb076abeae138e84e03595c06663ce265f3";
const VSCODE_SOURCE_COMMIT = "1661351593016a618a3de4fddc5985f8e8111477";
const VSCODE_TEMPLATE_FILES = {
  "base.colors.template.json": "3a972fde426820eb0e51f9f39eaab0254bba04b5040eff9ba08c6210131e6d41",
  "base.laf.template.json": "49985bb65c76b0a593a2968c986723acd24518ec5dd148c4ad10681aa648fc63",
  "base.semantic-tokens.template.json": "a7a2817caa99f79879b11adaaf4d42d32623fd28d8f7155a6ba30156884db57a",
  "base.syntax.template.json": "9de601ce15f45b803e8fdd196be61cd672028166938a5dc074804c169a95fa20",
  "dark.base.laf.template.json": "9546bd45d5faec5c198cc6066d4695930e13ecb1330ea858d7479835019bae83",
  "dark.colors.template.json": "aef4302547b0c682a0023517d131d35dd1221ad3fdbd0aa8fa96e8cd6d5e8c17",
  "dark.constrast.laf.template.json": "c18be04aff6ed60c954288f5bf35b5d5f78883185966e6d9ea37c01bbca44646",
  "dark.dim.laf.template.json": "33343379d2a0afecb76cfcf8acd756aed623659b8ee79571c6ab9803c9ac6664",
  "light.colors.template.json": "fff099e99ee19ad3769d8c49913d1e58ef50d622c851282c18183c5ab0db5172",
  "light.laf.template.json": "b652b680feee8dd8914333baeb70d42bbec93742c3372e6d5ceb9c3b5d718e98",
};
const OFFICIAL_DIR = path.join(ROOT, "official");
const UPSTREAM_DIR = path.join(ROOT, ".cache", "upstream");

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function resetDir(directory) {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
}

function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function downloadPinned(url, expectedSha256, target) {
  const partial = `${target}.download`;
  fs.rmSync(partial, { force: true });
  try {
    run("curl", ["--compressed", "-fL", "--retry", "3", url, "-o", partial]);
    const actual = sha256(partial);
    if (actual !== expectedSha256) {
      throw new Error(`Checksum inesperado para ${path.basename(target)}: ${actual}`);
    }
    fs.renameSync(partial, target);
  } finally {
    fs.rmSync(partial, { force: true });
  }
}

function requireRuntimeBases() {
  const missing = ["jetbrains-base.zip", "hyper-base.zip", "vscode-base.vsix"].filter(
    (file) => !fs.existsSync(path.join(ROOT, "vendor", file)),
  );
  const templates = path.join(ROOT, "vendor", "vscode-templates");
  for (const file of Object.keys(VSCODE_TEMPLATE_FILES)) {
    if (!fs.existsSync(path.join(templates, file))) missing.push(`vscode-templates/${file}`);
  }
  if (missing.length) {
    throw new Error(`Faltan ${missing.join(", ")}. Ejecuta npm run bootstrap.`);
  }
}

function bootstrapRuntime() {
  const vendorDir = path.join(ROOT, "vendor");
  fs.mkdirSync(vendorDir, { recursive: true });

  const jetbrainsTarget = path.join(vendorDir, "jetbrains-base.zip");
  if (fs.existsSync(jetbrainsTarget)) {
    console.log("jetbrains-base.zip: ya existe");
  } else {
    console.log("Descargando Doki Theme oficial desde JetBrains Marketplace...");
    downloadPinned(JETBRAINS_BASE_URL, JETBRAINS_BASE_SHA256, jetbrainsTarget);
  }

  const hyperTarget = path.join(vendorDir, "hyper-base.zip");
  if (fs.existsSync(hyperTarget)) {
    console.log("hyper-base.zip: ya existe");
  } else {
    console.log("Preparando Doki Theme oficial para Hyper desde npm...");
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "nini-doki-hyper-"));
    try {
      const tarball = path.join(temp, "doki-theme-hyper-88.1.2.tgz");
      downloadPinned(HYPER_BASE_URL, HYPER_BASE_SHA256, tarball);
      run("tar", ["-xzf", tarball, "-C", temp]);
      const pluginRoot = path.join(temp, "doki-theme-hyper-nini");
      fs.renameSync(path.join(temp, "package"), pluginRoot);

      const packagePath = path.join(pluginRoot, "package.json");
      const packageJson = readJson(packagePath);
      packageJson.name = "doki-theme-hyper-nini";
      packageJson.private = true;
      writeJson(packagePath, packageJson);
      run("npm", ["install", "--omit=dev", "--ignore-scripts", "--package-lock=false"], {
        cwd: pluginRoot,
      });
      run("zip", ["-qr", hyperTarget, "doki-theme-hyper-nini"], { cwd: temp });
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }

  const vscodeTarget = path.join(vendorDir, "vscode-base.vsix");
  if (fs.existsSync(vscodeTarget)) {
    console.log("vscode-base.vsix: ya existe");
  } else {
    console.log("Descargando Doki Theme oficial desde VS Code Marketplace...");
    downloadPinned(VSCODE_BASE_URL, VSCODE_BASE_SHA256, vscodeTarget);
  }

  const templateDir = path.join(vendorDir, "vscode-templates");
  fs.mkdirSync(templateDir, { recursive: true });
  for (const [file, checksum] of Object.entries(VSCODE_TEMPLATE_FILES)) {
    const target = path.join(templateDir, file);
    if (fs.existsSync(target) && sha256(target) === checksum) continue;
    const url = `https://raw.githubusercontent.com/doki-theme/doki-theme-vscode/${VSCODE_SOURCE_COMMIT}/buildSrc/assets/templates/${file}`;
    downloadPinned(url, checksum, target);
  }
  console.log(`Plantillas oficiales de VS Code: ${Object.keys(VSCODE_TEMPLATE_FILES).length}`);
}

function listThemes() {
  if (!fs.existsSync(THEMES_DIR)) return [];
  return fs
    .readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = path.join(THEMES_DIR, entry.name);
      return {
        slug: entry.name,
        directory,
        definition: readJson(path.join(directory, "definition.json")),
        config: readJson(path.join(directory, "theme.config.json")),
      };
    })
    .sort((left, right) => left.definition.name.localeCompare(right.definition.name));
}

function expectedEditorScheme(theme) {
  return `/doki/themes/${theme.config.category}/${theme.config.fileName}.xml`;
}

function expectedStickerPath(theme) {
  return `/${theme.config.stickerInstallPath.replace(/^stickers\//, "")}`;
}

function validateThemes(themes = listThemes()) {
  const errors = [];
  const ids = new Set();
  const names = new Set();
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const safePathPart = /^[A-Za-z0-9_.'!-]+$/;

  for (const theme of themes) {
    for (const file of REQUIRED_FILES) {
      if (!fs.existsSync(path.join(theme.directory, file))) {
        errors.push(`${theme.slug}: falta ${file}`);
      }
    }

    const definition = theme.definition;
    for (const field of ["id", "name", "displayName", "author", "group"] ) {
      if (typeof definition[field] !== "string" || !definition[field].trim()) {
        errors.push(`${theme.slug}: definition.${field} no es valido`);
      }
    }
    if (!uuid.test(definition.id || "")) errors.push(`${theme.slug}: id no es UUID`);
    if (ids.has(definition.id)) errors.push(`${theme.slug}: id duplicado ${definition.id}`);
    if (names.has(definition.name)) errors.push(`${theme.slug}: nombre duplicado ${definition.name}`);
    ids.add(definition.id);
    names.add(definition.name);

    if (typeof definition.dark !== "boolean") errors.push(`${theme.slug}: dark debe ser boolean`);
    if (!definition.colors || Object.keys(definition.colors).length < 20) {
      errors.push(`${theme.slug}: faltan colores Doki`);
    }
    if (!definition.ui || typeof definition.ui !== "object") errors.push(`${theme.slug}: falta ui`);
    if (!definition.backgrounds?.default) errors.push(`${theme.slug}: falta backgrounds.default`);
    if (!definition.stickers?.default) errors.push(`${theme.slug}: falta stickers.default`);
    if (definition.editorScheme !== expectedEditorScheme(theme)) {
      errors.push(`${theme.slug}: editorScheme debe ser ${expectedEditorScheme(theme)}`);
    }
    if (definition.stickers?.default !== expectedStickerPath(theme)) {
      errors.push(`${theme.slug}: stickers.default debe ser ${expectedStickerPath(theme)}`);
    }
    if (definition.backgrounds?.default?.name !== theme.config.wallpaperName) {
      errors.push(`${theme.slug}: el wallpaper no coincide con theme.config.json`);
    }
    if (!safePathPart.test(theme.config.category || "")) errors.push(`${theme.slug}: category no es seguro`);
    if (!safePathPart.test(theme.config.fileName || "")) errors.push(`${theme.slug}: fileName no es seguro`);
    if (!/^stickers\/[A-Za-z0-9_./'!-]+\.png$/.test(theme.config.stickerInstallPath || "")) {
      errors.push(`${theme.slug}: stickerInstallPath no es seguro`);
    }
    if (!/^[A-Za-z0-9_.'!-]+\.png$/.test(theme.config.wallpaperName || "")) {
      errors.push(`${theme.slug}: wallpaperName no es seguro`);
    }
  }

  if (!themes.length) errors.push("No hay temas en src/themes");
  if (errors.length) throw new Error(`Validacion fallida:\n- ${errors.join("\n- ")}`);
  return themes;
}

function stableUuid(value) {
  const bytes = createHash("sha1").update(`nini-doki:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function officialThemePath(theme) {
  return path.join(theme.config.category, theme.slug, theme.definition.dark ? "dark" : "light");
}

function editorTemplate(theme) {
  const colorNames = Object.entries(theme.definition.colors)
    .filter(([, value]) => typeof value === "string" && /^#[0-9a-f]{6,8}$/i.test(value))
    .sort((left, right) => right[1].length - left[1].length);
  return fs
    .readFileSync(path.join(theme.directory, "editor.xml"), "utf8")
    .replace(/value="([0-9a-f]{6,8})"/gi, (match, rawValue) => {
      const normalized = rawValue.toLowerCase();
      for (const [name, color] of colorNames) {
        const hex = color.slice(1).toLowerCase();
        if (normalized === hex) return `value="$${name}$"`;
        if (hex.length === 6 && normalized.startsWith(hex)) {
          return `value="$${name}$${rawValue.slice(6)}"`;
        }
      }
      return match;
    });
}

function syncOfficial(themes = validateThemes(), quiet = false) {
  resetDir(OFFICIAL_DIR);
  for (const theme of themes) {
    const relative = officialThemePath(theme);
    const mode = theme.definition.dark ? "dark" : "light";
    const masterName = `${theme.slug}.${mode}.master.definition.json`;
    const defaultBackground = theme.definition.backgrounds.default;
    const master = {
      id: theme.definition.id,
      name: theme.definition.name,
      displayName: theme.definition.displayName,
      dark: theme.definition.dark,
      author: theme.definition.author,
      group: theme.definition.group,
      stickers: {
        default: {
          name: `${theme.slug}.png`,
          anchor: "right",
          opacity: defaultBackground.opacity,
        },
      },
      overrides: { editorScheme: { colors: {} } },
      colors: theme.definition.colors,
      characterId: stableUuid(theme.slug),
      meta: { source: REPOSITORY, fanmade: true },
    };
    const jetbrains = {
      id: theme.definition.id,
      editorScheme: { type: "templateExtension", file: `${theme.config.fileName}.xml` },
      overrides: {},
      ui: theme.definition.ui,
      backgrounds: { default: { name: theme.config.wallpaperName } },
    };
    const anchorMap = {
      CENTER: "center",
      MIDDLE_RIGHT: "right center",
      MIDDLE_LEFT: "left center",
      TOP_RIGHT: "right top",
      TOP_LEFT: "left top",
      BOTTOM_RIGHT: "right bottom",
      BOTTOM_LEFT: "left bottom",
    };
    const hyper = {
      id: theme.definition.id,
      backgrounds: {
        default: {
          anchor: anchorMap[defaultBackground.position] || "center",
          opacity: defaultBackground.opacity / 100,
        },
      },
    };
    const vscode = {
      id: theme.definition.id,
      overrides: {},
      laf: {
        extends: theme.definition.dark ? "dark-contrast" : "light",
        ui: {},
      },
      syntax: {},
      colors: {},
    };

    const masterDir = path.join(OFFICIAL_DIR, "definitions", relative);
    const jetbrainsDir = path.join(OFFICIAL_DIR, "apps", "jetbrains", relative);
    const hyperDir = path.join(OFFICIAL_DIR, "apps", "hyper", relative);
    const vscodeDir = path.join(OFFICIAL_DIR, "apps", "vscode", relative);
    const assetDir = path.join(OFFICIAL_DIR, "assets", relative);
    writeJson(path.join(masterDir, masterName), master);
    writeJson(
      path.join(jetbrainsDir, `${theme.slug}.${mode}.jetbrains.definition.json`),
      jetbrains,
    );
    fs.writeFileSync(path.join(jetbrainsDir, `${theme.config.fileName}.xml`), editorTemplate(theme));
    writeJson(path.join(hyperDir, `${theme.slug}.${mode}.hyper.definition.json`), hyper);
    writeJson(path.join(vscodeDir, `${theme.slug}.${mode}.vsCode.definition.json`), vscode);
    fs.mkdirSync(assetDir, { recursive: true });
    fs.copyFileSync(path.join(theme.directory, "sticker.png"), path.join(assetDir, `${theme.slug}.png`));
    fs.copyFileSync(path.join(theme.directory, "wallpaper.png"), path.join(assetDir, theme.config.wallpaperName));
  }
  if (!quiet) console.log(`Overlay oficial sincronizado: ${themes.length} temas.`);
  return themes;
}

function clonePinnedUpstream(name, specification) {
  const destination = path.join(UPSTREAM_DIR, name);
  if (!fs.existsSync(path.join(destination, ".git"))) {
    fs.mkdirSync(UPSTREAM_DIR, { recursive: true });
    run("git", ["clone", "--filter=blob:none", specification.repository, destination]);
    run("git", ["-C", destination, "checkout", "--detach", specification.commit]);
  }
  const current = execFileSync("git", ["-C", destination, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (current !== specification.commit) {
    throw new Error(`${name} esta en ${current}; se esperaba ${specification.commit}. Borra .cache/upstream/${name} para recrearlo.`);
  }
  console.log(`${name}: ${current.slice(0, 7)}`);
}

function bootstrapUpstream() {
  const lock = readJson(path.join(ROOT, "upstream.lock.json"));
  for (const [name, specification] of Object.entries(lock.repositories)) {
    clonePinnedUpstream(name, specification);
  }
}

function copyDirectoryContents(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function prepareUpstream(themes = validateThemes()) {
  syncOfficial(themes, true);
  bootstrapUpstream();
  const master = path.join(UPSTREAM_DIR, "doki-master-theme");
  const jetbrains = path.join(UPSTREAM_DIR, "doki-theme-jetbrains");
  const hyper = path.join(UPSTREAM_DIR, "doki-theme-hyper");
  const vscode = path.join(UPSTREAM_DIR, "doki-theme-vscode");
  const targets = [
    [path.join(OFFICIAL_DIR, "definitions"), path.join(master, "definitions", "niniCustom")],
    [path.join(OFFICIAL_DIR, "apps", "jetbrains"), path.join(jetbrains, "buildSrc", "assets", "themes", "niniCustom")],
    [path.join(OFFICIAL_DIR, "apps", "hyper"), path.join(hyper, "buildSrc", "assets", "themes", "niniCustom")],
    [path.join(OFFICIAL_DIR, "apps", "vscode"), path.join(vscode, "buildSrc", "assets", "themes", "niniCustom")],
    [path.join(OFFICIAL_DIR, "assets"), path.join(UPSTREAM_DIR, "nini-theme-assets")],
  ];
  for (const [source, destination] of targets) {
    fs.rmSync(destination, { recursive: true, force: true });
    copyDirectoryContents(source, destination);
  }
  console.log(`Upstream preparado en ${UPSTREAM_DIR}`);
  console.log("Las definiciones usan los formatos oficiales master, jetbrains, hyper y VS Code.");
}

function jetBrainsLookAndFeel(definition) {
  const {
    displayName,
    group,
    stickers,
    backgrounds,
    meta,
    ...lookAndFeel
  } = definition;
  return lookAndFeel;
}

function patchPluginXml(xml, themes) {
  const registrations = [
    '    <postStartupActivity implementation="local.nini.doki.NiniAssetInstaller" />',
    ...themes.map(
      (theme) =>
        `    <themeProvider id="${theme.definition.id}" path="${expectedEditorScheme(theme).replace(/\.xml$/, ".theme.json")}" />`,
    ),
  ].join("\n");
  const anchor = xml.includes("    <themeProvider") ? "    <themeProvider" : "  </extensions>";
  return xml
    .replace(/<version>[^<]+<\/version>/, `<version>${IDEA_VERSION}</version>`)
    .replace(anchor, `${registrations}\n${anchor}`);
}

function buildIdea(themes = validateThemes()) {
  requireRuntimeBases();
  const output = path.join(DIST_DIR, "jetbrains");
  resetDir(output);
  run("unzip", ["-q", path.join(ROOT, "vendor", "jetbrains-base.zip"), "-d", output]);

  const pluginRoot = path.join(output, "doki-theme-jetbrains");
  const mainJar = path.join(pluginRoot, "lib", IDEA_JAR);
  const patchRoot = path.join(DIST_DIR, ".idea-patch");
  resetDir(patchRoot);
  run("unzip", ["-q", mainJar, "META-INF/plugin.xml", "-d", patchRoot]);

  const pluginXmlPath = path.join(patchRoot, "META-INF", "plugin.xml");
  fs.writeFileSync(pluginXmlPath, patchPluginXml(fs.readFileSync(pluginXmlPath, "utf8"), themes));
  fs.cpSync(
    path.join(ROOT, "runtime", "classes", "local"),
    path.join(patchRoot, "local"),
    { recursive: true },
  );

  const registry = ["# bundled-resource\tpath-under-dokiThemeAssets"];
  for (const theme of themes) {
    const resourceDir = path.join(patchRoot, "doki", "themes", theme.config.category);
    fs.mkdirSync(resourceDir, { recursive: true });
    writeJson(
      path.join(resourceDir, `${theme.config.fileName}.theme.json`),
      jetBrainsLookAndFeel(theme.definition),
    );
    writeJson(
      path.join(resourceDir, `${theme.config.fileName}.theme.meta.json`),
      theme.definition,
    );
    fs.copyFileSync(path.join(theme.directory, "editor.xml"), path.join(resourceDir, `${theme.config.fileName}.xml`));

    const bundledDir = path.join(patchRoot, "doki", "nini-assets");
    fs.mkdirSync(bundledDir, { recursive: true });
    const stickerResource = `/doki/nini-assets/${theme.slug}-sticker.png`;
    const wallpaperResource = `/doki/nini-assets/${theme.slug}-wallpaper.png`;
    fs.copyFileSync(path.join(theme.directory, "sticker.png"), path.join(bundledDir, `${theme.slug}-sticker.png`));
    fs.copyFileSync(path.join(theme.directory, "wallpaper.png"), path.join(bundledDir, `${theme.slug}-wallpaper.png`));
    registry.push(`${stickerResource}\t${theme.config.stickerInstallPath}`);
    registry.push(`${wallpaperResource}\tbackgrounds/wallpapers/${theme.config.wallpaperName}`);
    registry.push(`${wallpaperResource}\tbackgrounds/${theme.config.wallpaperName}`);
  }
  fs.writeFileSync(path.join(patchRoot, "doki", "nini-assets.tsv"), `${registry.join("\n")}\n`);
  run("zip", ["-qr", mainJar, "."], { cwd: patchRoot });
  fs.rmSync(patchRoot, { recursive: true, force: true });

  const archive = path.join(DIST_DIR, `Nini-Doki-JetBrains-${IDEA_VERSION}.zip`);
  fs.rmSync(archive, { force: true });
  run("zip", ["-qr", archive, "doki-theme-jetbrains"], { cwd: output });
  console.log(`JetBrains: ${archive}`);
  return { archive, pluginRoot };
}

function hyperCustomizationsSource(themes) {
  const specs = themes.map((theme) => ({
    id: theme.definition.id,
    meta: `${theme.slug}.json`,
    sticker: `${theme.slug}-sticker.png`,
    wallpaper: `${theme.slug}-wallpaper.png`,
  }));
  return `"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const THEME_SPECS = ${JSON.stringify(specs, null, 2)};
const CUSTOM_THEME_IDS = new Set(THEME_SPECS.map((spec) => spec.id));
const POSITION_MAP = {
  CENTER: "center", MIDDLE_RIGHT: "right center", MIDDLE_LEFT: "left center",
  TOP_RIGHT: "right top", TOP_LEFT: "left top",
  BOTTOM_RIGHT: "right bottom", BOTTOM_LEFT: "left bottom",
};

function getDokiConfigDirectory() {
  const applicationDirectory = process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, "hyper")
    : process.platform === "win32"
      ? path.join(process.env.APPDATA || "", "Hyper")
      : os.homedir();
  return path.resolve(applicationDirectory, ".doki-theme-hyper-config");
}

function readMeta(fileName) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "nini-meta", fileName), "utf8"));
}

function buildDefinition(spec) {
  const meta = readMeta(spec.meta);
  const background = meta.backgrounds.default;
  return {
    information: {
      id: meta.id, name: meta.name, displayName: meta.displayName, dark: meta.dark,
      author: meta.author, group: meta.group,
      stickers: { default: { name: spec.sticker, anchor: "right", opacity: background.opacity } },
    },
    colors: meta.colors,
    stickers: {
      default: {
        path: \`/nini/\${spec.sticker}\`,
        name: \`nini/\${spec.wallpaper}\`,
        background: {
          anchor: POSITION_MAP[background.position] || "center",
          opacity: background.opacity / 100,
        },
      },
    },
  };
}

function installAsset(sourceName, targetKind) {
  const source = path.resolve(__dirname, "..", "assets", "nini", sourceName);
  const target = path.join(getDokiConfigDirectory(), targetKind, "nini", sourceName);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function toFileUrl(file) {
  const normalized = file.replace(/\\\\/g, "/");
  return \`file://\${encodeURI(normalized).replace(/[!'()*]/g, (character) =>
    \`%\${character.charCodeAt(0).toString(16).toUpperCase()}\`
  )}\`;
}

function protectLocalAssets() {
  const config = require("./config");
  const updater = require("./StickerUpdateService");
  const updateOfficialAssets = updater.attemptToUpdateSticker;
  updater.attemptToUpdateSticker = async () => {
    const { theme, sticker: { sticker } } = config.getTheme();
    if (!CUSTOM_THEME_IDS.has(theme.information.id)) {
      return updateOfficialAssets();
    }
    return {
      stickerDataURL: toFileUrl(updater.resolveLocalStickerPath(sticker)),
      wallpaperURL: toFileUrl(updater.resolveLocalWallpaperPath(sticker)),
    };
  };
}

function getCarouselThemeIds(savedConfig = require("./config").extractConfig()) {
  const definitions = require("./DokiThemeDefinitions").default;
  const configuredIds = Array.isArray(savedConfig.startupCarouselThemeIds)
    ? savedConfig.startupCarouselThemeIds
    : Object.keys(definitions);
  return [...new Set(configuredIds)].filter((themeId) =>
    definitions[themeId]
  );
}

function withoutCarouselQueue(savedConfig) {
  const { startupCarouselQueue, startupCarouselSelection, ...currentConfig } = savedConfig;
  return currentConfig;
}

function setStartupCarouselEnabled(enabled) {
  const config = require("./config");
  const savedConfig = config.extractConfig();
  config.saveConfig({
    ...withoutCarouselQueue(savedConfig),
    startupCarouselEnabled: enabled,
    startupCarouselThemeIds: getCarouselThemeIds(savedConfig),
  });
}

function setCarouselThemes(themeIds) {
  const config = require("./config");
  const definitions = require("./DokiThemeDefinitions").default;
  const savedConfig = config.extractConfig();
  const selectedIds = [...new Set(themeIds)].filter((themeId) => definitions[themeId]);
  config.saveConfig({
    ...withoutCarouselQueue(savedConfig),
    startupCarouselThemeIds: selectedIds,
  });
}

let carouselPickerWindow;

function showCarouselPicker(parentWindow) {
  const { BrowserWindow, ipcMain } = require("electron");
  if (carouselPickerWindow && !carouselPickerWindow.isDestroyed()) {
    carouselPickerWindow.focus();
    return;
  }
  const definitions = require("./DokiThemeDefinitions").default;
  const selectedIds = new Set(getCarouselThemeIds());
  const themes = Object.values(definitions)
    .sort((left, right) => left.information.name.localeCompare(right.information.name))
    .map((definition) => ({
      id: definition.information.id,
      name: definition.information.name,
      selected: selectedIds.has(definition.information.id),
    }));
  const saveChannel = "nini-doki-carousel:save";
  const cancelChannel = "nini-doki-carousel:cancel";
  const windowOptions = {
    width: 520,
    height: 680,
    minWidth: 420,
    minHeight: 480,
    title: "Choose Startup Themes",
    backgroundColor: "#17191d",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "CarouselPickerPreload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
  if (parentWindow && typeof parentWindow.isDestroyed === "function" && !parentWindow.isDestroyed()) {
    windowOptions.parent = parentWindow;
    windowOptions.modal = true;
  }
  const picker = new BrowserWindow(windowOptions);
  carouselPickerWindow = picker;
  const save = (event, themeIds) => {
    if (event.sender !== picker.webContents || !Array.isArray(themeIds)) return;
    setCarouselThemes(themeIds);
    picker.close();
  };
  const cancel = (event) => {
    if (event.sender === picker.webContents) picker.close();
  };
  const cleanup = () => {
    ipcMain.removeListener(saveChannel, save);
    ipcMain.removeListener(cancelChannel, cancel);
    if (carouselPickerWindow === picker) carouselPickerWindow = undefined;
  };
  ipcMain.on(saveChannel, save);
  ipcMain.on(cancelChannel, cancel);
  picker.once("closed", cleanup);
  picker.once("ready-to-show", () => picker.show());
  const themeData = JSON.stringify(themes).replace(/</g, "\\u003c");
  const html = \`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Choose Startup Themes</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, system-ui, sans-serif; background: #17191d; color: #f0f2f5; }
    * { box-sizing: border-box; }
    body { margin: 0; height: 100vh; display: grid; grid-template-rows: auto auto 1fr auto; overflow: hidden; }
    header { padding: 20px 22px 12px; border-bottom: 1px solid #343840; }
    h1 { margin: 0 0 6px; font-size: 19px; font-weight: 650; letter-spacing: 0; }
    #count { color: #aeb4bd; font-size: 13px; }
    .search { padding: 12px 22px; border-bottom: 1px solid #343840; }
    input[type="search"] { width: 100%; height: 36px; padding: 0 11px; border: 1px solid #484e58; border-radius: 6px; background: #23262c; color: #f0f2f5; outline: none; }
    input[type="search"]:focus { border-color: #5bbdc8; box-shadow: 0 0 0 2px #5bbdc833; }
    #themes { overflow-y: auto; padding: 8px 14px; }
    label { min-height: 38px; display: flex; align-items: center; gap: 11px; padding: 7px 8px; border-radius: 4px; cursor: pointer; }
    label:hover { background: #252a31; }
    label[hidden] { display: none; }
    input[type="checkbox"] { width: 17px; height: 17px; margin: 0; accent-color: #5bbdc8; flex: 0 0 auto; }
    .name { min-width: 0; overflow-wrap: anywhere; font-size: 14px; }
    footer { display: flex; justify-content: flex-end; gap: 9px; padding: 12px 22px; border-top: 1px solid #343840; background: #1c1f24; }
    button { min-width: 82px; height: 34px; padding: 0 14px; border: 1px solid #4a505a; border-radius: 6px; background: #282c33; color: #f0f2f5; font-weight: 600; cursor: pointer; }
    button:hover { background: #333840; }
    button.primary { border-color: #5bbdc8; background: #326b72; }
    button.primary:hover { background: #3b7b83; }
  </style>
</head>
<body>
  <header><h1>Choose Startup Themes</h1><div id="count"></div></header>
  <div class="search"><input id="search" type="search" placeholder="Filter themes" autofocus></div>
  <main id="themes"></main>
  <footer><button id="cancel" type="button">Cancel</button><button id="apply" class="primary" type="button">Apply</button></footer>
  <script>
    const themes = \${themeData};
    const container = document.getElementById("themes");
    const count = document.getElementById("count");
    const rows = themes.map((theme) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      const name = document.createElement("span");
      checkbox.type = "checkbox";
      checkbox.value = theme.id;
      checkbox.checked = theme.selected;
      name.className = "name";
      name.textContent = theme.name;
      label.append(checkbox, name);
      container.append(label);
      return { label, checkbox, search: theme.name.toLocaleLowerCase() };
    });
    const updateCount = () => {
      const selected = rows.filter(({ checkbox }) => checkbox.checked).length;
      count.textContent = selected + " of " + rows.length + " selected";
    };
    container.addEventListener("change", updateCount);
    document.getElementById("search").addEventListener("input", (event) => {
      const query = event.target.value.trim().toLocaleLowerCase();
      for (const row of rows) row.label.hidden = !row.search.includes(query);
    });
    document.getElementById("apply").addEventListener("click", () => {
      window.carouselPicker.save(rows.filter(({ checkbox }) => checkbox.checked).map(({ checkbox }) => checkbox.value));
    });
    document.getElementById("cancel").addEventListener("click", () => window.carouselPicker.cancel());
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") window.carouselPicker.cancel();
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") document.getElementById("apply").click();
    });
    updateCount();
  </script>
</body>
</html>\`;
  picker.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
}

function selectStartupTheme() {
  const config = require("./config");
  const savedConfig = config.extractConfig();
  if (savedConfig.startupCarouselEnabled !== true) return;
  const selectedIds = getCarouselThemeIds(savedConfig);
  if (selectedIds.length === 0) return;
  const alternatives = selectedIds.filter((themeId) => themeId !== savedConfig.themeId);
  const candidates = alternatives.length > 0 ? alternatives : selectedIds;
  const themeId = candidates[Math.floor(Math.random() * candidates.length)];
  config.saveConfig({
    ...withoutCarouselQueue(savedConfig),
    themeId,
    startupCarouselThemeIds: selectedIds,
  });
  return themeId;
}

function install() {
  const definitions = require("./DokiThemeDefinitions").default;
  for (const spec of THEME_SPECS) {
    const definition = buildDefinition(spec);
    definitions[definition.information.id] = definition;
    installAsset(spec.sticker, "stickers");
    installAsset(spec.wallpaper, "wallpapers");
  }
  selectStartupTheme();
  protectLocalAssets();
}

exports.install = install;
exports.CUSTOM_THEME_IDS = CUSTOM_THEME_IDS;
exports.getCarouselThemeIds = getCarouselThemeIds;
exports.setStartupCarouselEnabled = setStartupCarouselEnabled;
exports.setCarouselThemes = setCarouselThemes;
exports.showCarouselPicker = showCarouselPicker;
exports.selectStartupTheme = selectStartupTheme;
`;
}

function hyperCarouselPickerPreloadSource() {
  return `"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("carouselPicker", {
  save: (themeIds) => ipcRenderer.send("nini-doki-carousel:save", themeIds),
  cancel: () => ipcRenderer.send("nini-doki-carousel:cancel"),
});
`;
}

function replaceRequired(source, marker, replacement, description) {
  if (!source.includes(marker)) {
    throw new Error(`La base de Doki Hyper cambio: no encontre ${description}`);
  }
  return source.replace(marker, replacement);
}

function patchHyperStickerHoverRuntime(pluginRoot) {
  const configPath = path.join(pluginRoot, "build", "config.js");
  let configSource = fs.readFileSync(configPath, "utf8");
  configSource = replaceRequired(
    configSource,
    "    showWallpaper: true,\n    stickerType:",
    "    showWallpaper: true,\n    hideStickerOnHover: true,\n    stickerHoverOpacity: 0.15,\n    stickerTransitionMs: 160,\n    startupCarouselEnabled: false,\n    stickerType:",
    "los valores predeterminados del sticker",
  );
  configSource = replaceRequired(
    configSource,
    "    return JSON.parse(fs_1.default.readFileSync(configFile, \"utf8\"));",
    "    return Object.assign({}, exports.DEFAULT_CONFIGURATION, JSON.parse(fs_1.default.readFileSync(configFile, \"utf8\")));",
    "la lectura de configuracion de Doki",
  );
  fs.writeFileSync(configPath, configSource);

  const settingsPath = path.join(pluginRoot, "build", "settings.js");
  let settingsSource = fs.readFileSync(settingsPath, "utf8");
  settingsSource = replaceRequired(
    settingsSource,
    'const themeTools_1 = require("./themeTools");',
    'const themeTools_1 = require("./themeTools");\nconst NiniCustomizations_1 = require("./NiniCustomizations");',
    "las dependencias del menu de Doki",
  );
  settingsSource = replaceRequired(
    settingsSource,
    'exports.TOGGLE_STICKER = "TOGGLE_STICKER";',
    'exports.TOGGLE_STICKER = "TOGGLE_STICKER";\nexports.TOGGLE_STICKER_HOVER = "TOGGLE_STICKER_HOVER";',
    "el evento Toggle Sticker",
  );
  const wallpaperMenuMarker = `            {
                label: "Toggle Wallpaper",`;
  settingsSource = replaceRequired(
    settingsSource,
    wallpaperMenuMarker,
    `            {
                label: "Hide Sticker on Hover",
                type: "checkbox",
                checked: config_1.extractConfig().hideStickerOnHover !== false,
                click: (menuItem, focusedWindow) => __awaiter(void 0, void 0, void 0, function* () {
                    const savedConfig = config_1.extractConfig();
                    const hideStickerOnHover = menuItem.checked;
                    config_1.saveConfig(Object.assign(Object.assign({}, savedConfig), { hideStickerOnHover }));
                    focusedWindow.rpc.emit(exports.TOGGLE_STICKER_HOVER);
                }),
            },
${wallpaperMenuMarker}`,
    "el menu Toggle Wallpaper",
  );
  const stickerTypeMenuMarker = `            {
                id: "StickerType",`;
  settingsSource = replaceRequired(
    settingsSource,
    stickerTypeMenuMarker,
    `            {
                id: "StartupCarousel",
                label: "Startup Carousel",
                commandId: 1990,
                checked: false,
                enabled: true,
                submenu: [
                    {
                        label: "Enabled",
                        type: "checkbox",
                        checked: config_1.extractConfig().startupCarouselEnabled === true,
                        click: (menuItem) => NiniCustomizations_1.setStartupCarouselEnabled(menuItem.checked),
                    },
                    { type: "separator" },
                    {
                        label: "Choose Themes... (" + NiniCustomizations_1.getCarouselThemeIds().length + " selected)",
                        click: (_, focusedWindow) => NiniCustomizations_1.showCarouselPicker(focusedWindow),
                    },
                ],
            },
${stickerTypeMenuMarker}`,
    "el menu Sticker Type",
  );
  fs.writeFileSync(settingsPath, settingsSource);

  const decoratorPath = path.join(pluginRoot, "build", "decorator.js");
  let decoratorSource = fs.readFileSync(decoratorPath, "utf8");
  decoratorSource = replaceRequired(
    decoratorSource,
    'const StickerUpdateService_1 = require("./StickerUpdateService");',
    'const StickerUpdateService_1 = require("./StickerUpdateService");\nconst config_1 = require("./config");',
    "la dependencia StickerUpdateService",
  );
  decoratorSource = replaceRequired(
    decoratorSource,
    "            this.state = {\n                imageLoaded: false,\n            };",
    `            this.state = {
                imageLoaded: false,
                stickerHovered: false,
            };
            this.stickerRef = react_1.default.createRef();
            this.handleStickerMouseMove = (event) => {
                const sticker = this.stickerRef.current;
                if (!sticker)
                    return;
                const bounds = sticker.getBoundingClientRect();
                const stickerHovered = event.clientX >= bounds.left && event.clientX <= bounds.right &&
                    event.clientY >= bounds.top && event.clientY <= bounds.bottom;
                if (stickerHovered !== this.state.stickerHovered)
                    this.setState({ stickerHovered });
            };`,
    "el estado de carga del sticker",
  );
  decoratorSource = replaceRequired(
    decoratorSource,
    "        componentDidMount() {\n            if (!initialized) {",
    "        componentDidMount() {\n            window.addEventListener(\"mousemove\", this.handleStickerMouseMove, true);\n            if (!initialized) {",
    "el montaje del terminal",
  );
  decoratorSource = replaceRequired(
    decoratorSource,
    "        componentWillReceiveProps(nextProps) {",
    "        componentWillUnmount() {\n            window.removeEventListener(\"mousemove\", this.handleStickerMouseMove, true);\n        }\n        componentWillReceiveProps(nextProps) {",
    "la actualizacion de propiedades del terminal",
  );
  const fontListenerMarker = `                window.rpc.on(settings_1.TOGGLE_FONT, () => {
                    window.store.dispatch(reloadConfig(window.config.getConfig()));
                });`;
  decoratorSource = replaceRequired(
    decoratorSource,
    fontListenerMarker,
    `${fontListenerMarker}
                window.rpc.on(settings_1.TOGGLE_STICKER_HOVER, () => {
                    this.forceUpdate();
                    window.store.dispatch(reloadConfig(window.config.getConfig()));
                });`,
    "el listener Toggle Fonts",
  );
  const imageStyleMarker = `            const imageStyle = window.screen.width <= 1920
                ? { maxHeight: "200px", maxWidth: "175px" }
                : {};`;
  decoratorSource = replaceRequired(
    decoratorSource,
    imageStyleMarker,
    `${imageStyleMarker}
            const savedConfig = config_1.extractConfig();
            const configuredHoverOpacity = Number(savedConfig.stickerHoverOpacity);
            const hoverOpacity = Number.isFinite(configuredHoverOpacity)
                ? Math.min(1, Math.max(0, configuredHoverOpacity)) : 0.15;
            const configuredTransitionMs = Number(savedConfig.stickerTransitionMs);
            const transitionMs = Number.isFinite(configuredTransitionMs)
                ? Math.max(0, configuredTransitionMs) : 160;
            const stickerOpacity = savedConfig.hideStickerOnHover !== false && this.state.stickerHovered
                ? hoverOpacity : 1;
            const stickerStyle = Object.assign({}, imageStyle, {
                opacity: stickerOpacity,
                transition: "opacity " + transitionMs + "ms ease",
            });`,
    "el estilo responsivo del sticker",
  );
  decoratorSource = replaceRequired(
    decoratorSource,
    'style: this.state.imageLoaded ? imageStyle : { display: "none" }, onLoad:',
    'ref: this.stickerRef, style: this.state.imageLoaded ? stickerStyle : { display: "none" }, onLoad:',
    "el elemento de imagen del sticker",
  );
  fs.writeFileSync(decoratorPath, decoratorSource);
}

function buildHyper(themes = validateThemes()) {
  requireRuntimeBases();
  const output = path.join(DIST_DIR, "hyper");
  resetDir(output);
  run("unzip", ["-q", path.join(ROOT, "vendor", "hyper-base.zip"), "-d", output]);
  const pluginRoot = path.join(output, "doki-theme-hyper-nini");
  patchHyperStickerHoverRuntime(pluginRoot);
  const metaDir = path.join(pluginRoot, "build", "nini-meta");
  const assetsDir = path.join(pluginRoot, "assets", "nini");
  resetDir(metaDir);
  resetDir(assetsDir);

  for (const theme of themes) {
    writeJson(path.join(metaDir, `${theme.slug}.json`), theme.definition);
    fs.copyFileSync(path.join(theme.directory, "sticker.png"), path.join(assetsDir, `${theme.slug}-sticker.png`));
    fs.copyFileSync(path.join(theme.directory, "wallpaper.png"), path.join(assetsDir, `${theme.slug}-wallpaper.png`));
  }
  fs.writeFileSync(
    path.join(pluginRoot, "build", "NiniCustomizations.js"),
    hyperCustomizationsSource(themes),
  );
  fs.writeFileSync(
    path.join(pluginRoot, "build", "CarouselPickerPreload.js"),
    hyperCarouselPickerPreloadSource(),
  );

  const indexPath = path.join(pluginRoot, "build", "index.js");
  let indexSource = fs.readFileSync(indexPath, "utf8");
  if (!indexSource.includes("NiniCustomizations")) {
    const marker = 'Object.defineProperty(exports, "__esModule", { value: true });';
    if (!indexSource.includes(marker)) {
      throw new Error("No pude conectar las personalizaciones con la base oficial de Hyper");
    }
    indexSource = indexSource.replace(marker, `${marker}\nrequire("./NiniCustomizations").install();`);
    fs.writeFileSync(indexPath, indexSource);
  }
  const packagePath = path.join(pluginRoot, "package.json");
  const packageJson = readJson(packagePath);
  packageJson.version = HYPER_VERSION;
  packageJson.description = "Doki Theme for Hyper generated by Nini Doki Themes";
  writeJson(packagePath, packageJson);

  const archive = path.join(DIST_DIR, `Nini-Doki-Hyper-${HYPER_VERSION}.zip`);
  fs.rmSync(archive, { force: true });
  run("zip", ["-qr", archive, "doki-theme-hyper-nini"], { cwd: output });
  console.log(`Hyper: ${archive}`);
  return { archive, pluginRoot };
}

function vscodeTemplate(file) {
  return readJson(path.join(ROOT, "vendor", "vscode-templates", file));
}

function resolveVscodeTemplate(value, palette) {
  const resolvedColors = new Map();
  const resolveColor = (name, trail = []) => {
    if (resolvedColors.has(name)) return resolvedColors.get(name);
    if (!(name in palette)) throw new Error(`La plantilla oficial de VS Code requiere el color ${name}`);
    if (trail.includes(name)) throw new Error(`Referencia circular de color VS Code: ${[...trail, name].join(" -> ")}`);
    const resolved = resolveString(palette[name], [...trail, name]);
    resolvedColors.set(name, resolved);
    return resolved;
  };
  const resolveString = (input, trail = []) => {
    if (typeof input !== "string") return input;
    let output = input;
    for (let attempt = 0; attempt < 20 && /&[^&]+&/.test(output); attempt += 1) {
      output = output.replace(/&([^&]+)&/g, (_, name) => resolveColor(name, trail));
    }
    if (/&[^&]+&/.test(output)) throw new Error(`No pude resolver el color VS Code ${output}`);
    return output;
  };
  const walk = (input) => {
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input).map(([key, child]) => [key, walk(child)]));
    }
    return resolveString(input);
  };
  return walk(value);
}

function vscodeThemeDocument(theme) {
  const baseColors = vscodeTemplate("base.colors.template.json").colors;
  const modeColors = vscodeTemplate(theme.definition.dark
    ? "dark.colors.template.json"
    : "light.colors.template.json").colors;
  const palette = { ...baseColors, ...modeColors, ...theme.definition.colors };
  const baseLookAndFeel = vscodeTemplate("base.laf.template.json").ui;
  const modeLookAndFeel = theme.definition.dark
    ? {
        ...vscodeTemplate("dark.base.laf.template.json").ui,
        ...vscodeTemplate("dark.constrast.laf.template.json").ui,
      }
    : vscodeTemplate("light.laf.template.json").ui;
  const syntax = vscodeTemplate("base.syntax.template.json").tokenColors;
  const semanticTokens = vscodeTemplate("base.semantic-tokens.template.json").semanticTokenColors;
  const document = resolveVscodeTemplate({
    type: theme.definition.dark ? "dark" : "light",
    colors: { ...baseLookAndFeel, ...modeLookAndFeel },
    semanticHighlighting: true,
    semanticTokenColors: semanticTokens,
    tokenColors: syntax,
  }, palette);
  for (const [name, color] of Object.entries(theme.definition.colors)) {
    if (name.startsWith("terminal.ansi")) document.colors[name] = color;
  }
  return document;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const payload = Buffer.concat([typeBuffer, data]);
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  payload.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(payload), data.length + 8);
  return chunk;
}

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function pngWithOpacity(source, opacity) {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  if (!source.subarray(0, 8).equals(signature)) throw new Error("El wallpaper de VS Code no es PNG");
  let offset = 8;
  let header;
  const imageData = [];
  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.subarray(offset + 4, offset + 8).toString("ascii");
    const data = source.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") header = Buffer.from(data);
    if (type === "IDAT") imageData.push(data);
    offset += length + 12;
    if (type === "IEND") break;
  }
  if (!header || !imageData.length) throw new Error("El wallpaper PNG esta incompleto");
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const bitDepth = header[8];
  const colorType = header[9];
  const interlace = header[12];
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`PNG no compatible para VS Code: profundidad ${bitDepth}, color ${colorType}, interlace ${interlace}`);
  }
  const channels = colorType === 2 ? 3 : 4;
  const stride = width * channels;
  const inflated = inflateSync(Buffer.concat(imageData));
  if (inflated.length !== (stride + 1) * height) throw new Error("Tamano PNG inesperado");
  const rgbaStride = width * 4;
  const output = Buffer.alloc((rgbaStride + 1) * height);
  let previous = Buffer.alloc(stride);
  for (let row = 0; row < height; row += 1) {
    const inputOffset = row * (stride + 1);
    const filter = inflated[inputOffset];
    const reconstructed = Buffer.alloc(stride);
    for (let index = 0; index < stride; index += 1) {
      const encoded = inflated[inputOffset + 1 + index];
      const left = index >= channels ? reconstructed[index - channels] : 0;
      const above = previous[index];
      const upperLeft = index >= channels ? previous[index - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) predictor = paethPredictor(left, above, upperLeft);
      else if (filter !== 0) throw new Error(`Filtro PNG no compatible: ${filter}`);
      reconstructed[index] = (encoded + predictor) & 0xff;
    }
    const outputOffset = row * (rgbaStride + 1);
    output[outputOffset] = 0;
    for (let pixel = 0; pixel < width; pixel += 1) {
      const sourcePixel = pixel * channels;
      const targetPixel = outputOffset + 1 + pixel * 4;
      output[targetPixel] = reconstructed[sourcePixel];
      output[targetPixel + 1] = reconstructed[sourcePixel + 1];
      output[targetPixel + 2] = reconstructed[sourcePixel + 2];
      const sourceAlpha = channels === 4 ? reconstructed[sourcePixel + 3] : 255;
      output[targetPixel + 3] = Math.round(sourceAlpha * Math.min(1, Math.max(0, opacity)));
    }
    previous = reconstructed;
  }
  const rgbaHeader = Buffer.from(header);
  rgbaHeader[9] = 6;
  return Buffer.concat([
    signature,
    pngChunk("IHDR", rgbaHeader),
    pngChunk("IDAT", deflateSync(output, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function vscodeAnchor(theme) {
  const positions = {
    CENTER: "center",
    MIDDLE_RIGHT: "right center",
    MIDDLE_LEFT: "left center",
    TOP_RIGHT: "right top",
    TOP_LEFT: "left top",
    BOTTOM_RIGHT: "right bottom",
    BOTTOM_LEFT: "left bottom",
  };
  return positions[theme.definition.backgrounds.default.position] || "center";
}

function vscodeRuntimeDefinition(theme) {
  const sticker = `${theme.slug}-sticker.png`;
  const wallpaper = `${theme.slug}-wallpaper.png`;
  const command = `doki-theme.theme.nini.${theme.slug}`;
  return {
    extensionNames: [command, `doki-theme.theme.wallpaper.nini.${theme.slug}`],
    themeDefinition: {
      information: {
        id: theme.definition.id,
        name: theme.definition.name,
        displayName: theme.definition.displayName,
        dark: theme.definition.dark,
        author: theme.definition.author,
        group: theme.definition.group,
        stickers: {
          default: {
            name: sticker,
            anchor: vscodeAnchor(theme),
            opacity: theme.definition.backgrounds.default.opacity,
          },
        },
        characterId: stableUuid(theme.slug),
      },
      stickers: {
        default: {
          path: `/nini/${theme.slug}/${sticker}`,
          name: wallpaper,
          anchoring: vscodeAnchor(theme),
        },
      },
    },
  };
}

function prependVscodeDefinitions(source, marker, definitions, description) {
  if (!source.includes(marker)) throw new Error(`La base de Doki VS Code cambio: no encontre ${description}`);
  const serialized = definitions.map((definition) => JSON.stringify(definition)).join(",");
  return source.replace(marker, `${marker}${serialized},`);
}

function vscodeLocalAssetsSource(themes) {
  const specs = Object.fromEntries(themes.map((theme) => [theme.definition.id, {
    sticker: `${theme.slug}-sticker.png`,
    wallpaper: `${theme.slug}-wallpaper.png`,
    background: `${theme.slug}-background.png`,
  }]));
  return `"use strict";

const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const SPECS = ${JSON.stringify(specs, null, 2)};

function configuredAsset(config, key, fallback) {
  const candidate = String(config.get(key) || "");
  return candidate && fs.existsSync(candidate) ? candidate : fallback;
}

function dataUrl(file) {
  const extension = path.extname(file).toLowerCase();
  const mime = extension === ".gif" ? "image/gif"
    : extension === ".jpg" || extension === ".jpeg" ? "image/jpeg"
      : "image/png";
  return \`data:\${mime};base64,\${fs.readFileSync(file).toString("base64")}\`;
}

function resolveLocalAssets(theme, currentSticker, context) {
  const spec = SPECS[theme.id];
  if (!spec) return undefined;
  const assets = path.join(context.extensionPath, "assets", "nini");
  const config = vscode.workspace.getConfiguration("doki");
  const sticker = configuredAsset(config, "sticker.path", path.join(assets, spec.sticker));
  const wallpaper = configuredAsset(config, "wallpaper.path", path.join(assets, spec.wallpaper));
  const background = configuredAsset(config, "background.path", path.join(assets, spec.background));
  return {
    stickerDataURL: dataUrl(sticker),
    backgroundImageURL: dataUrl(background),
    wallpaperImageURL: dataUrl(wallpaper),
    backgroundAnchoring: config.get("background.anchor") || currentSticker.anchoring,
  };
}

exports.resolveLocalAssets = resolveLocalAssets;
`;
}

function patchVscodeLocalAssets(pluginRoot, themes) {
  fs.writeFileSync(path.join(pluginRoot, "out", "NiniLocalAssets.js"), vscodeLocalAssetsSource(themes));
  const updaterPath = path.join(pluginRoot, "out", "StickerUpdateService.js");
  let source = fs.readFileSync(updaterPath, "utf8");
  source = replaceRequired(
    source,
    'const DokiTheme_1 = require("./DokiTheme");',
    'const DokiTheme_1 = require("./DokiTheme");\nconst NiniLocalAssets_1 = require("./NiniLocalAssets");',
    "el import de DokiTheme en VS Code",
  );
  const attemptMarker = "const _attemptToUpdateSticker = (context, { sticker: currentSticker, theme }, assetUpdater) => __awaiter(void 0, void 0, void 0, function* () {";
  source = replaceRequired(
    source,
    attemptMarker,
    `${attemptMarker}\n    const localAssets = NiniLocalAssets_1.resolveLocalAssets(theme, currentSticker, context);\n    if (localAssets) return localAssets;`,
    "la actualizacion de recursos de VS Code",
  );
  fs.writeFileSync(updaterPath, source);
}

function patchVscodeManifest(pluginRoot, themes) {
  const packagePath = path.join(pluginRoot, "package.json");
  const packageJson = readJson(packagePath);
  packageJson.displayName = "Doki Theme + Nini";
  packageJson.description = "Official Doki Theme runtime extended with Nini custom themes";
  delete packageJson.__metadata;
  packageJson.activationEvents ||= [];
  packageJson.contributes.commands ||= [];
  packageJson.contributes.themes ||= [];
  for (const theme of themes) {
    const [stickerCommand, wallpaperCommand] = vscodeRuntimeDefinition(theme).extensionNames;
    packageJson.activationEvents.push(`onCommand:${stickerCommand}`, `onCommand:${wallpaperCommand}`);
    packageJson.contributes.commands.push(
      { command: stickerCommand, title: `Doki-Theme: Install ${theme.definition.name}'s Sticker` },
      { command: wallpaperCommand, title: `Doki-Theme: Install ${theme.definition.name}'s Wallpaper` },
    );
    packageJson.contributes.themes.push({
      id: theme.definition.id,
      label: `Nini Doki: ${theme.definition.group}: ${theme.definition.displayName}`,
      path: `./generatedThemes/Nini ${theme.slug}.theme.json`,
      uiTheme: theme.definition.dark ? "vs-dark" : "vs",
    });
  }
  writeJson(packagePath, packageJson);
}

function patchVscodeDefinitions(pluginRoot, definitions) {
  for (const relative of ["out/DokiThemeDefinitions.js", "out/cjs/DokiThemeDefinitions.js"]) {
    const file = path.join(pluginRoot, relative);
    if (!fs.existsSync(file)) continue;
    let source = fs.readFileSync(file, "utf8");
    const marker = source.includes("exports.default = [") ? "exports.default = [" : 'exports["default"] = [';
    source = prependVscodeDefinitions(source, marker, definitions, relative);
    fs.writeFileSync(file, source);
  }
  const webBundlePath = path.join(pluginRoot, "out", "web-extension.bundled.js");
  let webBundle = fs.readFileSync(webBundlePath, "utf8");
  webBundle = prependVscodeDefinitions(webBundle, "e.default=[", definitions, "las definiciones web");
  fs.writeFileSync(webBundlePath, webBundle);
}

function buildVscode(themes = validateThemes()) {
  requireRuntimeBases();
  const output = path.join(DIST_DIR, "vscode");
  resetDir(output);
  run("unzip", ["-q", path.join(ROOT, "vendor", "vscode-base.vsix"), "-d", output]);
  const pluginRoot = path.join(output, "extension");
  const assetsDir = path.join(pluginRoot, "assets", "nini");
  fs.mkdirSync(assetsDir, { recursive: true });
  const definitions = themes.map(vscodeRuntimeDefinition);
  for (const theme of themes) {
    writeJson(
      path.join(pluginRoot, "generatedThemes", `Nini ${theme.slug}.theme.json`),
      vscodeThemeDocument(theme),
    );
    const sticker = fs.readFileSync(path.join(theme.directory, "sticker.png"));
    const wallpaper = fs.readFileSync(path.join(theme.directory, "wallpaper.png"));
    fs.writeFileSync(path.join(assetsDir, `${theme.slug}-sticker.png`), sticker);
    fs.writeFileSync(path.join(assetsDir, `${theme.slug}-background.png`), wallpaper);
    fs.writeFileSync(
      path.join(assetsDir, `${theme.slug}-wallpaper.png`),
      pngWithOpacity(wallpaper, theme.definition.backgrounds.default.opacity / 100),
    );
  }
  patchVscodeManifest(pluginRoot, themes);
  patchVscodeDefinitions(pluginRoot, definitions);
  patchVscodeLocalAssets(pluginRoot, themes);

  const vsixManifestPath = path.join(output, "extension.vsixmanifest");
  if (fs.existsSync(vsixManifestPath)) {
    let manifest = fs.readFileSync(vsixManifestPath, "utf8");
    manifest = manifest
      .replace(/<DisplayName>[^<]+<\/DisplayName>/, "<DisplayName>Doki Theme + Nini</DisplayName>")
      .replace(/<Description xml:space="preserve">[^<]+<\/Description>/, '<Description xml:space="preserve">Official Doki Theme runtime extended with Nini custom themes</Description>');
    fs.writeFileSync(vsixManifestPath, manifest);
  }
  const archive = path.join(DIST_DIR, `Nini-Doki-VSCode-${VSCODE_VERSION}.vsix`);
  fs.rmSync(archive, { force: true });
  run("zip", ["-qr", archive, "."], { cwd: output });
  console.log(`VS Code: ${archive}`);
  return { archive, pluginRoot };
}

function patchHyperConfig() {
  const configPath = path.join(os.homedir(), ".hyper.js");
  if (!fs.existsSync(configPath)) {
    console.warn(`No existe ${configPath}; abre Hyper una vez y vuelve a instalar.`);
    return;
  }
  let source = fs.readFileSync(configPath, "utf8");
  if (source.includes('"doki-theme-hyper-nini"') || source.includes("'doki-theme-hyper-nini'")) return;
  const pattern = /localPlugins\s*:\s*\[([^\]]*)\]/m;
  if (!pattern.test(source)) throw new Error(`No encontre localPlugins en ${configPath}`);
  source = source.replace(pattern, (whole, entries) => {
    const separator = entries.trim() ? `${entries.trimEnd()}, ` : "";
    return `localPlugins: [${separator}"doki-theme-hyper-nini"]`;
  });
  fs.writeFileSync(configPath, source);
}

function installHyper(themes) {
  const { pluginRoot } = buildHyper(themes);
  const target = path.join(os.homedir(), ".hyper_plugins", "local", "doki-theme-hyper-nini");
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(pluginRoot, target, { recursive: true });
  patchHyperConfig();
  console.log(`Hyper instalado en ${target}`);
}

function ideaInstallTarget(explicitTarget) {
  if (explicitTarget) return path.resolve(explicitTarget);
  const root = path.join(os.homedir(), ".local", "share", "JetBrains");
  const candidates = fs.existsSync(root)
    ? fs.readdirSync(root)
        .filter((name) => /^IntelliJIdea\d/.test(name))
        .sort()
        .reverse()
    : [];
  if (!candidates.length) {
    throw new Error("No encontre IntelliJ IDEA. Usa: npm run install:idea -- --target /ruta/plugins/doki-theme-jetbrains");
  }
  return path.join(root, candidates[0], "doki-theme-jetbrains");
}

function installIdea(themes, explicitTarget) {
  const { pluginRoot } = buildIdea(themes);
  const target = ideaInstallTarget(explicitTarget);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(pluginRoot, target, { recursive: true });
  console.log(`JetBrains instalado en ${target}`);
  console.log("Reinicia IDEA para cargar el plugin generado.");
}

function installVscode(themes) {
  const { archive } = buildVscode(themes);
  run("code", ["--install-extension", archive, "--force"]);
  console.log("VS Code instalado. Recarga la ventana para activar los temas Nini.");
}

function optionsFrom(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    if (!args[index].startsWith("--")) continue;
    const key = args[index].slice(2);
    options[key] = args[index + 1] && !args[index + 1].startsWith("--") ? args[++index] : true;
  }
  return options;
}

async function promptMissing(options) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (key, label, fallback) => {
    if (options[key]) return options[key];
    const answer = (await terminal.question(`${label}${fallback ? ` [${fallback}]` : ""}: `)).trim();
    return answer || fallback;
  };
  try {
    options.from = await ask("from", "Tema base", "angela-aspirants");
    options.slug = await ask("slug", "Slug nuevo", "mi-tema-dark");
    options.name = await ask("name", "Nombre visible", "Nini: Mi Tema Dark");
    options.display = await ask("display", "Nombre corto", options.name);
    options.group = await ask("group", "Grupo", "Nini Custom");
    options.category = await ask("category", "Categoria interna", "nini_custom");
    options.file = await ask("file", "Nombre de archivo", options.slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase()).replaceAll("-", "_"));
  } finally {
    terminal.close();
  }
  return options;
}

async function createTheme(args) {
  const options = await promptMissing(optionsFrom(args));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug)) throw new Error("El slug solo admite minusculas, numeros y guiones");
  const target = path.join(THEMES_DIR, options.slug);
  if (fs.existsSync(target)) throw new Error(`Ya existe ${options.slug}`);
  const base = listThemes().find((theme) => theme.slug === options.from);
  if (!base) throw new Error(`No existe el tema base ${options.from}`);

  fs.mkdirSync(target, { recursive: true });
  fs.copyFileSync(path.join(base.directory, "sticker.png"), path.join(target, "sticker.png"));
  fs.copyFileSync(path.join(base.directory, "wallpaper.png"), path.join(target, "wallpaper.png"));
  let editor = fs.readFileSync(path.join(base.directory, "editor.xml"), "utf8");
  editor = editor.replace(/<scheme name="[^"]+"/, `<scheme name="${options.name.replaceAll('"', "")}"`);
  fs.writeFileSync(path.join(target, "editor.xml"), editor);

  const config = {
    category: options.category,
    fileName: options.file,
    stickerInstallPath: `stickers/nini/${options.slug}/${options.slug}.png`,
    wallpaperName: `${options.slug.replaceAll("-", "_")}.png`,
  };
  const definition = structuredClone(base.definition);
  definition.id = randomUUID();
  definition.name = options.name;
  definition.displayName = options.display;
  definition.group = options.group;
  definition.editorScheme = `/doki/themes/${config.category}/${config.fileName}.xml`;
  definition.stickers.default = `/nini/${options.slug}/${options.slug}.png`;
  definition.backgrounds.default.name = config.wallpaperName;
  writeJson(path.join(target, "theme.config.json"), config);
  writeJson(path.join(target, "definition.json"), definition);
  syncOfficial(validateThemes(), true);
  console.log(`Creado ${target}`);
  console.log("Reemplaza sticker.png y wallpaper.png, ajusta definition.json/editor.xml y ejecuta npm run build.");
}

function compileInstaller() {
  const ideaHome = path.join(os.homedir(), ".local", "share", "JetBrains", "Toolbox", "apps", "intellij-idea-ultimate");
  const javac = path.join(ideaHome, "jbr", "bin", "javac");
  const classpath = [
    path.join(ideaHome, "lib", "util-8.jar"),
    path.join(ideaHome, "lib", "util.jar"),
    path.join(ideaHome, "lib", "annotations.jar"),
    path.join(ideaHome, "plugins", "Kotlin", "kotlinc.ide", "lib", "kotlin-stdlib.jar"),
    path.join(ROOT, "vendor", "jetbrains-base.zip"),
  ];
  if (!fs.existsSync(javac)) throw new Error(`No encontre ${javac}`);
  const temp = path.join(DIST_DIR, ".compile-installer");
  resetDir(temp);
  run("unzip", ["-q", path.join(ROOT, "vendor", "jetbrains-base.zip"), `doki-theme-jetbrains/lib/${IDEA_JAR}`, "-d", temp]);
  classpath[classpath.length - 1] = path.join(temp, "doki-theme-jetbrains", "lib", IDEA_JAR);
  const output = path.join(ROOT, "runtime", "classes");
  resetDir(output);
  run(javac, ["--release", "21", "-cp", classpath.join(path.delimiter), "-d", output, path.join(ROOT, "runtime", "NiniAssetInstaller.java")]);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Instalador generico recompilado.");
}

function exportPortable(themes) {
  const idea = buildIdea(themes);
  const hyper = buildHyper(themes);
  const vscode = buildVscode(themes);
  const backups = path.resolve(ROOT, "..", "backups");
  fs.mkdirSync(backups, { recursive: true });
  const portable = path.join(backups, "Nini-Doki-Themes-portable.zip");
  fs.rmSync(portable, { force: true });
  run("zip", [
    "-qr", portable,
    "package.json", ".gitignore", "README.md", "OFFICIAL-WORKFLOW.md",
    "CONTRIBUTING.md", "CUSTOM_THEMES.md", "ASSET-NOTICE.md",
    "THIRD_PARTY_NOTICES.md", "LICENSE", "upstream.lock.json",
    "runtime", "scripts", "src", "official", "vendor",
  ]);
  for (const archive of [idea.archive, hyper.archive, vscode.archive]) {
    fs.copyFileSync(archive, path.join(backups, path.basename(archive)));
  }
  console.log(`Proyecto portable: ${portable}`);
}

function usage() {
  console.log(`Nini Doki Themes

  npm run bootstrap
  npm run list
  npm run validate
  npm run sync:official
  npm run upstream:prepare
  npm run build
  npm run install:hyper
  npm run install:idea -- [--target /ruta/doki-theme-jetbrains]
  npm run install:vscode
  npm run new-theme
  npm run export`);
}

const [command = "help", target, ...rest] = process.argv.slice(2);
try {
  const themes = command === "new" || command === "help" ? null : validateThemes();
  if (command === "bootstrap") {
    bootstrapRuntime();
  } else if (command === "list") {
    for (const theme of themes) console.log(`${theme.slug}\t${theme.definition.name}\t${theme.definition.id}`);
  } else if (command === "validate") {
    console.log(`${themes.length} temas validos.`);
  } else if (command === "sync-official") {
    syncOfficial(themes);
  } else if (command === "upstream-bootstrap") {
    bootstrapUpstream();
  } else if (command === "upstream-prepare") {
    prepareUpstream(themes);
  } else if (command === "build") {
    if (!target || target === "all") {
      buildIdea(themes);
      buildHyper(themes);
      buildVscode(themes);
    } else if (target === "idea") buildIdea(themes);
    else if (target === "hyper") buildHyper(themes);
    else if (target === "vscode") buildVscode(themes);
    else throw new Error(`Destino desconocido: ${target}`);
  } else if (command === "install") {
    const options = optionsFrom(rest);
    if (target === "idea") installIdea(themes, options.target);
    else if (target === "hyper") installHyper(themes);
    else if (target === "vscode") installVscode(themes);
    else throw new Error(`Destino desconocido: ${target}`);
  } else if (command === "new") {
    await createTheme([target, ...rest].filter(Boolean));
  } else if (command === "export") {
    exportPortable(themes);
  } else if (command === "compile-installer") {
    compileInstaller();
  } else {
    usage();
  }
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
