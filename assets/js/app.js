/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Pure helpers live in logic.mjs, where they are unit tested.
   ============================================================= */

import {
  pick, esc, lookup, assignInterludes, groupTimeline, periodLabel, isCurrent, skillGroups, softSkills, currentRoles,
  langFromSearch, withLang, timecode, logLineStates, projectLinkKey, storyParagraphs, textList, fieldErrorKey,
} from "./logic.mjs";

const page = document.body.dataset.page ?? "home"; // "home" or "project" (the pages in /projecten/<id>/)

const state = {
  lang: langFromSearch(location.search), // Dutch by default; English lives in the URL (?lang=en). Nothing is stored.
  theme: null, // null = follow the system; "light" / "dark" once the visitor picks one (lasts for this page view)
};

const $ = (sel) => document.querySelector(sel);
const t = (value) => pick(value, state.lang);
const uiText = (key) => lookup(ui[state.lang], key);
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const calmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- Load data ---------- */
async function loadJSON(path) {
  // "no-cache" makes the browser always revalidate (ETag), so content changes show up
  // immediately while unchanged JSON is not downloaded again
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

let ui, site, highlights, projects, timeline, skills, certificates;
try {
  let nl, en;
  [site, highlights, projects, timeline, skills, certificates, nl, en] = await Promise.all([
    loadJSON("data/site.json"),
    loadJSON("data/highlights.json"),
    loadJSON("data/projects.json"),
    loadJSON("data/timeline.json"),
    loadJSON("data/skills.json"),
    loadJSON("data/certificates.json"),
    loadJSON("content/nl.json"),
    loadJSON("content/en.json"),
  ]);
  ui = { nl, en };
} catch (err) {
  $("#main").classList.remove("is-loading");
  $("#main").removeAttribute("aria-busy");
  $("#main").insertAdjacentHTML(
    "afterbegin",
    '<p class="load-error">Content could not be loaded. Serve the site through a (local) web server, ' +
      "for example <code>npx serve</code> or <code>python3 -m http.server</code>.</p>"
  );
  throw err; // stop here, loudly: nothing below can render without the data
}

/* ---------- Static UI strings ---------- */
function applyUIStrings() {
  document.documentElement.lang = state.lang;
  for (const [attr, apply] of [
    ["t", (el, v) => (el.textContent = v)],
    ["tHtml", (el, v) => (el.innerHTML = v)], // only hero.title, which carries <em> for the drawn underline
    ["tAria", (el, v) => el.setAttribute("aria-label", v)],
    ["tAlt", (el, v) => (el.alt = v)],
  ]) {
    const sel = `[data-${attr.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}]`;
    document.querySelectorAll(sel).forEach((el) => {
      const v = uiText(el.dataset[attr]);
      if (v !== undefined) apply(el, v);
    });
  }
  document.querySelectorAll("[data-site]").forEach((el) => {
    el.textContent = site[el.dataset.site] ?? el.textContent;
  });
  // Links to the site's other pages carry the language along
  document.querySelectorAll("[data-keep-lang]").forEach((a) => {
    a.dataset.href ??= a.getAttribute("href");
    a.setAttribute("href", withLang(a.dataset.href, state.lang));
  });
}

/* ---------- Icons: one drawn set, same stroke as the nav icons ---------- */
const ICONS = { arrow: "M5 12h14M13 6l6 6-6 6", out: "M7 17 17 7M9 7h8v8", down: "M12 5v14M6 13l6 6 6-6" };
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Section renderers ---------- */
/* The hero's proof strip: four highlights, each linking to where the evidence is on the page */
function renderHighlights() {
  $("#proofList").innerHTML = highlights
    .map((h) => {
      const external = h.link && h.link.startsWith("http");
      const inner = `<span class="when">${esc(h.year)}</span>
        <span class="proof-title">${esc(t(h.title))}</span>
        <span class="proof-text">${esc(t(h.text))}</span>`;
      return `<li>${
        h.link
          ? `<a href="${esc(h.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>${inner}<span class="proof-arrow">${icon(external ? "out" : "arrow")}</span></a>`
          : `<div>${inner}</div>`
      }</li>`;
    })
    .join("");
}

function renderAbout() {
  const A = ui[state.lang].about;
  $("#aboutText").innerHTML = A.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#aboutFacts").innerHTML = (A.facts ?? []).map((f) => `<div><dt class="label">${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join("");
  $("#portraitImg").src = site.portraitImage;
}

const linkAttrs = (url) => (url.startsWith("http") ? ' target="_blank" rel="noopener"' : "");
const sizeAttrs = (w, h) => (w && h ? ` width="${Number(w)}" height="${Number(h)}"` : "");

// Image, or a link to the video when there is one: a video links out instead of embedding,
// so the page stays free of third-party cookies
function projectVisual(p, L, { lazy = true } = {}) {
  if (!p.image) return "";
  const img = `<img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}"${sizeAttrs(p.imageWidth, p.imageHeight)}${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  return p.video
    ? `<a class="project-visual" href="${esc(p.video)}" target="_blank" rel="noopener">${img}
        <span class="glass play-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>${esc(L.watch_trailer)}</span>
      </a>`
    : `<div class="project-visual">${img}</div>`;
}

// A field with several entries (the thesis findings) becomes a list; one entry stays a plain answer
const caseAnswer = (value) => {
  const items = textList(value, state.lang);
  return items.length > 1 ? `<ul class="case-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : esc(items[0] ?? "");
};

const projectCase = (p, L) =>
  [[L.label_problem, p.problem], [L.label_role, p.role], [L.label_result, p.result]]
    .map(([label, value]) => `<div><dt class="label">${esc(label)}</dt><dd>${caseAnswer(value)}</dd></div>`)
    .join("");

const projectTech = (p) => p.tech.map((c) => `<li>${esc(t(c))}</li>`).join("");

function renderProjects() {
  const L = ui[state.lang].projects;
  $("#projectsList").innerHTML = projects
    .map((p) => {
      // Only projects with a detail page (the optional `page` field) get a link; it says "Lees meer"
      // only when that page has more to tell (a `story`), otherwise just "Projectpagina"
      const more = p.page
        ? `<a class="text-link" href="${esc(withLang(p.page, state.lang))}">${esc(L[projectLinkKey(p, state.lang)])}<span class="sr-only">: ${esc(t(p.title))}</span>${icon("arrow")}</a>`
        : "";
      return `<li class="project">
        ${projectVisual(p, L)}
        <div class="project-body">
          <div class="project-side reveal">
            <p class="label">${esc(t(p.tag))}</p>
            <h3 class="title">${esc(t(p.title))}</h3>
            <p class="project-intro">${esc(t(p.intro))}</p>
            <ul class="chips" aria-label="${esc(L.label_tech)}">${projectTech(p)}</ul>
            <div class="project-links">
              <a class="btn btn-primary" href="${esc(p.cta.url)}"${linkAttrs(p.cta.url)}>${esc(t(p.cta.label))}</a>
              ${more}
            </div>
          </div>
          <dl class="case reveal">${projectCase(p, L)}</dl>
        </div>
      </li>`;
    })
    .join("");
}

/* A project's own page (/projecten/<id>/): the same data, with room for the image and an optional story */
function renderProjectPage() {
  const id = document.body.dataset.project;
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`No project with id "${id}" in data/projects.json`);
  const L = ui[state.lang].projects;
  document.title = `${t(p.title)} — ${site.name}`;
  $("#ppMeta").textContent = t(p.tag);
  $("#ppTitle").textContent = t(p.title);
  $("#ppIntro").textContent = t(p.intro);
  $("#ppVisual").innerHTML = projectVisual(p, L, { lazy: false }); // above the fold here
  $("#ppCase").innerHTML = projectCase(p, L);
  $("#ppStory").innerHTML = storyParagraphs(p, state.lang).map((para) => `<p>${esc(para)}</p>`).join("");
  $("#ppTech").innerHTML = projectTech(p);
  $("#ppTech").setAttribute("aria-label", L.label_tech);
  const cta = $("#ppCta");
  cta.href = p.cta.url.startsWith("#") ? withLang(`./${p.cta.url}`, state.lang) : p.cta.url;
  cta.textContent = t(p.cta.label);
  if (p.cta.url.startsWith("http")) Object.assign(cta, { target: "_blank", rel: "noopener" });
  $("#ppMore").innerHTML = projects
    .filter((x) => x.id !== id && x.page)
    .map((x) => `<li><a href="${esc(withLang(x.page, state.lang))}"><span class="label">${esc(t(x.tag))}</span><span class="more-title">${esc(t(x.title))}</span><span class="tile-arrow">${icon("arrow")}</span></a></li>`)
    .join("");
}

/* Full-bleed photo interludes from site.json, placed in the page's slots in order. Empty entries render nothing. */
function renderInterludes() {
  const slots = document.querySelectorAll(".interlude-slot");
  assignInterludes(site.interludes, slots.length).forEach((photo, n) => {
    const slot = slots[n];
    slot.hidden = !photo;
    slot.innerHTML = photo
      ? `<figure class="interlude">
          <img src="${esc(photo.src)}" alt="${esc(t(photo.alt) ?? "")}" width="2400" height="1029" loading="lazy" decoding="async">
          <figcaption class="wrap label">${esc(uiText("interlude.credit"))}</figcaption>
        </figure>`
      : "";
  });
}

/* One ledger of work, education and extracurricular. Roles that share a `group` (the Amac roles)
   become one featured card that shows the progression; descriptions sit in native <details>. */
function renderTimeline() {
  const L = ui[state.lang].experience;
  // One meta line per entry: "2024 – heden · Werk", with the "Nu" marker beneath when it's still running
  const meta = (period, k, current) =>
    `<p class="when">${esc(periodLabel(period, L.present))} · ${esc(L.kinds[k] ?? k)}</p>${current ? `<span class="now-tag">${esc(L.now)}</span>` : ""}`;

  $("#timelineList").innerHTML = groupTimeline(timeline)
    .map((entry) => {
      if (entry.type === "item") {
        const item = entry.item;
        return `<li class="row">
          <div class="row-side">${meta(item.period, item.kind, isCurrent(item.period))}</div>
          <div class="row-main">
            <h3 class="row-title">${esc(t(item.title))}</h3>
            <p class="row-org">${esc(item.org)}</p>
            <details><summary>${esc(L.details)}<span class="sr-only">: ${esc(t(item.title))}</span></summary><p>${esc(t(item.description))}</p></details>
          </div>
        </li>`;
      }
      const first = entry.steps[0];
      const steps = entry.steps
        .map(
          (s) => `<li${isCurrent(s.period) ? ' aria-current="step"' : ""}>
            <span class="when">${esc(periodLabel(s.period, L.present))}</span>
            <span class="step-title">${esc(t(s.title))}</span>
          </li>`
        )
        .join("");
      const roles = entry.steps.map((s) => `<dt>${esc(t(s.title))}</dt><dd>${esc(t(s.description))}</dd>`).join("");
      return `<li class="row row-group">
        <div class="row-side">${meta(entry.period, first.kind, entry.current)}</div>
        <div class="row-main">
          <h3 class="row-title">${esc(first.org)}</h3>
          <ol class="steps" aria-label="${esc(L.group_steps)}">${steps}</ol>
          <details><summary>${esc(L.group_details)}</summary><dl class="roles">${roles}</dl></details>
        </div>
      </li>`;
    })
    .join("");
}

/* Skills: the three ways of working (pillars in content/*.json), each with its methods and tools from skills.json.
   A group without a matching pillar still renders, as a column without the pillar text.
   The old percentage bars in skills.json are no longer rendered. */
function renderSkills() {
  const L = ui[state.lang];
  const groups = skillGroups(skills);
  const tools = (items) =>
    items.length
      ? `<h4 class="label tools-label">${esc(L.skills.tools)}</h4><ul class="tools">${items.map((c) => `<li>${esc(t(c))}</li>`).join("")}</ul>`
      : "";
  const columns = L.pillars.items.map((p, i) => {
    const group = groups.find((g) => g.pillar === p.id);
    return `<li class="pillar">
        <span class="pillar-no" aria-hidden="true">${i + 1}</span>
        <h3 class="title">${esc(p.name)}</h3>
        <p class="pillar-promise">${esc(p.promise)}</p>
        <p class="pillar-text">${esc(p.text)}</p>
        ${tools(group?.items ?? [])}
      </li>`;
  });
  const loose = groups.filter((g) => !L.pillars.items.some((p) => p.id === g.pillar));
  $("#pillarList").innerHTML = [...columns, ...loose.map((g) => `<li class="pillar">${tools(g.items)}</li>`)].join("");
  $("#softList").innerHTML = softSkills(skills).map((s) => `<li>${esc(t(s))}</li>`).join("");
  $("#languageList").innerHTML = skills.languages
    .map((l) => `<div><dt>${esc(t(l.name))}</dt><dd>${esc(t(l.level))}</dd></div>`)
    .join("");
}

function renderCertificates() {
  const section = $("#certificaten");
  section.classList.toggle("hidden", !certificates.length); // an empty list hides the section
  $("#certList").innerHTML = certificates
    .map(
      (c) => `<li class="row">
        <div class="row-side"><span class="when">${esc(c.year ?? "")}</span></div>
        <div class="row-main"><h3 class="row-title">${esc(t(c.title))}</h3>${c.issuer ? `<p class="row-org">${esc(c.issuer)}</p>` : ""}</div>
      </li>`
    )
    .join("");
}

// The CV sits with the socials, so a visitor who has scrolled to the end doesn't have to go back to the hero for it
function renderSocials() {
  const cv = site.cvFile ? `<li><a class="text-link" href="${esc(site.cvFile)}" download>${esc(ui[state.lang].contact.cv)}${icon("down")}</a></li>` : "";
  $("#socialLinks").innerHTML =
    cv + (site.socials || []).map((s) => `<li><a class="text-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}${icon("out")}</a></li>`).join("");
}

function renderHeroNow() {
  $("#heroNow").innerHTML = currentRoles(timeline)
    .map((r) => `<li><span class="now-role">${esc(t(r.title))}</span><span class="now-org">${esc(r.org)}</span></li>`)
    .join("");
}

/* ---------- Hero: the intro video as an observed session ---------- */
const video = site.heroVideo;
const session = { el: $("#sessionVideo"), userPaused: false, started: false };

function renderSessionLog() {
  if (!video || !session.el) return;
  $("#sessionLog").innerHTML = (video.cues ?? [])
    .map((c) => `<li><span class="when">${esc(timecode(c.at))}</span><span>${esc(t(c.label))}</span></li>`)
    .join("");
  syncSession();
}

// Light up the cues the recording has reached, and keep the button's label in step with the video
function syncSession() {
  const v = session.el;
  if (!v || !video) return;
  const lines = logLineStates(video.cues, { started: session.started, ended: v.ended, time: v.currentTime });
  document.querySelectorAll("#sessionLog li").forEach((li, i) => {
    li.classList.toggle("is-done", lines[i].done);
    li.classList.toggle("is-now", lines[i].now);
  });
  const L = ui[state.lang].hero;
  const mode = v.ended ? "replay" : v.paused ? "play" : "pause";
  $("#videoBtnText").textContent = L[`video_${mode}`];
  $("#videoIcon").setAttribute("d", { pause: "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z", play: "M8 5v14l11-7z", replay: "M12 5a7 7 0 1 1-6.6 4.7l1.9.6A5 5 0 1 0 12 7v3L7.5 6 12 2z" }[mode]);
}

function initSession() {
  const v = session.el;
  if (!video || !v) return;
  $("#session").hidden = false;
  v.poster = video.poster; // the final frame: before playback (and under reduced motion) the stage shows the result
  // AV1 first when there is one (smaller), H.264 as the fallback every browser plays
  v.innerHTML =
    (video.av1 ? `<source src="${esc(video.av1)}" type='video/mp4; codecs="av01.0.08M.08"'>` : "") +
    `<source src="${esc(video.h264)}" type="video/mp4">`;

  const play = () => {
    session.started = true;
    v.play().catch((err) => console.warn("Intro video did not start:", err.message)); // e.g. blocked by a data-saver; the poster stays
  };
  $("#videoBtn").addEventListener("click", () => {
    if (v.paused || v.ended) {
      session.userPaused = false;
      if (v.ended) v.currentTime = 0;
      play();
    } else {
      session.userPaused = true;
      v.pause();
    }
    syncSession(); // relabel at once instead of waiting for the media event
  });
  ["play", "pause", "ended", "timeupdate"].forEach((type) => v.addEventListener(type, syncSession));

  // Plays once when it comes into view, never under reduced motion and never after the visitor paused it
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !session.started && !session.userPaused && !calmQuery.matches) play();
      else if (!entry.isIntersecting && !v.paused) v.pause();
      else if (entry.isIntersecting && session.started && v.paused && !v.ended && !session.userPaused && !calmQuery.matches) play();
    },
    { threshold: 0.5 }
  ).observe(v);
}

