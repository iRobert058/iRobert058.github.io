import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pick, esc, lookup, isCurrent, periodLabel, groupTimeline, assignInterludes, skillGroups, softSkills, currentRoles,
  langFromSearch, withLang, cueIndex, timecode, logLineStates, projectLinkKey, storyParagraphs,
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

test("periodLabel and isCurrent", () => {
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

test("langFromSearch: English only for ?lang=en, Dutch otherwise", () => {
  assert.equal(langFromSearch("?lang=en"), "en");
  assert.equal(langFromSearch("?x=1&lang=en"), "en");
  assert.equal(langFromSearch("?lang=de"), "nl");
  assert.equal(langFromSearch(""), "nl");
  assert.equal(langFromSearch(undefined), "nl");
});

test("withLang adds or removes ?lang=en on internal links and leaves the rest alone", () => {
  assert.equal(withLang("privacy.html", "en"), "privacy.html?lang=en");
  assert.equal(withLang("privacy.html?lang=en", "nl"), "privacy.html");
  assert.equal(withLang("projecten/thesis/", "en"), "projecten/thesis/?lang=en");
  assert.equal(withLang("./#projecten", "en"), "./?lang=en#projecten");
  assert.equal(withLang("/?a=1", "en"), "/?a=1&lang=en");
  assert.equal(withLang("#contact", "en"), "#contact");
  assert.equal(withLang("https://github.com/x", "en"), "https://github.com/x");
  assert.equal(withLang("mailto:x@example.com", "en"), "mailto:x@example.com");
});

test("cueIndex finds the cue that has started, -1 before the first", () => {
  const cues = [{ at: 0.5 }, { at: 2.5 }, { at: 4.5 }];
  assert.equal(cueIndex(cues, 0), -1);
  assert.equal(cueIndex(cues, 0.5), 0);
  assert.equal(cueIndex(cues, 3), 1);
  assert.equal(cueIndex(cues, 99), 2);
  assert.equal(cueIndex(undefined, 3), -1);
});

test("logLineStates: the whole log reads as done before playback and after the end", () => {
  const cues = [{ at: 0.25 }, { at: 0.75 }, { at: 2 }, { at: 2.3 }];
  const all = cues.map(() => ({ done: true, now: false }));
  assert.deepEqual(logLineStates(cues, { started: false, ended: false, time: 0 }), all); // poster / reduced motion
  assert.deepEqual(logLineStates(cues, { started: true, ended: true, time: 5 }), all);
});

test("logLineStates: while playing, earlier lines are done and the reached line is current", () => {
  const cues = [{ at: 0.25 }, { at: 0.75 }, { at: 2 }];
  assert.deepEqual(logLineStates(cues, { started: true, ended: false, time: 1 }), [
    { done: true, now: false }, { done: false, now: true }, { done: false, now: false },
  ]);
  assert.deepEqual(logLineStates(cues, { started: true, ended: false, time: 0 }).map((l) => l.now), [false, false, false]);
  assert.deepEqual(logLineStates(undefined, { started: false, ended: false, time: 0 }), []);
});

test("timecode formats seconds as mm:ss.t", () => {
  assert.equal(timecode(0.25), "00:00.3");
  assert.equal(timecode(2.3), "00:02.3");
  assert.equal(timecode(75), "01:15.0");
  assert.equal(timecode(-1), "00:00.0");
  assert.equal(timecode("x"), "00:00.0");
});

test("projectLinkKey: 'read more' only when there is a story", () => {
  assert.equal(projectLinkKey({}, "nl"), "project_page");
  assert.equal(projectLinkKey({ story: "" }, "nl"), "project_page");
  assert.equal(projectLinkKey({ story: { nl: ["Alinea"] } }, "en"), "read_more"); // falls back to Dutch
  assert.equal(projectLinkKey({ story: { nl: ["  "] } }, "nl"), "project_page");
  assert.equal(projectLinkKey({ story: "Plain text" }, "nl"), "read_more");
});

test("storyParagraphs returns the story per language as paragraphs", () => {
  assert.deepEqual(storyParagraphs({ story: { nl: ["A", " ", "B"], en: "C" } }, "nl"), ["A", "B"]);
  assert.deepEqual(storyParagraphs({ story: { nl: ["A"], en: "C" } }, "en"), ["C"]);
  assert.deepEqual(storyParagraphs({}, "nl"), []);
});
