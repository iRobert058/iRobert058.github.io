/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Nothing is stored: the language lives in the URL (?lang=en),
   the theme follows the system until the visitor picks one.
   ============================================================= */

(async function () {
  "use strict";

  const state = {
    lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "nl",
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Load data ---------- */
  async function loadJSON(path) {
    // "no-cache" makes the browser always revalidate (ETag), so content changes show up
    // immediately while unchanged JSON is not downloaded again
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
    return res.json();
  }

  let ui, site, highlights, pillars, projects, timeline, skills, certificates;
  try {
    let nl, en;
    [site, highlights, pillars, projects, timeline, skills, certificates, nl, en] = await Promise.all([
      loadJSON("data/site.json"),
      loadJSON("data/highlights.json"),
      loadJSON("data/pillars.json"),
      loadJSON("data/projects.json"),
      loadJSON("data/timeline.json"),
      loadJSON("data/skills.json"),
      loadJSON("data/certificates.json"),
      loadJSON("content/nl.json"),
      loadJSON("content/en.json"),
    ]);
    ui = { nl, en };
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:120px 24px;text-align:center;font-family:sans-serif">' +
        "Content could not be loaded. Serve the site through a (local) web server, " +
        "for example <code>npx serve</code> or <code>python -m http.server</code>.</p>"
    );
    return;
  }

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const t = (value) => (value && typeof value === "object" ? value[state.lang] ?? value.nl : value);
  const uiText = (key) => key.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), ui[state.lang]);
  // Typography only: keep a spaced dash with the word before it, so a title never starts a line with "- "
  const keepDash = (s) => String(s ?? "").replace(/ ([-–—]) /g, "\u00A0$1 ");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    document.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
    // The language travels along to the privacy page
    document.querySelectorAll('a[href^="privacy.html"]').forEach((a) => {
      a.href = state.lang === "en" ? "privacy.html?lang=en" : "privacy.html";
    });
  }

  /* ---------- Section renderers ---------- */
  function renderHighlights() {
    $("#highlightsGrid").innerHTML = highlights
      .map((h) => {
        const external = h.link && h.link.startsWith("http");
        const inner = `<span class="moment-year">${esc(h.year)}</span>
          <h3>${esc(t(h.title))}</h3>
          <p>${esc(t(h.text))}</p>`;
        return h.link
          ? `<li class="moment reveal"><a href="${esc(h.link)}"${external ? ' target="_blank" rel="noopener"' : ""}>${inner}
              <span class="moment-go" aria-hidden="true">${external ? "↗" : "→"}</span></a></li>`
          : `<li class="moment reveal"><div>${inner}</div></li>`;
      })
      .join("");
  }

  function renderAbout() {
    const L = ui[state.lang].about;
    $("#aboutText").innerHTML = L.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#aboutFacts").innerHTML = (L.facts || [])
      .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
      .join("");
    $("#portraitImg").src = site.portraitImage;
  }

  // "Werkwijze": each pillar points at the project that shows it in practice
  function renderPillars() {
    const L = ui[state.lang].pillars;
    $("#pillarList").innerHTML = pillars
      .map((p, i) => {
        const project = projects.find((x) => x.id === p.project);
        const proof = project
          ? `<a class="pillar-proof" href="#project-${esc(project.id)}"><span class="pillar-proof-label">${esc(L.proof)}</span>
              <span>${esc(t(project.title))} <span aria-hidden="true">→</span></span></a>`
          : "";
        return `<li class="pillar reveal">
          <span class="pillar-no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(t(p.title))}</h3>
          <p class="pillar-promise">${esc(t(p.promise))}</p>
          <p class="pillar-text">${esc(t(p.text))}</p>
          ${proof}
        </li>`;
      })
      .join("");
  }

  // Each project is a small case study: a (sticky) title column beside the visual and problem / role / result
  function renderProjects() {
    const L = ui[state.lang].projects;
    const size = (p) => (p.imageWidth && p.imageHeight ? ` width="${Number(p.imageWidth)}" height="${Number(p.imageHeight)}"` : "");
    $("#projectsList").innerHTML = projects
      .map((p, i) => {
        const img = p.image
          ? `<img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}"${size(p)} loading="lazy" decoding="async">`
          : "";
        // A video links out instead of embedding, so the page stays free of third-party cookies
        const visual = !img
          ? ""
          : p.video
            ? `<a class="case-visual case-video" href="${esc(p.video)}" target="_blank" rel="noopener">${img}
                <span class="case-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(L.watch_trailer)} ↗</span></a>`
            : `<div class="case-visual">${img}</div>`;
        const external = p.cta.url.startsWith("http");
        const tags = p.tech.map((c) => `<li>${esc(t(c))}</li>`).join("");
        return `<article class="case reveal" id="project-${esc(p.id)}">
          <div class="case-side">
            <p class="case-meta"><span class="case-no">${String(i + 1).padStart(2, "0")}</span>${esc(t(p.tag))}</p>
            <h3>${esc(keepDash(t(p.title)))}</h3>
            <p class="case-intro">${esc(t(p.intro))}</p>
            <a class="case-cta" href="${esc(p.cta.url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(t(p.cta.label))}</a>
          </div>
          <div class="case-main">
            ${visual}
            <dl class="case-facts">
              <div><dt>${esc(L.label_problem)}</dt><dd>${esc(t(p.problem))}</dd></div>
              <div><dt>${esc(L.label_role)}</dt><dd>${esc(t(p.role))}</dd></div>
              <div><dt>${esc(L.label_result)}</dt><dd>${esc(t(p.result))}</dd></div>
            </dl>
            <ul class="tags">${tags}</ul>
          </div>
        </article>`;
      })
      .join("");
  }

  // Full-bleed photo interludes (data/site.json → interludes), filled into the slots in order.
  // Entries without a src are skipped; with none, the slots stay empty and take no space.
  function renderInterludes() {
    const photos = (site.interludes || []).filter((it) => it && it.src);
    document.querySelectorAll(".interlude-slot").forEach((slot, i) => {
      const it = photos[i];
      slot.innerHTML = it
        ? `<figure class="interlude"><img src="${esc(it.src)}" alt="${esc(t(it.alt) ?? "")}" width="${Number(it.width) || 2400}" height="${Number(it.height) || 1350}"${it.position ? ` style="object-position:${esc(it.position)}"` : ""} loading="lazy" decoding="async">${it.caption ? `<figcaption>${esc(t(it.caption))}</figcaption>` : ""}</figure>`
        : "";
    });
  }

  // One list, file order (newest first). Entries that share a "group" become one card that shows the
  // progression oldest → newest; descriptions sit in native <details>; "present" entries get a "Nu" marker.
  function renderTimeline() {
    const L = ui[state.lang].experience;
    const when = (p) => (p.from === p.to ? p.from : `${p.from} — ${p.to === "present" ? L.present : p.to}`);
    const now = (p) => (p.to === "present" ? `<span class="tl-now">${esc(L.now)}</span>` : "");
    const more = (item) =>
      `<details class="tl-more"><summary>${esc(L.details)}<span class="sr-only">: ${esc(t(item.title))}</span></summary>
        <p>${esc(t(item.description))}</p></details>`;
    const kind = (item) => esc(L.kinds[item.kind] ?? item.kind);
    const done = new Set();
    $("#timelineList").innerHTML = timeline
      .map((item) => {
        if (!item.group) {
          return `<li class="tl-row reveal">
            <p class="tl-when">${esc(when(item.period))}${now(item.period)}</p>
            <div class="tl-body">
              <p class="tl-kind">${kind(item)}</p>
              <h3>${esc(t(item.title))}</h3>
              <p class="tl-org">${esc(item.org)}</p>
              ${more(item)}
            </div>
          </li>`;
        }
        if (done.has(item.group)) return "";
        done.add(item.group);
        const steps = timeline.filter((x) => x.group === item.group).reverse(); // oldest first
        const span = {
          from: steps[0].period.from,
          to: steps.some((x) => x.period.to === "present") ? "present" : steps[steps.length - 1].period.to,
        };
        return `<li class="tl-row tl-group reveal">
          <p class="tl-when">${esc(when(span))}${now(span)}</p>
          <div class="tl-body">
            <p class="tl-kind">${kind(item)} · ${esc(L.growth)}</p>
            <h3>${esc(item.org)}</h3>
            <ol class="tl-steps" style="--steps: ${steps.length}">
              ${steps
                .map(
                  (x, i) => `<li class="tl-step${x.period.to === "present" ? " is-now" : ""}" style="--step: ${i}">
                    <span class="tl-step-when">${esc(when(x.period))}</span>
                    <span class="tl-step-title">${esc(t(x.title))}</span>
                    ${more(x)}
                  </li>`
                )
                .join("")}
            </ol>
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

  /* ---------- Hero demo (Fig. 1) ---------- */
  // Each "return visit" moves the add-to-cart button to the next spot; a dashed ghost marks where it was.
  // The caption is a polite live region, so the change is announced; with reduced motion the move is instant (CSS).
  const demo = { visit: 1, spot: 0, spots: 3 };
  const specimenPage = $("#specimenPage");

  function renderDemo() {
    const L = ui[state.lang].hero.demo;
    $("#specimenVisit").textContent = L.visit.replace("{n}", demo.visit);
    const moved = demo.visit > 1 ? `<span class="sr-only">${esc(L.moved.replace("{n}", demo.visit))} </span>` : "";
    $("#specimenCaption").innerHTML = moved + esc(L.caption);
  }

  $("#specimenBtn").addEventListener("click", () => {
    specimenPage.dataset.prev = demo.spot;
    demo.spot = (demo.spot + 1) % demo.spots;
    demo.visit += 1;
    specimenPage.dataset.spot = demo.spot;
    renderDemo();
  });

  /* ---------- Reveal animations ---------- */
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
    document.querySelectorAll(".reveal, .skills-grid, .hero h1 em").forEach((el) => io.observe(el));
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
    renderSocials();
    renderDemo();
    observeReveals();
  }

  /* ---------- Language ---------- */
  // Kept in the URL instead of storage: shareable, survives a reload, stores nothing
  document.querySelectorAll(".seg-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.dataset.lang === state.lang) return;
      state.lang = btn.dataset.lang;
      const url = new URL(location.href);
      if (state.lang === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      history.replaceState(null, "", url);
      renderAll();
    })
  );

  /* ---------- Theme ---------- */
  // index.html sets the system theme before first paint; a click overrides it for this visit only
  const themeBtn = $("#themeBtn");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  let themePicked = false;
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
  };
  themeBtn.addEventListener("click", () => {
    themePicked = true;
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  systemDark.addEventListener("change", (e) => {
    if (!themePicked) applyTheme(e.matches ? "dark" : "light");
  });

  /* ---------- Compact nav menu ---------- */
  // Disclosure pattern: focus stays on the button and Tab continues into the menu (it follows in the DOM).
  // Esc closes and returns focus; a link, a click outside or focus leaving the bar closes it too.
  const topbar = $(".topbar");
  const menuBtn = $("#menuBtn");
  const navMenu = $("#navMenu");
  const isMenuOpen = () => menuBtn.getAttribute("aria-expanded") === "true";
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    navMenu.classList.toggle("open", open);
  };
  menuBtn.addEventListener("click", () => setMenu(!isMenuOpen()));
  navMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (isMenuOpen() && !topbar.contains(e.target)) setMenu(false);
  });
  topbar.addEventListener("focusout", (e) => {
    if (isMenuOpen() && e.relatedTarget && !topbar.contains(e.relatedTarget)) setMenu(false);
  });
  window.matchMedia("(max-width: 860px)").addEventListener("change", () => setMenu(false));

  /* ---------- Honest banner ---------- */
  // Dismissing removes it from the page; keyboard focus moves on to whatever came next
  $("#honestBtn").addEventListener("click", () => {
    const honest = $("#honest");
    const next = [...document.querySelectorAll("a[href], button, input, textarea, summary")].find(
      (el) => honest.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !honest.contains(el)
    );
    honest.classList.add("gone");
    setTimeout(() => (honest.hidden = true), reducedMotion.matches ? 0 : 450);
    next?.focus();
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const L = ui[state.lang].contact;
    status.className = "form-status";

    if (form.company.value) return; // honeypot: bots fill this hidden field, humans never do

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
  const github = (site.socials || []).find((s) => s.label === "GitHub");
  if (github) $("#githubBtn").href = github.url;
  else $("#githubBtn").remove();
  $("#year").textContent = new Date().getFullYear();
  applyTheme(document.documentElement.dataset.theme);
  renderAll();
})();
