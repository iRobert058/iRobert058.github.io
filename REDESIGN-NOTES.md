# Redesign v3: notes for review

Branch `redesign/v3`, cut from `main` at `813bcf4` (V1.13). Fresh redesign: `redesign/v2` was deliberately not opened or reused.

## Direction

**One idea:** the site reads like a well-made research paper that happens to be interactive. Robert studies how people actually use interfaces, so the page behaves like a careful study does: it numbers its sections, labels its figures, shows its evidence in ruled tables, and explains every experiment it runs on you.

- **Clean and light first.** Soft paper-white background, near-black ink, one accent. The dark theme is a proper second theme that follows the system, never the default.
- **New accent: signal blue** (`#2F45D8` light, `#8D9BFF` dark), replacing the red, as agreed in the preflight ("let loose of my signature colours, focus on a clean aesthetic"). It's one token pair in `tokens.css`, so swapping it back is a two-line change.
- **Type:** the three existing families stay (Bricolage Grotesque for display, Hanken Grotesk for body, Spline Sans Mono for labels), now self-hosted. Display weight is 600 with tight tracking: confident, not shouty.
- **Paper conventions as the structuring device:** sections are numbered `§ 01` to `§ 06` (computed, so a hidden section doesn't leave a gap), figures get `Fig.` captions, and facts, experience and skills sit in ruled tables with hairlines rather than cards with shadows.
- **Rhythm:** paper sections alternate with two ink bands (projects and contact) and up to two full-bleed photo interludes.
- **Motion:** small and explanatory. Reveals fade up once, the hero underline draws once, and the hero demo moves only when the visitor presses the button. Everything is instant under `prefers-reduced-motion`.

## Borrowed patterns and what makes mine different

Reference: jopmors.com, studied only through screenshots of the live site at 1440 and 390 px plus a file listing of its repo. I didn't read his CSS or JS, because every mechanism I needed is standard (sticky nav, `<details>`, IntersectionObserver, CSS scroll-driven animations).

| Pattern borrowed | His version | Mine |
|---|---|---|
| Framed "app window" in the hero | Code editor on a laptop in a photographed room, which zooms in on scroll | A small browser window with a fake web-shop product card on a plain paper background, beside the headline. It's an interactive figure of my thesis: a labelled button moves the add-to-cart button, and a live caption explains the effect. No scroll-linked zoom. |
| Numbered structure, mono labels | `01 / 03` counters and small caps labels | Paper-style `§ 01` section numbers and `Fig. 1` captions. Pillars are numbered `1`, `2`, `3` as large figures in a three-column ruled grid. |
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
3. Hero with the specimen demo and the honest note.
4. Highlights, About with facts, pillars.
5. Projects (ink band) and interludes.
6. Experience timeline with groups, `Nu` and `<details>`.
7. Skills by pillar, certificates, contact (ink band, `_gotcha`).
8. Hardening: meta, JSON-LD, noscript, 404, privacy page fonts, robots.
9. Verification: `node --test`, the browser matrix, keyboard, Lighthouse/axe, the originality script. README.
10. Stretch: project detail pages.

Pure logic goes in `assets/js/logic.js` (ES module) so Node can test it: timeline grouping, interlude slots, skill groups with fallbacks, section numbering.

## Decisions log

- **Hero headline:** the current one, "Goede techniek begint met een goed *gesprek*.", as answered in the preflight. The brief's "Ik ontwerp interfaces die doen wat je verwacht" isn't used.
- **Accent colour:** red replaced by signal blue (preflight answer). The favicon and `og-image.png` are existing images and still red. See TODOs.
- **Intro video (V1.13) leaves the homepage.** The pinned, autoplaying video stage conflicts with the brief's hero (headline plus specimen) and with "nothing moves unless the visitor asks". The files in `assets/video/`, the posters and `assets/robert-portfolio-intro.mp4` stay in the repo, untouched. To bring it back, restore the `.hero-stage` markup from `main`. **Decision for you.**
- **No storage at all:** `app.js`, `404.html` and `privacy.html` used `localStorage` for the language. That's removed (the site promises nothing is stored), so a language choice now lasts for the page view only.
- **Language toggle** becomes two segments (NL / EN) with `aria-pressed`. The theme toggle is a button with `aria-pressed` and a translated label. The theme follows the system until the visitor toggles it.
- **Honeypot** renamed from `company` to Formspree's `_gotcha`, which Formspree discards server-side as well. The client still skips sending when it's filled.
- **Grades:** the thesis `result` text still says "beoordeeld met een 8,5". That is existing content in the one place the repo's CLAUDE.md allows a grade, and the brief says nothing gets deleted. There are no grade badges or highlights.
- **Hero demo content:** on the return visit the add-to-cart button moves into the shop's top bar and a paid "add warranty" button takes its old spot. That makes the habit effect concrete (a habitual click now buys something) and is shown and explained, never done to the visitor. The fake shop buttons are plain text, not controls, so nothing on the page pretends to be clickable. The product is fictional.
- **Hero layout:** the headline has a forced line break and is too wide to sit beside the window, so it spans the full width and the window sits beside the intro and buttons. Below 900 px everything stacks.
- **`content/en.json` had an extra key** `contact.footer_location` (unused duplicate of `footer.location`), which broke NL/EN key parity. Removed; a test now checks parity.
- **Pillar section label is "Werkwijze / How I work", not "Wat ik doe".** "What I do" is the reference site's own section label, and the brief forbids his section titles, translated ones included. The pillar names themselves are your working labels.
- **Pillar and fact copy only uses facts already on the site** (thesis N = 40, MobiPad's three layouts and hardware test, the exec(ut), Amac and Sticky roles, languages, hobbies). The "Ontwerpen" promise reuses your old v1.0 headline, "Interfaces die doen wat je verwacht", which felt right there.
- **Section numbers** (`§ 01`…) are computed over the visible sections, so the hidden certificates section leaves no gap. The highlights block is unnumbered: it works as the page's abstract.
- **New optional fields `imageWidth` / `imageHeight` in `projects.json`** (set for all three), so project images get `width`/`height` and don't shift the layout while loading. Without them the image still renders.
- **Interludes** render in three fixed slots (see TODOs). The caption under each photo is a credit line; `alt` is the description for screen readers.
- **Timeline groups:** new optional `group` field in `timeline.json`, set to `"amac"` on the three Amac roles. Grouped roles render as one card at the position of the newest role, titled with the organisation, with the roles as steps oldest → newest. The current step is filled and marked `aria-current="step"`. Each role's description sits in one `<details>`. A group of one renders as a normal row. Logic: `groupTimeline()` in `logic.js`, with tests.
- **Highlights still say "Junior → Senior Sales Associate met dagverantwoording"** while the timeline title is "Senior Sales Associate · Daily Operations Lead". Not changed (existing copy), just flagging the mismatch between the NL and EN highlight texts: EN mentions Daily Operations Lead, NL doesn't.
- **Skills:** `bars` in `skills.json` is untouched but no longer rendered (percentages for soft skills suggest a precision they don't have). New fields: `groups` (`[{ pillar, items }]`, pillar ids match `pillars.items[].id` in the content files) and `soft` (a plain list). Without `groups` the old flat `tools` list renders; without `soft` the bar labels render, without levels. "IT-vaardigheden" is left out of the soft skills because the capabilities already cover it. `tools` stays as the fallback.
- **Contact form:** on an invalid submit, the invalid fields get `aria-invalid="true"` and focus moves to the first one, alongside the existing status message. The status colours now come from tokens (`--ok`, `--err`); the hardcoded green is gone.
- **Hardening:** `og:url`, `og:image`, the canonical link, JSON-LD, `<noscript>` and `robots.txt` already existed on `main`. Updated: `meta description`, `og:description` and `twitter:description` now open with the current hero line. JSON-LD gained `description`, `alumniOf`, `worksFor`, `knowsLanguage` and `knowsAbout`, all taken from facts on the site. The noscript message is restyled, and the empty page skeleton is hidden without JS. `robots.txt` was correct and is unchanged.
- **404 page** rebuilt in the new style with its existing NL/EN text; it now has `noindex`, absolute asset paths, a real link instead of a button-with-JS, and no storage.
- **Privacy page:** only technical changes (self-hosted fonts, NL/EN segments without storage, a `<main>` landmark). Wording untouched. **Flag:** it shows `robertkarzijn@icloud.com` twice, while the repo's rules say no email address on the site. Decision for you: keep it (a GDPR contact point is reasonable on a privacy page) or replace it with the form.
- **Project meta line:** the existing `tag` field already is "type · year", so it's rendered as the meta line. No new year/type fields.

## Copy to review

All new strings are drafts in `content/nl.json` and `content/en.json`. NL is the source; EN is a natural translation.

| Key | NL | EN |
|---|---|---|
| `nav.skip` | Ga naar de inhoud | Skip to content |
| `nav.label` / `nav.menu` / `nav.lang_group` | Hoofdmenu / Menu / Taal | Main menu / Menu / Language |
| `nav.theme` (label of the toggle, `aria-pressed` = dark) | Donker thema | Dark theme |
| `specimen.fig` | Fig. 1 | Fig. 1 |
| `specimen.url` | winkel.example/koptelefoon | shop.example/headphones |
| `specimen.brand` / `product` / `price` / `stock` | Winkel / Draadloze koptelefoon / € 89,00 / Op voorraad | Shop / Wireless headphones / €89.00 / In stock |
| `specimen.cart` / `extra` / `save` | In winkelwagen / Garantie toevoegen + € 19 / Bewaar voor later | Add to cart / Add warranty + €19 / Save for later |
| `specimen.visit` | Bezoek {n} | Visit {n} |
| `specimen.caption_1` | Dit is wat mijn thesis onderzoekt: uit gewoonte klik je waar de knop vorige keer stond. | This is what my thesis studies: habit makes you click where the button used to be. |
| `specimen.caption_2` | Bezoek 2: de winkelwagenknop staat nu bovenaan en op de oude plek zit een betaalde garantie. Uit gewoonte klik je dáár. | Visit 2: the cart button has moved to the top and its old spot now holds a paid warranty. Habit sends your click there. |
| `about.portrait_alt` (was hardcoded Dutch in `index.html`) | Portretfoto van Robert Karzijn | Portrait photo of Robert Karzijn |
| `about.portrait_fig` | Fig. 2 | Fig. 2 |
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
| `specimen.btn_next` / `btn_reset` | Simuleer een volgend bezoek / Terug naar bezoek 1 | Simulate a return visit / Back to visit 1 |

## TODOs for Robert

- **Interlude photos.** Add entries to `interludes` in `data/site.json`: `{ "src": "assets/img/interlude-1.webp", "alt": { "nl": "…", "en": "…" } }`. Entries fill the page's three slots in order: (1) between "Werkwijze" and the projects, (2) between experience and skills, (3) between skills and contact. Empty `src` entries are skipped and extra entries are ignored. Export **2400 × 1029 px (21:9) WebP, about 300–400 KB**. Phones crop the same file to 4:3 around the centre, so keep the subject central. Leave `alt` empty only if a photo is purely atmospheric.
