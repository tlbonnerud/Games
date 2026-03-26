import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET /api/progress  – hent all progress for innlogget bruker
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const result = await pool.query(
    `SELECT game_id, high_score, games_played, last_played, metadata
     FROM game_progress WHERE userid = $1
     ORDER BY last_played DESC NULLS LAST`,
    [user.userid]
  );

  return NextResponse.json({ progress: result.rows });
}

// POST /api/progress  – lagre/oppdater progress for ett spill
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { game_id, score, metadata } = await req.json();
  if (!game_id) return NextResponse.json({ error: "game_id mangler" }, { status: 400 });

  const result = await pool.query(
    `INSERT INTO game_progress (userid, game_id, high_score, games_played, last_played, metadata)
     VALUES ($1, $2, $3, 1, NOW(), $4)
     ON CONFLICT (userid, game_id) DO UPDATE SET
       high_score   = GREATEST(game_progress.high_score, EXCLUDED.high_score),
       games_played = game_progress.games_played + 1,
       last_played  = NOW(),
       metadata     = game_progress.metadata || EXCLUDED.metadata,
       updated_at   = NOW()
     RETURNING *`,
    [user.userid, game_id, score ?? 0, JSON.stringify(metadata ?? {})]
  );

  return NextResponse.json({ progress: result.rows[0] });
}
