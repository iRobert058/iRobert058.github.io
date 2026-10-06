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
| `specimen.btn_next` / `btn_reset` | Simuleer een volgend bezoek / Terug naar bezoek 1 | Simulate a return visit / Back to visit 1 |

## TODOs for Robert

_(filled in as sections land)_
