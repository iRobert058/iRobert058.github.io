# robertkarzijn.nl

Persoonlijke portfoliowebsite van **Robert Karzijn**

**Live:** [robertkarzijn.nl](https://robertkarzijn.nl)

## Wat deze site doet

Eén statische pagina die als digitaal visitekaartje dient richting werkgevers, opdrachtgevers en netwerk, met:

- **Tweetalig (NL/EN)**: Nederlands als standaardtaal, met een taalwisselaar in de navigatie. Alle content, van UI-labels tot projectbeschrijvingen, is in beide talen volledig uitgewerkt en wisselt makkelijk zonder herlaadmoment.
- **Dark mode**: volgt automatisch de systeemvoorkeur (`prefers-color-scheme`) en is handmatig te togglen.
- **Contentsecties**: hero, hoogtepunten, over mij, uitgelichte projecten (probleem / rol / technieken / resultaat), gecombineerde tijdlijn van werk en opleiding, vaardigheden en talen, en een contactformulier. Een certificatensectie verschijnt automatisch zodra er certificaten in de data staan.
- **Contactformulier zonder zichtbare persoonsgegevens**: berichten lopen via een configureerbaar endpoint (Formspree-compatibel); er staat geen e-mailadres of telefoonnummer op de site, zodat mijn privacy behouden wordt.
- **Subtiele micro-animaties**:  geanimeerde skill bars en een getekende accent onderstreping in de hero. `prefers-reduced-motion` wordt gerespecteerd.
- **Geen cookies, geen trackers en geen deceptive patterns**: een bewuste keuze die aansluit op mijn onderzoeksgebied, en de knipoog in de "cookiebanner" op de site.

## Hoe het gebouwd is

Bewust **zonder frameworks of build-stap**: vanilla HTML, CSS en JavaScript. Voor een one-pager levert dat de snelste laadtijd, nul dependencies en jarenlange onderhoudbaarheid op.

```
├── index.html                 # Structuur (skelet zonder content)
├── assets/
│   ├── css/tokens.css         # Alle design tokens: kleuren, typografie, spacing (licht + donker)
│   ├── css/main.css           # Componentstijlen, gebouwd op de tokens
│   ├── js/app.js              # Laadt JSON, rendert secties, regelt i18n / thema / formulier
│   └── img/                   # Afbeeldingen
├── content/                   # UI-teksten & "Over mij" per taal (nl.json, en.json)
└── data/                      # Structurele content: projecten, tijdlijn, skills,
                               # hoogtepunten, certificaten, site-config
```

Kernprincipe: **content en code zijn gescheiden.** Alle inhoud leeft in JSON; `app.js` rendert die client-side. Een nieuw project, een nieuwe baan of een certificaat toevoegen is een JSON-object toevoegen. Tweetalige velden hebben de vorm `{ "nl": "…", "en": "…" }`. Dit zodat mogelijkheid tot uitbereiding wat makkelijker is voor de toekomst.

Hetzelfde geldt voor de huisstijl: alle kleuren, lettertypen en maten staan als CSS-variabelen in `tokens.css`. Eén bestand aanpassen volstaat voor een volledige restyle, inclusief dark mode.

## Content aanpassen

| Wil je…                        | Pas aan                                   |
| ------------------------------ | ----------------------------------------- |
| Project toevoegen/wijzigen     | `data/projects.json`                      |
| Tijdlijn bijwerken             | `data/timeline.json`                      |
| Hoogtepunt toevoegen           | `data/highlights.json`                    |
| Vaardigheid of taal wijzigen   | `data/skills.json`                        |
| Certificaat toevoegen          | `data/certificates.json` (sectie verschijnt vanzelf) |
| "Over mij" of UI-tekst wijzigen| `content/nl.json` en `content/en.json`    |
| Socials, CV-pad, formulier     | `data/site.json`                          |
| Huisstijl wijzigen             | `assets/css/tokens.css`                   |

## Lokaal draaien

De site laadt content via `fetch()` en heeft dus een webserver nodig (werkt niet via `file://`):

```bash
python -m http.server    # of: npx serve
```

## Deployment

Gehost op GitHub Pages met een custom domain via TransIP; `robertkarzijn.com` stuurt met een 301 door naar `robertkarzijn.nl`. Elke push naar `main` gaat automatisch live. Het contactformulier verwacht een endpoint (bijv. Formspree) in `data/site.json` → `formEndpoint`.

---

© Robert Karzijn · Gebouwd zonder frameworks, cookies of deceptive patterns.
