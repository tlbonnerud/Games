// Auth-bro mellom UI og ekte JWT-API.
// HubHeader og ProfilePage bruker readAuthState() + AUTH_CHANGE_EVENT for reaktiv UI.
// Innlogging og utlogging kaller API-ruter og synker localStorage.

export const AUTH_CHANGE_EVENT = "hub-auth-change";

const LOGIN_STATE_KEY = "hub:isLoggedIn";
const USERNAME_KEY = "hub:username";
const USERID_KEY = "hub:userid";
const EMAIL_KEY = "hub:email";
const ROLLE_KEY = "hub:rolle";
const ADMIN_KEY = "hub:isAdmin";

export interface HubAuthState {
  isLoggedIn: boolean;
  username: string;
  email: string;
  userid: string;
  rolle: string;
  is_admin: boolean;
}

const DEFAULT_AUTH_STATE: HubAuthState = {
  isLoggedIn: false,
  username: "",
  email: "",
  userid: "",
  rolle: "",
  is_admin: false,
};

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function readAuthState(): HubAuthState {
  if (typeof window === "undefined") return DEFAULT_AUTH_STATE;
  return {
    isLoggedIn: window.localStorage.getItem(LOGIN_STATE_KEY) === "true",
    username: window.localStorage.getItem(USERNAME_KEY) ?? "",
    email: window.localStorage.getItem(EMAIL_KEY) ?? "",
    userid: window.localStorage.getItem(USERID_KEY) ?? "",
    rolle: window.localStorage.getItem(ROLLE_KEY) ?? "",
    is_admin: window.localStorage.getItem(ADMIN_KEY) === "true",
  };
}

function writeAuthState(user: { username: string; email: string; userid: string; is_admin?: boolean }) {
  window.localStorage.setItem(LOGIN_STATE_KEY, "true");
  window.localStorage.setItem(USERNAME_KEY, user.username);
  window.localStorage.setItem(EMAIL_KEY, user.email);
  window.localStorage.setItem(USERID_KEY, user.userid);
  window.localStorage.removeItem(ROLLE_KEY);
  window.localStorage.setItem(ADMIN_KEY, user.is_admin ? "true" : "false");
  emitAuthChange();
}

/** Synk JWT-cookie → localStorage ved sideload */
export async function syncAuthFromCookie(): Promise<void> {
  try {
    const res = await fetch("/api/me");
    if (res.ok) {
      const { user } = await res.json();
      if (user) { writeAuthState(user); return; }
    }
  } catch { /* nettverksfeil */ }
  // Ikke innlogget – tøm localStorage
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOGIN_STATE_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
  window.localStorage.removeItem(USERID_KEY);
  window.localStorage.removeItem(ROLLE_KEY);
  emitAuthChange();
}

/** Logg inn med e-post + passord. Kaster Error ved feil. */
export async function loginWithCredentials(email: string, password: string): Promise<void> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Feil e-post eller passord");
  }
  const user = await res.json();
  writeAuthState(user);
}

/** Logg ut – sletter cookie og localStorage */
export async function logout(): Promise<void> {
  try { await fetch("/api/logout", { method: "POST" }); } catch { /* ignorer */ }
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOGIN_STATE_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
  window.localStorage.removeItem(USERID_KEY);
  window.localStorage.removeItem(ROLLE_KEY);
  emitAuthChange();
}
