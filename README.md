# robertkarzijn.nl

Personal portfolio website of **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## What this site does

A single static page that serves as a digital business card for employers, clients and my network, with:

- **Bilingual (NL/EN)**: Dutch is the default language, with a language switcher in the navigation. All content, from UI labels to project descriptions, is fully written in both languages and switches instantly without a page reload.
- **Dark mode**: follows the system preference (`prefers-color-scheme`) automatically and can be toggled manually.
- **Content sections**: hero, highlights, about me, featured projects (problem / role / techniques / result), a combined timeline of work and education, skills and languages, and a contact form. A certificates section appears automatically as soon as certificates are present in the data.
- **Contact form without visible personal details**: messages go through a configurable endpoint (Formspree-compatible); no email address or phone number is shown on the site, to protect my privacy.
- **Intro video in the hero**: a short, silent, self-hosted intro animation fills the first screen, plays once and then rests on its final title. On scroll, the rest of the page slides up over it like a sheet while the video shrinks slightly and fades into the page. It has a pause/play/replay button. With `prefers-reduced-motion` the video doesn't autoplay (it shows the final frame) and simply scrolls away without the effect; Data Saver also turns off autoplay.
- **Subtle micro-animations**: animated skill bars and a drawn accent underline in the hero. `prefers-reduced-motion` is respected.
- **No cookies, no trackers and no deceptive patterns**: a deliberate choice that ties in with my research field, and the wink behind the "cookie banner" on the site.

## How it is built

Deliberately **without frameworks or a build step**: vanilla HTML, CSS and JavaScript. For a one-pager this gives the fastest load time, zero dependencies and years of maintainability.

```
├── index.html                 # Structure (skeleton without content)
├── privacy.html               # Privacy statement (NL/EN)
├── 404.html                   # Custom 404 page (NL/EN)
├── docs/setup-overview.svg    # Diagram of the hosting setup
├── assets/
│   ├── css/tokens.css         # All design tokens: colours, typography, spacing (light + dark)
│   ├── css/main.css           # Component styles, built on the tokens
│   ├── js/app.js              # Loads JSON, renders sections, handles i18n / theme / form
│   ├── img/                   # Images (WebP, max ~1600px wide), incl. the hero video posters
│   └── video/                 # Hero intro video (AV1 + H.264 fallback)
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

### Replacing the hero video

The hero plays `assets/video/hero-intro-av1.mp4` (AV1, smallest, picked by browsers that support it) with `assets/video/hero-intro.mp4` (H.264) as the fallback for everything else. The posters are `assets/img/hero-start.webp` (first frame, shown while loading) and `assets/img/hero-end.webp` (final frame, shown instead of the animation with reduced motion). Keep the video silent, centred and ending on a still frame, since it stops on its last frame. With [ffmpeg](https://ffmpeg.org) (`brew install ffmpeg`), from a source render `intro.mp4`:

```bash
# Optional: -ss/-to trim the source (the current video uses -ss 0.5 -to 13.8 to skip the empty start and the fade-out)
VF="format=yuv420p,setparams=colorspace=bt709:color_primaries=bt709:color_trc=iec61966-2-1"
ffmpeg -i intro.mp4 -an -vf "$VF" -c:v libsvtav1 -preset 4 -crf 34 -movflags +faststart assets/video/hero-intro-av1.mp4
ffmpeg -i intro.mp4 -an -vf "$VF" -c:v libx264 -preset veryslow -tune animation -crf 24 -movflags +faststart assets/video/hero-intro.mp4
ffmpeg -i intro.mp4 -frames:v 1 -quality 82 assets/img/hero-start.webp
ffmpeg -sseof -0.1 -i intro.mp4 -frames:v 1 -quality 82 assets/img/hero-end.webp
```

`-an` drops the audio (a muted hero never plays it), and the sRGB tag keeps the video's colours matching the page in Safari and Chrome. If the new video's edges are a different colour, update `--stage-bg` in `tokens.css`.

## Running locally

The site loads content via `fetch()` and therefore needs a web server (it does not work via `file://`):

```bash
python -m http.server    # or: npx serve
```

## Deployment

Hosted on GitHub Pages with a custom domain via TransIP; `robertkarzijn.com` redirects with a 301 to `robertkarzijn.nl`. Every push to `main` goes live automatically. See [docs/setup-overview.svg](docs/setup-overview.svg) for a diagram of the hosting setup. The contact form expects an endpoint (e.g. Formspree) in `data/site.json` → `formEndpoint`.

---

© Robert Karzijn · Built without frameworks, cookies or deceptive patterns.
