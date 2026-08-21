#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function rgb(value, key) {
  if (typeof value !== "string" || !/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(value)) {
    throw new Error(`${key} must be #RRGGBB or #RRGGBBAA`);
  }
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function luminance(value, key) {
  return rgb(value, key)
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(left, right, leftKey, rightKey) {
  const leftLuminance = luminance(left, leftKey);
  const rightLuminance = luminance(right, rightKey);
  return (Math.max(leftLuminance, rightLuminance) + 0.05) / (Math.min(leftLuminance, rightLuminance) + 0.05);
}

const args = process.argv.slice(2);
const definitionIndex = args.indexOf("--definition");
const definitionPath = definitionIndex >= 0 ? args[definitionIndex + 1] : null;
if (!definitionPath) fail("Usage: audit-palette.mjs --definition src/themes/<slug>/definition.json");

const absoluteDefinition = path.resolve(definitionPath);
if (!fs.existsSync(absoluteDefinition)) fail(`Missing ${absoluteDefinition}`);
const definition = JSON.parse(fs.readFileSync(absoluteDefinition, "utf8"));
const colors = definition.colors || {};
const checks = [
  ["foregroundColor", "baseBackground", 4.5],
  ["foregroundColorEditor", "textEditorBackground", 4.5],
  ["buttonFont", "buttonColor", 4.5],
  ["selectionForeground", "selectionBackground", 4.5],
  ["comments", "textEditorBackground", 3],
  ["lineNumberColor", "textEditorBackground", 3],
  ["accentColor", "baseBackground", 3],
];
const results = [];
const errors = [];

for (const [foreground, background, minimum] of checks) {
  try {
    const ratio = contrast(colors[foreground], colors[background], foreground, background);
    const pass = ratio >= minimum;
    results.push({ foreground, background, ratio: Number(ratio.toFixed(2)), minimum, pass });
    if (!pass) errors.push(`${foreground}/${background} contrast ${ratio.toFixed(2)} is below ${minimum}`);
  } catch (error) {
    errors.push(error.message);
  }
}

const accent = typeof colors.accentColor === "string" ? colors.accentColor.slice(0, 7) : "";
for (const [key, suffix] of [
  ["accentColorLessTransparent", "9A"],
  ["accentColorMoreTransparent", "2A"],
  ["accentColorTransparent", "5A"],
]) {
  const expected = `${accent}${suffix}`.toLowerCase();
  if (String(colors[key] || "").toLowerCase() !== expected) errors.push(`${key} must be ${expected}`);
}

console.log(JSON.stringify({ definition: absoluteDefinition, pass: errors.length === 0, checks: results, errors }, null, 2));
if (errors.length) process.exitCode = 1;
