# robertkarzijn.nl

Personal portfolio website of **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## What this site does

A single static page that serves as a digital business card for employers, clients and my network, with:

- **Bilingual (NL/EN)**: Dutch is the default language, with an NL/EN switch in the navigation. All content, from UI labels to project descriptions, is written in both languages and switches instantly without a page reload.
- **Light and dark theme**: follows the system preference (`prefers-color-scheme`) and can be switched with the toggle. The choice lasts for the page view; nothing is stored.
- **A typographic hero**: the headline, the intro and an "Op dit moment" list that is built from the timeline entries running until `present`, so it updates itself.
- **Content sections**: about me (with a fact table), highlights, three pillars (research, design, organise), featured projects as small case studies (problem / role / result), one timeline of work, education and extracurricular activities (with the Amac roles shown as one progression), capabilities grouped by pillar, soft skills and languages, and a contact form. A certificates section appears automatically when there are certificates in the data. Optional full-width photo interludes appear between sections.
- **Contact form without visible personal details**: messages go to a Formspree endpoint, with a `_gotcha` honeypot against spam.
- **No cookies, no trackers, no storage and no deceptive patterns**: no analytics, no third-party requests (fonts are self-hosted), and no `localStorage`. The only external request is the form submission.
- **Accessible by default**: skip link, landmarks, a keyboard-operable mobile menu (Esc closes it), visible focus, `aria-pressed` on the toggles, and `prefers-reduced-motion` turns all motion off.

## How it is built

Deliberately **without frameworks or a build step**: vanilla HTML, CSS and JavaScript. For a one-pager this gives the fastest load time, zero dependencies and years of maintainability.

```
├── index.html                 # Structure (skeleton without content)
├── privacy.html               # Privacy statement (NL/EN)
├── 404.html                   # Custom 404 page (NL/EN)
├── docs/setup-overview.svg    # Diagram of the hosting setup
├── assets/
│   ├── css/tokens.css         # All design tokens: fonts, colours, type and spacing scales, motion (light + dark)
│   ├── css/main.css           # Component styles, built on the tokens
│   ├── js/app.js              # Loads JSON, renders sections, handles language / theme / menu / form
│   ├── js/logic.mjs           # Pure helpers (timeline grouping, interludes, skills fallbacks), unit tested
│   ├── fonts/                 # Self-hosted variable WOFF2 fonts (Latin subset) + OFL licence
│   ├── img/                   # Images (WebP, max ~1600px wide)
│   └── video/                 # Former hero intro video (not on the page since v3, kept for later use)
├── content/                   # UI strings & "About me" per language (nl.json, en.json)
├── data/                      # Structured content: projects, timeline, skills,
│                              # highlights, certificates, site config
└── tests/                     # node --test: logic and content checks
```

Core principle: **content and code are separated.** All content lives in JSON; `app.js` renders it client-side. Adding a new project, job or certificate means adding a JSON object. Bilingual fields are a plain string (same in both languages) or `{ "nl": "…", "en": "…" }`.

The same goes for the visual identity: all colours, fonts and sizes are CSS variables in `tokens.css`. The dark sections (projects, contact) re-point the same variables to their "band" values, so components work in both.

## Editing content

| To…                              | Edit                                      |
| -------------------------------- | ----------------------------------------- |
| Add/change a project             | `data/projects.json`                      |
| Update the timeline              | `data/timeline.json`                      |
| Add a highlight                  | `data/highlights.json`                    |
| Change capabilities, soft skills or languages | `data/skills.json`           |
| Add a certificate                | `data/certificates.json` (section appears automatically) |
| Add a photo interlude            | `data/site.json` → `interludes`           |
| Change "About me", facts, pillars or UI text | `content/nl.json` and `content/en.json` |
| Socials, CV path, form endpoint  | `data/site.json`                          |
| Change the visual identity       | `assets/css/tokens.css`                   |

### Optional fields

All of these are optional; older data without them still renders.

- **`projects.json` → `imageWidth`, `imageHeight`**: the image's pixel size, so the page reserves its space while it loads.
- **`timeline.json` → `group`**: entries with the same group (for example `"amac"`) render as one card showing the progression from the oldest to the newest role. Keep the file newest first; the card appears where the newest role is.
- **`skills.json` → `groups`**: `[{ "pillar": "research" | "design" | "organise", "items": [...] }]`, capabilities shown under the pillars. The pillar ids match `pillars.items[].id` in the content files. Without `groups`, the flat `tools` list is shown.
- **`skills.json` → `soft`**: soft skills as a plain list. Without it, the labels of the old `bars` are shown. `bars` itself is no longer rendered.
- **`site.json` → `interludes`**: see below.

### Adding photo interludes

```json
"interludes": [
  { "src": "assets/img/interlude-1.webp", "alt": { "nl": "…", "en": "…" } }
]
```

Entries fill three slots in order: between "Werkwijze" and the projects, between experience and skills, and between skills and contact. Entries with an empty `src` are skipped; with no usable entries nothing renders. Export photos at **2400 × 1029 px (21:9)** as WebP of roughly 300–400 KB. On phones the same image is cropped to 4:3 around the centre.

### Adding images

Keep images small: export as WebP at no more than ~1600px wide (960px for the portrait), for example:

```bash
cwebp -q 80 -resize 1600 0 input.jpg -o assets/img/project-name.webp
```

## Running locally

The site loads content via `fetch()` and therefore needs a web server (it does not work via `file://`):

```bash
python3 -m http.server    # or: npx serve
```

## Tests

Node's built-in test runner, no `package.json` needed (any current Node LTS):

```bash
node --test
```

`tests/logic.test.mjs` covers the helpers in `assets/js/logic.mjs` (timeline grouping, interlude slots, skills fallbacks, labels). `tests/content.test.mjs` checks that every JSON file parses, that `content/nl.json` and `content/en.json` have identical keys, that projects have the fields rendering needs, and that the copy says "deceptive patterns". Check visual changes in the browser in both languages, both themes and at phone width.

## Deployment

Hosted on GitHub Pages with a custom domain via TransIP; `robertkarzijn.com` redirects with a 301 to `robertkarzijn.nl`. Every push to `main` goes live automatically. See [docs/setup-overview.svg](docs/setup-overview.svg) for a diagram of the hosting setup. The contact form expects an endpoint (e.g. Formspree) in `data/site.json` → `formEndpoint`.

---

© Robert Karzijn · Built without frameworks, cookies or deceptive patterns.