/* ---------- Reveal animations ---------- */
// An IntersectionObserver in every browser. Not CSS scroll-driven animations (animation-timeline: view()):
// in Safari/WebKit 26–27 those sometimes stay stuck on their first frame, which left whole blocks at opacity 0.
// The .reveal-io class is only set here, so without this script (or under reduced motion, see main.css) nothing is hidden.
const io =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            io.unobserve(e.target);
          }),
        // Any visible pixel counts (threshold 0), so blocks taller than the screen reveal too
        { threshold: 0, rootMargin: "0px 0px -6% 0px" }
      )
    : null;
if (io) document.documentElement.classList.add("reveal-io");

// The portrait gets its own, later trigger: it uncovers once a third of it is in view, so the reveal is seen, not missed
if (io) {
  const photoIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        photoIo.unobserve(e.target);
      }),
    { threshold: 0.35 }
  );
  document.querySelectorAll(".reveal-photo").forEach((el) => photoIo.observe(el));
}

let revealsObserved = false;
function observeReveals() {
  if (!io) return;
  if (revealsObserved) {
    // A language switch re-renders blocks: show them at once instead of fading them in a second time
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    return;
  }
  revealsObserved = true;
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ---------- Language & theme ---------- */
function renderPrefs() {
  document.querySelectorAll("[data-lang]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang)));
  const dark = state.theme ? state.theme === "dark" : darkQuery.matches;
  $("#themeBtn").setAttribute("aria-pressed", String(dark));
}

function renderAll() {
  applyUIStrings();
  if (page === "project") {
    renderProjectPage();
  } else {
    renderAbout();
    renderHighlights();
    renderProjects();
    renderInterludes();
    renderTimeline();
    renderSkills();
    renderCertificates();
    renderSocials();
    renderHeroNow();
    renderSessionLog();
    renderFormMessages();
  }
  renderPrefs();
  observeReveals();
}

document.querySelectorAll("[data-lang]").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (state.lang === btn.dataset.lang) return;
    state.lang = btn.dataset.lang;
    // Keep the choice in the address (shareable, survives a reload, stored nowhere)
    history.replaceState(null, "", withLang(location.pathname + location.search + location.hash, state.lang));
    // The other language has different text lengths: keep the section being read at the same spot on screen
    const anchor = sectionAtTop();
    const before = anchor?.getBoundingClientRect().top;
    renderAll();
    if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
    if (panel.classList.contains("open")) setMenu(false, { returnFocus: true }); // choice made: back to the page
  })
);

