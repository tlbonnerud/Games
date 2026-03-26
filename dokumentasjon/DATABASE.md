# Games – Database og innlogging

Forklarer databasestruktur, auth-flyt og game progression for Games-plattformen.

---

## Innhold

- [Kjøre opp lokalt](#kjøre-opp-lokalt)
- [Databasestruktur](#databasestruktur)
- [Game progression](#game-progression)
- [Innloggingsflyt](#innloggingsflyt)
- [Admin-dashbord](#admin-dashbord)

---

## Kjøre opp lokalt

```bash
# 1. Start Games-databasen (fra KjerneHuset3.0-mappen)
cd ~/KjerneHuset3.0
sudo docker compose -f dokumentasjon/docker-compose.server.yml --env-file laanesystem/.env up -d games_postgres

# 2. Verifiser
sudo docker exec games_postgres psql -U games -d games -c "\dt"
# Forventet: users, game_progress

# 3. Start Next.js
cd ~/Games/my-app
npm run dev
```

---

## Databasestruktur

Skjema initialiseres fra `my-app/sql/init.sql`.

### `users`

| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| `userid` | `UUID` (PK) | Unik bruker-ID, genereres automatisk |
| `email` | `TEXT` (UNIQUE) | Innloggingsnavn / e-postadresse |
| `username` | `TEXT` (UNIQUE) | Visningsnavn valgt ved registrering |
| `password_hash` | `TEXT` | bcrypt-hash av passordet (cost 12) |
| `is_admin` | `BOOLEAN` | Om brukeren har admin-tilgang (default false) |
| `last_seen` | `TIMESTAMPTZ` | Sist aktiv – oppdateres via `/api/ping` hvert minutt |
| `created_at` | `TIMESTAMPTZ` | Tidspunkt for opprettelse |

**Gjøre en bruker til admin:**
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'din@epost.no';
```

---

### `game_progress`

Lagrer spillprogresjon per bruker per spill. Én rad per `(userid, game_id)`-kombinasjon.

| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| `id` | `UUID` (PK) | Unik ID for denne raden |
| `userid` | `UUID` (FK → users) | Eieren av progresjonen – slettes om brukeren slettes |
| `game_id` | `TEXT` | Spill-identifikator (se tabell under) |
| `high_score` | `INTEGER` | Høyeste score i dette spillet |
| `games_played` | `INTEGER` | Antall sesjoner / ganger spilt |
| `last_played` | `TIMESTAMPTZ` | Sist gang spillet ble spilt |
| `metadata` | `JSONB` | Spillspesifikk data (se under) |
| `updated_at` | `TIMESTAMPTZ` | Sist oppdatert |

**Spill-IDer:**

| `game_id` | Spill | `high_score` betyr |
|-----------|-------|-------------------|
| `chicken-farm` | Chicken Farm Factory | `totalCoinsEarned` |
| `snake` | Neon Snake | Høyeste score |
| `tetris` | Tetris With Effects | Høyeste score |
| `bubble-shooter` | Bubble Shooter | Høyeste score |
| `tux-racer` | Tux Racer | Beste tid (ms) |

---

## Game progression

### Chicken Farm – `metadata`-struktur

Lagres som JSONB og inneholder full spilltilstand:

```json
{
  "coins": 12500,
  "totalEggsEarned": 450000,
  "totalCoinsEarned": 38200,
  "eggsPerSecond": 1240,
  "coinsPerSecond": 620,
  "unitsOwned": {
    "chicken": 50,
    "coop": 12,
    "feed_cart": 6,
    "egg_sorter": 3,
    "conveyor": 1,
    "barn_worker": 0,
    "mechanical_harvester": 0,
    "robo_farmer": 0
  },
  "purchasedUpgrades": ["firm_grip_gloves", "sunrise_shift", "quality_feed"],
  "achievementsUnlocked": ["first_cluck", "hundred_taps", "small_flock"],
  "prestigePoints": 0,
  "playtimeSeconds": 3600,
  "saveVersion": 1
}
```

**Lagringsstrategi:**
- Spillet auto-lagrer hvert 10. sekund til både `localStorage` og databasen
- Ved innlogging lastes progresjonen fra databasen (prioriteres over localStorage)
- Ikke innlogget: kun localStorage brukes
- Upsert-logikk: `high_score` beholdes alltid som det høyeste, `games_played` økes

---

## Innloggingsflyt

```
POST /api/signup (email + username + passord)
  → bcrypt.hash(passord, 12)
  → INSERT INTO users
  → setAuthCookie (JWT, 7 dager)
  → loginWithCredentials() → skriv til localStorage
  → redirect til /

POST /api/login (email + passord)
  → SELECT FROM users WHERE email = ?
  → bcrypt.compare(passord, password_hash)
  → setAuthCookie (JWT, 7 dager)
  → localStorage synket via syncAuthFromCookie()

GET /api/me
  → Verifiser JWT-cookie
  → SELECT is_admin FROM users
  → Returner { userid, email, username, is_admin }

POST /api/logout
  → Slett cookie
  → Tøm localStorage
```

---

## Admin-dashbord

Tilgjengelig på `/admin` – kun synlig for brukere med `is_admin = TRUE`.

**Funksjoner:**
- Totalt antall brukere og registrerte admins
- Aktive brukere nå (sist sett < 5 minutter siden)
- Spill-statistikk per spill (spillere + sesjoner)
- Registreringshistorikk siste 14 dager (stolpediagram)
- Søkbar brukertabell med: brukernavn, e-post, antall spill, sist aktiv, registreringsdato

**Aktiv-tracking:**
- `PingProvider` (i layout) sender `POST /api/ping` hvert minutt
- Oppdaterer `users.last_seen` for innlogget bruker
- Admin-dashbordet poller stats hvert 30. sekund
