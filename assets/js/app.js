/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   Nothing is stored: the language lives in the URL (?lang=en),
   the theme follows the system until the visitor picks one.
   One script for every page: index.html, and the project pages in
   projecten/<id>/ (marked with data-project on <body>).
   ============================================================= */

(async function () {
  "use strict";

  const state = {
    lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "nl",
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Pages below the site root (projecten/<id>/) set data-root="../../" on <html>; paths from the JSON get it prefixed
  const root = document.documentElement.dataset.root || "";
  const projectId = document.body.dataset.project;

  /* ---------- Load data ---------- */
  async function loadJSON(path) {
    // "no-cache" makes the browser always revalidate (ETag), so content changes show up
    // immediately while unchanged JSON is not downloaded again
    const res = await fetch(root + path, { cache: "no-cache" });
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
    document.documentElement.classList.remove("is-loading");
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
  // Links to the site's other pages carry the language along: "privacy.html" → "privacy.html?lang=en"
  const withLang = (href) => {
    if (state.lang !== "en") return href;
    const [path, hash] = href.split("#");
    return `${path}${path.includes("?") ? "&" : "?"}lang=en${hash !== undefined ? "#" + hash : ""}`;
  };

  /* ---------- Static UI strings ---------- */
  function applyUIStrings() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-t]").forEach((el) => {
      const v = uiText(el.dataset.t);
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll("[data-t-html]").forEach((el) => {
      const v = uiText(el.dataset.tHtml);
      // A space before each <br> keeps the words apart where CSS hides the break (the hero on phones)
      if (v !== undefined) el.innerHTML = v.replace(/<br\s*\/?>/g, " <br>");
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
    // Links to other pages of the site keep the language (data-keep-lang holds the plain href)
    document.querySelectorAll("a[data-keep-lang]").forEach((a) => {
      a.href = withLang(a.dataset.keepLang);
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
    $("#portraitImg").src = root + site.portraitImage;
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

  // A project's visual, problem / role / result and tags: shared by the home page and the project pages
  function caseParts(p, { eager = false } = {}) {
    const L = ui[state.lang].projects;
    const size = p.imageWidth && p.imageHeight ? ` width="${Number(p.imageWidth)}" height="${Number(p.imageHeight)}"` : "";
    const img = p.image
      ? `<img src="${esc(root + p.image)}" alt="${esc(t(p.imageAlt))}"${size}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`
      : "";
    // A video links out instead of embedding, so the page stays free of third-party cookies
    const visual = !img
      ? ""
      : p.video
        ? `<a class="case-visual case-video" href="${esc(p.video)}" target="_blank" rel="noopener">${img}
            <span class="case-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(L.watch_trailer)} ↗</span></a>`
        : `<div class="case-visual">${img}</div>`;
    const facts = `<dl class="case-facts">
        <div><dt>${esc(L.label_problem)}</dt><dd>${esc(t(p.problem))}</dd></div>
        <div><dt>${esc(L.label_role)}</dt><dd>${esc(t(p.role))}</dd></div>
        <div><dt>${esc(L.label_result)}</dt><dd>${esc(t(p.result))}</dd></div>
      </dl>`;
    const tags = `<ul class="tags">${p.tech.map((c) => `<li>${esc(t(c))}</li>`).join("")}</ul>`;
    const external = p.cta.url.startsWith("http");
    const cta = `<a class="case-cta" href="${esc(external ? p.cta.url : withLang(root + p.cta.url))}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(t(p.cta.label))}</a>`;
    return { visual, facts, tags, cta };
  }

  // Each project is a small case study: a (sticky) title column beside the visual and problem / role / result.
  // The project page link says "Lees meer" only once a project has extra text ("story") to read there.
  function renderProjects() {
    const L = ui[state.lang].projects;
    $("#projectsList").innerHTML = projects
      .map((p, i) => {
        const { visual, facts, tags, cta } = caseParts(p);
        return `<article class="case reveal" id="project-${esc(p.id)}">
          <div class="case-side">
            <p class="case-meta"><span class="case-no">${String(i + 1).padStart(2, "0")}</span>${esc(t(p.tag))}</p>
            <h3>${esc(keepDash(t(p.title)))}</h3>
            <p class="case-intro">${esc(t(p.intro))}</p>
            <div class="case-links">${cta}
              <a class="case-page" href="${esc(withLang(`${root}projecten/${p.id}/`))}">${esc(t(p.story) ? L.read_more : L.project_page)} <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div class="case-main">
            ${visual}
            ${facts}
            ${tags}
          </div>
        </article>`;
      })
      .join("");
  }

  // projecten/<id>/: the same case study on its own page, with room for an optional "story" and links to the others
  function renderProjectPage() {
    const L = ui[state.lang].projects;
    const i = projects.findIndex((x) => x.id === projectId);
    const p = projects[i];
    if (!p) return;
    const { visual, facts, tags, cta } = caseParts(p, { eager: true });
    const story = [].concat(t(p.story) || []).map((para) => `<p>${esc(para)}</p>`).join("");
    const link = (x, label, rel) =>
      `<a class="pp-${rel}" href="${esc(withLang(`${root}projecten/${x.id}/`))}" rel="${rel}"><span class="pp-dir">${esc(label)}</span>${esc(keepDash(t(x.title)))}</a>`;
    const n = projects.length;
    document.title = `${t(p.title)} — ${site.name}`;
    $("#projectPage").innerHTML = `
      <a class="pp-back" href="${esc(withLang(root + "#projecten"))}"><span aria-hidden="true">←</span> ${esc(L.all_projects)}</a>
      <header class="pp-head">
        <p class="case-meta"><span class="case-no">${String(i + 1).padStart(2, "0")}</span>${esc(t(p.tag))}</p>
        <h1>${esc(keepDash(t(p.title)))}</h1>
        <p class="pp-intro">${esc(t(p.intro))}</p>
      </header>
      ${visual}
      <div class="pp-body">
        <div>${facts}${story ? `<div class="pp-story">${story}</div>` : ""}</div>
        <aside class="pp-aside">${tags}${cta}</aside>
      </div>
      ${n > 1 ? `<nav class="pp-pager" aria-label="${esc(L.more_projects)}">${link(projects[(i - 1 + n) % n], L.prev, "prev")}${link(projects[(i + 1) % n], L.next, "next")}</nav>` : ""}`;
  }

  // Full-bleed photo interludes (data/site.json → interludes), filled into the slots in order.
  // Entries without a src are skipped; with none, the slots stay empty and take no space.
  function renderInterludes() {
    const photos = (site.interludes || []).filter((it) => it && it.src);
    document.querySelectorAll(".interlude-slot").forEach((slot, i) => {
      const it = photos[i];
      slot.innerHTML = it
        ? `<figure class="interlude"><img src="${esc(root + it.src)}" alt="${esc(t(it.alt) ?? "")}" width="${Number(it.width) || 2400}" height="${Number(it.height) || 1350}"${it.position ? ` style="object-position:${esc(it.position)}"` : ""} loading="lazy" decoding="async">${it.caption ? `<figcaption>${esc(t(it.caption))}</figcaption>` : ""}</figure>`
        : "";
    });
  }

  // One list, file order (newest first). Entries that share a "group" become one card that shows the
  // progression oldest → newest; descriptions sit in native <details>; "present" entries get a "Nu" marker.
  function renderTimeline() {
    const L = ui[state.lang].experience;
    const when = (p) => (p.from === p.to ? p.from : `${p.from} — ${p.to === "present" ? L.present : p.to}`);
    const now = (p) => (p.to === "present" ? `<span class="route-now">${esc(L.now)}</span>` : "");
    const more = (item) =>
      `<details class="route-more"><summary>${esc(L.details)}<span class="sr-only">: ${esc(t(item.title))}</span></summary>
        <p>${esc(t(item.description))}</p></details>`;
    const kind = (item) => esc(L.kinds[item.kind] ?? item.kind);
    const done = new Set();
    $("#timelineList").innerHTML = timeline
      .map((item) => {
        if (!item.group) {
          return `<li class="route-row reveal">
            <p class="route-when">${esc(when(item.period))}${now(item.period)}</p>
            <div class="route-body">
              <p class="route-kind">${kind(item)}</p>
              <h3>${esc(t(item.title))}</h3>
              <p class="route-org">${esc(item.org)}</p>
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
        return `<li class="route-row route-group reveal">
          <p class="route-when">${esc(when(span))}${now(span)}</p>
          <div class="route-body">
            <p class="route-kind">${kind(item)} · ${esc(L.growth)}</p>
            <h3>${esc(item.org)}</h3>
            <ol class="route-steps" style="--steps: ${steps.length}">
              ${steps
                .map(
                  (x, i) => `<li class="route-step${x.period.to === "present" ? " is-now" : ""}" style="--step: ${i}">
                    <span class="route-step-when">${esc(when(x.period))}</span>
                    <span class="route-step-title">${esc(t(x.title))}</span>
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

  // Methods & tools grouped under the three pillars, soft skills as a plain list, languages.
  // (skills.json → "bars" and "tools" stay in the data but are no longer shown.)
  function renderSkills() {
    $("#capGroups").innerHTML = pillars
      .map((p, i) => {
        const group = (skills.capabilities || []).find((c) => c.pillar === p.id);
        if (!group) return "";
        return `<div class="cap-group">
          <h4><span class="cap-no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>${esc(t(p.title))}</h4>
          <ul>${group.items.map((c) => `<li>${esc(t(c))}</li>`).join("")}</ul>
        </div>`;
      })
      .join("");
    $("#softSkills").innerHTML = (skills.soft || []).map((s) => `<li>${esc(t(s))}</li>`).join("");
    $("#languageList").innerHTML = skills.languages
      .map((l) => `<div><dt>${esc(t(l.name))}</dt><dd>${esc(t(l.level))}</dd></div>`)
      .join("");
  }

  function renderCertificates() {
    const section = $("#certificaten");
    section.classList.toggle("hidden", !certificates.length);
    $("#certList").innerHTML = certificates
      .map(
        (c) => `<li><span>${esc(t(c.title))}${c.issuer ? ` <span class="cert-issuer">— ${esc(c.issuer)}</span>` : ""}</span>
          <span class="cert-year">${esc(c.year ?? "")}</span></li>`
      )
      .join("");
  }

  function renderSocials() {
    $("#socialLinks").innerHTML = (site.socials || [])
      .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} <span aria-hidden="true">↗</span></a></li>`)
      .join("");
  }

  /* ---------- Hero: Fig. 1, a mini-experiment ---------- */
  // Six rounds of "click Add to cart as fast as you can". In round 6 the button moves to the top left and a
  // look-alike decoy takes its old spot; a debriefing then explains what happened. It only starts when the
  // visitor presses Start, and the reaction times never leave this page.
  const ROUNDS = 6;
  const HABIT_SLOT = 5; // bottom right: the button's spot in rounds 1–5
  const NEW_SLOT = 0; // top left: where it moves in round 6
  const lab = { phase: "idle", round: 0, times: [], decoy: false, keys: false, shown: 0, timer: 0 };
  const labEl = $("#lab");

  function renderLab() {
    if (!labEl) return;
    const T = ui[state.lang].hero.lab;
    const t = lab.times;
    const trap = lab.round === ROUNDS;
    labEl.dataset.phase = lab.phase;
    $("#labRound").textContent = `${lab.round}/${ROUNDS}`;

    // The mock shop: a product line and six actions; one is the target, and in round 6 another one is the decoy
    const note = (slot) =>
      lab.phase !== "done" ? "" : slot === HABIT_SLOT ? (lab.decoy ? T.note_hit : T.note_decoy) : slot === NEW_SLOT ? T.note_target : "";
    const slots = Array.from({ length: 6 }, (_, i) =>
      i === (trap ? NEW_SLOT : HABIT_SLOT) ? ["target", T.target] : trap && i === HABIT_SLOT ? ["decoy", T.decoy.replace(/€ /g, "€\u00A0")] : ["plain", T.actions[i]]
    );
    const screen = $("#labScreen");
    screen.inert = lab.phase !== "stim";
    screen.innerHTML = `<p class="lab-product"><span class="lab-thumb" aria-hidden="true"></span>${esc(T.product)}<span class="lab-price">${esc(T.price)}</span></p>
      <div class="lab-grid">${slots
        .map(([kind, label], i) => {
          const attrs = `class="lab-btn is-${kind}"${note(i) ? ` data-note="${esc(note(i))}"` : ""}`;
          return kind === "plain" ? `<span ${attrs}>${esc(label)}</span>` : `<button ${attrs} type="button" data-kind="${kind}">${esc(label)}</button>`;
        })
        .join("")}</div>`;

    // The visitor's own reaction times; round 1 is practice, so the average uses rounds 2–5
    const max = Math.max(400, ...t) * 1.18; // bars start at zero and scale to the slowest round
    const base = t.length >= 5 ? (t[1] + t[2] + t[3] + t[4]) / 4 : 0;
    $("#labBars").innerHTML = Array.from({ length: ROUNDS }, (_, i) => {
      const v = t[i];
      const cls = `${i === ROUNDS - 1 ? "is-trap" : ""}${v === undefined ? " is-empty" : ""}`.trim();
      return `<li${cls ? ` class="${cls}"` : ""} style="--h: ${v === undefined ? 0 : (v / max).toFixed(3)}"${v === undefined ? "" : ` title="${i + 1}: ${Math.round(v)} ms"`}>
        <i></i><span>${i + 1}</span>${i === ROUNDS - 1 && v !== undefined ? `<b>${Math.round(v)}</b>` : ""}</li>`;
    }).join("");
    const mean = $("#labMean");
    mean.hidden = !base;
    if (base) {
      mean.style.setProperty("--h", (base / max).toFixed(3));
      mean.firstElementChild.textContent = `${T.mean} ${Math.round(base)}`;
    }

    if (lab.phase === "done") {
      const extra = Math.round(t[ROUNDS - 1] - base);
      const key = lab.decoy ? "debrief_decoy" : lab.keys ? "debrief_keys" : extra > 40 ? "debrief_slower" : "debrief_steady";
      $("#labDebriefText").textContent = T[key].replace("{ms}", extra);
      $("#labSummary").textContent = T.summary.replace("{list}", t.map((v) => Math.round(v)).join(", "));
    }
  }

  function labNextRound() {
    lab.round += 1;
    lab.phase = "fix";
    renderLab();
    $("#labStage").focus({ preventScroll: true }); // keyboard users carry on with Tab from here
    // A fixation cross first, for a random half second or so, as in a real reaction-time task
    lab.timer = setTimeout(() => {
      lab.phase = "stim";
      renderLab();
      $("#labLive").textContent = ui[state.lang].hero.lab.round.replace("{n}", lab.round).replace("{total}", ROUNDS);
      requestAnimationFrame(() => (lab.shown = performance.now()));
    }, 450 + Math.random() * 450);
  }

  function labStart() {
    clearTimeout(lab.timer);
    Object.assign(lab, { round: 0, times: [], decoy: false, keys: false });
    labNextRound();
  }

  $("#labStart")?.addEventListener("click", labStart);
  $("#labAgain")?.addEventListener("click", labStart);
  $("#labScreen")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-kind]");
    if (!btn || lab.phase !== "stim") return;
    lab.times.push(performance.now() - lab.shown);
    if (lab.round < ROUNDS) return labNextRound();
    lab.decoy = btn.dataset.kind === "decoy";
    lab.keys = e.detail === 0; // Enter or Space instead of a pointer
    lab.phase = "done";
    renderLab();
    $("#labDebriefTitle").focus();
  });

  /* ---------- Reveal animations ---------- */
  // Where CSS scroll-driven animations exist, .reveal needs no JS; the observer then only draws the hero underline
  const cssReveal = window.CSS?.supports?.("animation-timeline: view()");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );

  function observeReveals() {
    document.querySelectorAll(cssReveal ? ".hero h1 em" : ".reveal, .hero h1 em").forEach((el) => io.observe(el));
  }

  function renderAll() {
    applyUIStrings();
    if (projectId) {
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
      renderLab();
    }
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
  $("#honestBtn")?.addEventListener("click", () => {
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
  const fields = form ? [...form.querySelectorAll(".field input, .field textarea")] : [];
  fields.forEach((f) => f.addEventListener("input", () => f.validity.valid && f.removeAttribute("aria-invalid")));
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const L = ui[state.lang].contact;
    status.className = "form-status";

    if (form.elements._gotcha.value) return; // honeypot: bots fill this hidden field, humans never do

    // Mark what's wrong and take keyboard users straight to the first problem
    fields.forEach((f) => (f.validity.valid ? f.removeAttribute("aria-invalid") : f.setAttribute("aria-invalid", "true")));
    if (!form.checkValidity()) {
      status.textContent = L.status_invalid;
      status.classList.add("err");
      form.querySelector("[aria-invalid]")?.focus();
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
  if ($("#cvBtn")) $("#cvBtn").href = root + site.cvFile;
  const github = (site.socials || []).find((s) => s.label === "GitHub");
  if (github) $("#githubBtn")?.setAttribute("href", github.url);
  else $("#githubBtn")?.remove();
  $("#year").textContent = new Date().getFullYear();
  applyTheme(document.documentElement.dataset.theme);
  renderAll();
  // Show the page once it's rendered; give the (preloaded) fonts a brief moment so text doesn't reflow after
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 500))]);
  document.documentElement.classList.remove("is-loading");
  // The browser jumped to #anchor before the content above it existed; go there again now that it's rendered
  if (location.hash.length > 1) {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep as is */ }
    document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }
})();