// The section (or other top-level block, which re-renders never replace) under the top of the screen
function sectionAtTop() {
  const y = (bar.offsetHeight || 0) + 1;
  return [...document.querySelectorAll("main > *, .pp > *")].find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= y && r.bottom > y;
  });
}

$("#themeBtn").addEventListener("click", () => {
  const dark = state.theme ? state.theme === "dark" : darkQuery.matches;
  state.theme = dark ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  renderPrefs();
});
darkQuery.addEventListener("change", renderPrefs); // the system theme changed while we're still following it

/* ---------- Navigation bar ---------- */
// Below 900px (keep in sync with main.css) the links and preferences become a disclosure under the menu button.
const bar = $("#bar");
const menuBtn = $("#menuBtn");
const panel = $("#barPanel");
const narrow = window.matchMedia("(max-width: 900px)");

function setMenu(open, { returnFocus = false } = {}) {
  menuBtn.setAttribute("aria-expanded", String(open));
  panel.classList.toggle("open", open);
  bar.classList.toggle("menu-open", open);
  if (open) panel.querySelector("a, button").focus();
  else if (returnFocus) menuBtn.focus();
}
menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
panel.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false); // a link was followed: get out of the way
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && panel.classList.contains("open")) setMenu(false, { returnFocus: true });
});
document.addEventListener("click", (e) => {
  if (panel.classList.contains("open") && !e.target.closest(".bar")) setMenu(false);
});
// Focus left the open menu (Tab past the last item, or a click elsewhere): close it
panel.addEventListener("focusout", (e) => {
  if (narrow.matches && panel.classList.contains("open") && !e.currentTarget.contains(e.relatedTarget) && e.relatedTarget !== menuBtn) {
    setMenu(false);
  }
});
narrow.addEventListener("change", () => setMenu(false));

