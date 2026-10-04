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
        const imgTag = p.image
          ? `<img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}" loading="lazy" decoding="async">`
          : "";
        // A video links out instead of embedding, so the page stays free of third-party cookies
        const img = !p.image
          ? ""
          : p.video
            ? `<a class="pimg pvideo" href="${esc(p.video)}" target="_blank" rel="noopener">${imgTag}
                <span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(L.watch_trailer)}</span>
              </a>`
            : `<div class="pimg">${imgTag}</div>`;
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
    renderProjects();
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
