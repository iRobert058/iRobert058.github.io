# Redesign v2: working notes

Branch `redesign/v2`, cut from `main` at `813bcf4` (V1.13). Nothing here touches `main`.

## Progress

_Last update: 2026-10-05 05:20 CEST_

- [x] 1. Study the repo and the reference, write this brief
- [x] 2a. Tokens, self-hosted fonts, base styles
- [x] 2b. Nav (sticky, mobile menu) and hero (specimen demo, honest banner)
- [x] 2c. Highlights, About (facts), pillars
- [x] 2d. Projects (ink band) and interludes
- [x] 2e. Experience timeline (groups, "Nu", details)
- [x] 2f. Skills (capabilities by pillar), certificates, contact (ink band, `_gotcha`)
- [x] 2g. Motion pass (scroll-driven reveals + fallback)
- [x] 3. Hardening (meta, JSON-LD, noscript, robots, 404, privacy page fonts)
- [x] 4. Verification (matrix, keyboard, Lighthouse/axe, originality script), README. Deleting the reference clone is left for the very end, after a final originality run.
- [x] 5. Stretch: project detail pages (`/projecten/<id>/`)

**Next:** final originality run, deleting the reference clone, closing summary. Sections not yet redesigned still use the "Legacy V1" block at the bottom of `main.css` and the old renderers in `app.js`; that is expected until 2f.
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

## Verification (step 4)

Run against a local server with headless Chrome (Playwright), with throwaway tools in a scratch folder and nothing installed in the repo. Screenshots are in `_review/` (git-ignored):

- light and dark, NL and EN, at 390 and 1440 wide
- plus 768 light NL and 1280 dark EN.

| Check | Result |
|---|---|
| Console errors, failed or third-party requests, storage, cookies | None, on every page in every configuration. The only external request the code can make is the Formspree POST. |
| JSON | All files in `data/` and `content/` parse. `nl.json` / `en.json` have identical keys, apart from the existing stray `contact.footer_location` in EN (see Known issues). |
| NL ↔ EN | Every new element switches, including the demo caption, `aria-label`s, the portrait `alt` and `<html lang>`. A scan of the English page finds no Dutch UI words. The language survives a reload and carries over to the privacy page via `?lang=`. |
| Light and dark | Checked by screenshot, including both ink bands. AA contrast for every text/background pair in the palette was computed (script): all pass. |
| Layout at 390, 768, 1280 and 1440 | No horizontal scroll at any width. The compact menu is used up to 860px. |
| Reduced motion | No animations or transitions run, nothing starts hidden, smooth scrolling is off, and the demo button jumps instantly. |
| Keyboard | 44 Tab stops in reading order, each with a visible focus ring. The skip link is first and moves focus to `<main>`. The Menu disclosure opens with Enter, Tab moves into it, and Esc closes it and returns focus. The demo works with Enter and Space. Every `<details>` toggles with Enter and Space. |
| Contact form | Tested against a fake local endpoint, with every non-local request blocked, so **nothing was sent to Formspree**. Empty or invalid input gives the error message, marks the field with `aria-invalid` and focuses it. A server error shows the failure text. Success shows the thanks and clears the form. A filled `_gotcha` sends nothing. |
| Certificates | Hidden with the real (empty) data. It appears as §07 when a certificate is served temporarily (injected in the browser, so the repo was never edited). |
| Interludes | Render nothing while empty. With a temporary entry: full-bleed 21:9 (desktop) / 4:3 (phone), with `alt`, `width`/`height`, lazy loading and the caption. |
| axe-core 4.13 (WCAG 2.0/2.1/2.2 A+AA + best practices) | **0 violations** on home, 404 and privacy, light/dark, NL/EN, phone/desktop, with the menu open and the demo and details expanded. The "incomplete" items are decorative glyphs inside `role="img"` / `aria-hidden`. |
| Lighthouse 12 (home, served with gzip like GitHub Pages) | Mobile **98 / 100 / 100 / 100**, desktop **100 / 100 / 100 / 100** (performance / a11y / best practices / SEO). CLS 0, TBT 0. Privacy page 99/100/100/100. The 404 gets SEO 54 only because of its `noindex`, which is correct for an error page. |
| JavaScript size | `app.js` ≈ 20 KB unminified (≈ 6.6 KB gzipped), under the 30 KB budget. |
| No-JS | A styled bilingual note under the brand bar, with no empty links. |

