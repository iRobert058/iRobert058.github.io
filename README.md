# robertkarzijn.nl

Personal portfolio website of **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## What this site does

A single static page that serves as a digital business card for employers, clients and my network, with:

- **Bilingual (NL/EN)**: Dutch is the default language, with an NL/EN switch in the navigation. All content, from UI labels to project descriptions, is written in both languages and switches instantly without a page reload. English lives in the address (`?lang=en`), so a shared or reloaded link keeps its language and nothing is stored.
- **Light and dark theme**: follows the system preference (`prefers-color-scheme`) and can be switched with the toggle. The choice lasts for the page view; nothing is stored.
- **A session-recording hero**: the headline with its drawn underline, the intro, an "Op dit moment" list built from the timeline entries running until `present`, and the intro video framed as an observed session: a short mono log beside it lights up as the cursor acts. The video plays once when it comes into view, has a pause/replay button, and never plays on its own under reduced motion.
- **Content sections**, in page order: a hero with what Robert is looking for, his current roles and a strip of four highlights; featured projects as case studies (problem / role / result) on a dark stage; about me (portrait and a fact table); one timeline of work, education and extracurricular activities (with the Amac roles shown as one progression); skills as three ways of working (research, design, organise), each with its methods and tools, plus soft skills and languages; and a contact form with the CV, socials and a privacy line. A certificates section appears automatically when there are certificates in the data. Optional full-width photo interludes appear between sections.
- **Project pages** at `/projecten/<id>/` with the same case study, a large visual and room for an optional longer story.
- **Contact form without visible personal details**: messages go to a Formspree endpoint, with a `_gotcha` honeypot against spam.
- **No cookies, no trackers, no storage and no deceptive patterns**: no analytics, no third-party requests (fonts are self-hosted), and no `localStorage`. The only external request is the form submission.
- **Accessible by default**: skip link, landmarks, a keyboard-operable mobile menu (Esc closes it), visible focus, `aria-pressed` on the toggles, AA contrast in both themes (also on the translucent controls), and `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast` are all respected.

## How this site works

There is no framework and no build step: what is in this repository is exactly what GitHub Pages serves.

### What each folder is for

```
├── index.html                 # The homepage skeleton: structure only, no copy
├── projecten/<id>/index.html  # One small skeleton per project page
├── privacy.html, 404.html     # Standalone pages with their own NL/EN text inside
├── content/                   # UI text and the "About me" copy, one file per language (nl.json, en.json)
├── data/                      # Structured content: projects, timeline, skills, highlights, certificates,
│                              #   site settings (socials, CV, form endpoint, photos, hero video)
├── assets/css/tokens.css      # The visual identity: colours, fonts, sizes, spacing, radii, glass, motion
├── assets/css/main.css        # The components, built only on the tokens
├── assets/js/app.js           # Loads the JSON and renders every section; language, theme, menu, video, form
├── assets/js/logic.mjs        # Small pure helpers (no page access), covered by the tests
├── assets/fonts/              # Self-hosted variable WOFF2 fonts (Latin subset) + OFL licence
├── assets/img/, assets/video/ # Images (WebP) and the intro video
├── docs/setup-overview.svg    # Diagram of the hosting setup
└── tests/                     # node --test: logic, content checks and the content-preservation test
```

### How the pieces fit

1. The browser loads an HTML skeleton. Elements that show text carry a key, for example `data-t="hero.sub"`.
2. `app.js` loads all JSON files, fills every keyed element from `content/<language>.json`, and builds the lists (projects, timeline, skills…) from `data/`.
3. Switching language or theme re-renders the page from the same data. Every value goes through an escape function before it reaches the page.

### Run it locally

