import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pick, esc, lookup, pad2, isCurrent, periodLabel, groupTimeline, assignInterludes, skillGroups, softSkills, currentRoles,
} from "../assets/js/logic.mjs";

test("pick returns the language, falls back to nl, passes plain strings through", () => {
  assert.equal(pick({ nl: "Hallo", en: "Hello" }, "en"), "Hello");
  assert.equal(pick({ nl: "Hallo" }, "en"), "Hallo");
  assert.equal(pick("Swift", "en"), "Swift");
  assert.equal(pick(undefined, "en"), undefined);
});

test("esc escapes markup characters", () => {
  assert.equal(esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  assert.equal(esc(null), "");
});

test("lookup resolves dotted keys and returns undefined for missing ones", () => {
  const s = { hero: { title: "T" } };
  assert.equal(lookup(s, "hero.title"), "T");
  assert.equal(lookup(s, "hero.nope.deeper"), undefined);
});

test("pad2 and periodLabel", () => {
  assert.equal(pad2(3), "03");
  assert.equal(pad2(12), "12");
  assert.equal(periodLabel({ from: "2024", to: "2025" }, "heden"), "2024 – 2025");
  assert.equal(periodLabel({ from: "2026", to: "present" }, "heden"), "2026 – heden");
  assert.equal(periodLabel({ from: "2025", to: "2025" }, "heden"), "2025");
  assert.equal(isCurrent({ from: "2026", to: "present" }), true);
  assert.equal(isCurrent({ from: "2024", to: "2025" }), false);
});

const job = (title, from, to, group) => ({ title, period: { from, to }, kind: "work", org: "Org", ...(group && { group }) });

test("groupTimeline leaves ungrouped items alone and in order", () => {
  const items = [job("A", "2026", "present"), job("B", "2020", "2021")];
  assert.deepEqual(groupTimeline(items), items.map((item) => ({ type: "item", item })));
});

test("groupTimeline merges a group at its first position, steps oldest first", () => {
  const items = [
    job("Senior", "2026", "present", "amac"),
    job("Study", "2026", "present"),
    job("Medior", "2025", "2026", "amac"),
    job("Junior", "2024", "2025", "amac"),
    job("Old", "2019", "2024"),
  ];
  const out = groupTimeline(items);
  assert.equal(out.length, 3);
  assert.equal(out[0].type, "group");
  assert.deepEqual(out[0].steps.map((s) => s.title), ["Junior", "Medior", "Senior"]);
  assert.deepEqual(out[0].period, { from: "2024", to: "present" });
  assert.equal(out[0].current, true);
  assert.equal(out[1].item.title, "Study");
  assert.equal(out[2].item.title, "Old");
});

test("groupTimeline: finished group ends at its latest year; a one-item group is a plain item", () => {
  const out = groupTimeline([job("B", "2021", "2023", "g"), job("A", "2019", "2021", "g"), job("Solo", "2018", "2019", "h")]);
  assert.deepEqual(out[0].period, { from: "2019", to: "2023" });
  assert.equal(out[0].current, false);
  assert.deepEqual(out[1], { type: "item", item: job("Solo", "2018", "2019", "h") });
});

test("assignInterludes skips empty entries and fills slots in order", () => {
  const empty = [{ src: "", alt: { nl: "", en: "" } }];
  assert.deepEqual(assignInterludes(empty, 2), [null, null]);
  assert.deepEqual(assignInterludes(undefined, 2), [null, null]);
  const a = { src: "a.webp" }, b = { src: "b.webp" }, c = { src: "c.webp" };
  assert.deepEqual(assignInterludes([a, { src: " " }, b, c], 2), [a, b]);
});

test("skillGroups uses groups when present and falls back to the flat tools list", () => {
  const groups = [{ pillar: "research", items: ["Qualtrics"] }];
  assert.deepEqual(skillGroups({ groups, tools: ["x"] }), [{ pillar: "research", items: ["Qualtrics"] }]);
  assert.deepEqual(skillGroups({ tools: ["Git"] }), [{ pillar: null, items: ["Git"] }]);
  assert.deepEqual(skillGroups({}), [{ pillar: null, items: [] }]);
});

test("softSkills uses `soft` and falls back to the bar labels without levels", () => {
  assert.deepEqual(softSkills({ soft: ["Teamwork"] }), ["Teamwork"]);
  assert.deepEqual(softSkills({ bars: [{ label: "Lead", level: 80 }] }), ["Lead"]);
  assert.deepEqual(softSkills({}), []);
});

test("currentRoles keeps only running roles, in file order", () => {
  const items = [job("Senior", "2026", "present", "amac"), job("Old", "2019", "2024"), job("Study", "2026", "present")];
  assert.deepEqual(currentRoles(items).map((i) => i.title), ["Senior", "Study"]);
  assert.deepEqual(currentRoles(undefined), []);
});