**Originality check (scripted).** The script compares this repo with the reference clone on class names, IDs, data attributes, CSS custom properties, keyframe names and every identical stretch of 40+ characters, in both visible text and whitespace-normalised source.

- **Fixed:** my timeline classes used a `tl-` prefix, and `tl-body` was identical to his, so the whole family was renamed to `route-*`.
- **Shared identifiers left:** `hidden`, `contact` and `js` (a false positive from "app.js" in CSS comments). `--ease` and `--font-mono` both existed in the V1 tokens, before this redesign. No data attributes or keyframes are shared.
- **Identical stretches left:** HTML `<head>` boilerplate (meta/og/icon/preload tags), generic CSS declarations (`font-family: var(--font-mono); font-size:`, `display: grid; grid-template-columns: minmax(`), standard browser APIs, and one phrase from your own V1 hero copy ("a bachelor's degree in Information Science…").
- ⚠️ **Not mine to change:** the English text of your existing `privacy.html` (1 Sep 2026) shares several sentences word for word with the reference's privacy page. Examples: "the only place personal data is processed is the contact form", "…your name, email address and message are sent to Formspree…", "…processes these messages for me and forwards them to my email. I use this…". I didn't touch it, because the brief says not to write policy text. Since that site has no licence, consider rewriting those paragraphs in your own words (see TODOs).

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
| 14 | Section numbers are thesis-style "§01, §02 …", generated by a CSS counter on `.sec` and hidden from screen readers | Sections need no hand-kept numbers; the hidden certificates section doesn't take a number. |
| 15 | New `data/pillars.json` (`id`, `title`, `promise`, `text`, `project`) instead of strings in `content/*.json` | Pillars are structured, bilingual content like projects. `project` links each pillar to the case study that shows it ("In de praktijk"). The skills section reuses the pillars for its groups. |
| 16 | About facts in `content/*.json` → `about.facts: [{label, value}]` | Only the four facts the brief named, all taken from existing copy. Possible additions are under TODOs. |
| 17 | The portrait `alt` is now translated (`about.portrait_alt`, via a new `data-t-alt` attribute) | It was hardcoded Dutch. The Dutch text is unchanged. |
| 18 | Highlights restyled as a ruled four-up strip of "moments" with an arrow (→ in-page, ↗ external) | Copy and data unchanged. Still four columns, matching the "four moments" lead. |
| 19 | Project meta line = the existing `tag` ("Bachelorthesis · 2026"), prefixed with the case number | The tag already is a type · year line. Splitting it into new `year` / `type` fields would duplicate data you'd have to keep in sync. |
| 20 | Optional `imageWidth` / `imageHeight` in `projects.json` (set for all three) | Gives every project image width/height attributes (no layout shift). Projects without them still render. |
| 21 | Projects keep linking out to the trailer (no embed); the play pill now says "Bekijk de trailer ↗" | No third-party embeds. The ↗ signals it leaves the site. |
| 22 | `site.json` → `"interludes": []` with three fixed slots (before Projecten, between Ervaring and Vaardigheden, before Contact), filled in order | Predictable placement without a positioning field. Empty slots take no space. Tested by serving a modified `site.json` in the browser, so the repo was never touched. |
| 23 | Ink band in dark mode is *deeper* than the page (#0A0A09 vs #12110F) with hairlines (`--band-edge`) | A slightly lighter band read as a card; the deeper one keeps the letterbox feel. |
| 24 | `timeline.json` gains an optional `group` (set to `"amac"` on the three Amac roles). Grouped entries render as **one card at the position of the newest one**, with the roles oldest → newest as a staircase. | It turns the Junior → Medior → Senior growth into one visual feature. Any future group (e.g. two roles at the UU) works the same way, with no code change. |
| 25 | Descriptions sit in native `<details>`, closed by default. Each summary reads "Details" plus a screen-reader-only ": <role title>". | The list stays scannable. Nine identical "Details" buttons would be ambiguous for screen-reader users without the title. |
| 26 | "Nu" marker = any entry (or group) whose `to` is `"present"` | Derived from data, so nothing to maintain. |
| 27 | `skills.json`: `bars` and `tools` untouched but no longer rendered. New additive `capabilities` (`[{pillar, items}]`, keyed to `pillars.json` ids) and `soft`. | As briefed: percentage bars imply a precision nobody can measure. Every former tool is in a pillar group. The other items come from existing copy (thesis role, MobiPad tech, exec(ut) tags, the Amac and Sticky descriptions). |
| 28 | Soft skills = the bar labels minus "IT-vaardigheden" | That one isn't a soft skill, and the methods & tools cover it. |
| 29 | Honeypot is now `_gotcha` (replacing the hidden `company` field). The JS still drops a filled honeypot before sending. | Formspree discards `_gotcha` submissions server-side too. Browsers can autofill a field named "company" (organisation), which risked silently swallowing real messages. |
| 30 | A failed submit marks invalid fields with `aria-invalid="true"` and moves focus to the first one | The message alone left keyboard and screen-reader users to hunt for the problem. |
| 31 | Form success colour tokenised (`--success`, `--band-success`) | It was the one hardcoded colour in `main.css` (CLAUDE.md flagged it). |
| 32 | The contact form sits on a band-coloured card, not a paper card | A paper card inside the dark band needed a second palette remap. The band card keeps every field border ≥ 3:1. |
| 33 | Footer continues the closing band | The page ends on one dark block instead of a thin paper strip. |
| 34 | Reveals are CSS scroll-driven (`animation-timeline: view()`) over a **fixed 160px** of entry. The IntersectionObserver only runs where that's unsupported (it still draws the hero underline everywhere). | No JS work while scrolling in modern browsers. A percentage range kept tall case studies half-transparent while you read their top; a fixed distance doesn't. Checked by scrolling with motion on: every block sitting 220px+ inside the viewport is fully opaque. |
| 35 | Motion inventory, all off or instant under `prefers-reduced-motion`: content settling in (fade + 18px rise), the underline drawing once, the demo button moving and its ghost fading in (only on click), the menu dropping in, 1–2px hover lifts. With reduced motion nothing starts hidden. | No scroll-jacking, parallax, custom cursor or smooth-scroll library. Native anchor scrolling, smooth only when motion is allowed. |
| 36 | Hardening, per item: `og:url`, `og:image` (the existing 1200×630 `og-image.png`), the canonical link and `robots.txt` already existed and are correct, so they're kept. The meta/og/twitter descriptions are rewritten from the current hero copy. The JSON-LD `Person` gains only on-site facts: UU as alma mater and affiliation, Amac, nl/en/de, the fields. | No duplicates. Nothing claimed that the page doesn't say. |
| 37 | No-JS: a `<noscript><style>` in `<head>` hides the parts only JavaScript fills (the links would be empty). The existing bilingual note is restyled under the brand bar. | Before, the page showed empty nav links and a large blank area without JS. |
| 38 | `404.html` rebuilt in the new style: the "Fig. 404" window shows the address that was asked for, with a dashed ghost where the page should be. The existing copy is unchanged, the button is now a real link, and the language comes from `?lang=`. | It reuses the hero's "it was here" idea. Absolute paths keep it working at any depth on GitHub Pages. |
| 39 | `privacy.html`: same text (all 30 strings verified identical). New top bar with the NL/EN toggle, theme set before paint, links in the AA-safe red, `?lang=` instead of `localStorage`. | No policy text was written or changed, as asked. |
| 40 | Project pages are static skeletons in `projecten/<id>/` with `data-project`, filled by the same `app.js` from `projects.json`. A `data-root="../../"` attribute lets one script serve both depths. | As briefed: no build step and no duplicated copy. A new project needs one copied folder (see the README). |
| 41 | The card link says **"Projectpagina"** for now, not "Lees meer". It switches to "Lees meer" automatically once a project has the new optional `story` field (extra paragraphs, shown only on its page). | Today the page holds the same text as the card, plus a larger visual, its own URL and prev/next. A "Read more" that leads to nothing more would be a small deceptive pattern, on this site of all sites. |
| 42 | Links between pages carry the language (`?lang=en`): home ↔ project pages ↔ privacy, the nav, back links, prev/next and internal CTAs | Switching pages never drops you back into Dutch, and nothing is stored. |
| 43 | After rendering, the page re-scrolls to `location.hash` | The browser jumps to `/#projecten` before the JSON content above it exists, so deep links landed in the wrong place. That was true in V1 too. |
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

**About** (`about.*`)

| Key | NL | EN |
|---|---|---|
| `facts[0]` | Studie: MSc Human-Computer Interaction, Universiteit Utrecht | Study: MSc Human-Computer Interaction, Utrecht University |
| `facts[1]` | Werk: Daily Operations Lead bij Amac in Apeldoorn | Work: Daily Operations Lead at Amac in Apeldoorn |
| `facts[2]` | Talen: Nederlands, Engels, Duits | Languages: Dutch, English, German |
| `facts[3]` | Buiten werk: Fotografie, audio en af en toe een avond gamen | Off duty: Photography, audio and the occasional evening of gaming |
| `portrait_alt` | Portretfoto van Robert Karzijn (unchanged) | Portrait photo of Robert Karzijn |

**Pillars: working labels.** Section labels are in `pillars.*`; the pillars themselves are in `data/pillars.json`.

| | NL | EN |
|---|---|---|
| eyebrow | Werkwijze | How I work |
| title | Onderzoeken, ontwerpen, organiseren | Research, design, organise |
| proof label | In de praktijk | In practice |
| 01 title | Onderzoeken | Research |
| 01 promise | Uitzoeken hoe mensen een interface echt gebruiken. | Finding out how people actually use an interface. |
| 01 text | Met literatuur, een zorgvuldig experimenteel ontwerp en statistiek. Voor mijn bachelorthesis bouwde ik een studieomgeving en testte ik met 40 deelnemers wat er met gewoontegedrag gebeurt als een webshop zijn knoppen verplaatst. | With literature, a careful experimental design and statistics. For my bachelor's thesis I built a study environment and tested with 40 participants what happens to habits when a web shop moves its buttons. |
| 02 title | Ontwerpen | Design |
| 02 promise | Van eisen naar een werkend ontwerp. | From requirements to a working design. |
| 02 text | Requirements, architectuur, interface en code, en daarna testen op echte hardware. MobiPad ontwierp en bouwde ik zelf: een iPhone-app met drie controller-layouts, een Mac-menubalkapp en een versleuteld netwerkprotocol. | Requirements, architecture, interface and code, then testing on real hardware. I designed and built MobiPad on my own: an iPhone app with three controller layouts, a Mac menu bar app and an encrypted network protocol. |
| 03 title | Organiseren | Organise |
| 03 promise | Mensen meenemen, ook als de deadline dichtbij komt. | Bringing people along, even when the deadline gets close. |
| 03 text | Bij exec(ut) werfde en begeleidde ik de sprekers van de studenten-techconferentie, van eerste mail tot podium. Bij Amac ben ik als Daily Operations Lead het aanspreekpunt voor het team. | At exec(ut) I recruited and supported the speakers of the student tech conference, from first email to stage. At Amac, as Daily Operations Lead, I'm the point of contact for the team. |

**Project pages** (`projects.*`)

| Key | NL | EN |
|---|---|---|
| `project_page` (card link, until a `story` exists) | Projectpagina | Project page |
| `read_more` (card link, once a `story` exists) | Lees meer | Read more |
| `all_projects` (back link) | Alle projecten | All projects |
| `more_projects` (aria-label of the pager) | Meer projecten | More projects |
| `prev` / `next` | Vorige / Volgende | Previous / Next |

The project pages' static `<title>` and description are the Dutch title and intro from `projects.json`. JavaScript switches the title with the language.

**Meta** (`index.html`, hardcoded Dutch like before)

| Tag | New text |
|---|---|
| `meta description` | Goede techniek begint met een goed gesprek. Portfolio van Robert Karzijn, masterstudent Human-Computer Interaction met een bachelor Informatiekunde van Universiteit Utrecht. |
| `og:description` / `twitter:description` | Goede techniek begint met een goed gesprek. Human-Computer Interaction · UX-onderzoek. |
| JSON-LD `description` | Masterstudent Human-Computer Interaction met een bachelor Informatiekunde van Universiteit Utrecht. |

**Experience** (`experience.*`)

| Key | NL | EN |
|---|---|---|
| `now` (marker) | Nu | Current |
| `details` (disclosure) | Details | Details |
| `growth` (label on the Amac card) | Doorgroei | Growth |

**Skills** (`skills.soft` in content, the rest in `data/skills.json`)

| Item | NL | EN |
|---|---|---|
| label | Soft skills | Soft skills |
| new capability | Literatuurstudie | Literature review |
| new capability | Requirements | Requirements |
| new capability | Swift / SwiftUI | Swift / SwiftUI |
| new capability | Sprekersacquisitie | Speaker acquisition |
| new capability | Relatiebeheer · Planning | Relationship management · Planning |
| new capability | Dagelijkse operatie | Daily operations |
| new capability | Notulen & administratie | Minutes & administration |
| honeypot label (hidden from everyone) | Laat dit veld leeg | Leave this field empty |

Every claim in the pillar texts is lifted from `projects.json` / `timeline.json`. Note that the research text describes the experiment and doesn't state a finding.

## TODOs for Robert

- **Privacy page wording:** rewrite the English (and check the Dutch) paragraphs that match the reference's privacy page word for word (see "Originality check"). Separately, the page shows your e-mail address twice (`mailto:`), which conflicts with the "no e-mail address anywhere" rule in CLAUDE.md. Decide whether the AVG/GDPR contact route should be the form or LinkedIn instead. Its "Laatst bijgewerkt" date will need a bump after any change.
- **Interlude photos** (`data/site.json` → `interludes`). Add up to three entries; they fill these slots in order:
  1. between *Werkwijze* and *Projecten* (leads into the dark band)
  2. between *Ervaring* and *Vaardigheden*
  3. right before *Contact*.

  Entry shape: `{ "src": "assets/img/interlude-1.webp", "alt": { "nl": "…", "en": "…" }, "width": 2400, "height": 1350, "position": "50% 40%", "caption": { "nl": "…", "en": "…" } }`. Only `src` and `alt` are needed; use `""` alt for a purely atmospheric photo.

  **Export:** landscape **16:9 at 2400 × 1350 px**, WebP at about q78, ideally ≤ 300 KB:

  ```
  cwebp -q 78 -resize 2400 0 photo.jpg -o assets/img/interlude-1.webp
  ```

  Desktop shows a 21:9 crop, which loses about 12% at the top and bottom. Phones show 4:3, which crops the sides. Keep the subject near the centre, or set `position`.
- **Project pages:** if you want "Lees meer" on the cards, give a project a `story` in `projects.json`, for example process, screenshots or what you'd do differently. Then the page really has more to read.
- **About facts:** the list has only the four facts the brief named. Possible additions if you want them: where you're based (city), what you're open to (internship, part-time role, thesis project) and since when, or your research focus in one line.

## Known issues

_Filled in as sections land._
