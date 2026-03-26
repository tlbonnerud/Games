-- Games – database-initialisering
-- Kjøres automatisk av Docker første gang containeren starter.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Brukere ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  userid        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  username      TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  is_admin      BOOLEAN     NOT NULL DEFAULT FALSE,
  last_seen     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Game progression ─────────────────────────────────────────────────────────
-- Én rad per bruker per spill. metadata-kolonnen lagrer spillspesifikk data.
CREATE TABLE IF NOT EXISTS game_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  userid       UUID        NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  game_id      TEXT        NOT NULL,         -- 'snake', 'tetris', 'bubble-shooter', 'tux-racer', 'farm'
  high_score   INTEGER     NOT NULL DEFAULT 0,
  games_played INTEGER     NOT NULL DEFAULT 0,
  last_played  TIMESTAMPTZ,
  metadata     JSONB       NOT NULL DEFAULT '{}',   -- spillspesifikk data (nivå, achievements, etc.)
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (userid, game_id)
);
