import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5431"),
  user: process.env.DB_USER || "games",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "games",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Kjør migrasjon ved oppstart – legger til kolonner som mangler uten å ødelegge data
pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
`).catch(() => { /* ignorerer feil ved første oppstart før tabellen finnes */ });
