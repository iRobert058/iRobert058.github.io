/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Pure helpers live in logic.js, where they are unit tested.
   ============================================================= */

import { pick, esc, lookup, pad2, assignInterludes, groupTimeline, periodLabel, isCurrent } from "./logic.js";

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

/* Paper-style section numbers (§ 01 …), counted over the sections that are visible right now */
function numberSections() {
  document.querySelectorAll(".sect:not(.hidden) .sect-no").forEach((el, i) => (el.textContent = `§ ${pad2(i + 1)}`));
}

const linkAttrs = (url) => (url.startsWith("http") ? ' target="_blank" rel="noopener"' : "");
const sizeAttrs = (w, h) => (w && h ? ` width="${Number(w)}" height="${Number(h)}"` : "");

function renderProjects() {
  const L = ui[state.lang].projects;
  $("#projectsList").innerHTML = projects
    .map((p) => {
      const imgTag = p.image
        ? `<img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}"${sizeAttrs(p.imageWidth, p.imageHeight)} loading="lazy" decoding="async">`
        : "";
      // A video links out instead of embedding, so the page stays free of third-party cookies
      const visual = !p.image
        ? ""
        : p.video
          ? `<a class="project-visual project-video" href="${esc(p.video)}" target="_blank" rel="noopener">${imgTag}
              <span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(L.watch_trailer)}</span>
            </a>`
          : `<div class="project-visual">${imgTag}</div>`;
      const chips = p.tech.map((c) => `<li>${esc(t(c))}</li>`).join("");
      const block = (label, text) => `<div><dt class="label">${esc(label)}</dt><dd>${esc(t(text))}</dd></div>`;
      return `<li class="project reveal">
        <div class="project-side">
          <p class="label project-meta">${esc(t(p.tag))}</p>
          <h3>${esc(t(p.title))}</h3>
          <p class="project-intro">${esc(t(p.intro))}</p>
          <ul class="chips" aria-label="${esc(L.label_tech)}">${chips}</ul>
          <a class="project-cta" href="${esc(p.cta.url)}"${linkAttrs(p.cta.url)}>${esc(t(p.cta.label))}</a>
        </div>
        <div class="project-main">
          ${visual}
          <dl class="case">
            ${block(L.label_problem, p.problem)}
            ${block(L.label_role, p.role)}
            ${block(L.label_result, p.result)}
          </dl>
        </div>
      </li>`;
    })
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

function renderSkills() {
  $("#skillBars").innerHTML = skills.bars
    .map(
      (b) => `<div class="bar-item">
        <div class="bar-head"><span>${esc(t(b.label))}</span></div>
        <div class="bar"><i data-w="${Number(b.level) || 0}"></i></div>
      </div>`
    )
    .join("");
  $("#toolChips").innerHTML = skills.tools.map((c) => `<span class="chip">${esc(t(c))}</span>`).join("");
  $("#languageList").innerHTML = skills.languages
    .map((l) => `<div class="lang-row"><span>${esc(t(l.name))}</span><span>${esc(t(l.level))}</span></div>`)
    .join("");
}

function renderCertificates() {
  const section = $("#certificaten");
  if (!certificates.length) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  $("#certList").innerHTML = certificates
    .map((c) => `<div class="cert-row"><span>${esc(t(c.title))}${c.issuer ? ` — ${esc(c.issuer)}` : ""}</span><span>${esc(c.year ?? "")}</span></div>`)
    .join("");
}

function renderSocials() {
  $("#socialLinks").innerHTML = (site.socials || [])
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join("");
}

/* ---------- Reveal animations ---------- */
// CSS scroll-driven animations handle .reveal where supported; this observer is the fallback.
const scrollDriven = CSS.supports("animation-timeline: view()");
if (!scrollDriven) document.documentElement.classList.add("reveal-io");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll(".bar i").forEach((bar) => (bar.style.width = bar.dataset.w + "%"));
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);

function observeReveals() {
  const selector = scrollDriven ? ".skills-grid" : ".reveal, .skills-grid";
  document.querySelectorAll(selector).forEach((el) => io.observe(el));
}

/* ---------- Language & theme ---------- */
function renderPrefs() {
  document.querySelectorAll("[data-lang]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang)));
  const dark = state.theme ? state.theme === "dark" : darkQuery.matches;
  $("#themeBtn").setAttribute("aria-pressed", String(dark));
}

function renderAll() {
  applyUIStrings();
  renderHighlights();
  renderAbout();
  renderPillars();
  renderProjects();
  renderInterludes();
  renderTimeline();
  renderSkills();
  renderCertificates();
  numberSections();
  renderSocials();
  renderSpecimen();
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
// Below 760px the panel with links and preferences becomes a disclosure under the menu button.
const menuBtn = $("#menuBtn");
const panel = $("#topbarPanel");
const narrow = window.matchMedia("(max-width: 760px)");

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

/* ---------- Hero specimen ---------- */
// A fake product card from a web shop. Pressing the button simulates a return visit on which the
// add-to-cart button has moved and its old spot holds a paid extra: the habit effect from the thesis.
// It only ever moves on request, and the caption (a live region) says what changed.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const specimen = { visit: 1 };

function renderSpecimen() {
  const S = ui[state.lang].specimen;
  $("#specShop").dataset.visit = specimen.visit;
  $("#specVisit").textContent = S.visit.replace("{n}", specimen.visit);
  $("#specCaption").textContent = specimen.visit === 1 ? S.caption_1 : S.caption_2;
  $("#specBtn").textContent = specimen.visit === 1 ? S.btn_next : S.btn_reset;
}

$("#specBtn").addEventListener("click", () => {
  const cart = $("#specCart");
  const before = cart.getBoundingClientRect();
  specimen.visit = specimen.visit === 1 ? 2 : 1;
  renderSpecimen();
  if (reduceMotion.matches) return; // swap instantly
  // FLIP: start the button at its old spot and let it travel to the new one
  const after = cart.getBoundingClientRect();
  const dx = before.left + before.width / 2 - (after.left + after.width / 2);
  const dy = before.top + before.height / 2 - (after.top + after.height / 2);
  const easing = getComputedStyle(document.documentElement).getPropertyValue("--ease").trim();
  cart.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 520, easing });
  if (specimen.visit === 2) $("#specExtra").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 260, fill: "backwards" });
});

/* ---------- Honest banner ---------- */
$("#honestBtn").addEventListener("click", () => {
  $("#honest").hidden = true;
  $("#heroTitle").focus({ preventScroll: true }); // the button is gone; keep focus in the hero instead of losing it
});

/* ---------- Contact form ---------- */
const form = $("#contactForm");
const status = $("#formStatus");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const L = ui[state.lang].contact;
  status.className = "form-status";

  if (form._gotcha.value) return; // honeypot: bots fill this hidden field, humans never do

  if (!form.checkValidity()) {
    status.textContent = L.status_invalid;
    status.classList.add("err");
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

/* ---------- Init ---------- */
$("#cvBtn").href = site.cvFile;
const github = (site.socials || []).find((s) => s.label === "GitHub");
if (github) $("#githubBtn").href = github.url;
else $("#githubBtn").remove();
$("#year").textContent = new Date().getFullYear();
renderAll();
$("#specCaption").setAttribute("aria-live", "polite"); // only after the first render, so loading the page announces nothing
