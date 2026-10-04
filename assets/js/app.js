/* =============================================================
   app.js — loads content (content/*.json) and data (data/*.json)
   and renders the site. Changing content = changing JSON;
   this code does not need to be touched for that.
   ============================================================= */

(async function () {
  "use strict";

  const state = {
    lang: localStorage.getItem("site-lang") === "en" ? "en" : "nl",
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };

  /* ---------- Hero video ---------- */
  // Started before the content loads, so the intro never waits on the JSON
  const heroVideo = document.getElementById("heroVideo");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData;
  if (calm) heroVideo.poster = heroVideo.dataset.posterEnd; // rest on the finished title; the button still plays it
  else heroVideo.play().catch(() => {}); // autoplay can be refused (e.g. Low Power Mode); the button then offers play

  /* ---------- Hero scroll ---------- */
  // The page sheet slides up over the pinned video. --p runs from 0 to 1 until the sheet covers it;
  // the CSS lets the video recede with it, and the nav stays transparent while it floats over the video.
  const heroStage = document.getElementById("heroStage");
  const pageSheet = document.getElementById("pageSheet");
  const nav = document.querySelector("nav");
  let scrollQueued = false;
  function updateHeroScroll() {
    scrollQueued = false;
    // The sheet starts at offsetTop, so it has covered the video once the page has scrolled that far
    const p = Math.min(Math.max(scrollY / pageSheet.offsetTop, 0), 1);
    heroStage.style.setProperty("--p", p.toFixed(3));
    heroStage.classList.toggle("covered", p === 1);
    nav.classList.toggle("on-stage", p < 0.5); // past halfway the faded video is too light for white nav text
  }
  const queueHeroScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateHeroScroll);
  };
  addEventListener("scroll", queueHeroScroll, { passive: true });
  addEventListener("resize", queueHeroScroll);
  updateHeroScroll();

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
    document.querySelectorAll("[data-site]").forEach((el) => {
      el.textContent = site[el.dataset.site] ?? el.textContent;
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

  function renderVideoButton() {
    const s = heroVideo.ended ? "ended" : heroVideo.paused ? "paused" : "playing";
    const label = uiText({ playing: "hero.video_pause", paused: "hero.video_play", ended: "hero.video_replay" }[s]);
    heroStage.dataset.state = s;
    videoBtn.setAttribute("aria-label", label);
    videoBtn.title = label;
  }

  function renderSocials() {
    $("#socialLinks").innerHTML = (site.socials || [])
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
      .join("");
  }

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
    renderVideoButton();
    observeReveals();
  }

  /* ---------- Language & theme ---------- */
  const langBtn = $("#langBtn");
  langBtn.textContent = state.lang === "nl" ? "EN" : "NL";
  langBtn.addEventListener("click", () => {
    state.lang = state.lang === "nl" ? "en" : "nl";
    langBtn.textContent = state.lang === "nl" ? "EN" : "NL";
    localStorage.setItem("site-lang", state.lang);
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

  /* ---------- Hero video controls ---------- */
  // Pause/play/replay: the intro moves for longer than 5 seconds, so it must be stoppable (WCAG 2.2.2)
  const videoBtn = $("#heroVideoBtn");
  ["play", "pause", "ended"].forEach((type) => heroVideo.addEventListener(type, renderVideoButton));
  // play() on an ended video starts it from the beginning, which covers replay
  videoBtn.addEventListener("click", () => (heroVideo.paused ? heroVideo.play().catch(() => {}) : heroVideo.pause()));

  /* ---------- Honest banner ---------- */
  $("#honestBtn").addEventListener("click", () => $("#honest").classList.add("gone"));

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
  applyTheme();
  renderAll();
})();
