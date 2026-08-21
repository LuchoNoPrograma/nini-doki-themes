#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const args = process.argv.slice(2);
let outputDirectory;
let force = false;
const requestedReferences = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--output-dir") outputDirectory = args[++index];
  else if (args[index] === "--reference") requestedReferences.push(args[++index]);
  else if (args[index] === "--force") force = true;
}

if (!outputDirectory || !requestedReferences.length || requestedReferences.some((value) => !value)) {
  fail("Usage: capture-references.mjs --output-dir <directory> --reference <role=path> [--reference <role=path> ...] [--force]");
}

const references = requestedReferences.map((value, index) => {
  const separator = value.indexOf("=");
  if (separator < 1) fail(`Reference ${index + 1} must use role=path`);
  const role = value.slice(0, separator).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const source = path.resolve(value.slice(separator + 1));
  if (!role || !fs.existsSync(source) || !fs.statSync(source).isFile()) {
    fail(`Invalid reference ${index + 1}: ${value}`);
  }
  const extension = path.extname(source).toLowerCase() || ".img";
  return {
    role,
    source,
    file: `${String(index + 1).padStart(2, "0")}-${role}${extension}`,
  };
});

const target = path.resolve(outputDirectory);
const parent = path.dirname(target);
fs.mkdirSync(parent, { recursive: true });
const staging = fs.mkdtempSync(path.join(parent, ".capture-references-"));
const backup = `${staging}-backup`;
let targetBackedUp = false;

try {
  const manifestReferences = [];
  for (const reference of references) {
    const destination = path.join(staging, reference.file);
    fs.copyFileSync(reference.source, destination);
    manifestReferences.push({
      role: reference.role,
      file: reference.file,
      originalFileName: path.basename(reference.source),
      sha256: sha256(destination),
      bytes: fs.statSync(destination).size,
    });
  }
  fs.writeFileSync(path.join(staging, "manifest.json"), `${JSON.stringify({ version: 1, references: manifestReferences }, null, 2)}\n`);

  if (fs.existsSync(target)) {
    if (!force) throw new Error(`Refusing to replace ${target}; pass --force when replacement is intended`);
    fs.renameSync(target, backup);
    targetBackedUp = true;
  }
  fs.renameSync(staging, target);
  if (targetBackedUp) fs.rmSync(backup, { recursive: true, force: true });
  console.log(JSON.stringify({ directory: target, manifest: path.join(target, "manifest.json"), references: manifestReferences }, null, 2));
} catch (error) {
  if (!fs.existsSync(target) && targetBackedUp && fs.existsSync(backup)) fs.renameSync(backup, target);
  console.error(error.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
  fs.rmSync(backup, { recursive: true, force: true });
}
