# Redesign v3: notes for review

Branch `redesign/v3`, cut from `main` at `813bcf4` (V1.13). Fresh redesign: `redesign/v2` was deliberately not opened or reused.

## Direction

**One idea:** the site reads like a well-made research paper that happens to be interactive. Robert studies how people actually use interfaces, so the page behaves like a careful study does: it numbers its sections, labels its figures, shows its evidence in ruled tables, and explains every experiment it runs on you.

- **Clean and light first.** Soft paper-white background, near-black ink, one accent. The dark theme is a proper second theme that follows the system, never the default.
- **Accent: your brand red** (`#E23C46` light, `#FF5C63` dark). The first version used signal blue; you asked for the red back after review. Small text and fills behind white text use `--accent-strong` (`#C42D38` in light mode, the same `#FF5C63` in dark), because `#E23C46` is only ~3.9:1 on the paper background and white on it ~4.2:1, both below WCAG AA for small text.
- **Type:** the three existing families stay (Bricolage Grotesque for display, Hanken Grotesk for body, Spline Sans Mono for labels), now self-hosted. Display weight is 600 with tight tracking: confident, not shouty.
- **Paper conventions as the structuring device:** section labels sit in a left margin column like margin notes, and facts, experience and skills sit in ruled tables with hairlines rather than cards with shadows. (Section numbers `§ 01…` and `Fig.` captions were removed after review.)
- **Rhythm:** paper sections alternate with two ink bands (projects and contact) and up to two full-bleed photo interludes.
- **Motion:** small and explanatory. Reveals fade up once, the hero underline draws once. Nothing moves on its own beyond that. Everything is instant under `prefers-reduced-motion`.

## Borrowed patterns and what makes mine different

Reference: jopmors.com, studied only through screenshots of the live site at 1440 and 390 px plus a file listing of its repo. I didn't read his CSS or JS, because every mechanism I needed is standard (sticky nav, `<details>`, IntersectionObserver, CSS scroll-driven animations).

| Pattern borrowed | His version | Mine |
|---|---|---|
| ~~Framed "app window" in the hero~~ | Code editor on a laptop in a photographed room, which zooms in on scroll | **Dropped after review.** The first v3 hero had a fake web-shop window with a "return visit" demo; you didn't like it (too close to v2's idea), so the hero is now type only, with a "right now" column. No framed object at all. |
| Numbered structure, mono labels | `01 / 03` counters and small caps labels | No running section numbers (removed after review): mono section labels in a margin column beside the heading. Pillars are numbered `1`, `2`, `3` as large figures in a three-column ruled grid. |
| About: portrait + key–value facts | Portrait above a 2×2 fact grid, narrative in a right column, serif-italic intro line | Narrative on the left, a captioned portrait figure on the right, and the facts as a full-width ruled table (`dl`) underneath. No serif, no italic intro line. |
| Three numbered pillars | Stacked large cards, each with a generative line illustration and an italic serif promise | Three equal columns side by side, separated by hairlines, text only. The promise is set in the body face, not italic serif. |
| Project cards as mini case studies | Glass cards on dark, big product visual, status chips, Launched / Ongoing split | One list on an ink band. Each project is a two-column row: a sticky left column (number, meta line, title, link), a right column with the image and a problem / role / result table. No status split, no glass. |
| Full-bleed photo interludes | Moody photos with cards and text layered on top | Plain photographs at a fixed 21:9 ratio with nothing on top, and a small mono caption line below, like a plate in a book. Nothing renders while the list is empty. |
| Capabilities grouped by pillar | Glass cards over a photo, plus a strip of technology logos | Ruled text lists under the three pillar names, soft skills as a plain list, languages as a small table. No logos. |
| Richer timeline | Centre spine, alternating sides, huge year numerals, monogram badges, "More +" | A one-column ledger: period in mono on the left, the role on the right, a `Nu` marker and a native `<details>` for the description. The Amac roles are one card with a Junior → Medior → Senior stepper. No spine, no year numerals, no badges. |
| Sticky nav with a contact CTA | Floating centred glass capsule | A full-width bar with a hairline, name on the left, links, NL/EN segments, theme toggle and a filled Contact pill on the right. Below 760 px, a disclosure menu. |
| Strong closing contact | Photo background, big headline with a full stop, glass form | Ink band, existing contact copy as the statement, the form with plain ruled fields, socials as text links. No photo, no full stop as a device. |

