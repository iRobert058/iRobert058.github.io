# Redesign V3.0 (Apple × cinematic): notes for review

Branch `redesign/v3-apple`, cut from local `main` at `68373a2` (V2.1 plus the `.gitignore` commit for `PRODUCT.md` and `.impeccable/`). The pre-push hook on this machine blocks pushing `main`, so that commit reaches `main` through this branch's PR.

Status: **sections 1–4 done; finish review results and fixes at the end of this file.** Hero: concept A (your pick). Stack: vanilla (your pick).

---

## 1. Analysis

### What the references do, and why it works

**jopmors.com** (screenshots at 1440 and 390, ten and eight scroll positions, in `_review/v3-apple/ref/`):
- **Pacing:** one confident move per screen, then a long breath. The hero is a full-bleed photograph with a giant name. Each following section opens with a big heading and lets the content sit on dark glass panels.
- **Scale:** display type around 120–160 px on desktop, against 11–12 px mono labels. Few in-between sizes, so the contrast does the work.
- **Light, material, depth:** a dark, photographic ground (dusk skylines), with frosted panels floating above it. Depth comes from photo → blur → panel → text.
- **Hand-over:** sections fade into each other through the shared dark ground; photography returns as a backdrop every few screens.
- **What moves:** the hero zooms into a laptop screen on scroll; numbers and panels rise in. The rest stays still.

**apple.com** (home, a product page, the MacBook Air page; same capture method):
- **Pacing:** strictly one idea per screen. A product name, a three-to-five-word headline, a one-line subhead, two actions, then a huge image. The next idea starts only after a full screen of space.
- **Scale:** headlines of 56–96 px with tight tracking; the subhead is 21–28 px; body copy is rare and short. Hierarchy comes almost entirely from size and weight; colour barely participates.
- **Light, material, depth:** mostly flat, light-grey and white tiles with large radii (about 18–28 px) on a white page, with black stages for the darker products. The only translucent material is the functional layer: the sticky nav and sub-nav. Content is never glass.
- **Hand-over:** a section ends, and the next one starts on a different ground (white → light grey → black), so the page has rhythm without decoration. Bento rows of tiles close a story.
- **What moves:** images scale or slide in once as they arrive, sticky sections play a short story while scrolling stays native, and everything else is still. Motion always arrives and settles; nothing loops except product films.

### Where they pull apart, and how I resolve it

| Tension | Jop | Apple | Resolution (clarity wins) |
|---|---|---|---|
| Ground | Dark and photographic everywhere | Light first, dark stages as accents | Light first, following the system theme; dark **stages** for projects and contact, so the page has a cinematic rhythm without being charcoal by default |
| Glass | On content panels and cards | Only on the nav and controls | Only on the functional layer (nav, menu, toggles, Contact pill, video controls, honest banner). Never on content |
| Imagery | Stock-feeling scenes carry the mood | Product imagery carries the page | Only your own material: portrait, intro video, project images, later your own photography |
| Type | Name as the hero object, italic serif accents | Product name small, headline large | Your headline is the hero object; your name stays the wordmark. No serif or italic accents |
| Motion | Hero zooms into a screen | Arrive-and-settle, sticky storytelling | Arrive-and-settle only; one sticky storytelling sequence (projects); no zoom-into-screen |

---

## 2. The design system (derived with the skills)

Values are the starting point for `tokens.css`; the build may tune them, and `DESIGN.md` will record what shipped.

