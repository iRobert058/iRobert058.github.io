# Redesign V3.0 (Apple × cinematic): notes for review

Branch `redesign/v3-apple`, cut from local `main` at `68373a2` (V2.1 plus the `.gitignore` commit for `PRODUCT.md` and `.impeccable/`). The pre-push hook on this machine blocks pushing `main`, so that commit reaches `main` through this branch's PR.

Status: **section 1 (study and brief). No design code until you've answered the hero and stack question.**

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
- `glass-bar` (nav): `backdrop-filter: blur(20px) saturate(170%)`, a 72 % canvas tint, a 1-px inner highlight on the top edge, and a soft shadow only once the page has scrolled.
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

*Your pick:* (pending)

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

## Decisions log

- **Base commit:** your preflight answer was "push main first", but the pre-push hook blocks pushing `main`. I didn't work around it; the branch includes `68373a2` instead.
- **Positioning:** your preflight answer: both, the headline leads. The bridge-builder headline stays the lead message; the hero visual and subhead show the research.
- **`?lang=` and the "Projectpagina" rule:** the brief says `main` has the language in `?lang=` and a card link that says "Projectpagina" until a project has `story` content. Neither is on `main`: both exist only on `redesign/v2`. I'll rebuild both on this branch (new code, same behaviour as described). That adds one new copy key, `projects.project_page` ("Projectpagina" / "Project page"), listed under copy to review.
- **UI/UX Pro Max design system overridden** (see section 2).
- **Playwright:** the browsers cached on this machine match Playwright 1.62 (Chromium) and 1.63 (WebKit), so both were installed in the session scratchpad instead of downloading new browsers. Nothing in the repo.
- **Reference screenshots** are in `_review/v3-apple/ref/` (git-ignored). The Jop clone for the originality check will go to `/tmp/reference-jopmors` in section 4.

## Copy to review

(Filled in as new copy is added.)

## TODOs for you

- `privacy.html`: parts of the English text match the reference site's privacy page word for word, and it shows your e-mail address. Both left as they are (see the brief).