## Deliberately not copied

- Code-editor/IDE window, name with numbered roles, the "in one sentence" block, headings ending in a full stop, the Launched / Ongoing split, timeline monograms, the logo strip.
- Charcoal dark-by-default palette, dusk skylines, glass/blur cards, serif-italic accents.
- Smooth-scroll libraries, scroll-jacking or scroll-linked zoom.
- No class names, IDs, custom properties, keyframe names, file structure, headings or text from his site. The originality script in section 4 checks this.

## Plan

1. Brief (this file) — commit.
2. Tokens, self-hosted fonts, base styles, nav with mobile menu.
3. Hero (first with a specimen demo, later replaced by a type-only hero) and the honest note.
4. Highlights, About with facts, pillars.
5. Projects (ink band) and interludes.
6. Experience timeline with groups, `Nu` and `<details>`.
7. Skills by pillar, certificates, contact (ink band, `_gotcha`).
8. Hardening: meta, JSON-LD, noscript, 404, privacy page fonts, robots.
9. Verification: `node --test`, the browser matrix, keyboard, Lighthouse/axe, the originality script. README.
10. Stretch: project detail pages.

Pure logic goes in `assets/js/logic.mjs` (ES module) so Node can test it: timeline grouping, interlude slots, skill groups with fallbacks, section numbering.

## Report

### What changed and why

A complete visual and structural redesign on `redesign/v3`, in 12 commits, one per phase or section:

1. **Brief** (this file).
2. **Tokens, fonts, base, nav:** a new token set in `tokens.css`:
   - light paper palette, brand-red accent (after review; first signal blue), ink band colours
   - type and spacing scales
   - dark theme that follows the system, plus the toggle

   Self-hosted variable fonts with preloads replace Google Fonts. `app.js` became an ES module without `localStorage`. The sticky top bar has NL/EN segments, the theme toggle, a filled Contact pill and an accessible mobile menu. The pinned intro video left the page.
3. **Hero:** the current headline with its drawn underline and the restyled honest note. (It first had a browser-window demo; after review it became type only with a "right now" column, see the decisions log.)
4. **Highlights, About, pillars:** paper-style section heads (their `§` numbers were removed after review), a facts table, and three numbered pillars.
5. **Projects and interludes:** projects as case studies on an ink band with a sticky title column; photo interludes from `site.json` (empty for now).
6. **Experience:** a ledger with a `Nu` marker and `<details>`, plus the Amac roles grouped into one progression card.
7. **Skills, certificates, contact:**
   - capabilities grouped by pillar, soft skills as a list, languages as a table
   - certificates as ledger rows
   - contact on an ink band, with `_gotcha` and `aria-invalid` feedback
8. **Hardening:** meta and OG descriptions, JSON-LD, noscript, the 404 page in the new style, and the privacy page without Google Fonts or storage.
9. **Verification fixes:** menu breakpoint, a button background bug, layout shift on load, label-in-name.
10. **README and tests;** `logic.mjs`.
11. **Stretch:** project detail pages.

### Checks that ran

- **`node --test`:** 16 tests, all passing. They cover the logic helpers, that every JSON file parses, NL/EN key parity, required project fields, timeline kind labels, "deceptive patterns" terminology, and that each project page exists.
- **Browser matrix (Playwright, Chromium):** 4 widths (390, 768, 1280, 1440) × light/dark × NL/EN. All 16 combinations have no console errors or warnings, no horizontal overflow, no empty `data-t` elements, width/height on every image, and **no requests to any other host**. Screenshots are in `_review/v3/` (gitignored).
- **Pages:** the 404 page, the privacy page, the three project pages and the no-JS fallback load without errors in both languages and themes.
- **Keyboard:**
  - Tab order starts at the skip link, which moves focus to `<main>`.
  - Every stop has a visible focus ring.
  - The mobile menu opens with focus on the first link; Esc closes it and returns focus to the button; tabbing out or following a link closes it too.
  - `<details>` open with Enter.
  - The language and theme toggles work with Space/Enter and update `aria-pressed`, `lang` and the labels.
