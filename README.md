# Portfolio — Robert Karzijn

Statische, tweetalige (NL/EN) portfoliowebsite zonder frameworks of build-stap.
Alle content staat in JSON-bestanden; de broncode hoeft voor contentwijzigingen niet aangepast te worden.

## Projectstructuur

```
portfolio/
├── index.html                 # HTML-skelet (structuur, geen content)
├── assets/
│   ├── css/
│   │   ├── tokens.css         # ← Volledige huisstijl: kleuren, fonts, radius, spacing
│   │   └── main.css           # Componentstijlen (gebruikt alleen tokens)
│   ├── js/app.js              # Laadt JSON en rendert de site
│   └── img/                   # Afbeeldingen (placeholders — vervangen!)
├── content/
│   ├── nl.json                # Nederlandse UI-teksten en "Over mij"
│   └── en.json                # Engelse UI-teksten en "Over mij"
└── data/
    ├── site.json              # Naam, socials, CV-pad, formulier-endpoint
    ├── highlights.json        # Hoogtepunten-kaarten
    ├── projects.json          # Projecten (probleem/rol/technieken/resultaat/CTA)
    ├── timeline.json          # Ervaring & opleiding
    ├── skills.json            # Skill bars, tools, talen
    └── certificates.json      # Certificaten (sectie verschijnt automatisch zodra gevuld)
```

## Lokaal draaien

De site laadt JSON via `fetch()` en werkt daarom niet via `file://`. Start een lokale server:

```bash
npx serve            # of:
python -m http.server
```

Open daarna `http://localhost:3000` (serve) of `http://localhost:8000` (python).

## Content aanpassen

- **Nieuw project / ervaring / certificaat toevoegen:** voeg een object toe aan het betreffende
  JSON-bestand in `data/`. Tweetalige velden hebben de vorm `{ "nl": "...", "en": "..." }`.
- **Certificaten:** `data/certificates.json` is nu leeg (`[]`), de sectie is dan verborgen.
  Voorbeeld-item:
  `{ "title": { "nl": "Certificaatnaam", "en": "Certificate name" }, "issuer": "Uitgever", "year": "2027" }`
- **"Over mij"-tekst:** staat in `content/nl.json` en `content/en.json` onder `about.paragraphs`.

## Afbeeldingen vervangen

Vervang de bestanden in `assets/img/` door echte afbeeldingen **met dezelfde bestandsnaam**,
of pas het pad aan in `data/site.json` (portret) / `data/projects.json` (projectbeelden).
Aanbevolen: portret 4:5 (bijv. 800×1000), projectbeelden ±1200×560. Een leeg `"image": ""`
verbergt het beeld bij dat project.

## CV

Plaats je CV als `assets/cv-robert-karzijn.pdf` (of wijzig `cvFile` in `data/site.json`).

## Contactformulier koppelen

Er staan geen persoonlijke contactgegevens op de site; berichten lopen via het formulier.
Het formulier POST naar het endpoint in `data/site.json` → `formEndpoint`. Twee nette opties:

1. **Formspree** (aanrader om mee te starten): maak op formspree.io een gratis form aan en
   zet de endpoint-URL (`https://formspree.io/f/xxxxxxxx`) in `site.json`. Berichten komen in
   je Formspree-dashboard en optioneel per e-mail binnen — je e-mailadres blijft onzichtbaar.
2. **Netlify Forms**: host je bij Netlify, voeg dan `data-netlify="true"` toe aan het
   `<form>`-element in `index.html`; berichten verschijnen in het Netlify-dashboard.

Zolang `formEndpoint` leeg is, toont het formulier een nette melding dat het nog niet
gekoppeld is. Later migreren naar een eigen backend kan door alleen de endpoint-URL te wijzigen.

## Huisstijl aanpassen

Alle kleuren, lettertypen en maten staan in `assets/css/tokens.css` (licht + donker thema).
Eén bestand aanpassen is genoeg voor een volledige restyle. De lettertypen zelf worden
geladen via de Google Fonts-link in `index.html`.

## Publiceren (GitHub Pages)

1. Maak een repository `iRobert058.github.io` en push de inhoud van deze map naar `main`.
2. De site staat daarna op `https://irobert058.github.io`.

Alternatieven: Netlify of Vercel (map slepen en klaar; Netlify geeft je meteen Forms).
