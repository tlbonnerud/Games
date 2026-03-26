import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  // Hent is_admin fra DB (ikke lagret i JWT)
  const result = await pool.query(
    "SELECT is_admin FROM users WHERE userid = $1",
    [session.userid]
  );
  const is_admin = result.rows[0]?.is_admin ?? false;

  return NextResponse.json({ user: { ...session, is_admin } });
}
