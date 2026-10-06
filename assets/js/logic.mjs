/* =============================================================
   logic.js — pure helpers used by app.js. No DOM access here,
   so everything in this file can be tested with `node --test`.
   ============================================================= */

/** A bilingual field is a plain string or { nl, en }; a missing translation falls back to Dutch. */
export const pick = (value, lang) => (value && typeof value === "object" ? value[lang] ?? value.nl : value);

/** Escape a value for use in innerHTML. Every rendered value goes through this. */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Look up a dotted key ("hero.title") in a nested strings object. */
export const lookup = (strings, key) => key.split(".").reduce((obj, k) => (obj == null ? undefined : obj[k]), strings);

/** True for a period that is still running. */
export const isCurrent = (period) => period?.to === "present";

/** "2024 – 2025", "2026 – heden", or a single year when from === to. */
export function periodLabel(period, presentWord) {
  const to = isCurrent(period) ? presentWord : period.to;
  return period.from === period.to ? String(period.from) : `${period.from} – ${to}`;
}

/**
 * Turn timeline.json into render entries. Items sharing a `group` become one entry at the position of
 * the group's first item (the file is newest first), with its steps ordered oldest → newest so the
 * card reads as a progression. A group with a single item renders as a normal item.
 * Returns [{ type: "item", item } | { type: "group", id, steps, period, current }].
 */
export function groupTimeline(items) {
  const entries = [];
  const groups = new Map();
  for (const item of items) {
    if (!item.group) {
      entries.push({ type: "item", item });
      continue;
    }
    let group = groups.get(item.group);
    if (!group) {
      group = { type: "group", id: item.group, steps: [] };
      groups.set(item.group, group);
      entries.push(group);
    }
    group.steps.push(item);
  }
  return entries.map((entry) => {
    if (entry.type === "item") return entry;
    if (entry.steps.length === 1) return { type: "item", item: entry.steps[0] };
    // The file is newest first, so reversing gives oldest first; the stable sort fixes any other order
    // and keeps that reversed order for steps that start in the same year
    const steps = [...entry.steps].reverse().sort((a, b) => Number(a.period.from) - Number(b.period.from));
    const current = steps.some((s) => isCurrent(s.period));
    const lastTo = Math.max(...steps.map((s) => Number(s.period.to) || 0));
    const period = { from: steps[0].period.from, to: current ? "present" : String(lastTo) };
    return { type: "group", id: entry.id, steps, period, current };
  });
}

/** The roles that are still running ("present"), in file order: the hero's "right now" list. */
export const currentRoles = (items) => (Array.isArray(items) ? items.filter((i) => isCurrent(i.period)) : []);

/**
 * Place photo interludes into the page's fixed slots, in order. Entries without a src are skipped,
 * so the empty placeholder in site.json renders nothing. Entries beyond the number of slots are ignored.
 * Returns an array of length slotCount with an interlude or null per slot.
 */
export function assignInterludes(interludes, slotCount) {
  const usable = (Array.isArray(interludes) ? interludes : []).filter(
    (i) => i && typeof i.src === "string" && i.src.trim() !== ""
  );
  return Array.from({ length: slotCount }, (_, n) => usable[n] ?? null);
}

/**
 * Capabilities grouped by pillar. Uses skills.groups ([{ pillar, items }]) when present; older data
 * with only the flat `tools` list renders as one group without a pillar.
 */
export function skillGroups(skills) {
  if (Array.isArray(skills?.groups) && skills.groups.length) {
    return skills.groups.map((g) => ({ pillar: g.pillar ?? null, items: g.items ?? [] }));
  }
  return [{ pillar: null, items: skills?.tools ?? [] }];
}

/** Soft skills as plain labels. Falls back to the labels of the old percentage bars (levels are dropped). */
export function softSkills(skills) {
  if (Array.isArray(skills?.soft)) return skills.soft;
  return (skills?.bars ?? []).map((b) => b.label);
}
