/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Pure helpers live in logic.mjs, where they are unit tested.
   ============================================================= */

import { pick, esc, lookup, assignInterludes, groupTimeline, periodLabel, isCurrent, skillGroups, softSkills, currentRoles } from "./logic.mjs";

const page = document.body.dataset.page ?? "home"; // "home" or "project" (the pages in /projecten/<id>/)

const state = {
  lang: "nl", // Dutch by default. Nothing is stored: a language or theme choice lasts for this page view.
  theme: null, // null = follow the system; "light" / "dark" once the visitor picks one
};

const $ = (sel) => document.querySelector(sel);
const t = (value) => pick(value, state.lang);
const uiText = (key) => lookup(ui[state.lang], key);
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

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
  document.querySelectorAll("[data-t]").forEach((el) => {
    const v = uiText(el.dataset.t);
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll("[data-t-html]").forEach((el) => {
    const v = uiText(el.dataset.tHtml);
    if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-t-aria]").forEach((el) => {
    const v = uiText(el.dataset.tAria);
    if (v !== undefined) el.setAttribute("aria-label", v);
  });
  document.querySelectorAll("[data-t-alt]").forEach((el) => {
    const v = uiText(el.dataset.tAlt);
    if (v !== undefined) el.alt = v;
  });
  document.querySelectorAll("[data-site]").forEach((el) => {
    el.textContent = site[el.dataset.site] ?? el.textContent;
  });
}