The site loads its content with `fetch()`, so it needs a small web server (opening `index.html` as a file won't work):

```bash
python3 -m http.server    # then open http://localhost:8000
```

No `npm install` is needed. For the tests you only need Node (any current LTS): `node --test`.

### Change a text

- **Labels, headings and the About copy:** edit `content/nl.json` and the same key in `content/en.json`. Both files must keep identical keys (a test checks this). Dutch is the source; English is a natural translation.
- **A project, job, highlight or skill:** edit the matching file in `data/`. Bilingual fields are either a plain string (same in both languages) or `{ "nl": "…", "en": "…" }`; a missing `en` falls back to Dutch.
- After editing, run `node --test`: one JSON syntax error blanks the whole site, and the tests catch it.

### Add a project

1. Add an object to `data/projects.json` (fields below).
2. To give it its own page, copy one of the folders in `projecten/`, rename it to the new `id`, change `data-project="…"`, the `<title>`, the descriptions, the `og:` tags and the canonical URL in its `index.html`, and set `"page": "projecten/<id>/"` in the JSON.
3. Add the new URL to `sitemap.xml`.

The card's link says **Projectpagina / Project page** while the page only repeats the card, and **Lees meer / Read more** once the project has a `story`.

### Add a photo

See "Photo interludes" below. Export images as WebP, for example `cwebp -q 80 -resize 1600 0 input.jpg -o assets/img/name.webp`.

### How it deploys

Every push to `main` goes live on GitHub Pages within minutes, from the repository root. The custom domain comes from the `CNAME` file (DNS at TransIP); `robertkarzijn.com` redirects with a 301 to `robertkarzijn.nl`. See [docs/setup-overview.svg](docs/setup-overview.svg).

## Content schema

`L` = a plain string or `{ "nl": "…", "en": "…" }`. Fields marked *optional* can be left out; older data without them still renders.

| File | Shape |
|---|---|
| `data/site.json` | `name`, `cvFile`, `portraitImage`, `formEndpoint` (Formspree URL), `socials: [{label, url}]`, `interludes: [{src, alt: L}]`, `heroVideo` (below) |
| `data/highlights.json` | `[{year, title: L, text: L, link?}]`, shown as the strip under the hero; `link` is `#anchor` or `https://…`. The strip is four columns wide on desktop, so four items fit best; keep `text` to one short sentence |
| `data/projects.json` | `[{id, tag: L, title: L, intro: L, image?, imageWidth?, imageHeight?, imageAlt: L, video?, problem: L, role: L, result: L, tech: (string\|L)[], cta: {label: L, url}, page?, story?}]`. `tech` and `cta` are required; `imageAlt` is required with an `image`; `story` is a string or a list of paragraphs, per language; `result` can also be a list per language (the thesis findings), which renders as a ruled list with the last item quieter |
| `data/timeline.json` | `[{period: {from, to}, kind, title: L, org, description: L, group?}]`, newest first. `to: "present"` shows the "Nu" marker. `kind` is `work`, `education` or `extracurricular`. Entries sharing a `group` (for example `"amac"`) render as one card with the progression oldest → newest |
| `data/skills.json` | `groups: [{pillar, items: (string\|L)[]}]` (pillar ids match `pillars.items[].id` in the content files), `soft: L[]`, `languages: [{name: L, level: L}]`. `tools` is the fallback without `groups`; `bars` is kept but no longer shown |
| `data/certificates.json` | `[{title: L, issuer?, year?}]`; an empty array hides the section |

### The hero video (`site.json` → `heroVideo`)

```json
"heroVideo": {
  "av1": "",
  "h264": "assets/video/robert-intro-5s.mp4",
  "poster": "assets/img/robert-intro-5s-end.webp",
  "width": 1920,
  "height": 1080,
  "cues": [
    { "at": 0.25, "label": { "nl": "cursor komt in beeld", "en": "cursor enters" } }
  ]
}
```

- `av1` is optional: when set, browsers that can play AV1 get that (smaller) file first; `h264` is the fallback every browser plays.
- `poster` is a still of the **last** frame: it shows before playback and under reduced motion.
- `cues` are the lines of the session log, with the second (`at`) at which each action starts in the video. When you replace the video, update these times.

### Photo interludes

```json
"interludes": [
  { "src": "assets/img/interlude-1.webp", "alt": { "nl": "…", "en": "…" } }
]
```

Entries fill three slots in order: after the projects, after the experience timeline, and after the skills (before contact). Entries with an empty `src` are skipped; with no usable entries nothing renders. Export photos at **2400 × 1029 px (21:9)** as WebP of roughly 300–400 KB; on phones the same image is cropped to 4:3 around the centre, so keep the subject in the middle.

## Tests

Node's built-in test runner, no `package.json` needed:

```bash
node --test
```

- `tests/logic.test.mjs`: the helpers in `assets/js/logic.mjs` (timeline grouping, interlude slots, skills fallbacks, the language in the URL, session-log timing, the project link label).
- `tests/content.test.mjs`: every JSON file parses, `nl.json` and `en.json` have identical keys, projects have the fields rendering needs, timeline kinds have labels, project pages exist, and the copy says "deceptive patterns".
- `tests/content-preservation.test.mjs`: every text string that was in the JSON at V2.1 (`tests/fixtures/v2.1-strings.json`) still exists somewhere in the JSON, so a restructure can't silently lose content.

Check visual changes in the browser in both languages, both themes and at phone width.

---

© Robert Karzijn · Built without frameworks, cookies or deceptive patterns.
