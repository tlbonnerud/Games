export const AUTH_CHANGE_EVENT = "hub-auth-change";

const LOGIN_STATE_KEY = "hub:isLoggedIn";
const USERNAME_KEY = "hub:username";

export interface HubAuthState {
  isLoggedIn: boolean;
  username: string;
}

const DEFAULT_AUTH_STATE: HubAuthState = {
  isLoggedIn: false,
  username: "",
};

function emitAuthChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function readAuthState(): HubAuthState {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_STATE;
  }

  return {
    isLoggedIn: window.localStorage.getItem(LOGIN_STATE_KEY) === "true",
    username: window.localStorage.getItem(USERNAME_KEY) ?? "",
  };
}

export function loginWithUsername(username: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOGIN_STATE_KEY, "true");
  window.localStorage.setItem(USERNAME_KEY, username.trim());
  emitAuthChange();
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOGIN_STATE_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  emitAuthChange();
}