**Colour roles** (Restrained strategy: calm neutrals plus your one red. Neutrals are cool and slightly blue-grey, like Apple's, not warm paper):

| Role | Light | Dark | Notes |
|---|---|---|---|
| `canvas` | `#FFFFFF` | `#000000` | Page ground |
| `canvas-alt` | `#F4F4F6` | `#121214` | Alternate sections, tiles |
| `stage` | `#0B0B0D` | `#1A1A1D` | Dark bands (projects, contact). In dark mode the stage lifts instead of disappearing, so the rhythm survives |
| `ink` | `#111114` | `#F4F4F6` | Text |
| `ink-muted` | `#55555C` (≥ 7:1 on white) | `#A3A3AB` (≥ 7:1 on black) | Secondary text |
| `hairline` | `#E3E3E8` | `#2A2A2E` | Dividers, used sparingly |
| `accent` | `#E23C46` | `#FF5C63` | Large text, the underline, numerals, dots |
| `accent-strong` | `#C42D38` | `#FF5C63` | Small red text and fills behind white text (AA) |
| `on-accent` | `#FFFFFF` | `#0B0B0D` | Text on a red fill |

**Type** (only your three self-hosted families):
- Bricolage Grotesque for display, weight 600–700, optical feel through tracking: hero `clamp(52px, 9vw, 152px)` at −0.04em, line-height 0.98; section headline `clamp(40px, 6.2vw, 96px)` at −0.035em; title `clamp(26px, 2.6vw, 40px)` at −0.02em.
- Hanken Grotesk for text: lead `clamp(20px, 1.6vw, 26px)` at line-height 1.4; body 17–18 px at 1.6; small 15 px.
- Spline Sans Mono for labels: 12.5–13 px, uppercase, +0.06em. Labels are the only uppercase.
- Seven sizes in total, no more.

**Spacing:** a 4-px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192. Section padding `clamp(96px, 14vw, 192px)`: Apple-scale breathing room.

**Grid:** 12 columns, content max 1280 px, a reading measure of 980 px for the narrative, gutters `clamp(20px, 4vw, 48px)`.

**Radii:** 10 (small controls), 18 (tiles, inputs), 28 (large media and stages), pill.

**Materials** (all hand-written CSS, all on the functional layer):
- `glass-bar` (nav): `backdrop-filter: blur(20px) saturate(170%)`, a 72 % canvas tint, a 1-px inner highlight on the top edge, and a soft shadow. (The brief stage planned the shadow only after scrolling; as built, the nav groups float from the start, so they always carry it.)
- `glass-control` (toggles, Contact pill, video controls, honest banner): a smaller blur, a stronger tint, the same light edge; on hover the highlight shifts and the surface brightens; on press it dims and scales to 0.97.
- Fallbacks: a solid surface under `prefers-reduced-transparency`, without `backdrop-filter` support (`@supports`), and under `prefers-contrast: more` (plus a stronger border). `-webkit-backdrop-filter` is set alongside for WebKit.

**Motion:**
- `--ease-settle: cubic-bezier(.22, 1, .36, 1)` for arrivals (close to a critically damped spring), with a `linear()` spring curve as an enhancement where supported; `--ease-exit: cubic-bezier(.4, 0, 1, 1)`.
- Durations: 120 ms press, 220 ms state change, 480 ms reveal, 720 ms large scale shift. Exits run at about 65 % of the entry.
- Only `transform` and `opacity` animate. Content is visible by default; reveals only enhance (the Safari lesson). Under reduced motion everything is instant and nothing starts hidden.

### Skill guidance overridden

UI/UX Pro Max's generated design system for "personal portfolio, UX researcher, cinematic" returned Brutalism, Caveat with Quicksand from Google Fonts, a blue accent and GSAP from a CDN. All of that breaks the brief (your fonts, your red, no CDN, Apple restraint), so I didn't use it. I kept its **scroll-triggered storytelling** pattern (story readable without the effects, everything static under reduced motion) and its **Liquid Glass** checklist (navigation and controls only, separate content layer, test reduced transparency and contrast).

---

## 3. Hero concepts

All three keep your headline ("Goede techniek begint met een goed *gesprek*.") as the lead, with the drawn underline, and keep the honest banner (on glass). None reuses the rejected shop demo, the reaction-time experiment or section numbers.

### A. "Opname 01": the intro video as an observed session *(video as centrepiece, recommended)*
- **First viewport:** the headline, very large, on the light canvas. Directly under it, a wide dark stage with rounded corners (28 px) plays your intro video, muted and looping: the cursor that draws a text box, drops the red full stop and types "HCI student".
- **What makes it yours:** the video is framed as **research footage**, not a title card. Beside it (below it on phones) runs a short coding track in mono, like the notes of a usability session: "00:02 cursor komt binnen · 00:05 selecteert tekstvak · 00:08 plaatst punt · 00:10 typt rol". Each line lights up as the video reaches that moment. This turns the name-with-role-beneath into what you actually do: observing and coding how someone uses an interface. It sits on a light page, not a dark stage-by-default, and the name is the subject being observed, not a headline.
- **Controls:** a glass pause/play button on the stage (always visible), AV1 first with H.264 fallback, `hero-start.webp` as the poster. Under reduced motion: no autoplay, the poster shows the final frame and the full coding track is static.
- **Risk:** the coding track adds four short new lines of copy (both languages, for review). The video costs about 0.5 MB (AV1); it loads after the headline, so LCP stays the text.

### B. "Tussen partijen": you between three worlds *(no video)*
- **First viewport:** the headline across the full width, your portrait below it in a large rounded tile. Around the portrait sit three small tiles from the "right now" list (MSc HCI at Utrecht University, Daily Operations Lead at Amac, secretary at Stichting Sticky).
- **On scroll:** the three tiles slide in from the edges and settle against the portrait, a literal picture of "at my best between parties", then the page hands over to About. Scrolling stays native; the tiles only move with scroll position and are static under reduced motion.
- **Risk:** the most "bridge-builder" of the three, but research shows up only in the words, not in the picture. A portrait-plus-tiles hero is also a familiar portfolio layout.

### C. "Het gesprek": type only *(no video)*
- **First viewport:** only the headline, at the biggest size the screen allows, with the underline drawing under *gesprek* once. The honest banner floats as a glass pill at the bottom.
- **On scroll:** the underline keeps growing into the thin red line that becomes the page's thread (it runs into the timeline's "Nu" marker and the contact section).
- **Risk:** the most Apple-pure and the cheapest to build, but the least about your research and the closest to what V2.1 already does.

