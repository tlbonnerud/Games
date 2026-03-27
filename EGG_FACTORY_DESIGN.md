# Egg Factory — Oppgraderinger & Sprites Design

## Konsept

Cookie Clicker-motor + chicken farm-tema. Primær valuta: **egg**. Sekundær: **coins** (egg selges til coins). Klikkobjekt: stor pixel art-kylling i midten. Bygninger langs høyre side.

---

## Bygninger (8 stk, erstatter Cookie Clicker's 10)

| # | Navn | Pris | Egg/s | Beskrivelse |
|---|------|------|-------|-------------|
| 1 | Kylling | 10 | 0.2 | En liten høne som legger egg jevnt |
| 2 | Hønsehus | 60 | 1.2 | Trygt hus med bedre rutiner |
| 3 | Fôrvogn | 250 | 4 | Automatisk fôring av flokken |
| 4 | Egg-sorterer | 900 | 12 | Sorterer og pakker egg |
| 5 | Transportbånd | 3 000 | 35 | Kontinuerlig logistikk |
| 6 | Låvearbeider | 9 000 | 90 | Menneskelig kapasitet |
| 7 | Mekanisk innhøster | 28 000 | 250 | Tung maskin, masseproduksjon |
| 8 | Robo-bonde | 92 000 | 700 | Autonom superenhet |

---

## Oppgraderinger (22 stk)

Organisert i 5 kategorier. Alle har navn, pris, effekt, og unlock-betingelse.

### 🐾 Klikk-oppgraderinger (forbedrer manuell klikking)

| ID | Navn | Pris (egg) | Effekt | Unlock |
|----|------|-----------|--------|--------|
| 1 | Hardere nebbtrening | 40 | 1.5× klikk-kraft | 20 klikk |
| 2 | Ståtuppede klør | 220 | 2× klikk-kraft | 220 egg totalt |
| 3 | Presisjonsklø | 900 | 2.6× klikk-kraft | 120 klikk |
| 4 | Gyldent grep | 8 000 | 4× klikk-kraft | 500 klikk |

**Sprite-idé:** Kyllingklø/nebb-ikoner. Pixel art, 32×32, knallgul/oransje.

---

### 🌍 Global produksjon (alle bygninger)

| ID | Navn | Pris (egg) | Effekt | Unlock |
|----|------|-----------|--------|--------|
| 5 | Soloppgangstur | 180 | 1.25× global prod | 5 kyllinger |
| 6 | Lagerautomatisering | 3 400 | 1.3× global prod | 2 fôrvogner |
| 7 | Fagforeningsbonus | 15 000 | 1.4× global prod | 3 låvearbeidere |
| 8 | Solcellenett | 26 000 | 1.7× global prod | 2 innhøstere |
| 9 | Kvantemyserium | 52 000 | 2× global prod | 50 000 egg totalt |

**Sprite-idé:** Sol, tannhjul, solpanel, atom — pixel art 32×32 i grønn/gul palett.

---

### 🐔 Enhetsspesifikke oppgraderinger

| ID | Navn | Pris (egg) | Effekt | Unlock |
|----|------|-----------|--------|--------|
| 10 | Hønsehusdekke | 480 | 1.5× hønsehus | 2 hønsehus |
| 11 | Premium-fôr | 900 | 1.8× kylling | 10 kyllinger |
| 12 | Fôrvogn-turbo | 5 200 | 1.85× fôrvogn | 4 fôrvogner |
| 13 | Sorteringsalgoritme | 2 400 | 1.75× egg-sorterer | 2 sorterere |
| 14 | Smurte kjeder | 6 800 | 1.7× transportbånd | 1 transportbånd |
| 15 | Ergonomisk sele | 22 000 | 1.9× låvearbeider | 4 låvearbeidere |
| 16 | Hydraulisk arm | 48 000 | 2× mekanisk innhøster | 3 innhøstere |
| 17 | Kvantechipen | 120 000 | 2.2× robo-bonde | 2 robo-bønder |

**Sprite-idé:** Matching unit-ikoner med "+" eller "⬆" overlay. Kan gjenbruke `/icons/units/` + legge gyllen kant rundt.

---

### 💰 Coins-oppgraderinger (forbedrer egg→coins-konvertering)

| ID | Navn | Pris (egg) | Effekt | Unlock |
|----|------|-----------|--------|--------|
| 18 | Markedskontrakter | 1 200 | 1.5× coins per salg | 300 coins tjent |
| 19 | Meglernettverk | 7 600 | 1.75× coins per salg | 1 800 coins |
| 20 | Eksportlisens | 14 000 | 2× coins per salg | 4 000 coins |

**Sprite-idé:** Myntstabel, kontrakt, globus — pixel art i gull/grønn.

---

### ✨ Gylne / Legendariske oppgraderinger

| ID | Navn | Pris (egg) | Effekt | Unlock |
|----|------|-----------|--------|--------|
| 21 | Gulegreplomme-raffineri | 61 000 | 5% gyldent egg-sjanse, 2.2× gyllen-multiplikator | 62 000 egg |
| 22 | Gyldent eggprotokoll | 76 000 | 8% sjanse, 3× gyllen-multiplikator | 70 000 egg |

**Sprite-idé:** Glødende gyllent egg, pixel art med strålekrans rundt.

---

## Sprites — Komplett liste og plan

### Hva vi allerede har ✅

