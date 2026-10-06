# robertkarzijn.nl

Personal portfolio website of **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## What this site does

A single static page that serves as a digital business card for employers, clients and my network, with:

- **Bilingual (NL/EN)**: Dutch is the default language, with an NL/EN switch in the navigation. All content, from UI labels to project descriptions, is fully written in both languages and switches instantly without a page reload. The choice travels in the URL (`?lang=en`), so it survives a reload and can be shared, without storing anything.
- **Dark mode**: follows the system preference (`prefers-color-scheme`) automatically, even while the page is open, and can be toggled for the current visit.
- **Content sections** (numbered like a report: §01, §02 …):
  - hero with a ten-second mini-experiment (*Fig. 1*, see below)
  - highlights
  - about me with a fact sheet
  - *Werkwijze*: three pillars, each linked to the project that shows it
  - projects as case studies (problem / role / result) on a dark band
  - one timeline of work, education and extracurricular activities, with a "Nu" marker, expandable details and a growth card for roles that belong together
  - skills grouped under the three pillars, plus soft skills and languages
  - a contact form.

  A certificates section appears automatically as soon as certificates are present in the data. Full-width photo interludes appear as soon as photos are added.
- **The hero experiment (Fig. 1)**: a ten-second reaction-time task about the subject of my thesis.
  - The visitor clicks "In winkelmand" six times while a chart of their own reaction times builds up.
  - In round 6 the button moves and a lookalike decoy takes its old spot.
  - A debriefing then explains what happened, with the screen annotated.

  It only starts when the visitor presses Start. It works with the keyboard and is announced to screen readers. The times never leave the browser. The texts live in `content/*.json` → `hero.lab`.
- **Contact form without visible personal details**: messages go through a configurable endpoint (Formspree-compatible), with a `_gotcha` honeypot against bots. No email address or phone number is shown on the site, to protect my privacy.
- **Scroll animations**: content settles in as it scrolls into view. While you read:
  - a red progress line under the navigation fills up
  - lines draw themselves
  - the pillar numbers rise into place
  - the dark bands open up to full width
  - the growth card draws its staircase step by step
  - images settle from a slight zoom.

  All of it is pure CSS (scroll-driven animations) tied to your own scrolling, with no scroll-jacking. The hero only moves when you ask it to. Browsers without scroll-driven animations get a simple fade-in instead, and `prefers-reduced-motion` turns all of it off.
- **No cookies, no trackers, no storage and no deceptive patterns**. This is a deliberate choice that ties in with my research field, and the wink behind the "cookie banner" on the site. Fonts are self-hosted, so a visit makes no third-party requests. The only exception is the contact form when you press send.

## How it is built

Deliberately **without frameworks or a build step**: vanilla HTML, CSS and JavaScript. For a one-pager this gives the fastest load time, zero dependencies and years of maintainability.

```
├── index.html                 # Structure (skeleton without content)
├── privacy.html               # Privacy statement (NL/EN)
├── 404.html                   # Custom 404 page (NL/EN)
├── projecten/<id>/index.html  # One page per project, rendered from data/projects.json
├── REDESIGN-NOTES.md          # Decisions, copy to review and TODOs from the v2 redesign
├── docs/setup-overview.svg    # Diagram of the hosting setup
├── assets/
│   ├── css/tokens.css         # All design tokens: fonts, colours (light, dark, ink band), type/spacing/motion scales
│   ├── css/main.css           # Component styles, built on the tokens
│   ├── js/app.js              # Loads JSON, renders sections, handles i18n / theme / menu / demo / form
│   ├── fonts/                 # Self-hosted WOFF2 fonts + their OFL licences
│   ├── img/                   # Images (WebP, max ~1600px wide; interludes 2400px)
│   └── video/                 # V1 hero intro video (not used in v2, kept)
├── content/                   # UI strings & "About me" per language (nl.json, en.json)
└── data/                      # Structured content: projects, pillars, timeline, skills,
                               # highlights, certificates, site config
```

Core principle: **content and code are separated.** All content lives in JSON, and `app.js` renders it client-side. Adding a new project, job or certificate means adding a JSON object. Bilingual fields are either a plain string (same in both languages) or `{ "nl": "…", "en": "…" }`. This keeps the site easy to extend in the future.

The same goes for the visual identity: all colours, fonts and sizes are CSS variables in `tokens.css`. Changing that one file is enough for a complete restyle, including dark mode and the dark bands. Inside a dark band (`.band`) the colour tokens are re-mapped, so components need no separate dark versions.

## Editing content

| To…                              | Edit                                      |
| -------------------------------- | ----------------------------------------- |
| Add/change a project             | `data/projects.json`                      |
| Change the three pillars         | `data/pillars.json`                       |
| Update the timeline              | `data/timeline.json`                      |
| Add a highlight                  | `data/highlights.json`                    |
| Change a skill or language       | `data/skills.json`                        |
| Add a certificate                | `data/certificates.json` (section appears automatically) |
| Add photo interludes             | `data/site.json` → `interludes`           |
| Change "About me", the fact sheet or UI text | `content/nl.json` and `content/en.json` |
| Socials, CV path, form endpoint  | `data/site.json`                          |
| Change the visual identity       | `assets/css/tokens.css`                   |

