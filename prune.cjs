const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve("src");
const exts = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const importPattern =
  /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;
const alwaysKeep = new Set(["lib/utils.ts"]);
const held = { "lib/quiz-categories.ts": "the seed script will need it" };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const rel = (file) => path.relative(root, file).split(path.sep).join("/");
const isLib = (r) => r.startsWith("lib/");
const isUi = (r) => r.startsWith("components/ui/");

const files = walk(root).filter((file) => exts.includes(path.extname(file)));
const known = new Set(files);

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, spec.slice(2));
  else if (spec === "cn") base = path.join(root, "lib", "utils");
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;

  const candidates = [
    base,
    ...exts.map((ext) => base + ext),
    ...exts.map((ext) => path.join(base, "index" + ext)),
  ];
  return candidates.find((candidate) => known.has(candidate)) ?? null;
}

const imports = new Map();
const importers = new Map();

for (const file of files) {
  const targets = new Set();
  for (const match of fs.readFileSync(file, "utf8").matchAll(importPattern)) {
    const target = resolveImport(file, match[1]);
    if (target && target !== file) targets.add(target);
  }
  imports.set(file, targets);
  for (const target of targets) {
    if (!importers.has(target)) importers.set(target, new Set());
    importers.get(target).add(file);
  }
}

const entries = files.filter((file) => {
  const r = rel(file);
  return (
    r.startsWith("app/") ||
    r === "proxy.ts" ||
    r === "middleware.ts" ||
    r === "instrumentation.ts"
  );
});

const reached = new Set(entries);
const queue = [...entries];
while (queue.length) {
  for (const target of imports.get(queue.pop())) {
    if (!reached.has(target)) {
      reached.add(target);
      queue.push(target);
    }
  }
}

const unused = files.filter((file) => !reached.has(file));

const deletable = new Set(
  unused.filter((file) => {
    const r = rel(file);
    return (isLib(r) || isUi(r)) && !alwaysKeep.has(r) && !(r in held);
  }),
);

// A file is only safe to delete if everything importing it is going too.
const blocked = new Map();
let changed = true;
while (changed) {
  changed = false;
  for (const file of [...deletable]) {
    const outside = [...(importers.get(file) ?? [])].filter(
      (importer) => !deletable.has(importer),
    );
    if (outside.length > 0) {
      deletable.delete(file);
      blocked.set(file, outside);
      changed = true;
    }
  }
}

function list(title, items) {
  console.log(`\n${title} (${items.length})`);
  items.forEach((item) => console.log("  " + item));
}

const sorted = (items, test) => [...items].map(rel).filter(test).sort();

list("Safe to delete in src/lib", sorted(deletable, isLib));
list("Safe to delete in src/components/ui", sorted(deletable, isUi));

console.log("\nHeld back");
for (const [file, by] of blocked) {
  console.log(`  ${rel(file)}  <-  ${by.map(rel).join(", ")}`);
}
for (const [name, why] of Object.entries(held)) {
  if (fs.existsSync(path.join(root, name))) console.log(`  ${name}  (${why})`);
}

list(
  "Other files nothing reaches (never touched by this script)",
  unused
    .map(rel)
    .filter((r) => !isLib(r) && !isUi(r))
    .sort(),
);

const mode = process.env.DELETE;
if (mode === "lib" || mode === "ui") {
  const pick = mode === "lib" ? isLib : isUi;
  const victims = [...deletable].filter((file) => pick(rel(file)));
  for (const file of victims) fs.rmSync(file);
  console.log(`\nDeleted ${victims.length} files from the ${mode} folder.`);
} else {
  console.log("\nDry run. Nothing was deleted.");
}
