import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5430"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "kjernehuset",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
