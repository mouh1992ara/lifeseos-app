// Assembles messages/<locale>.json from messages/parts/<locale>/*.json.
// Run: node scripts/build-messages.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const partsDir = path.join(root, "messages", "parts");
const locales = ["en", "ar", "fr", "zh"];

function deepMerge(target, source, file) {
  for (const [key, value] of Object.entries(source)) {
    if (key in target && typeof target[key] !== typeof value) {
      throw new Error(
        `Type clash for "${key}" while merging ${file}: ` +
          `${typeof target[key]} vs ${typeof value}`,
      );
    }
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      deepMerge(target[key], value, file);
    } else if (key in target) {
      throw new Error(`Duplicate key "${key}" in ${file}`);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function flatten(tree, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

let enKeys = null;
const problems = [];

for (const locale of locales) {
  const dir = path.join(partsDir, locale);
  if (!fs.existsSync(dir)) {
    problems.push(`missing parts directory for ${locale}`);
    continue;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const merged = {};
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    deepMerge(merged, data, `${locale}/${file}`);
  }
  const outPath = path.join(root, "messages", `${locale}.json`);
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");

  const flat = flatten(merged);
  const sorted = Object.keys(flat).sort();
  console.log(
    `${locale}: ${files.length} parts, ${sorted.length} keys -> messages/${locale}.json`,
  );

  if (locale === "en") {
    enKeys = new Set(sorted);
  } else if (enKeys) {
    const missing = [...enKeys].filter((k) => !(k in flat));
    const extra = sorted.filter((k) => !enKeys.has(k));
    if (missing.length) problems.push(`${locale} missing: ${missing.join(", ")}`);
    if (extra.length) problems.push(`${locale} extra: ${extra.join(", ")}`);
  }
}

if (problems.length) {
  console.error("\nCatalog parity problems:");
  for (const p of problems) console.error(" - " + p);
  process.exitCode = 1;
} else {
  console.log("\nAll locales are in parity.");
}