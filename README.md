# robertkarzijn.nl

Personal portfolio website of **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## What this site does

A single static page that serves as a digital business card for employers, clients and my network, with:

- **Bilingual (NL/EN)**: Dutch is the default language, with a language switcher in the navigation. All content, from UI labels to project descriptions, is fully written in both languages and switches instantly without a page reload.
- **Dark mode**: follows the system preference (`prefers-color-scheme`) automatically and can be toggled manually.
- **Content sections**: hero, highlights, about me, featured projects (problem / role / techniques / result), a combined timeline of work and education, skills and languages, and a contact form. A certificates section appears automatically as soon as certificates are present in the data.
- **Contact form without visible personal details**: messages go through a configurable endpoint (Formspree-compatible); no email address or phone number is shown on the site, to protect my privacy.
- **Subtle micro-animations**: animated skill bars and a drawn accent underline in the hero. `prefers-reduced-motion` is respected.
- **No cookies, no trackers and no deceptive patterns**: a deliberate choice that ties in with my research field, and the wink behind the "cookie banner" on the site.

## How it is built

Deliberately **without frameworks or a build step**: vanilla HTML, CSS and JavaScript. For a one-pager this gives the fastest load time, zero dependencies and years of maintainability.

```
├── index.html                 # Structure (skeleton without content)
├── privacy.html               # Privacy statement (NL/EN)
├── 404.html                   # Custom 404 page (NL/EN)
├── wkz-prototype.html         # Interactive WKZ alarm system concept prototype
├── docs/setup-overview.svg    # Diagram of the hosting setup
├── assets/
│   ├── css/tokens.css         # All design tokens: colours, typography, spacing (light + dark)
│   ├── css/main.css           # Component styles, built on the tokens
│   ├── js/app.js              # Loads JSON, renders sections, handles i18n / theme / form
│   └── img/                   # Images (WebP, max ~1600px wide)
├── content/                   # UI strings & "About me" per language (nl.json, en.json)
└── data/                      # Structured content: projects, timeline, skills,
                               # highlights, certificates, site config
```

Core principle: **content and code are separated.** All content lives in JSON; `app.js` renders it client-side. Adding a new project, job or certificate means adding a JSON object. Bilingual fields have the shape `{ "nl": "…", "en": "…" }`. This keeps the site easy to extend in the future.

The same goes for the visual identity: all colours, fonts and sizes are CSS variables in `tokens.css`. Changing that one file is enough for a complete restyle, including dark mode.

## Editing content

| To…                              | Edit                                      |
| -------------------------------- | ----------------------------------------- |
| Add/change a project             | `data/projects.json`                      |
| Update the timeline              | `data/timeline.json`                      |
| Add a highlight                  | `data/highlights.json`                    |
| Change a skill or language       | `data/skills.json`                        |
| Add a certificate                | `data/certificates.json` (section appears automatically) |
| Change "About me" or UI text     | `content/nl.json` and `content/en.json`   |
| Socials, CV path, form endpoint  | `data/site.json`                          |
| Change the visual identity       | `assets/css/tokens.css`                   |

### Adding images

Keep images small: export as WebP at no more than ~1600px wide (960px for the portrait), for example:

```bash
cwebp -q 80 -resize 1600 0 input.jpg -o assets/img/project-name.webp
```

## Running locally

The site loads content via `fetch()` and therefore needs a web server (it does not work via `file://`):

```bash
python -m http.server    # or: npx serve
```

## Deployment

Hosted on GitHub Pages with a custom domain via TransIP; `robertkarzijn.com` redirects with a 301 to `robertkarzijn.nl`. Every push to `main` goes live automatically. See [docs/setup-overview.svg](docs/setup-overview.svg) for a diagram of the hosting setup. The contact form expects an endpoint (e.g. Formspree) in `data/site.json` → `formEndpoint`.

---

© Robert Karzijn · Built without frameworks, cookies or deceptive patterns.
