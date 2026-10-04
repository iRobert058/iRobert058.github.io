# Redesign v2: working notes

Branch `redesign/v2`, cut from `main` at `813bcf4` (V1.13). Nothing here touches `main`.

## Progress

_Last update: 2026-10-05 01:40 CEST_

- [x] 1. Study the repo and the reference, write this brief
- [x] 2a. Tokens, self-hosted fonts, base styles
- [x] 2b. Nav (sticky, mobile menu) and hero (specimen demo, honest banner)
- [ ] 2c. Highlights, About (facts), pillars
- [ ] 2d. Projects (ink band) and interludes
- [ ] 2e. Experience timeline (groups, "Nu", details)
- [ ] 2f. Skills (capabilities by pillar), certificates, contact (ink band, `_gotcha`)
- [ ] 2g. Motion pass (scroll-driven reveals + fallback)
- [ ] 3. Hardening (meta, JSON-LD, noscript, robots, 404, privacy page fonts)
- [ ] 4. Verification (matrix, keyboard, Lighthouse/axe, originality script), README
- [ ] 5. Stretch: project detail pages

**Next:** 2c (highlights, About facts, pillars). Sections not yet redesigned still use the "Legacy V1" block at the bottom of `main.css` and the old renderers in `app.js`; that is expected until 2f.
**Half-finished:** nothing.

---

## Read this first: where the brief and the repo disagree

I couldn't ask, so I picked the conservative option each time. Each one is easy to flip.

1. **Hero headline.** The brief says to keep "Ik ontwerp interfaces die doen wat je *verwacht*." That was the v1.0 headline. You replaced it on 10 July (V1.1) with "Goede techniek begint met een goed *gesprek*.", and that's what `content/*.json` contains today. "Keep my headline" plus "existing texts stay as they are" points to the current one, so I kept it and synced the meta/og descriptions to it. To switch back, set `hero.title` to:
   - nl: `"Ik ontwerp interfaces<br>die doen wat je <em>verwacht</em>."`
   - en: `"I design interfaces<br>that do what you <em>expect</em>."`

   Then update `<meta name="description">`, `og:description` and `twitter:description` in `index.html`. The hero demo works with either headline, but it pairs especially well with "verwacht".
2. **README language.** The brief says "keep the README in Dutch", but V1.10 (24 Sep) deliberately translated the repo, README included, to English. I kept it in English so I wasn't undoing that commit, and added the new sections in English.
3. **localStorage.** `app.js`, `404.html` and `privacy.html` store the language in `localStorage` (added in V1.3). Both the brief and CLAUDE.md forbid that, so it's gone. The language now travels in the URL instead (`?lang=en`). That's shareable, survives a reload and is stored nowhere.
4. **The V1.13 intro video.** The brief doesn't mention it. The redesigned page no longer shows it, and all video files stay untouched in `assets/`. Reasons:
   - the brief's hero spec makes the browser specimen the immersive object
   - the video's title card is the name ending in a full stop with a role beneath it, on an always-dark stage. That sits too close to three reference signatures the brief says to avoid: the name with roles beneath it, full-stop headings, and charcoal by default
   - it was the heaviest thing on the page.

   The `hero.video_*` strings stay in the JSON, unused. To bring the video back, the old implementation is in `main` (commit `813bcf4`).
5. **Hardening items that already existed.** `og:url`, `og:image`, the canonical link, the JSON-LD `Person`, `<noscript>`, `robots.txt`, `404.html` and `privacy.html` were already in the repo, although CLAUDE.md's backlog still lists most of them. I verified, extended or restyled them instead of adding duplicates.
6. **The privacy page already exists** (`privacy.html`, dated 1 Sep 2026). As asked, I didn't write a policy or change its text. I only swapped its Google Fonts for the self-hosted ones and removed its `localStorage` use. Note that it shows an e-mail address (`mailto:` twice), which conflicts with CLAUDE.md's "no e-mail address anywhere on the site". It's listed under TODOs for you to decide.

---

## What I'm borrowing (as patterns), and what makes mine different

Reference: jopmors.com (studied 2026-10-05 via screenshots at 1440 and 390, plus a skim of the source for mechanisms). There's no license, so all rights are reserved, and nothing was copied.