**Recommendation: A.** It is the only concept that shows your research in the first screen, it uses your own strongest material, and the observation framing makes the video clearly yours instead of a name-with-roles title card. B is the fallback if you'd rather not have motion in the hero.

*Your pick:* **A**, with your own new 5-second intro video (`assets/video/robert-intro-5s.mp4`), which is now wired in.

---

## 4. Stack decision

| | Stay vanilla (today) | Eleventy (11ty) | Astro |
|---|---|---|---|
| What it is | HTML skeleton + JSON + `app.js` renders in the browser | Static site generator: templates + your JSON → plain HTML at build time | Component framework that outputs static HTML |
| Dependencies | None | 1 package (`@11ty/eleventy`) and its tree | Astro and its tree (larger), components in `.astro` |
| Build and deploy | None; Pages serves the repo | `npm run build`, a GitHub Actions workflow, Pages source switched to Actions | Same as Eleventy |
| Content editing | Edit JSON | Edit the same JSON | Edit the same JSON |
| Without JavaScript | Empty page (noscript fallback) | Full content in NL | Full content in NL |
| Language switch | Instant, in the browser (`?lang=en`) | Needs either `/en/` pages (new URLs) or the same client-side switch on top, so two render paths | Same as Eleventy |
| Shared header/footer | Copied into 6 HTML files | One template | One component |
| Measured today | Lighthouse 98–100 in V2.x | Likely similar | Likely similar |

**Recommendation: stay vanilla.** A generator would bring real gains (prerendered HTML without JS, one shared header), but your two hard requirements (instant NL/EN switch and editing only JSON) mean a generator would need either new `/en/` URLs or two render paths for the same content. That's more to understand and maintain for a site that already scores in the high 90s. Instead I'll tidy the vanilla structure: one renderer per section, the shared header and footer rendered by `app.js` from one template so the six HTML files stop duplicating it, and a content-preservation test.

---

## 5. Borrowed patterns

| Pattern | Source | What makes mine different |
|---|---|---|
| One idea per screen, huge headline + short subhead | Apple | Your own headlines and copy; numbers and labels in your mono face |
| Sticky translucent nav | Apple (also Jop) | Liquid Glass built from scratch; Contact as a red-filled glass pill; tucks away on scroll down, returns on scroll up or focus |
| Dark stages between light sections | Apple | Two stages (projects, contact) that lift in dark mode instead of vanishing |
| Sticky storytelling while scrolling | Apple | Projects: each case pins its title while problem → role → result scroll past; native scroll |
| Large rounded tiles / bento | Apple | Only for highlights and capabilities, flat (no glass, no shadow) |
| Cinematic, immersive feel and depth | Jop | Depth only in the glass layer and scale shifts, not in photo backdrops; light first |
| Portrait + key–value facts in About | Jop | Facts from your content only; portrait in a rounded tile beside the narrative, not under it |
| Numbered pillars | Jop | Your three verbs (Onderzoeken / Ontwerpen / Organiseren) as one horizontal row of large numerals, not stacked cards |
| Full-bleed photography between sections | Jop | Your own photos only, in data, nothing rendered while empty |
| Expandable timeline details | Jop | One left-aligned ledger, the Amac growth as its own featured card, no centre spine, no monograms |

## 6. Deliberately not copying

- From Jop: the code-editor window, the desk/laptop/skyline/bridge scenes, the zoom-into-screen hero, the name with numbered roles beneath, the "in one sentence" block, the Launched / Ongoing split, monogram badges, the centred alternating timeline, the logo strip, the iPod widget, charcoal with orange, serif-italic accents, and all of his section titles (in any language).
- From Apple: no logo, product names, product imagery, SF Pro or SF Symbols, no Apple text, nothing that suggests Apple made or endorses the site. Your existing mentions of Amac and Apple Premium Reseller stay as content.
- Not brought back: the shop demo, the reaction-time experiment, `§ 01` section numbers and "Fig." labels.

## 7. Design direction, in my words