/* ---------- Section renderers ---------- */
function renderHighlights() {
  $("#highlightsGrid").innerHTML = highlights
    .map((h) => {
      const external = h.link && h.link.startsWith("http");
      const inner = `<span class="label">${esc(h.year)}</span>
        <h3>${esc(t(h.title))}</h3>
        <p>${esc(t(h.text))}</p>`;
      return h.link
        ? `<a class="highlight reveal" href="${esc(h.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>`
        : `<div class="highlight reveal">${inner}</div>`;
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
        <h3>${esc(p.name)}</h3>
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
function projectVisual(p, L) {
  if (!p.image) return "";
  const img = `<img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}"${sizeAttrs(p.imageWidth, p.imageHeight)} loading="lazy" decoding="async">`;
  return p.video
    ? `<a class="project-visual project-video" href="${esc(p.video)}" target="_blank" rel="noopener">${img}
        <span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(L.watch_trailer)}</span>
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
      // Only projects with a detail page (the optional `page` field) get a "read more" link
      const more = p.page ? `<a class="project-more" href="${esc(p.page)}">${esc(L.read_more)}<span class="sr-only">: ${esc(t(p.title))}</span></a>` : "";
      return `<li class="project reveal">
        <div class="project-side">
          <p class="label project-meta">${esc(t(p.tag))}</p>
          <h3>${esc(t(p.title))}</h3>
          <p class="project-intro">${esc(t(p.intro))}</p>
          <ul class="chips" aria-label="${esc(L.label_tech)}">${projectTech(p)}</ul>
          <div class="project-links">
            <a class="project-cta" href="${esc(p.cta.url)}"${linkAttrs(p.cta.url)}>${esc(t(p.cta.label))}</a>
            ${more}
          </div>
        </div>
        <div class="project-main">
          ${projectVisual(p, L)}
          <dl class="case">${projectCase(p, L)}</dl>
        </div>
      </li>`;
    })
    .join("");
}

/* A project's own page (/projecten/<id>/): the same data, with room for the image */
function renderProjectPage() {
  const id = document.body.dataset.project;
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error(`No project with id "${id}" in data/projects.json`);
  const L = ui[state.lang].projects;
  document.title = `${t(p.title)} — ${site.name}`;
  $("#ppMeta").textContent = t(p.tag);
  $("#ppTitle").textContent = t(p.title);
  $("#ppIntro").textContent = t(p.intro);
  $("#ppVisual").innerHTML = projectVisual(p, L).replace(' loading="lazy"', ""); // above the fold here
  $("#ppCase").innerHTML = projectCase(p, L);
  $("#ppTech").innerHTML = projectTech(p);
  $("#ppTech").setAttribute("aria-label", L.label_tech);
  const cta = $("#ppCta");
  cta.href = p.cta.url;
  cta.textContent = t(p.cta.label);
  if (p.cta.url.startsWith("http")) Object.assign(cta, { target: "_blank", rel: "noopener" });
  $("#ppMore").innerHTML = projects
    .filter((x) => x.id !== id && x.page)
    .map((x) => `<li><a href="${esc(x.page)}"><span class="label">${esc(t(x.tag))}</span><span class="more-title">${esc(t(x.title))}</span></a></li>`)
    .join("");
}

/* Full-bleed photo interludes from site.json, placed in the page's slots in order. Empty entries render nothing. */
function renderInterludes() {
  const slots = document.querySelectorAll(".interlude-slot");
  assignInterludes(site.interludes, slots.length).forEach((photo, n) => {
    const slot = slots[n];
    slot.hidden = !photo;
    slot.innerHTML = photo
      ? `<figure class="interlude reveal">
          <img src="${esc(photo.src)}" alt="${esc(t(photo.alt) ?? "")}" width="2400" height="1029" loading="lazy" decoding="async">
          <figcaption class="wrap label">${esc(uiText("interlude.credit"))}</figcaption>
        </figure>`
      : "";
  });
}

/* One ledger of work, education and extracurricular. Roles that share a `group` (the Amac roles)
   become one card that shows the progression; descriptions sit in native <details>. */
function renderTimeline() {
  const L = ui[state.lang].experience;
  const when = (period) => `<span class="ledger-when">${esc(periodLabel(period, L.present))}</span>`;
  const now = (current) => (current ? `<span class="now-tag">${esc(L.now)}</span>` : "");
  const kind = (k) => `<span class="label">${esc(L.kinds[k] ?? k)}</span>`;

  $("#timelineList").innerHTML = groupTimeline(timeline)
    .map((entry) => {
      if (entry.type === "item") {
        const item = entry.item;
        return `<li class="ledger-row reveal">
          <div class="ledger-side">${when(item.period)}${now(isCurrent(item.period))}</div>
          <div class="ledger-main">
            ${kind(item.kind)}
            <h3>${esc(t(item.title))}</h3>
            <p class="ledger-org">${esc(item.org)}</p>
            <details><summary>${esc(L.details)}</summary><p>${esc(t(item.description))}</p></details>
          </div>
        </li>`;
      }
      const first = entry.steps[0];
      const steps = entry.steps
        .map(
          (s) => `<li${isCurrent(s.period) ? ' aria-current="step"' : ""}>
            <span class="ledger-when">${esc(periodLabel(s.period, L.present))}</span>
            <span class="step-title">${esc(t(s.title))}</span>
          </li>`
        )
        .join("");
      const roles = entry.steps.map((s) => `<dt>${esc(t(s.title))}</dt><dd>${esc(t(s.description))}</dd>`).join("");
      return `<li class="ledger-row ledger-group reveal">
        <div class="ledger-side">${when(entry.period)}${now(entry.current)}</div>
        <div class="ledger-main">
          ${kind(first.kind)}
          <h3>${esc(first.org)}</h3>
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
      const head = index >= 0 ? `<h4><span aria-hidden="true">${index + 1}</span> ${esc(pillars[index].name)}</h4>` : "";
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
      (c) => `<li class="ledger-row">
        <div class="ledger-side"><span class="ledger-when">${esc(c.year ?? "")}</span></div>
        <div class="ledger-main"><h3>${esc(t(c.title))}</h3>${c.issuer ? `<p class="ledger-org">${esc(c.issuer)}</p>` : ""}</div>
      </li>`
    )
    .join("");
}

function renderSocials() {
  $("#socialLinks").innerHTML = (site.socials || [])
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} <span aria-hidden="true">↗</span></a></li>`)
    .join("");
}

/* ---------- Reveal animations ---------- */
// An IntersectionObserver in every browser. Not CSS scroll-driven animations (animation-timeline: view()):
// in Safari/WebKit 26–27 those sometimes stay stuck on their first frame, which left whole blocks at opacity 0.
// The .reveal-io class is only set here, so without this script nothing is ever hidden.
document.documentElement.classList.add("reveal-io");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  },
  // Any visible pixel counts (threshold 0), so blocks taller than the screen reveal too; the margin waits
  // until the block is a little way into the view
  { threshold: 0, rootMargin: "0px 0px -5% 0px" }
);

let revealsObserved = false;
function observeReveals() {
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
    renderHighlights();
    renderAbout();
    renderPillars();
    renderProjects();
    renderInterludes();
    renderTimeline();
    renderSkills();
    renderCertificates();
    renderSocials();
    renderHeroNow();
  }
  renderPrefs();
  observeReveals();
}

document.querySelectorAll("[data-lang]").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (state.lang === btn.dataset.lang) return;
    state.lang = btn.dataset.lang;
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

/* ---------- Mobile menu ---------- */
// Below 980px (keep in sync with main.css) the panel with links and preferences becomes a disclosure under the menu button.
const menuBtn = $("#menuBtn");
const panel = $("#topbarPanel");
const narrow = window.matchMedia("(max-width: 980px)");

function setMenu(open, { returnFocus = false } = {}) {
  menuBtn.setAttribute("aria-expanded", String(open));
  panel.classList.toggle("open", open);
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
  if (panel.classList.contains("open") && !e.target.closest(".topbar")) setMenu(false);
});
// Focus left the open menu (Tab past the last item, or a click elsewhere): close it
panel.addEventListener("focusout", (e) => {
  if (narrow.matches && panel.classList.contains("open") && !e.currentTarget.contains(e.relatedTarget) && e.relatedTarget !== menuBtn) {
    setMenu(false);
  }
});
narrow.addEventListener("change", () => setMenu(false));

/* ---------- Hero: right now ---------- */
function renderHeroNow() {
  $("#heroNow").innerHTML = currentRoles(timeline)
    .map((r) => `<li><span class="now-role">${esc(t(r.title))}</span><span class="now-org">${esc(r.org)}</span></li>`)
    .join("");
}

// Everything below only exists on the homepage
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
    }
  });

  $("#cvBtn").href = site.cvFile;
  const github = (site.socials || []).find((s) => s.label === "GitHub");
  if (github) $("#githubBtn").href = github.url;
  else $("#githubBtn").remove();
}

/* ---------- Init ---------- */
if (page === "home") initHome();
$("#year").textContent = new Date().getFullYear();
try {
  renderAll();
} finally {
  $("#main").classList.remove("is-loading"); // also after a render error, which still surfaces in the console
}