| Pattern | How the reference does it | How my version differs |
|---|---|---|
| Immersive hero around a framed "app window" | Photographic dusk office with a laptop running a code editor. A 400svh pinned section zooms into the screen as you scroll ("scroll to enter"). His name is the giant headline. | Text-first hero on warm paper with my existing headline. Beside it sits a light **browser window labelled "Fig. 1"** containing a fake web-shop product card. Nothing moves until the visitor presses "Simuleer een volgend bezoek"; the add-to-cart button then relocates and a dashed ghost marks where it used to be. It's an explained mini-experiment from my thesis, not a scene: no photo, no pinned scroll, no name as the headline. |
| Numbered structure, mono labels, big headings | Small "— LABEL" with a leading rule, "01 / 03" counters, headings ending in a full stop. | Thesis-style section marks (**§ 01**) in red mono next to my existing eyebrow text, and figure numbers ("Fig. 1") on visuals. No leading rules, no "01 / 03" counters, no full-stop headings. |
| About: portrait, key–value facts, candid narrative | Photo with a 2×2 fact grid under it and a mixed sans/serif-italic heading. | Narrative first, then a **datasheet card**: portrait and a ruled one-fact-per-row table with mono keys. My existing h2, with no serif italic. |
| Three numbered pillars | "What I do": a sticky single column with generative canvas drawings, each pillar a huge word with a serif-italic one-liner. | Section "Werkwijze" (I avoided "Wat ik doe", which is his label translated). Three side-by-side columns: **Onderzoeken / Ontwerpen / Organiseren**, each with a one-line promise, a paragraph and an **evidence link to the project that proves it**. No canvas, no sticky scroll. |
| Projects as mini case studies | Glass cards on charcoal with status chips, version badges and a grade badge, split into Launched / Ongoing, with up to three action buttons. | One list on an ink band. On desktop a **sticky title column** holds the number, meta line, title, intro and actions; the other column has a large visual and my own **problem / role / result** breakdown. No status split, no badges, no grades. |
| Full-bleed photographic interludes | Dusk skyline and bridge photos used as backdrops for glass cards and the form. | My own photos as **quiet pauses between sections**: nothing placed on top, an optional caption below, and nothing rendered until I add photos. |
| Capabilities grouped, not flat | Design/Application/Data glass cards over a city photo, plus a strip of technology logos. | Methods & tools grouped under **my three pillars** as plain typographic lists on paper, soft skills as a plain list, languages kept. No logos, no photo, no glass. |
| A richer timeline | Centred spine with alternating sides, giant faded year numerals, monogram badges, a Work/Now/Study filter and "More +" buttons. | A single left-aligned list with periods in a mono gutter, a kind tag, a **"Nu" marker** and native `<details>`. The three Amac roles become **one card that shows Junior → Medior → Senior as steps**. No monograms, big years, filter or alternating sides. |
| Sticky nav with a prominent contact CTA | Floating centred glass capsule that hides while you scroll down, with a white "Say hello" pill and scroll-spy. | Full-width **solid paper bar** that stays put, a **red filled "Contact" pill** (existing label), an NL/EN segmented toggle and a theme toggle. An accessible "Menu" disclosure below 760px. No glass, no hide-on-scroll. |
| Strong closing contact | "Let's build something." over a dark photo, with a glass form and an e-mail pill. | Ink band using **my existing contact copy** as the closing statement, the form on a paper card, socials as links. No photo, no e-mail address. |

## What I'm deliberately not copying

- Anything from the brief's no-go list: the code-editor/IDE window, the name with numbered roles beneath it, the "in one sentence" statement, full-stop headings as a device, the Launched / Ongoing split, monogram badges, the logo strip, charcoal dark-by-default, dusk-skyline imagery.
- Mechanisms I saw and won't use:
  - Lenis smooth scrolling (it takes over native scrolling)
  - the 400svh pinned scroll-zoom
  - canvas line art
  - the iPod/dock widgets
  - "liquid glass" surfaces
  - the serif-italic accent font
  - orange action buttons
  - hide-on-scroll nav and scroll-spy
  - year filters
  - a grade badge.
- His section titles, including translations: "What I do", "Selected work", "Shipped & Developing", "Capabilities", "The toolkit behind each step", "Background", "Timeline", "Let's build something". Every section keeps my existing titles. The one new title is "Werkwijze" (a working label, see Copy to review).
- His class names, IDs, data attributes (for example `data-reveal`, `data-tone`), custom property and keyframe names, and his file/folder structure. The originality script in step 4 checks this mechanically.

## Design direction

**Field notes from a usability lab.** Jop's site says "developer". Mine should say "someone who studies how people actually use interfaces". The page reads like a well-set research report:

- **Materials:** warm paper, deep ink, one red pen. The paper replaces the cool near-white, the ink is used for type and for two dark bands, and the red stays the brand accent: #E23C46 (light) / #FF5C63 (dark).
- **Type:**
  - Bricolage Grotesque, large and tight, for headings
  - Hanken Grotesk for reading
  - Spline Sans Mono for everything that's metadata: section marks, periods, figure labels, captions, tags.
- **Figures, not decoration.** Visuals are numbered and captioned like figures in a paper. The hero figure is a tiny experiment the visitor runs, and its caption explains the result in one line.
- **Rhythm.** Paper sections alternate with two ink bands (projects, contact), and with Robert's own photos once he adds them. That's what makes it cinematic. No scroll effects are involved.
- **Motion only confirms.** Content rises in as it enters, the headline gets its drawn underline, and the demo button moves only when asked. Under `prefers-reduced-motion` everything is instant.
- **Honest by construction:**
  - no cookies, storage, trackers or third-party requests (the Formspree POST is the only exception)
  - fonts are self-hosted
  - the honest banner stays as the signature.