// The bar tucks away while scrolling down and comes back on scroll up, near the top,
// whenever the menu is open and whenever anything in it has keyboard focus.
let lastY = window.scrollY;
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const down = y > lastY + 4;
  const up = y < lastY - 4;
  if (down && y > 160 && !bar.contains(document.activeElement) && !panel.classList.contains("open")) bar.classList.add("tucked");
  else if (up || y <= 160) bar.classList.remove("tucked");
  bar.classList.toggle("scrolled", y > 8);
  if (down || up) lastY = y;
  updateStages();
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) requestAnimationFrame(onScroll);
    ticking = true;
  },
  { passive: true }
);
bar.addEventListener("focusin", () => bar.classList.remove("tucked"));

/* ---------- Where am I ----------
   The nav link of the section crossing the middle of the screen gets aria-current, so the long page has a "you are here". */
const navLinks = [...document.querySelectorAll('.bar-nav a[href^="#"]')];
if (navLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const link = byId.get(e.target.id);
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          link?.setAttribute("aria-current", "location");
        } else if (link?.hasAttribute("aria-current")) {
          link.removeAttribute("aria-current"); // e.g. scrolled back up into the hero
        }
      }),
    { rootMargin: "-50% 0px -50% 0px" }
  );
  document.querySelectorAll("main > section[id]").forEach((s) => spy.observe(s));
}

