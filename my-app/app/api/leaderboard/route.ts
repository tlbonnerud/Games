import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/leaderboard?game_id=neon-snake   (omit for all games)
// Returns top 50 entries for the given game, or top 50 per game globally
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game_id = searchParams.get("game_id");

  if (game_id) {
    // Per-game leaderboard
    const result = await pool.query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY gp.high_score DESC) AS rank,
         u.username,
         gp.high_score,
         gp.games_played,
         gp.last_played
       FROM game_progress gp
       JOIN users u ON u.userid = gp.userid
       WHERE gp.game_id = $1 AND gp.high_score > 0
       ORDER BY gp.high_score DESC
       LIMIT 50`,
      [game_id]
    );
    return NextResponse.json({ entries: result.rows });
  }

  // Global: best score per user across all games
  const result = await pool.query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY MAX(gp.high_score) DESC) AS rank,
       u.username,
       MAX(gp.high_score)  AS high_score,
       SUM(gp.games_played) AS games_played,
       MAX(gp.last_played)  AS last_played
     FROM game_progress gp
     JOIN users u ON u.userid = gp.userid
     WHERE gp.high_score > 0
     GROUP BY u.username
     ORDER BY high_score DESC
     LIMIT 50`
  );
  return NextResponse.json({ entries: result.rows });
}
