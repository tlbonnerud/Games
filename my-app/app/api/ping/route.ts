import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false });

  await pool.query(
    "UPDATE users SET last_seen = NOW() WHERE userid = $1",
    [user.userid]
  );

  return NextResponse.json({ ok: true });
}
