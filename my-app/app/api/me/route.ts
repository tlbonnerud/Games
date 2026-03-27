import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser, setAuthCookie } from "@/lib/auth";
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

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const body = await req.json();

  // Endre brukernavn
  if (body.username !== undefined) {
    const username = String(body.username).trim();
    if (username.length < 2) {
      return NextResponse.json({ error: "Brukernavn må være minst 2 tegn" }, { status: 400 });
    }
    try {
      const result = await pool.query(
        "UPDATE users SET username = $1 WHERE userid = $2 RETURNING userid, email, username",
        [username, session.userid]
      );
      const user = result.rows[0];
      await setAuthCookie({ userid: user.userid, email: user.email, username: user.username });
      return NextResponse.json({ userid: user.userid, email: user.email, username: user.username });
    } catch (err: unknown) {
      const pg = err as { code?: string };
      if (pg.code === "23505") {
        return NextResponse.json({ error: "Brukernavnet er allerede tatt" }, { status: 409 });
      }
      console.error("Update username error:", err);
      return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
    }
  }

  // Endre passord
  if (body.currentPassword !== undefined && body.newPassword !== undefined) {
    const newPassword = String(body.newPassword);
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nytt passord må være minst 6 tegn" }, { status: 400 });
    }
    const row = await pool.query(
      "SELECT password_hash FROM users WHERE userid = $1",
      [session.userid]
    );
    const valid = await bcrypt.compare(String(body.currentPassword), row.rows[0]?.password_hash ?? "");
    if (!valid) {
      return NextResponse.json({ error: "Feil nåværende passord" }, { status: 403 });
    }
    const password_hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE userid = $2", [password_hash, session.userid]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ingen gyldige felter å oppdatere" }, { status: 400 });
}
