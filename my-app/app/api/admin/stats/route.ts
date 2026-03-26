import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session) return null;
  const result = await pool.query(
    "SELECT is_admin FROM users WHERE userid = $1",
    [session.userid]
  );
  return result.rows[0]?.is_admin ? session : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ikke tilgang" }, { status: 403 });

  const [totals, active, perGame, signups] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int                                              AS total_users,
        COUNT(*) FILTER (WHERE is_admin)::int                     AS total_admins,
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '5 minutes')::int AS active_now
      FROM users
    `),
    pool.query(`
      SELECT userid, username, last_seen
      FROM users
      WHERE last_seen > NOW() - INTERVAL '5 minutes'
      ORDER BY last_seen DESC
    `),
    pool.query(`
      SELECT game_id, COUNT(DISTINCT userid)::int AS players, SUM(games_played)::int AS sessions
      FROM game_progress
      GROUP BY game_id
      ORDER BY sessions DESC
    `),
    pool.query(`
      SELECT
        DATE(created_at AT TIME ZONE 'Europe/Oslo') AS day,
        COUNT(*)::int AS count
      FROM users
      WHERE created_at > NOW() - INTERVAL '14 days'
      GROUP BY day
      ORDER BY day DESC
    `),
  ]);

  return NextResponse.json({
    total_users:  totals.rows[0].total_users,
    total_admins: totals.rows[0].total_admins,
    active_now:   totals.rows[0].active_now,
    active_users: active.rows,
    per_game:     perGame.rows,
    signups_14d:  signups.rows,
  });
}
