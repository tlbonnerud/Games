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

  const result = await pool.query(`
    SELECT
      u.userid,
      u.email,
      u.username,
      u.is_admin,
      u.created_at,
      u.last_seen,
      COUNT(gp.id)::int          AS games_played,
      MAX(gp.last_played)        AS last_game
    FROM users u
    LEFT JOIN game_progress gp ON gp.userid = u.userid
    GROUP BY u.userid
    ORDER BY u.created_at DESC
  `);

  return NextResponse.json({ users: result.rows });
}
