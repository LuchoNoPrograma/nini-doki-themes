#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { inflateSync } from "node:zlib";

function optionsFrom(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith("--")) continue;
    const key = argument.slice(2);
    const value = args[index + 1];
    options[key] = value && !value.startsWith("--") ? args[++index] : true;
  }
  return options;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runFfmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
}

function normalizeRgb(value, option) {
  const match = String(value || "").match(/^#?([0-9a-f]{6})$/i);
  if (!match) throw new Error(`${option} must be a 6-digit RGB hex color`);
  return match[1].toLowerCase();
}

function validateStickerTransparency(info, label, expectedSize) {
  const pixelCount = info.width * info.height;
  if (
    (expectedSize && (info.width !== expectedSize || info.height !== expectedSize))
    || info.transparentPixels < pixelCount * 0.05
    || info.opaquePixels === 0
    || info.transparentCorners !== 4
  ) {
    const sizeRequirement = expectedSize ? ` at exactly ${expectedSize}x${expectedSize}` : "";
    throw new Error(`${label} must contain visible artwork and genuine background transparency${sizeRequirement}`);
  }
}

function commitOutputs(staged, outputs, force, stagingDirectory) {
  const entries = Object.keys(outputs).map((key) => ({ key, source: staged[key], target: outputs[key] }));
  const existing = entries.filter(({ target }) => fs.existsSync(target));
  if (existing.length && !force) {
    throw new Error(`Refusing to overwrite: ${existing.map(({ target }) => target).join(", ")}. Pass --force when replacement is intended.`);
  }

  const backupDirectory = path.join(stagingDirectory, "backup");
  fs.mkdirSync(backupDirectory);
  const backups = [];
  const installed = [];
  try {
    for (const { key, target } of existing) {
      const backup = path.join(backupDirectory, key);
      fs.renameSync(target, backup);
      backups.push({ backup, target });
    }
    for (const { source, target } of entries) {
      fs.renameSync(source, target);
      installed.push(target);
    }
  } catch (error) {
    for (const target of installed.reverse()) fs.rmSync(target, { force: true });
    for (const { backup, target } of backups.reverse()) {
      if (fs.existsSync(backup)) fs.renameSync(backup, target);
    }
    throw error;
  }
}

function pngTransparency(file) {
  const source = fs.readFileSync(file);
  if (source.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${file} is not a PNG`);
  }

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];
  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.subarray(offset + 4, offset + 8).toString("ascii");
    const data = source.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    }
    offset += length + 12;
    if (type === "IEND") break;
  }

  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0 || !idat.length) {
    throw new Error(`${file} must be an 8-bit, non-interlaced RGBA PNG`);
  }

  const channels = 4;
  const stride = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  let previous = Buffer.alloc(stride);
  let transparentPixels = 0;
  let opaquePixels = 0;
  let transparentCorners = 0;
  for (let row = 0; row < height; row += 1) {
    const rowOffset = row * (stride + 1);
    const filter = inflated[rowOffset];
    const reconstructed = Buffer.alloc(stride);
    for (let index = 0; index < stride; index += 1) {
      const encoded = inflated[rowOffset + 1 + index];
      const left = index >= channels ? reconstructed[index - channels] : 0;
      const above = previous[index];
      const upperLeft = index >= channels ? previous[index - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) {
        const estimate = left + above - upperLeft;
        const leftDistance = Math.abs(estimate - left);
        const aboveDistance = Math.abs(estimate - above);
        const upperLeftDistance = Math.abs(estimate - upperLeft);
        predictor = leftDistance <= aboveDistance && leftDistance <= upperLeftDistance
          ? left
          : aboveDistance <= upperLeftDistance ? above : upperLeft;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter}`);
      }
      reconstructed[index] = (encoded + predictor) & 0xff;
    }
    for (let alpha = 3; alpha < stride; alpha += 4) {
      if (reconstructed[alpha] < 255) transparentPixels += 1;
      if (reconstructed[alpha] > 0) opaquePixels += 1;
    }
    if (row === 0 || row === height - 1) {
      if (reconstructed[3] < 16) transparentCorners += 1;
      if (reconstructed[(width - 1) * 4 + 3] < 16) transparentCorners += 1;
    }
    previous = reconstructed;
  }

  return { width, height, transparentPixels, opaquePixels, transparentCorners };
}

