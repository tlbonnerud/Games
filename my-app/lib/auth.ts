import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET!;
const COOKIE = "games_token";

export type SessionUser = {
  userid: string;
  email: string;
  username: string;
};

export function signToken(user: SessionUser): string {
  return jwt.sign(user, SECRET, { expiresIn: "7d" });
}

export async function setAuthCookie(user: SessionUser) {
  const token = signToken(user);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}
