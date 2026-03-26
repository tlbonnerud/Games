import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Mangler e-post eller passord" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT userid, email, password_hash, fornavn, etternavn, rolle FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Feil e-post eller passord" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Feil e-post eller passord" }, { status: 401 });
    }

    await setAuthCookie({
      userid: user.userid,
      email: user.email,
      fornavn: user.fornavn,
      etternavn: user.etternavn,
      rolle: user.rolle,
    });

    return NextResponse.json({
      userid: user.userid,
      email: user.email,
      fornavn: user.fornavn,
      etternavn: user.etternavn,
      rolle: user.rolle,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