Fields added in v2 (all optional or additive; older entries keep working):

| File | Field | What it does |
|---|---|---|
| `data/projects.json` | `imageWidth`, `imageHeight` | Intrinsic size of `image`, so the page doesn't shift while it loads |
| `data/projects.json` | `story` | Optional extra paragraphs, shown only on the project page |
| `data/pillars.json` | `id`, `title`, `promise`, `text`, `project` | One pillar each. `project` is a project `id`, shown as the "In de praktijk" link |
| `data/timeline.json` | `group` | Entries with the same `group` become one card that shows the roles oldest → newest as steps (used for the three Amac roles). Placed where the newest entry sits |
| `data/skills.json` | `capabilities: [{ pillar, items }]`, `soft` | Methods & tools per pillar (`pillar` is a pillar `id`), and the soft-skills list. `bars` and `tools` are kept but no longer shown |
| `data/site.json` | `interludes` | Photo interludes, see below. Empty means nothing is shown |
| `content/*.json` | `about.facts`, `about.portrait_alt`, `pillars.*`, `hero.lab.*`, `experience.now/details/growth`, `skills.soft`, `nav.*` | Text for the new elements |

Timeline entries whose `to` is `"present"` get the "Nu" / "Current" marker automatically. Keep the file newest first.

### Project pages

Every project also has its own page at `/projecten/<id>/` (for example [/projecten/thesis/](https://robertkarzijn.nl/projecten/thesis/)), linked from its card. The page is an empty skeleton that `app.js` fills from `data/projects.json`, so the text lives in one place. It also renders an optional `"story": { "nl": ["paragraph", …], "en": [ … ] }` for extra paragraphs that only appear there. The card link reads "Projectpagina" and switches to "Lees meer" automatically once a project has a `story`.

**For a new project:**

1. Add it to `projects.json`.
2. Copy one of the `projecten/<id>/` folders and rename it to the new `id`.
3. In its `index.html`, change `data-project`, `<title>`, the description and the URL tags (`og:url`, `canonical`).
4. Add the URL to `sitemap.xml`.

### Adding images

Keep images small: export as WebP at no more than ~1600px wide (960px for the portrait), for example:

```bash
cwebp -q 80 -resize 1600 0 input.jpg -o assets/img/project-name.webp
```

Add `imageWidth` / `imageHeight` to the project with the exported size.

### Adding photo interludes

Interludes are full-width photos between sections. They fill up to three fixed slots in order:

1. between *Werkwijze* and *Projecten*
2. between *Ervaring* and *Vaardigheden*
3. right before *Contact*.

```json
"interludes": [
  {
    "src": "assets/img/interlude-1.webp",
    "alt": { "nl": "…", "en": "…" },
    "width": 2400, "height": 1350,
    "position": "50% 40%",
    "caption": { "nl": "…", "en": "…" }
  }
]
```

Only `src` and `alt` are required. Use `""` as alt text for a purely atmospheric photo. `position` moves the crop and `caption` adds a small line under the photo. Export landscape **16:9 at 2400 × 1350 px**, WebP around q78, ideally under 300 KB:

```bash
cwebp -q 78 -resize 2400 0 photo.jpg -o assets/img/interlude-1.webp
```

Desktop shows a 21:9 crop, which loses about 12% at the top and bottom. Phones show a 4:3 crop, which loses the sides. Keep the subject near the centre or set `position`.

### Fonts

Bricolage Grotesque (headings), Hanken Grotesk (text) and Spline Sans Mono (labels) are self-hosted as variable WOFF2 files (latin subset, from [Fontsource](https://fontsource.org)) in `assets/fonts/`, next to their SIL Open Font Licences. The `@font-face` rules are at the top of `tokens.css`. The two most important files are preloaded in the `<head>` of every page. To update a font, download the new `…-latin-…-normal.woff2` from the matching `@fontsource-variable/…` package and replace the file.

### The V1 hero video (not used in v2)

The redesign no longer shows the intro video, but the files are kept: `assets/video/hero-intro-av1.mp4`, `assets/video/hero-intro.mp4`, `assets/img/hero-start.webp`, `assets/img/hero-end.webp` and the source render `assets/robert-portfolio-intro.mp4`. The V1 implementation and the ffmpeg instructions for re-encoding are in commit `813bcf4` (V1.13).

## Running locally

The site loads content via `fetch()` and therefore needs a web server (it does not work via `file://`):

```bash
python -m http.server    # or: npx serve
```

## Deployment

Hosted on GitHub Pages with a custom domain via TransIP. `robertkarzijn.com` redirects with a 301 to `robertkarzijn.nl`. Every push to `main` goes live automatically. See [docs/setup-overview.svg](docs/setup-overview.svg) for a diagram of the hosting setup. The contact form expects an endpoint (e.g. Formspree) in `data/site.json` → `formEndpoint`.

---

© Robert Karzijn · Built without frameworks, cookies or deceptive patterns.