The page says: *this is someone who studies how people actually use interfaces, and who is at his best between people.* It should have Jop's sense of presence (big type, depth, a page that tells a story as you scroll) and Apple's precision (one idea per screen, perfect alignment, imagery doing the talking, motion that arrives and settles). Light first, with dark stages for rhythm. Your red is the only colour. Glass only where you operate something. Everything works, and stays readable, with motion and transparency turned off.

## 8. Impeccable workflow

- `PRODUCT.md` and `.impeccable/config.json` read. Hook is on.
- `concept-seed --scope direction --mode experience` ran (seed `bbf08dd3`). The brief pins the visual world (Apple × cinematic, your red, your fonts, glass on controls), and Impeccable's own rule is that a brief-pinned direction beats the roll. So I used the roll only to stress-test the hero concepts. Raises kept from the challengers:
  - **from the variable-font specimen:** hierarchy by scale contrast alone (huge display against tiny mono labels, few sizes in between)
  - **from the mezzotint plate:** the hero video emerges from its dark poster frame instead of fading in from white.
- The decision page (`serve-question`) runs on localhost, which you can't reach from your phone, so the hero/stack round goes through the normal question tool. No image generation is available, so the build is code-led.

## Report

### What changed and why

- **Design system** (`assets/css/tokens.css`): cool neutrals (white / #F4F4F6, black in dark mode), dark stages for rhythm, your red as the only colour, seven type sizes in your three fonts, a 4-px spacing scale, radii 10/18/28, Liquid Glass materials with their fallbacks, and motion tokens with a critically damped spring curve (`linear()`, cubic-bezier fallback, no overshoot).
- **Navigation:** floating glass groups (wordmark, links, NL/EN, theme, a red Contact pill). The bar tucks away while scrolling down and comes back on scroll up, near the top, when the menu is open, and whenever anything in it has keyboard focus. Below 900 px the links and preferences fold into a glass sheet under a menu button (`aria-expanded`, focus moves in, Esc closes and returns focus, tabbing out closes).
- **Hero (concept A):** your headline with a hand-drawn underline that draws once; the intro and "Op dit moment"; three actions; the honest note on glass; then the session: your intro video on a rounded dark stage with a mono session log whose lines light up as the cursor acts. It plays once when it scrolls into view and holds the last frame; a glass button pauses, plays and replays. Under reduced motion it doesn't play and the poster shows the final frame.
- **About:** narrative and fact table on the left; the portrait on the right in a large rounded tile that stays put while the text scrolls (on phones the portrait stays above the text). The portrait uncovers from the bottom while the photo settles out of a slight zoom, once a third of it is in view; under reduced motion it's simply there.
- **Highlights:** a bento: the thesis as a large dark tile, the other three as flat tiles, the last spanning two columns.
- **Pillars:** three columns with large red numerals on a hairline. The numerals carry information: the skills section uses the same numbers.
- **Projects:** on a dark stage that widens from an inset panel to full bleed as it scrolls in (only the ground scales, never the text). Each project opens with a large visual, then a sticky title column (meta, title, intro, techniques, actions) beside the problem / role / result case in lead-size type.
- **Experience:** one left-aligned ledger with the "Nu" marker and native `<details>`. The Amac roles are a featured card with the Junior → Medior → Senior progression as three steps on one line, the current step in red.
- **Skills:** capabilities as three flat tiles under the pillar numbers, soft skills as pills, languages as a table. `bars` stays in the data, unrendered.
- **Contact:** dark stage, your contact copy as the closing statement, socials, the form with `_gotcha`; the submit button disables while sending.
- **Project pages, 404, privacy:** rebuilt in the new look; privacy text untouched.
- **Language in the URL:** `?lang=en` (rebuilt; it only existed on `redesign/v2`). Every internal link carries it; switching updates the address without a reload; nothing is stored.
- **Honest project links:** "Projectpagina / Project page" until a project has a `story`, then "Lees meer / Read more". Project pages render the optional `story`.
- **Content-preservation test:** a snapshot of every string in the V2.1 JSON, checked against today's JSON.

### Checks that ran

- **`node --test`:** 25 tests, all passing (logic helpers, JSON validity and parity, project fields, terminology, project pages, content preservation).
- **Browser passes (Playwright, local Python server):** homepage at 390 and 1440 in both themes and both languages, plus WebKit at 390 and 1440 with and without reduced motion. No console errors, no horizontal overflow, no requests to other hosts, and 0 reveal blocks left hidden after scrolling, in Chromium and in WebKit.
- **Behaviour script, Chromium (34 checks) and WebKit (31), all passing:**
  - mobile menu: opens with focus on the first link, Esc closes and returns focus, tabbing out closes
  - keyboard: skip link first and focuses `<main>`, every stop has a focus style (in WebKit with Option-Tab, Safari's default for links), `<details>` open with Enter
  - nav: tucks on scroll down, returns on scroll up and when something in it gets focus
  - language: `?lang=en`, `<html lang>`, `aria-pressed`, every internal link carries the language, project page opens in English, switching back drops the parameter
  - theme toggle with `aria-pressed`
  - video: plays in view, the log follows, pause/play relabels, plays once and offers replay, no autoplay under reduced motion
  - form against a fake local endpoint (every outside request was intercepted; nothing reached Formspree): empty submit marks all fields and focuses the name, an invalid e-mail marks only that field, a valid submit shows the thank-you
  - no cookies, `localStorage` or `sessionStorage`
  - certificates hidden with `[]` and shown with an injected certificate; interludes render nothing while empty and one full-bleed photo with alt and size when injected
  - glass fallbacks (Chromium media emulation): translucent by default, solid without blur under reduced transparency, solid with a border under increased contrast
- **Lighthouse 13.5** (local server without compression):

  | Page | Performance | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | Home, mobile | 97 | 100 | 100 | 100 |
  | Home, desktop | 100 | 100 | 100 | 100 |
  | Thesis page, mobile | 97 | 100 | 100 | 100 |
  | MobiPad page, desktop | 100 | 100 | 100 | 100 |
  | Privacy, mobile | 99 | 100 | 100 | 100 |
  | 404, mobile | 99 | 100 | 100 | 54 (it's `noindex` on purpose) |

  CLS 0.003–0.012 everywhere (the project page started at 0.21; fixed by reserving height while loading).
- **axe-core** (WCAG 2.0–2.2 A/AA and best practice): 0 violations on the homepage (NL and EN, menu open, all `<details>` open), two project pages, privacy and 404, at 390 and 1280, in both themes: 24 runs.
- **Glass contrast, computed against the worst background that can scroll beneath** (white, black, both stages, the red, mid grey, a bright photo): nav text ≥ 9.5:1 light / 5.7:1 dark; controls ≥ 13.7:1 / 8.1:1; muted text on glass ≥ 5.4:1 / 5.1:1 (the dark-mode value failed at 3.5:1 first and got its own token); Contact pill ≥ 4.9:1 / 5.6:1; menu sheet ≥ 16:1 / 12:1.
- **Impeccable detect** on the served page at 1280 and 390: only `kicker-above-heading` on the seven section labels. Those are your existing eyebrow texts and the brief explicitly allows small mono labels, so they stay; not suppressed in config.
- **JS size:** 31.4 KB uncompressed (`app.js` 24.7 KB, `logic.mjs` 6.8 KB; about 5 KB of that is explanatory comments), **11.2 KB gzipped**, which is what Pages transfers. See "Decisions for you".
- **Originality:** script comparison with `/tmp/reference-jopmors` (class names, IDs, data attributes, custom properties, keyframes, identical strings of 40+ characters). No shared IDs, data attributes, keyframes or strings; the only shared custom property is `--font-mono`, already on `main` before V3; the 17 "shared class" hits are regex false positives on JS property names (`.textContent`, `.currentTime`) and file extensions. The repo contains no Apple fonts, icons, logos or apple.com text.
- **Distance test, per section** (his 1440 captures against mine):
  - **Hero:** photo room, skyline and laptop with a giant name vs. a light page with your headline, intro, current roles and a recorded session with a coding log. Pass.
  - **About:** dark, portrait with facts beneath and a serif-italic subtitle vs. light, sticky portrait tile beside narrative and a ruled fact table. Pass.
  - **Pillars:** stacked glass cards with italic one-liners vs. three open columns with large red numerals. Pass.
  - **Projects:** glass cards with a Launched/Ongoing split vs. a dark stage with full-width visuals and a sticky title column beside the case study. Pass.
  - **Skills:** glass cards over a skyline with a logo strip vs. flat tiles on grey and pills. Pass.
  - **Timeline:** centre spine with year numerals and monograms vs. a left-aligned ledger with a featured progression card. Pass.
  - **Contact:** photo backdrop with a glass form vs. a dark stage with a plain form. Pass.
- **Hardening intact:** `og:*` and `twitter:*` tags, canonical, JSON-LD `Person`, `<noscript>` fallback, `robots.txt`, `sitemap.xml` (5 URLs), styled 404 and privacy, the honeypot. Meta, OG and Twitter descriptions start with the current hero line.
- **Untouched (checked with `git diff main`):** `CNAME`, the CV, `og-image.png`, the favicons, the portrait, the old intro videos, `formEndpoint` and `socials`.

### Unverified

- **Liquid Glass blur in real Safari:** Playwright's headless WebKit doesn't render `backdrop-filter` at all (it failed on a bare test page too), so the blur was only seen in Chromium. Legibility doesn't depend on it: every glass surface keeps AA contrast with no blur at all. Check by hand: open the site in Safari on the Mac and the iPhone, scroll so the nav passes over the dark project stage and the MobiPad image, and open the mobile menu over the hero headline.
- **Scroll smoothness on a real phone** with the glass and the stage widening (my checks ran on a desktop machine). Check by hand: scroll the homepage on your iPhone quickly from top to bottom; it should never stutter.
- **A real screen reader:** VoiceOver on the session log, the Amac step list and the menu.
- **The live form:** never submitted, on purpose. After merging, send one test message.
- **GitHub Pages:** that `/projecten/thesis/?lang=en` and the 404 page behave the same as locally. Check on the live site after merging.

### Small fixes, workarounds, dependencies, abstractions

- **Small fixes:** the project page's layout shift while loading; the submit button now disables while a message is sending, against double submits (a code change: the form test passed, but the disabled moment itself wasn't measured).
- **Workarounds:** none in the code.
- **New dependencies:** none in the site. Playwright (1.62 and 1.63 to match the browsers already cached on this Mac), Lighthouse 13.5 and axe-core ran from the session scratchpad; nothing in the repo.
- **Abstractions:** the dark stage re-points the colour tokens, so every component works on light and dark ground without duplicate styles (carried over from V2). `logic.mjs` gained `langFromSearch`, `withLang`, `cueIndex`, `timecode`, `projectLinkKey` and `storyParagraphs`, to keep the testable logic out of the DOM code.
- **New files:**
  - `assets/video/robert-intro-5s.mp4` (yours)
  - `assets/img/robert-intro-5s-end.webp`: its last frame, exported from the video in WebKit and converted with `cwebp -q 82` (13 KB)
  - `assets/img/og-image-v3.png`: the stretch item, a 1200×630 Playwright screenshot of the redesigned hero (light, NL). `og:image` / `twitter:image` now point at it; the old `og-image.png` is untouched. Link previews only show it once it's live on `main`.

## Decisions log

- **Base commit:** your preflight answer was "push main first", but the pre-push hook blocks pushing `main`. I didn't work around it; the branch includes `68373a2` instead.
- **Positioning:** your preflight answer: both, the headline leads. The bridge-builder headline stays the lead message; the hero visual and the session log show the research.
- **`?lang=` and the "Projectpagina" rule:** the brief says `main` has both; they only existed on `redesign/v2`. Rebuilt on this branch with new code.
- **Hero video:** play once and hold the last frame (not a loop): calmer, and no content that keeps moving. The new 5-second video replaced the old one in the hero; the old files stay untouched in `assets/video/` and are no longer referenced. AV1 is optional (your new clip is H.264 only and only 136 KB).
- **Session log timecodes** show tenths (00:02.3), because whole seconds were too coarse for a 5-second clip.
- **Header and footer stay in each HTML file** instead of being rendered by `app.js` from one template (which I had proposed in the stack section). Rendering them in JS would have added code against the JS budget and made the bar appear only after the script ran. Six short copies are the smaller cost.
- **Floating glass groups instead of one full-width bar:** glass on glass hurts legibility (the `apple-design` skill warns against stacking translucent layers), so each group is its own glass object and no group sits on another.
- **Section labels kept** above the headlines despite Impeccable's craft floor (which bans eyebrows): they are your existing copy, and the brief allows small mono labels. They appear only as mono labels, never as decoration.
- **Display size:** the hero goes up to 124 px, above the craft floor's 96 px guideline, because the brief asks for Apple-scale headlines; it stays two lines at 1440 and wraps cleanly on phones.
- **Menu sheet opacity** 93 % (light) / 92 % (dark), thicker than the other glass, because it's the largest glass surface and must stay legible even where a browser draws no blur.
- **Portrait on the right with its own reveal** (your request after the run): the clip sits on the `<img>`, not on the observed `<figure>`, because Chromium's IntersectionObserver counts an element's own `clip-path`; a fully clipped figure never intersected, so the photo stayed hidden in Chromium (WebKit didn't show the problem). Verified in Chromium and WebKit at 1440 and 390, and under reduced motion.
- **New thesis illustration** (your request after the run): `assets/img/project-thesis-habit.svg`, hand-written SVG in the site's dark-stage colours. It shows the mechanism the thesis studies (two visits, the button moved, the cursor still clicking the old spot), not results. It has no text inside, because fonts don't load in an `<img>`. The old `project-thesis.svg` stays in `assets/img/`. The content-preservation test now has an explicit `retired` list with a reason per string for the old path and the old alt text, so any other lost string still fails.
- **Hero headline always two lines above 560 px** (your request after the run): the size is capped so the longest line fits the column (`min(--fs-hero, 100cqi / --hero-em)`, behind `@supports`). `--hero-em` is the measured width of the longest line: Dutch 10.13 em, English 11.46 em, plus a small margin. English now runs at about 101 px on desktop (Dutch 111 px), and both languages stay two lines from 561 px up in Chromium and WebKit. If `hero.title` changes, re-measure those two values (comment in `main.css`). Phones keep the natural wrap.
- **Impeccable's surface brief** (`.impeccable/surfaces/index-html.md`, local only) was written after the build instead of before it; the direction itself was settled in this file and confirmed by you before any code.

## Skills used

| Skill | Used for | Applied | Overrode |
|---|---|---|---|
| `apple-design` | Materials, typography, motion, reduced-motion guidance | Glass only on the functional layer, no stacked translucent layers, bigger surfaces thicker; size-specific tracking (−0.04em display, +0.07em labels); critically damped motion with no overshoot; separate handling of reduced motion, reduced transparency and increased contrast | "Prefer the system font": your three fonts stay (brief) |
| UI/UX Pro Max (`ui-ux-pro-max`) | Design-system generation, Liquid Glass style data, quick-reference rules | Scroll-storytelling pattern that stays readable without effects; Liquid Glass checklist (nav and controls only, test reduced transparency and contrast); 44 px targets, focus states, no horizontal scroll, CLS < 0.1, `prefers-reduced-motion` | Its generated system (Brutalism, Caveat/Quicksand from Google Fonts, blue accent, GSAP from a CDN) broke the brief and wasn't used; Phosphor/Heroicons not used (three hand-written SVG icons instead) |
| Impeccable | Product context, direction, craft floor, detector, finish review | `PRODUCT.md`; `concept-seed` (seed `bbf08dd3`) to stress-test the hero concepts; craft floor (contrast, spacing, themed selection and caret, focus rings, tabular numerals); `detect` on the served page; the finish reviewer subagent for the critique | Brief-pinned world beats the roll; kicker ban and 6rem display cap overridden by the brief; the decision page (`serve-question`) replaced by the question tool because you were on your phone; code-led because no image generation is available |
| Other design skills | Not used separately | `design:accessibility-review` and `web-design-guidelines` overlap with the axe, Lighthouse and keyboard checks that ran; running them too would have repeated those checks | |

Commands from the brief I didn't run by name: `craft` (deprecated alias in this Impeccable version; I built per its new-work flow), and the separate `typeset` / `layout` / `colorize` / `animate` / `audit` / `harden` / `adapt` / `optimize` / `polish` passes. Their concerns were covered by the token design, the batched visual reviews (desktop/mobile, light/dark, NL/EN, Chromium/WebKit), the behaviour script, Lighthouse, axe and the finish review below, rather than as eleven separate passes. Say so if you want any of them run individually.

## Copy to review

| Key | NL | EN |
|---|---|---|
| `hero.session_title` | Sessielog · intro | Session log · intro |
| `projects.project_page` | Projectpagina | Project page |
| `site.heroVideo.cues[0]` | cursor komt in beeld | cursor enters |
| `site.heroVideo.cues[1]` | trekt een tekstvak | draws a text box |
| `site.heroVideo.cues[2]` | zet de punt | places the full stop |
| `site.heroVideo.cues[3]` | typt een rol eronder | types a role beneath |
| `projects[thesis].imageAlt` (replaces "Screenshot van de experimentomgeving") | Illustratie: twee bezoeken aan dezelfde productpagina. Bij het tweede bezoek staat de winkelwagenknop ergens anders, maar de cursor klikt nog op de oude plek. | Illustration: two visits to the same product page. On the second visit the add-to-cart button has moved, but the cursor still clicks where it used to be. |

## TODOs for you

- **Photos for the interludes** (`data/site.json` → `interludes`), each **2400 × 1029 px (21:9)**, WebP, about 300–400 KB, subject centred (phones crop to 4:3):
  1. after the pillars, before the projects: a wide, quiet photo of a place where you work or study (a lecture hall, the shop floor before opening), to open the "work" part of the page
  2. after the timeline, before the skills: people in the middle of something (exec(ut) backstage, a team at work), to echo "between parties"
  3. after the skills, before contact: a calm closing image, light or dark, with space in the centre.
- **`privacy.html`:** parts of the English text match the reference site's privacy page word for word, and it shows your e-mail address. Both left as they are (brief).
- **Optional:** an AV1 version of the new intro (`heroVideo.av1`); not needed at 136 KB.
- **Optional:** a `story` for any project, which turns its card link into "Lees meer".

## Decisions for you (skipped or left open)

- **JS budget:** 31.4 KB uncompressed, 11.2 KB gzipped. If the 30 KB is meant uncompressed, I can trim the comments in `app.js` (about 3.7 KB), but they're there to explain the code to you.
- **The old intro videos** (`hero-intro.mp4`, `hero-intro-av1.mp4`) and `hero-start.webp` / `hero-end.webp` are no longer used. Left untouched (brief); delete them yourself if you want.
- **Glyphs in your copy:** the finish review asked for one drawn icon set instead of text arrows. The arrows the code adds (tiles, project links, socials, the `<details>` plus) are now drawn SVG. The arrows that are part of your copy ("Bekijk mijn GitHub ↗", "← Alle projecten", the "→" at the end of the project CTA labels) are left as text, because existing copy stays as it is. If you're fine with removing them from the JSON, I'd draw those too, so every arrow on the page matches.
- **Impeccable telemetry:** `concept-seed` asks for an anonymous ping after a direction round. Skipped: it would send data to an outside service you didn't ask for.
- **Real-device checks** listed under "Unverified".

## Updates the repo's CLAUDE.md needs

- **Run/test:** `node --test` exists now (logic, content checks, content preservation); the "no test suite" line is outdated.
- **Architecture:** add `logic.mjs`, `tests/`, the project pages, `privacy.html`, `404.html`; the nav is `.bar` with glass groups; the language lives in `?lang=en` and internal links carry it (`data-keep-lang` / `withLang`).
- **Content model:** add `site.interludes`, `site.heroVideo` (`av1`, `h264`, `poster`, `cues[{at, label}]`), `projects.page`, `projects.story`, `projects.imageWidth/Height`, `projects.video`, `timeline.group`, `skills.groups` / `soft` (and that `bars` is no longer rendered); highlights: the first tile is the large one.
- **Styling:** the glass materials and their fallbacks live in `tokens.css` and at the end of `main.css`; glass only on the functional layer; muted text on glass uses `--glass-ink-muted`.
- **Backlog:** done: og/canonical, JSON-LD, noscript, honeypot, privacy page, robots, 404, self-hosted fonts, mobile navigation. Still open: the two privacy-page issues above.
- **Local tooling:** `PRODUCT.md`, `DESIGN.md`, `.impeccable/`, `.agents/` are git-ignored on purpose (Pages would publish them).

## Finish review (Impeccable)

The shipped finish-reviewer subagent reviewed the homepage from full-page and scroll-stop captures (desktop light and dark, mobile), the direction contract, `PRODUCT.md` and the code. It didn't read the project, 404 and privacy pages.

**Disposition: fix.**
- **Pass:** persistence; type, material and ground (the reviewer sampled #FFFFFF / #F4F4F6 / #0B0B0D in light and #000 / #121214 / #1A1A1D in dark, no drift); the first viewport, session stage, story order, stages, ledger and contact all match the contract. The section eyebrows count as a cited, brief-sanctioned adaptation.
- **Material fixes, and what I did:**
  1. **Glyph icons next to drawn SVG icons:** fixed in code (one drawn set: arrow, arrow-out, plus). The glyphs inside your copy stay; see "Decisions for you".
  2. **The thesis tile was a mostly empty black slab spanning two rows:** fixed. The bento is now asymmetric (the thesis wide on top, the last highlight wide below), so no tile reads as a void.
  3. **Capabilities repeated the pillar numbers in a second set of cards:** fixed. They're now open columns on a hairline, named but not numbered.
  4. **A generic fade-up on every block diluted the authored motion:** fixed. Reveals stay only on the project case studies. The underline draw, the session stage, the log lighting and the stage widening are the page's motion.
  5. **Three stacked labels above each timeline title:** fixed. One meta line per entry ("2024 – heden · Werk"), with "Nu" beneath.
- **Keep (not diluted):** the first viewport, the glass only on the functional layer, the session stage with its log, and the exact grounds.
- **After the fixes:** `node --test` 25/25; the behaviour script 34/34 in Chromium; a dark desktop scroll pass with no console errors, hidden blocks or overflow. I didn't run a second reviewer round.

**Hook triage:** the design hook's static `nested-cards` finding on `index.html` is a false positive: the NL/EN control inside the mobile menu sheet, which is a control, not a card. Rendered-page scans at 1280 and 390 don't report it. I recorded a file-scoped ignore with that reason in the local `.impeccable/config.json`.
