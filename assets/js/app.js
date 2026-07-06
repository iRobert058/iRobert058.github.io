/* =============================================================
   app.js — laadt content (content/*.json) en data (data/*.json)
   en rendert de site. Content aanpassen = JSON aanpassen;
   deze code hoeft daarvoor niet gewijzigd te worden.
   ============================================================= */

(async function () {
  "use strict";

  const state = {
    lang: "nl",
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };

  /* ---------- Data laden ---------- */
  async function loadJSON(path) {
    // "no-store" voorkomt dat de browser oude JSON uit de cache toont na een contentwijziging
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Kon ${path} niet laden (${res.status})`);
    return res.json();
  }

  let ui, site, highlights, projects, timeline, skills, certificates;
  try {
    [site, highlights, projects, timeline, skills, certificates] = await Promise.all([
      loadJSON("data/site.json"),
      loadJSON("data/highlights.json"),
      loadJSON("data/projects.json"),
      loadJSON("data/timeline.json"),
      loadJSON("data/skills.json"),
      loadJSON("data/certificates.json"),
    ]);
    ui = {
      nl: await loadJSON("content/nl.json"),
      en: await loadJSON("content/en.json"),
    };
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:120px 24px;text-align:center;font-family:sans-serif">' +
        "Content kon niet geladen worden. Draai de site via een (lokale) webserver, " +
        "bijvoorbeeld <code>npx serve</code> of <code>python -m http.server</code>.</p>"
    );
    return;
  }

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const t = (value) => (value && typeof value === "object" ? value[state.lang] ?? value.nl : value);
  const uiText = (key) => key.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), ui[state.lang]);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Statische UI-teksten ---------- */
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
    document.querySelectorAll("[data-site]").forEach((el) => {
      el.textContent = site[el.dataset.site] ?? el.textContent;
    });
  }

  /* ---------- Sectie-renderers ---------- */
  function renderHighlights() {
    $("#highlightsGrid").innerHTML = highlights
      .map((h) => {
        const external = h.link && h.link.startsWith("http");
        const tagOpen = h.link
          ? `<a class="highlight reveal" href="${esc(h.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>`
          : '<div class="highlight reveal">';
        const tagClose = h.link ? "</a>" : "</div>";
        return `${tagOpen}
          <span class="hl-year">${esc(h.year)}</span>
          <h3>${esc(t(h.title))}</h3>
          <p>${esc(t(h.text))}</p>
        ${tagClose}`;
      })
      .join("");
  }

  function renderAbout() {
    $("#aboutText").innerHTML = ui[state.lang].about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#portraitImg").src = site.portraitImage;
  }

  function renderProjects() {
    const L = ui[state.lang].projects;
    $("#projectsList").innerHTML = projects
      .map((p) => {
        const img = p.image
          ? `<div class="pimg"><img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}" loading="lazy"></div>`
          : "";
        const chips = p.tech.map((c) => `<span class="chip">${esc(t(c))}</span>`).join("");
        const external = p.cta.url.startsWith("http");
        return `<article class="project reveal">
          <span class="tag">${esc(t(p.tag))}</span>
          <h3>${esc(t(p.title))}</h3>
          <p class="intro">${esc(t(p.intro))}</p>
          ${img}
          <div class="pgrid">
            <div class="pblock"><h4>${esc(L.label_problem)}</h4><p>${esc(t(p.problem))}</p></div>
            <div class="pblock"><h4>${esc(L.label_role)}</h4><p>${esc(t(p.role))}</p></div>
          </div>
          <div class="chips">${chips}</div>
          <div class="pblock presult"><h4>${esc(L.label_result)}</h4><p>${esc(t(p.result))}</p></div>
          <a class="plink" href="${esc(p.cta.url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(t(p.cta.label))}</a>
        </article>`;
      })
      .join("");
  }

  function renderTimeline() {
    const L = ui[state.lang].experience;
    $("#timelineList").innerHTML = timeline
      .map((item) => {
        const to = item.period.to === "present" ? L.present : item.period.to;
        const when = item.period.from === item.period.to ? item.period.from : `${item.period.from} — ${to}`;
        return `<div class="titem reveal">
          <span class="when">${esc(when)}</span><span class="kind">${esc(L.kinds[item.kind] ?? item.kind)}</span>
          <h3>${esc(t(item.title))}</h3>
          <div class="org">${esc(item.org)}</div>
          <p>${esc(t(item.description))}</p>
        </div>`;
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

  /* ---------- Reveal-animaties ---------- */
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
    document.querySelectorAll(".reveal, .skills-grid").forEach((el) => io.observe(el));
  }

  function renderAll() {
    applyUIStrings();
    renderHighlights();
    renderAbout();
    renderProjects();
    renderTimeline();
    renderSkills();
    renderCertificates();
    renderSocials();
    observeReveals();
  }

  /* ---------- Taal & thema ---------- */
  const langBtn = $("#langBtn");
  langBtn.addEventListener("click", () => {
    state.lang = state.lang === "nl" ? "en" : "nl";
    langBtn.textContent = state.lang === "nl" ? "EN" : "NL";
    renderAll();
  });

  const themeBtn = $("#themeBtn");
  const applyTheme = () => {
    document.documentElement.dataset.theme = state.theme;
    themeBtn.textContent = state.theme === "dark" ? "☀" : "☾";
  };
  themeBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  /* ---------- Eerlijke banner ---------- */
  $("#honestBtn").addEventListener("click", () => $("#honest").classList.add("gone"));

  /* ---------- Contactformulier ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const L = ui[state.lang].contact;
    status.className = "form-status";

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
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = L.status_ok;
      status.classList.add("ok");
    } catch {
      status.textContent = L.status_err;
      status.classList.add("err");
    }
  });

  /* ---------- Init ---------- */
  $("#cvBtn").href = site.cvFile;
  $("#year").textContent = new Date().getFullYear();
  applyTheme();
  renderAll();
})();
