import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const jsonFiles = ["data", "content"].flatMap((dir) =>
  readdirSync(new URL(dir, root)).filter((f) => f.endsWith(".json")).map((f) => `${dir}/${f}`)
);

test("every JSON file parses", () => {
  for (const file of jsonFiles) assert.doesNotThrow(() => read(file), file);
});

// All key paths of an object, arrays indexed: { a: { b: [x] } } → ["a", "a.b", "a.b.0"]
const keyPaths = (obj, prefix = "") =>
  obj && typeof obj === "object"
    ? Object.entries(obj).flatMap(([k, v]) => [prefix + k, ...keyPaths(v, `${prefix}${k}.`)])
    : [];

test("content/nl.json and content/en.json have identical keys", () => {
  assert.deepEqual(keyPaths(read("content/en.json")).sort(), keyPaths(read("content/nl.json")).sort());
});

test("projects have the fields rendering depends on", () => {
  for (const p of read("data/projects.json")) {
    assert.ok(Array.isArray(p.tech), `${p.id}: tech`);
    assert.ok(p.cta?.url && p.cta?.label, `${p.id}: cta`);
    if (p.image) assert.ok(p.imageAlt, `${p.id}: imageAlt`);
  }
});

test("timeline kinds all have a label in both languages", () => {
  const kinds = new Set(read("data/timeline.json").map((i) => i.kind));
  for (const lang of ["nl", "en"]) {
    for (const kind of kinds) assert.ok(read(`content/${lang}.json`).experience.kinds[kind], `${lang}: ${kind}`);
  }
});

test("terminology: deceptive patterns, never dark patterns", () => {
  for (const file of jsonFiles) assert.doesNotMatch(readFileSync(new URL(file, root), "utf8"), /dark pattern/i, file);
});

test("every project `page` exists and renders that project", () => {
  for (const p of read("data/projects.json").filter((p) => p.page)) {
    const html = readFileSync(new URL(`${p.page}index.html`, root), "utf8");
    assert.match(html, new RegExp(`data-project="${p.id}"`), p.page);
    assert.match(html, /<base href="\/">/, `${p.page}: base`);
  }
});