| Sprite | Fil | Brukes til |
|--------|-----|-----------|
| Kylling | `/public/pixel-chicken.svg` | Referansestil for pixel art |
| Alle 8 unit-ikoner | `/public/icons/units/*.svg` | Bygnings-ikoner i butikken |
| Egg-valuta | `/public/icons/currency/egg.svg` | Currency display |
| Coin-valuta | `/public/icons/currency/coin.svg` | Coin display |
| Upgrade-ikoner (5 typer) | `/public/icons/upgrades/*.svg` | Generiske upgrade-kategorier |

### Hva som må lages 🔨

| Sprite | Fil | Beskrivelse | Prioritet |
|--------|-----|-------------|-----------|
| Stor klikk-kylling | `egg-factory/img/big-chicken.svg` | 64×64 viewBox, crispEdges, detaljert pixel art-kylling. Gjenbruk stil fra pixel-chicken.svg men med fjær, vinge, større øye, klo-detaljer | 🔴 Kritisk |
| Gylden kylling | `egg-factory/img/golden-chicken.svg` | Samme som big-chicken men gull-farget (#ffd700), glød-effekt rundt | 🔴 Kritisk |
| Råttent egg | `egg-factory/img/rotten-egg.svg` | Oval egg, grønn med sprekker, for "wrath"-event | 🟡 Viktig |
| Gyldent egg | `egg-factory/img/golden-egg.svg` | Oval egg, gull-gradient, glød — for golden event (brukes hvis vi velger egg istedenfor kylling for golden event) | 🟡 Viktig |
| Egg-partikkel | `egg-factory/img/small-eggs.svg` | Liten oval egg, hvit/gul — erstatter smallCookies.png | 🟡 Viktig |
| Farm-bakgrunn | `egg-factory/img/bgFarm.jpg` | Blå himmel over grønn mark, enkel piksel-stil | 🟢 Nice-to-have |
| Klikk-oppgradering sprite | `egg-factory/img/upgrades/claw.svg` | Pixel art kyllingklø | 🟢 Nice-to-have |
| Global prod. sprite | `egg-factory/img/upgrades/gear.svg` | Tannhjul + egg | 🟢 Nice-to-have |

### Sprite-stil guide

Alle pixel art-sprites følger:
- **ViewBox:** `0 0 64 64` (eller `0 0 32 32` for ikoner)
- **Attributt:** `shape-rendering="crispEdges"` på SVG-rot
- **Tegning:** Kun `<rect>` elementer (ingen path/circle for pixel-look)
- **Fargepalett:**
  - Kylling-body: `#fff8cf` (lys), `#ffe69d` (skygge)
  - Nebb/klør: `#f6a23d`, `#d9822b`
  - Øye: `#1e1e2e`
  - Kam: `#d64545`, `#f26a6a`
  - Bakgrunn: transparent (`#00000000`)

### Generering av sprites

**Alternativ A — Lag for hånd (anbefalt for hoved-kylling):**
Claude kan generere SVG-pixel-art direkte som kode, samme tilnærming som `pixel-chicken.svg`. Bare be om det.

**Alternativ B — Pixel art-verktøy:**
- [Piskel](https://www.piskelapp.com/) — gratis online pixel art editor, kan eksportere som PNG/SVG
- [Aseprite](https://www.aseprite.org/) — anbefalt desktop-app, eksporterer sprite sheets
- [LibreSprite](https://libresprite.github.io/) — gratis alternativ til Aseprite

**Alternativ C — AI-generering:**
- Prompt for DALL-E/Midjourney: `"pixel art chicken, 32x32, transparent background, retro game style, white and yellow feathers, orange beak"`
- Konverter PNG → SVG med [Vectorizer.AI](https://vectorizer.ai/) eller [SVGcode](https://svgco.de/)
- Merk: AI-generert må renses opp (path-basert, ikke rect-basert)

**Alternativ D — Open source sprites:**
- [OpenGameArt.org](https://opengameart.org/) — søk "chicken pixel art" — CC0/CC-BY lisenser
- [itch.io asset packs](https://itch.io/game-assets/free) — søk "farm animals pixel"
- [Kenney.nl](https://kenney.nl/assets) — gratis farm-asset packs

---

## Coin-konvertering — Mekanikk

```
Grunnrate: 1 egg = 0.15 coins
Med "Markedskontrakter": 1 egg = 0.225 coins
Med "Meglernettverk": 1 egg = 0.394 coins
Med "Eksportlisens": 1 egg = 0.787 coins
```

Selg-knapper:
- **Selg 25%** — selger 25% av nåværende egg
- **Selg alt** — selger alle egg

Coins brukes til: (fremtidig utvidelse)
- Kjøpe spesielle cosmetic-upgrades
- Leaderboard-poeng basert på coins earned

---

## Golden Egg Event (erstatter Golden Cookie)

**Utseende:** Gylden kylling flyr over skjermen (bruker `big-chicken-golden.svg`)

**Effekter (beholder CC-mekanikk, norske navn):**
- **Egg-feber** — 7× produksjon i 77 sekunder
- **Egg-bonanza** — Legg til 10% av nåværende egg-total
- **Klikk-feber** — 777× klikk-kraft i 13 sekunder (sjelden)
- **Kjøleskapet** — Halv produksjon i 66 sekunder (straff-event)

---

## TODO / Rekkefølge

1. [ ] Lag `big-chicken.svg` (stor klikk-kylling, pixel art)
2. [ ] Lag `golden-chicken.svg` (gyllen variant)
3. [ ] Lag `rotten-egg.svg` og `golden-egg.svg`
4. [ ] Kopier + modifiser `cookie-clicker/` → `egg-factory/`
5. [ ] Erstatt buildings i main.js
6. [ ] Legg til coin-system
7. [ ] Reskin CSS og HTML-tekster
8. [ ] Lag page.tsx og oppdater data.ts
9. [ ] Test og deploy