const options = optionsFrom(process.argv.slice(2));
const wallpaperOptions = [options.wallpaper, options["wallpaper-color"]].filter(Boolean);
if (wallpaperOptions.length !== 1 || !options.sticker || !options["output-dir"]) {
  fail("Usage: prepare-assets.mjs (--wallpaper <image> | --wallpaper-color <#rrggbb>) --sticker <png> --output-dir <directory> [--force]");
}
if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  fail("ffmpeg is required to normalize theme assets");
}

const wallpaperInput = options.wallpaper ? path.resolve(options.wallpaper) : undefined;
let wallpaperColor;
try {
  wallpaperColor = options["wallpaper-color"] ? normalizeRgb(options["wallpaper-color"], "--wallpaper-color") : undefined;
} catch (error) {
  fail(error.message);
}
const stickerInput = path.resolve(options.sticker);
const outputDir = path.resolve(options["output-dir"]);
for (const input of [wallpaperInput, stickerInput].filter(Boolean)) {
  if (!fs.existsSync(input)) fail(`Missing input: ${input}`);
}

fs.mkdirSync(outputDir, { recursive: true });
const outputs = {
  wallpaperJpg: path.join(outputDir, "wallpaper.jpg"),
  wallpaperPng: path.join(outputDir, "wallpaper.png"),
  stickerPng: path.join(outputDir, "sticker.png"),
};

let sourceTransparency;
try {
  sourceTransparency = pngTransparency(stickerInput);
  validateStickerTransparency(sourceTransparency, "Sticker source");
} catch (error) {
  fail(error.message);
}

const stagingDirectory = fs.mkdtempSync(path.join(outputDir, ".prepare-assets-"));
const staged = {
  wallpaperJpg: path.join(stagingDirectory, "wallpaper.jpg"),
  wallpaperPng: path.join(stagingDirectory, "wallpaper.png"),
  stickerPng: path.join(stagingDirectory, "sticker.png"),
};

try {
  if (wallpaperColor) {
    const [red, green, blue] = wallpaperColor.match(/../g).map((channel) => Number.parseInt(channel, 16));
    const flatSource = `nullsrc=s=1920x1080:r=1,format=rgb24,geq=r=${red}:g=${green}:b=${blue}`;
    runFfmpeg([
      "-y", "-f", "lavfi", "-i", flatSource,
      "-vf", "format=rgb24", "-frames:v", "1", "-q:v", "2", staged.wallpaperJpg,
    ]);
    runFfmpeg([
      "-y", "-f", "lavfi", "-i", flatSource,
      "-vf", "format=rgb24", "-frames:v", "1", "-compression_level", "9", staged.wallpaperPng,
    ]);
  } else if (wallpaperInput === outputs.wallpaperJpg) {
    fs.copyFileSync(wallpaperInput, staged.wallpaperJpg);
  } else {
    runFfmpeg([
      "-y", "-i", wallpaperInput,
      "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=rgb24",
      "-frames:v", "1", "-q:v", "2", staged.wallpaperJpg,
    ]);
  }
  if (!wallpaperColor) {
    runFfmpeg([
      "-y", "-i", staged.wallpaperJpg,
      "-vf", "format=rgb24", "-frames:v", "1", "-compression_level", "9", staged.wallpaperPng,
    ]);
  }
  if (sourceTransparency.width === 700 && sourceTransparency.height === 700) {
    fs.copyFileSync(stickerInput, staged.stickerPng);
  } else {
    runFfmpeg([
      "-y", "-i", stickerInput,
      "-vf", "scale=644:644:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=700:700:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba",
      "-frames:v", "1", staged.stickerPng,
    ]);
  }

  const transparency = pngTransparency(staged.stickerPng);
  validateStickerTransparency(transparency, "Sticker output", 700);
  commitOutputs(staged, outputs, Boolean(options.force), stagingDirectory);

  console.log(JSON.stringify({
    ...outputs,
    wallpaperSource: wallpaperColor ? { type: "flat-color", color: `#${wallpaperColor}`, opacity: 100 } : { type: "image", path: wallpaperInput },
    sourceSticker: sourceTransparency,
    sticker: transparency,
    note: "wallpaper.png is the repository compatibility copy; wallpaper.jpg and the 700x700 sticker.png are the source deliverables.",
  }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(stagingDirectory, { recursive: true, force: true });
}