/* ---------- Dark stages ----------
   The dark ground behind projects and contact starts as a rounded, inset panel and widens to full bleed as it
   scrolls into view. Only the ground (a pseudo-element) scales, never the content, and only with the scroll
   position: no animation of its own. Under reduced motion the stage is simply full width. */
const stages = [...document.querySelectorAll(".stage")];
function updateStages() {
  if (calmQuery.matches) return;
  const h = window.innerHeight;
  for (const s of stages) {
    const top = s.getBoundingClientRect().top;
    if (top > h || top < -h) continue; // off screen: leave it where it is
    const p = Math.min(1, Math.max(0, (h - top) / (h * 0.6)));
    s.style.setProperty("--stage-p", p.toFixed(3));
  }
}

/* ---------- Contact form messages ----------
   Messages are stored as content keys (data-err / data-key), so a language switch re-renders them in the new language. */
const FORM_FIELDS = ["name", "email", "message"];
const formFields = () => FORM_FIELDS.map((n) => $("#contactForm").elements[n]); // not form.name: that's the form's own name

// Show or clear one field's message; true when the field is valid
function checkField(f) {
  const key = fieldErrorKey(f.name, f.validity);
  f.setAttribute("aria-invalid", String(Boolean(key)));
  f.dataset.err = key ?? "";
  $(`#${f.id}-err`).textContent = key ? ui[state.lang].contact[key] : "";
  return !key;
}