- **Reduced motion:** after scrolling the whole page there are 0 running animations, 0 transitions and no smooth scrolling.
- **Form validation** (Formspree requests blocked in the test, nothing was sent):
  - an empty submit marks all three fields `aria-invalid`, shows the message and focuses the name field
  - an invalid email marks and focuses only that field
  - the message is translated
- **Certificates:** the section stays hidden with `[]`. With a temporary test certificate it appears; with `[]` it hides again. Reverted, and git shows no change. (Tested while the `§` numbers still existed; the show/hide logic is unchanged.)
- **Lighthouse** (local Python server, which has no compression or caching):

  | Page | Performance | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | Home, mobile | 98 | 100 | 100 | 100 |
  | Home, desktop | 100 | 100 | 100 | 100 |
  | Project page, mobile | 91 | 100 | 100 | 100 |

  Remaining hints are only about compression, caching and minification, which GitHub Pages or a build step would handle.
- **axe-core 4** (WCAG 2.0–2.2 A/AA and best practice): 0 violations on the homepage (menu open, all `<details>` open), the 404, privacy and project pages, at 390 and 1280, both themes and both languages.
- **JS size:** 24 KB unminified (`app.js` 19.9 KB, `logic.mjs` 4.2 KB), 8 KB gzipped, under the 30 KB budget. Fonts are 112 KB in total.
- **Originality script** (class names, IDs, custom properties, keyframes, identical strings of 40+ characters): the only overlaps are `js` (a false positive from "app.js" in comments), `#contact`, `--ease` and `--font-mono` (all already in this repo on `main`, before the redesign), and the line `@media (prefers-reduced-motion: reduce) {`. Nothing to rename. The reference clone in `/tmp` is deleted.
- **Distance tests,** per section, comparing his screenshots with mine:
  - **Hero:** photo room with a laptop and giant name vs. a light headline with a small product card.
  - **About:** his facts sit under the photo; mine are a full-width table under narrative + figure.
  - **Pillars:** stacked illustrated cards vs. text columns.
  - **Projects:** glass cards with a status split vs. a sticky column with a case table.
  - **Timeline:** a centre spine with year numerals vs. a ledger.
  - **Skills:** glass cards and logos vs. ruled lists.
  - **Contact:** photo and glass vs. an ink band.

  None reads as "same layout, different colours".

### Unverified

- **Safari and Firefox** (only Chromium was tested). Two things to check by hand in Safari 18+ and Firefox:
  - The scroll-driven reveals: Firefox doesn't support `animation-timeline` yet, so it takes the IntersectionObserver fallback. That fallback path was not exercised.
- **A real screen reader:** how the step list in the Amac card and the "right now" list are read (VoiceOver, Safari).
- **The live form:** never submitted, on purpose. After merging, send one test message to check that Formspree accepts `_gotcha` and still delivers.
- **GitHub Pages specifics:** that `.mjs` is served as JavaScript there (it is locally, and Pages normally does), and that `/projecten/thesis/` works without the trailing `index.html`. Check both on the deployed preview or after merging.

### Small fixes, workarounds, dependencies, abstractions

- **Small fixes:**
  - the dead `contact.footer_location` key
  - `localStorage` removed from three pages
  - the hardcoded form-status green replaced by tokens
  - the portrait `alt` is now translated
  - the honeypot is now `_gotcha`
- **Workarounds:** none marked in the code.
- **New dependencies:** none in the site. The fonts come from `@fontsource-variable/*` 5.3.0 (OFL, licence in `assets/fonts/`). Playwright, Lighthouse and axe-core ran from a scratch folder and are not in the repo. `npm audit` flags issues in Lighthouse's own dependencies there, which don't touch the site.
- **Abstractions:**
  - `logic.mjs`, so the pure logic can be tested with `node --test`.
  - The ink band re-points the colour tokens, so every component works on paper and on ink without duplicate styles.
  - `projectVisual` / `projectCase` / `projectTech` are shared between the homepage cards and the detail pages, to avoid two copies of the same markup.

## Decisions log

