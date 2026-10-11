import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// No content may get lost in the V3.0 redesign: every string value that was in the JSON on main at V2.1
// (snapshotted in fixtures/v2.1-strings.json) must still be a string value somewhere in today's JSON.
const root = new URL("../", import.meta.url);
const baseline = JSON.parse(readFileSync(new URL("tests/fixtures/v2.1-strings.json", root), "utf8")).strings;

const current = new Set();
const collect = (value) => {
  if (typeof value === "string") current.add(value);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
for (const dir of ["data", "content"]) {
  for (const file of readdirSync(new URL(dir, root)).filter((f) => f.endsWith(".json"))) {
    collect(JSON.parse(readFileSync(new URL(`${dir}/${file}`, root), "utf8")));
  }
}

// Strings that were retired on purpose, each with the reason. Anything else that disappears fails the test.
const retired = new Map([
  ["assets/img/project-thesis.svg", "V3.0: the thesis illustration was replaced (the old file stays in assets/img/)"],
  ["Screenshot van de experimentomgeving", "V3.0: alt text of the replaced thesis illustration"],
  ["Screenshot of the experiment environment", "V3.0: alt text of the replaced thesis illustration"],
]);

test("every V2.1 content string still exists in the JSON", () => {
  const missing = baseline.filter((s) => !current.has(s) && !retired.has(s));
  assert.deepEqual(missing, [], `${missing.length} string(s) from V2.1 are gone`);
});

test("retired strings really were in the V2.1 snapshot", () => {
  for (const s of retired.keys()) assert.ok(baseline.includes(s), `not in the snapshot: ${s}`);
});

test("the baseline snapshot is not empty", () => {
  assert.ok(baseline.length > 300, `only ${baseline.length} strings in the snapshot`);
});
