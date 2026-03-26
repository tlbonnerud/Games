import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Alle felt må fylles ut" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Passordet må være minst 6 tegn" }, { status: 400 });
  }
  if (username.trim().length < 2) {
    return NextResponse.json({ error: "Brukernavn må være minst 2 tegn" }, { status: 400 });
  }

  try {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING userid, email, username`,
      [email.toLowerCase().trim(), username.trim(), password_hash]
    );

    const user = result.rows[0];
    await setAuthCookie({ userid: user.userid, email: user.email, username: user.username });

    return NextResponse.json({ userid: user.userid, email: user.email, username: user.username });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === "23505") {
      const detail = (err as { detail?: string }).detail ?? "";
      if (detail.includes("email")) return NextResponse.json({ error: "E-posten er allerede i bruk" }, { status: 409 });
      if (detail.includes("username")) return NextResponse.json({ error: "Brukernavnet er allerede tatt" }, { status: 409 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
