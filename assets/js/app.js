/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Pure helpers live in logic.mjs, where they are unit tested.
   ============================================================= */

import {
  pick, esc, lookup, assignInterludes, groupTimeline, periodLabel, isCurrent, skillGroups, softSkills, currentRoles,
  langFromSearch, withLang, cueIndex, timecode, projectLinkKey, storyParagraphs,
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

/* ---------- Section renderers ---------- */
function renderHighlights() {
  $("#highlightsGrid").innerHTML = highlights
    .map((h) => {
      const external = h.link && h.link.startsWith("http");
      const inner = `<span class="label">${esc(h.year)}</span>
        <h3 class="tile-title">${esc(t(h.title))}</h3>
        <p>${esc(t(h.text))}</p>`;
      return h.link
        ? `<a class="tile reveal" href="${esc(h.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>${inner}<span class="tile-arrow" aria-hidden="true">${external ? "↗" : "→"}</span></a>`
        : `<div class="tile reveal">${inner}</div>`;
    })
    .join("");
}

function renderAbout() {
  const A = ui[state.lang].about;
  $("#aboutText").innerHTML = A.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#aboutFacts").innerHTML = (A.facts ?? []).map((f) => `<div><dt class="label">${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join("");
  $("#portraitImg").src = site.portraitImage;
}

function renderPillars() {
  $("#pillarList").innerHTML = ui[state.lang].pillars.items
    .map(
      (p, i) => `<li class="pillar reveal">
        <span class="pillar-no" aria-hidden="true">${i + 1}</span>
        <h3 class="title">${esc(p.name)}</h3>
        <p class="pillar-promise">${esc(p.promise)}</p>
        <p>${esc(p.text)}</p>
      </li>`
    )
    .join("");
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

const projectCase = (p, L) =>
  [[L.label_problem, p.problem], [L.label_role, p.role], [L.label_result, p.result]]
    .map(([label, text]) => `<div><dt class="label">${esc(label)}</dt><dd>${esc(t(text))}</dd></div>`)
    .join("");

const projectTech = (p) => p.tech.map((c) => `<li>${esc(t(c))}</li>`).join("");

function renderProjects() {
  const L = ui[state.lang].projects;
  $("#projectsList").innerHTML = projects
    .map((p) => {
      // Only projects with a detail page (the optional `page` field) get a link; it says "Lees meer"
      // only when that page has more to tell (a `story`), otherwise just "Projectpagina"
      const more = p.page
        ? `<a class="text-link" href="${esc(withLang(p.page, state.lang))}">${esc(L[projectLinkKey(p, state.lang)])}<span class="sr-only">: ${esc(t(p.title))}</span> <span aria-hidden="true">→</span></a>`
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
    .map((x) => `<li><a href="${esc(withLang(x.page, state.lang))}"><span class="label">${esc(t(x.tag))}</span><span class="more-title">${esc(t(x.title))}</span><span class="tile-arrow" aria-hidden="true">→</span></a></li>`)
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
  const when = (period) => `<span class="when">${esc(periodLabel(period, L.present))}</span>`;
  const now = (current) => (current ? `<span class="now-tag">${esc(L.now)}</span>` : "");
  const kind = (k) => `<span class="label">${esc(L.kinds[k] ?? k)}</span>`;

  $("#timelineList").innerHTML = groupTimeline(timeline)
    .map((entry) => {
      if (entry.type === "item") {
        const item = entry.item;
        return `<li class="row reveal">
          <div class="row-side">${when(item.period)}${now(isCurrent(item.period))}</div>
          <div class="row-main">
            ${kind(item.kind)}
            <h3 class="row-title">${esc(t(item.title))}</h3>
            <p class="row-org">${esc(item.org)}</p>
            <details><summary>${esc(L.details)}</summary><p>${esc(t(item.description))}</p></details>
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
      return `<li class="row row-group reveal">
        <div class="row-side">${when(entry.period)}${now(entry.current)}</div>
        <div class="row-main">
          ${kind(first.kind)}
          <h3 class="row-title">${esc(first.org)}</h3>
          <ol class="steps" aria-label="${esc(L.group_steps)}">${steps}</ol>
          <details><summary>${esc(L.group_details)}</summary><dl class="roles">${roles}</dl></details>
        </div>
      </li>`;
    })
    .join("");
}

/* Capabilities grouped under the three pillars; the old percentage bars in skills.json are no longer rendered */
function renderSkills() {
  const pillars = ui[state.lang].pillars.items;
  $("#capabilityList").innerHTML = skillGroups(skills)
    .map((g) => {
      const index = pillars.findIndex((p) => p.id === g.pillar);
      const head = index >= 0 ? `<h4 class="cap-head"><span aria-hidden="true">${index + 1}</span> ${esc(pillars[index].name)}</h4>` : "";
      return `<div class="capability reveal">${head}<ul>${g.items.map((c) => `<li>${esc(t(c))}</li>`).join("")}</ul></div>`;
    })
    .join("");
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

function renderSocials() {
  $("#socialLinks").innerHTML = (site.socials || [])
    .map((s) => `<li><a class="text-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} <span aria-hidden="true">↗</span></a></li>`)
    .join("");
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
  // Before playback (and under reduced motion) the poster shows the end state, so the whole log applies
  const reached = session.started ? cueIndex(video.cues, v.currentTime) : (video.cues ?? []).length - 1;
  document.querySelectorAll("#sessionLog li").forEach((li, i) => {
    li.classList.toggle("is-done", i < reached);
    li.classList.toggle("is-now", i === reached && session.started && !v.ended);
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
  v.innerHTML = `<source src="${esc(video.av1)}" type='video/mp4; codecs="av01.0.08M.08"'><source src="${esc(video.h264)}" type="video/mp4">`;

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
    renderPillars();
    renderProjects();
    renderInterludes();
    renderTimeline();
    renderSkills();
    renderCertificates();
    renderSocials();
    renderHeroNow();
    renderSessionLog();
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
    renderAll();
  })
);

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

/* ---------- Home only ---------- */
function initHome() {
  /* Honest banner */
  $("#honestBtn").addEventListener("click", () => {
    $("#honest").hidden = true;
    $("#heroTitle").focus({ preventScroll: true }); // the button is gone; keep focus in the hero instead of losing it
  });

  /* Contact form */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid")); // re-checked on the next submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const L = ui[state.lang].contact;
    status.className = "form-status";

    if (form.elements._gotcha.value) return; // honeypot: bots fill this hidden field, humans never do

    const fields = ["name", "email", "message"].map((n) => form.elements[n]); // not form.name: that's the form's own name
    fields.forEach((f) => f.setAttribute("aria-invalid", String(!f.validity.valid)));
    if (!form.checkValidity()) {
      status.textContent = L.status_invalid;
      status.classList.add("err");
      fields.find((f) => !f.validity.valid).focus();
      return;
    }
    if (!site.formEndpoint) {
      status.textContent = L.status_unconfigured;
      status.classList.add("err");
      return;
    }
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    status.textContent = L.status_sending;
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(`Form endpoint answered ${res.status}`);
      form.reset();
      status.textContent = L.status_ok;
      status.classList.add("ok");
    } catch (err) {
      console.error(err);
      status.textContent = L.status_err;
      status.classList.add("err");
    } finally {
      submit.disabled = false;
    }
  });

  $("#cvBtn").href = site.cvFile;
  const github = (site.socials || []).find((s) => s.label === "GitHub");
  if (github) $("#githubBtn").href = github.url;
  else $("#githubBtn").remove();

  initSession();
}

/* ---------- Init ---------- */
if (page === "home") initHome();
$("#year").textContent = new Date().getFullYear();
try {
  renderAll();
} finally {
  $("#main").classList.remove("is-loading"); // also after a render error, which still surfaces in the console
  updateStages();
}