function setFormStatus(key, kind = "") {
  const status = $("#formStatus");
  status.dataset.key = key ?? "";
  status.className = `form-status${kind ? ` ${kind}` : ""}`;
  status.textContent = key ? ui[state.lang].contact[key] : "";
}

function renderFormMessages() {
  for (const f of formFields()) if (f.dataset.err) $(`#${f.id}-err`).textContent = ui[state.lang].contact[f.dataset.err];
  const status = $("#formStatus");
  if (status.dataset.key) status.textContent = ui[state.lang].contact[status.dataset.key];
}

/* ---------- Home only ---------- */
function initHome() {
  /* Honest banner */
  $("#honestBtn").addEventListener("click", () => {
    $("#honest").hidden = true;
    $("#heroTitle").focus({ preventScroll: true }); // the button is gone; keep focus in the hero instead of losing it
  });

  /* Contact form: each field says what is wrong with it. A field is checked when the visitor leaves it after
     typing, and re-checked while they fix it; empty fields are only flagged on submit, so nothing nags early. */
  const form = $("#contactForm");
  form.addEventListener("focusout", (e) => {
    const f = e.target;
    if (FORM_FIELDS.includes(f.name) && (f.value.trim() || f.getAttribute("aria-invalid") === "true")) checkField(f);
  });
  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") !== "true") return;
    checkField(e.target);
    // Every flagged field is fixed: the summary has done its job
    if ($("#formStatus").dataset.key === "status_invalid" && formFields().every((f) => f.getAttribute("aria-invalid") !== "true")) setFormStatus(null);
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormStatus(null);

    if (form.elements._gotcha.value) return; // honeypot: bots fill this hidden field, humans never do

    const fields = formFields();
    const invalid = fields.filter((f) => !checkField(f));
    if (invalid.length) {
      setFormStatus("status_invalid", "err");
      invalid[0].focus();
      return;
    }
    if (!site.formEndpoint) {
      setFormStatus("status_unconfigured", "err");
      return;
    }
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    setFormStatus("status_sending");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(`Form endpoint answered ${res.status}`);
      form.reset();
      setFormStatus("status_ok", "ok");
    } catch (err) {
      console.error(err);
      setFormStatus("status_err", "err");
    } finally {
      submit.disabled = false;
    }
  });

  $("#cvBtn").href = site.cvFile;

  initSession();
}

/* ---------- Init ---------- */
if (page === "home") initHome();
$("#year").textContent = new Date().getFullYear();
try {
  renderAll();
} finally {
  $("#main").classList.remove("is-loading"); // also after a render error, which still surfaces in the console
  $("#main").removeAttribute("aria-busy");
  updateStages();
}