- **Hero headline:** the current one, "Goede techniek begint met een goed *gesprek*.", as answered in the preflight. The brief's "Ik ontwerp interfaces die doen wat je verwacht" isn't used.
- **Accent colour:** first signal blue (preflight answer), then back to your brand red after review. `#E23C46` / `#FF5C63` stay as the brand colours for large text, underlines, numerals and dots. A new token `--accent-strong` (`#C42D38`) carries small red text and the filled Contact pill in light mode so they pass WCAG AA (4.5:1). The old site used `#E23C46` for those too, at ~3.9–4.2:1. In dark mode both tokens are `#FF5C63`, with dark text on red fills.
- **Intro video (V1.13) leaves the homepage.** The pinned, autoplaying video stage conflicted with the brief's hero (headline plus specimen; now type only) and with "nothing moves unless the visitor asks". The files in `assets/video/`, the posters and `assets/robert-portfolio-intro.mp4` stay in the repo, untouched. To bring it back, restore the `.hero-stage` markup from `main`. **Decision for you.**
- **No storage at all:** `app.js`, `404.html` and `privacy.html` used `localStorage` for the language. That's removed (the site promises nothing is stored), so a language choice now lasts for the page view only.
- **Language toggle** becomes two segments (NL / EN) with `aria-pressed`. The theme toggle is a button with `aria-pressed` and a translated label. The theme follows the system until the visitor toggles it.
- **Honeypot** renamed from `company` to Formspree's `_gotcha`, which Formspree discards server-side as well. The client still skips sending when it's filled.
- **Grades:** the thesis `result` text still says "beoordeeld met een 8,5". That is existing content in the one place the repo's CLAUDE.md allows a grade, and the brief says nothing gets deleted. There are no grade badges or highlights.
- **Hero: type only (after review).** The shop demo is removed; you chose a type-only hero. Next to the intro sits an "Op dit moment / Right now" column, built from the timeline entries that run until `present` (`currentRoles()` in `logic.mjs`, tested). The thesis isn't in the hero on purpose: it's finished and lives in the projects, and the hero should say what you're doing now. Below 560 px the headline's forced line break is dropped so it wraps naturally; for that, a space was added before `<br>` in `hero.title` (whitespace only, same words).
- **Hero layout:** the headline has a forced line break and is too wide to sit beside the window, so it spans the full width and the window sits beside the intro and buttons. Below 900 px everything stacks.
- **`content/en.json` had an extra key** `contact.footer_location` (unused duplicate of `footer.location`), which broke NL/EN key parity. Removed; a test now checks parity.
- **Pillar section label is "Werkwijze / How I work", not "Wat ik doe".** "What I do" is the reference site's own section label, and the brief forbids his section titles, translated ones included. The pillar names themselves are your working labels.
- **Pillar and fact copy only uses facts already on the site** (thesis N = 40, MobiPad's three layouts and hardware test, the exec(ut), Amac and Sticky roles, languages, hobbies). The "Ontwerpen" promise reuses your old v1.0 headline, "Interfaces die doen wat je verwacht", which felt right there.
- **Section numbers and figure captions removed (after review):** no more `§ 01…` in the section heads and no `Fig.` label under the portrait (only your name stays). `numberSections()` and `pad2()` are gone.
- **Fix: the honest note didn't disappear** after "Duidelijk". `.honest { display: flex }` overrode the `hidden` attribute. A base rule `[hidden] { display: none !important; }` now makes `hidden` always win. Checked with mouse and keyboard at 1280 and 390 px; focus moves to the headline.
- **New optional fields `imageWidth` / `imageHeight` in `projects.json`** (set for all three), so project images get `width`/`height` and don't shift the layout while loading. Without them the image still renders.
- **Interludes** render in three fixed slots (see TODOs). The caption under each photo is a credit line; `alt` is the description for screen readers.
- **Timeline groups:** new optional `group` field in `timeline.json`, set to `"amac"` on the three Amac roles. Grouped roles render as one card at the position of the newest role, titled with the organisation, with the roles as steps oldest → newest. The current step is filled and marked `aria-current="step"`. Each role's description sits in one `<details>`. A group of one renders as a normal row. Logic: `groupTimeline()` in `logic.mjs`, with tests.
- **Flag, not changed (existing copy):** the Amac highlight says "naar Senior Sales Associate met dagverantwoording" in NL but "to Senior Sales Associate and Daily Operations Lead" in EN. The NL version doesn't name the Daily Operations Lead title that the timeline and About text use.
- **Skills:** `bars` in `skills.json` is untouched but no longer rendered (percentages for soft skills suggest a precision they don't have). New fields: `groups` (`[{ pillar, items }]`, pillar ids match `pillars.items[].id` in the content files) and `soft` (a plain list). Without `groups` the old flat `tools` list renders; without `soft` the bar labels render, without levels. "IT-vaardigheden" is left out of the soft skills because the capabilities already cover it. `tools` stays as the fallback.
- **Contact form:** on an invalid submit, the invalid fields get `aria-invalid="true"` and focus moves to the first one, alongside the existing status message. The status colours now come from tokens (`--ok`, `--err`); the hardcoded green is gone.
- **Hardening:** `og:url`, `og:image`, the canonical link, JSON-LD, `<noscript>` and `robots.txt` already existed on `main`. Updated: `meta description`, `og:description` and `twitter:description` now open with the current hero line. JSON-LD gained `description`, `alumniOf`, `worksFor`, `knowsLanguage` and `knowsAbout`, all taken from facts on the site. The noscript message is restyled, and the empty page skeleton is hidden without JS. `robots.txt` was correct and is unchanged.
- **404 page** rebuilt in the new style with its existing NL/EN text; it now has `noindex`, absolute asset paths, a real link instead of a button-with-JS, and no storage.
- **Privacy page:** only technical changes (self-hosted fonts, NL/EN segments without storage, a `<main>` landmark). Wording untouched. **Flag:** it shows `robertkarzijn@icloud.com` twice, while the repo's rules say no email address on the site. Decision for you: keep it (a GDPR contact point is reasonable on a privacy page) or replace it with the form.
- **Project pages (stretch):** `projecten/<id>/index.html` for all three projects, rendered by the same `app.js` (`<body data-page="project" data-project="<id>">`). They use `<base href="/">`, so assets, JSON and `#section` links resolve from the root; the skip link names its own page for that reason. Static per page: `<title>`, meta description and OG tags in Dutch, from the project's existing `title` / `intro`. A new optional field `page` in `projects.json` controls the "Lees meer" link, so a project without a page never links to a 404. A test checks that each `page` exists and points at the right project. The three URLs were added to `sitemap.xml`. **To add a page for a new project:** copy one of the folders, change `data-project`, the title, the description, the canonical/OG URLs and the skip-link path, then set `page` in `projects.json`.
- **Project meta line:** the existing `tag` field already is "type · year", so it's rendered as the meta line. No new year/type fields.
- **Mobile menu breakpoint is 980 px, not 760 px.** In Dutch the full bar (links, NL/EN, theme, Contact) overflowed at 768 px. Below 980 px the links and preferences move into the menu; the Contact pill stays visible.
- **No layout shift on load:** `<main>` stays invisible (`visibility: hidden`) until `app.js` has rendered it once, so the content appears in one go instead of pushing itself down. This took Lighthouse CLS from 0.19–0.76 to ~0.001. A render error still removes the class, so the page never stays blank silently.
- **`logic.mjs` instead of `logic.js`:** Node otherwise picked up a `package.json` in your home folder and warned on every test run. `.mjs` is always a module, needs no `package.json` and is served as `text/javascript`.
- **Language buttons have no `aria-label`:** "NL"/"EN" with labels "Nederlands"/"English" failed label-in-name (WCAG 2.5.3, matters for voice control). The visible text is now the name; the group is labelled "Taal".
- **README stays in English.** The brief says "keep the README in Dutch", but on `main` it's English, and my global rule is English unless the repo uses Dutch. Translating it is a quick follow-up if you want it.
- **Fonts:** Latin subsets only (Dutch, English, German and € are covered). Bricolage Grotesque uses the weight axis only (no optical-size axis), which halves its file size (41 KB instead of 77 KB).

## Copy to review

All new strings are drafts in `content/nl.json` and `content/en.json`. NL is the source; EN is a natural translation.

| Key | NL | EN |
|---|---|---|
| `nav.skip` | Ga naar de inhoud | Skip to content |
| `nav.label` / `nav.menu` / `nav.lang_group` | Hoofdmenu / Menu / Taal | Main menu / Menu / Language |
| `nav.theme` (label of the toggle, `aria-pressed` = dark) | Donker thema | Dark theme |
| `about.portrait_alt` (was hardcoded Dutch in `index.html`) | Portretfoto van Robert Karzijn | Portrait photo of Robert Karzijn |
| `hero.now` (label of the column beside the intro) | Op dit moment | Right now |
| `about.facts` (k / v) | Studie / MSc Human-Computer Interaction, Universiteit Utrecht · Werk / Daily Operations Lead bij Amac, Apeldoorn · Onderzoek / Deceptive patterns en gewoontegedrag in webshops · Talen / Nederlands, Engels, Duits · Daarbuiten / Fotografie, audio en af en toe gamen | Studying / MSc Human-Computer Interaction, Utrecht University · Working / Daily Operations Lead at Amac, Apeldoorn · Research / Deceptive patterns and habitual behaviour in web shops · Languages / Dutch, English, German · Beyond that / Photography, audio and the occasional game |
| `pillars.eyebrow` | Werkwijze | How I work |
| `pillars.title` | Onderzoeken, ontwerpen, organiseren | Research, design, organise |
| `pillars.items[0]` (working label) | **Onderzoeken.** Uitzoeken hoe mensen zich echt gedragen, niet hoe we denken dat ze dat doen. / Van literatuurstudie en experimenteel ontwerp tot dataverzameling en statistische analyse. In mijn bachelorthesis onderzocht ik met 40 deelnemers hoe het verplaatsen van interface-elementen gewoontegedrag in webshops verstoort. | **Research.** Finding out how people actually behave, not how we assume they do. / From literature review and experimental design to data collection and statistical analysis. In my bachelor's thesis I studied with 40 participants how relocating interface elements disrupts habitual behaviour in web shops. |
| `pillars.items[1]` (working label) | **Ontwerpen.** Interfaces die doen wat je verwacht. / Eisen vertalen naar een ontwerp, en dat ontwerp naar iets dat werkt. MobiPad ontwierp en bouwde ik zelf: van requirements en architectuur tot drie controller-layouts, getest op echte hardware. | **Design.** Interfaces that do what you expect. / Translating requirements into a design, and that design into something that works. I designed and built MobiPad myself: from requirements and architecture to three controller layouts, tested on real hardware. |
| `pillars.items[2]` (working label) | **Organiseren.** Mensen, planning en afspraken bij elkaar brengen, met een deadline. / Sprekers werven en begeleiden voor exec(ut), als Daily Operations Lead de dagelijkse operatie bij Amac draaiende houden en als secretaris de administratie van Stichting Sticky bijhouden. | **Organise.** Bringing people, plans and agreements together, against a deadline. / Recruiting and supporting speakers for exec(ut), keeping daily operations running at Amac as Daily Operations Lead, and keeping the administration of Stichting Sticky as its secretary. |
| `projects.label_tech` (screen-reader label of the tech list) | Technieken en methoden | Techniques and methods |
| `interlude.credit` (caption under each photo) | Foto · Robert Karzijn | Photo · Robert Karzijn |
| `experience.now` | Nu | Current |
| `experience.details` (summary of each `<details>`) | Toelichting | Details |
| `experience.group_details` | Wat ik per rol deed | What I did in each role |
| `experience.group_steps` (label of the step list) | Doorgroei | Progression |
| `skills.soft` | Persoonlijke vaardigheden | Soft skills |
| `skills.groups` / `skills.soft` in `data/skills.json` | Grouping of existing tools and project techniques under the pillars; soft skills are the old bar labels minus "IT-vaardigheden". Check that the grouping feels right. | |
| `projects.read_more` | Lees meer | Read more |
| `project_page.back` / `project_page.more` | ← Alle projecten / Andere projecten | ← All projects / Other projects |

## TODOs for Robert

- **Review the drafts** in "Copy to review", especially the pillar texts (working labels).
- **Privacy policy:** a page already exists (`privacy.html`, last updated 1 September 2026). I didn't write or change any legal copy. Check that it's still accurate, see the email-address flag in the decisions log, and consider stating there that no cookies or local storage are used, now that this is literally true.
- **Missing facts I didn't invent:** for the About facts, things like a graduation year for the MSc, a city of residence, or what you're looking for (internship, job, project) could be added if you want them. The current table uses only facts already on the site.
- **Interlude photos.** Add entries to `interludes` in `data/site.json`: `{ "src": "assets/img/interlude-1.webp", "alt": { "nl": "…", "en": "…" } }`. Entries fill the page's three slots in order: (1) between "Werkwijze" and the projects, (2) between experience and skills, (3) between skills and contact. Empty `src` entries are skipped and extra entries are ignored. Export **2400 × 1029 px (21:9) WebP, about 300–400 KB**. Phones crop the same file to 4:3 around the centre, so keep the subject central. Leave `alt` empty only if a photo is purely atmospheric.

## Decisions for you (skipped or left open)

1. **The intro video** is no longer on the page (files kept). Bring it back somewhere (for example as an opt-in "play intro" in About, or on a project page), or leave it out.
2. **The email address on `privacy.html`**: keep it as the GDPR contact point, or point to the form.
3. **The accent colour**: settled, back to your red.
4. **README language**: English kept; say so if you want it in Dutch.
5. **Merging**: not done, and the draft PR stays a draft. Nothing reached `main`.

## Proposed CLAUDE.md for this repo

Not created; this is the proposal. It replaces the current local `CLAUDE.md` once v3 is merged.

```markdown
# CLAUDE.md

robertkarzijn.nl: Robert Karzijn's portfolio (HCI / UX research). Static, bilingual (Dutch default, English), deployed to GitHub Pages from `main`.

## Run and test

    python3 -m http.server    # content is loaded with fetch(), so file:// doesn't work
    node --test               # logic helpers + content checks (JSON parses, NL/EN key parity, project pages exist)

No build step, linter or package.json. Check visual changes in both languages, both themes and at 390 px.

## Architecture

    index.html             Skeleton only. data-t / data-t-html / data-t-aria / data-t-alt keys get their text from content/<lang>.json
    projecten/<id>/        Project detail pages. <base href="/">; body has data-page="project" data-project="<id>"
    404.html, privacy.html Standalone pages with their own small NL/EN dictionary
    assets/css/tokens.css  All fonts, colours, scales, radii, motion. Light, dark (system + toggle) and the "band" (ink) colours
    assets/css/main.css    Components, built only on tokens. .band re-points the colour tokens for the dark sections
    assets/js/app.js       ES module: loads JSON, renders the page, language/theme/menu/form
    assets/js/logic.mjs    Pure helpers (no DOM), unit tested in tests/
    assets/fonts/          Self-hosted variable WOFF2 (Latin) + OFL licence
    content/{nl,en}.json   UI strings, About, facts, pillars. Identical keys in both files
    data/*.json            Projects, timeline, skills, highlights, certificates, site config

Content model (L = string or { "nl", "en" }; optional fields are additive and backwards compatible):
- projects: id, tag: L, title: L, intro: L, image?, imageWidth?, imageHeight?, imageAlt: L (required with image), video?, problem/role/result: L, tech: (string|L)[], cta: {label: L, url}, page? ("projecten/<id>/", only when that page exists)
- timeline: newest first; period {from, to|"present"}, kind (work|education|extracurricular), title: L, org, description: L, group? (same group = one progression card)
- skills: groups? [{pillar: research|design|organise, items}], soft?: L[], languages; tools and bars are legacy fallbacks (bars is not rendered)
- site: name, cvFile, portraitImage, formEndpoint, socials, interludes [{src, alt: L}] (three slots; empty src = nothing)
- certificates: [] hides the section

## Rules

- Vanilla HTML/CSS/JS only. No frameworks, bundlers, npm dependencies, CDN scripts or embeds. Never commit node_modules, package.json or lockfiles.
- Privacy is the identity: no cookies, no localStorage/sessionStorage, no analytics, no third-party requests. The only external request is the Formspree POST. Fonts stay self-hosted.
- Every rendered value goes through esc(). Pure logic goes in logic.mjs with a test.
- Bilingual parity: every change lands in NL and EN, same keys (a test enforces it). Dutch is the source.
- Say "deceptive patterns", never "dark patterns".
- Colours, fonts and sizes only from tokens.css. Anything that moves must be off under prefers-reduced-motion.
- WCAG 2.2 AA: keep the skip link, landmarks, visible focus, aria-pressed toggles, label-in-name, and width/height on images.
- No email address or phone number on the site (privacy.html is a flagged exception, pending Robert's decision). No grades except possibly in the thesis result text.
- Don't touch CNAME, formEndpoint, socials, the CV file or existing images without asking. Don't submit the live form.
- Never invent facts about Robert. Missing info → ask.

## Git

`main` is production and public. Work on a branch, ask before pushing main or merging, never force-push, no Claude attribution in commits or PRs. This file and .claude/ stay out of git.
```