---

## Decisions log

| # | Decision | Why |
|---|---|---|
| 1 | Kept the current headline ("goed *gesprek*"), not the one quoted in the brief | "Existing texts stay as they are". See "Read this first" for the swap. |
| 2 | Dropped the intro video from the page; files kept | See "Read this first" (spec, distance, weight). |
| 3 | Replaced `localStorage` with a `?lang=en` URL parameter | Runtime rule: nothing stored. Language still survives reloads and links to the privacy page. |
| 4 | Pillars section titled "Werkwijze" / "How I work", not "Wat ik doe" | "Wat ik doe" translates the reference's "What I do" label, which the originality rule forbids. It's a working label. |
| 5 | Kept README in English | V1.10 translated it on purpose. See "Read this first". |
| 6 | Three reds instead of one: `--accent` #E23C46 for graphics, `--accent-ink` #BD2C37 for small red text, `--accent-fill` #D02F3A for buttons. Dark mode keeps #FF5C63, with dark text on its buttons. | The live site fails AA here. White on #E23C46 is 4.23:1, and the red 13px eyebrows on the old background are 4.12:1 (4.5 needed). The new shades pass at 5.06:1 (button) and 5.25:1 (eyebrow on paper). Dark-mode button text is 6.26:1. |
| 7 | Theme set by a 2-line inline script in `<head>`, before first paint | The old page painted light first and switched after the JSON loaded, a flash for dark-mode visitors. It still follows the system live (a `change` listener) until the visitor clicks the toggle. That choice lasts for the visit only. |
| 8 | Language and theme toggles: NL/EN as a segmented pair of `aria-pressed` buttons, theme as one `aria-pressed` "Donkere modus" button | A single "EN" button that flips to "NL" can't carry `aria-pressed` honestly, because its name would change with its state. |
| 9 | The compact nav (Menu disclosure) kicks in at **860px**, not 760px | At 761–860px the Dutch links, the Contact pill and both toggles don't fit on one line. Below 760px is covered as asked. |
| 10 | Menu follows the WAI-ARIA disclosure pattern | Focus stays on the button and Tab moves into the menu. Esc closes and returns focus; a link, a click outside or focus leaving the bar also closes it. |
| 11 | The headline spans the full width, with the copy and Fig. 1 side by side below it | The existing headline needs about 900px at display size. At 1440×900 the full demo, control included, stays in the first screen. On phones the forced `<br>` is ignored so the line wraps naturally. |
| 12 | "Bekijk mijn GitHub ↗" styled as a text link, not a third button | Three buttons wrapped awkwardly; the CV and projects buttons stay primary and secondary. |
| 13 | Specimen product: a drawn instant camera at "€ 89,95" on `shop.example` (a reserved example domain) | Neutral and recognisably a shop, with the brand red as the camera stripe. It's a nod to the photography without claiming anything. |

## Copy to review (NL + EN)

All new strings are in `content/nl.json` / `content/en.json` unless noted. They're drafts; change freely.

**Nav** (`nav.*`)

| Key | NL | EN |
|---|---|---|
| `skip` | Naar de inhoud | Skip to content |
| `menu` | Menu | Menu |
| `label` (aria-label of the nav) | Hoofdnavigatie | Main navigation |
| `language` (aria-label of NL/EN) | Taal | Language |
| `theme` (aria-label of the toggle) | Donkere modus | Dark mode |

**Hero demo, Fig. 1** (`hero.demo.*`)

| Key | NL | EN |
|---|---|---|
| `button` | Simuleer een volgend bezoek | Simulate a return visit |
| `caption` | Gewoonte laat je klikken waar de knop stond: dat is wat mijn scriptie onderzoekt. | Habit makes you click where the button used to be: that's what my thesis studies. |
| `moved` (screen readers only, announced) | Bezoek {n}: de knop staat ergens anders. | Visit {n}: the button has moved. |
| `visit` (pill in the address bar) | bezoek {n} | visit {n} |
| `ghost` (dashed outline) | hier stond hij | it was here |
| `cart` / `save` | In winkelmand / Bewaar | Add to cart / Save |
| `product` / `price` | Instant camera / € 89,95 | Instant camera / €89.95 |
| `fig` | Fig. 1 | Fig. 1 |
| `alt` (aria-label of the window) | Productpagina van een nagemaakte webshop, met een knop ‘In winkelmand’. | Product page of a mock web shop, with an ‘Add to cart’ button. |

## TODOs for Robert

_Filled in as sections land._

## Known issues

_Filled in as sections land._
