"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, HubAuthState, readAuthState, syncAuthFromCookie } from "@/components/hub/auth";

function linkClasses(isActive: boolean) {
  const baseClasses = "rounded-lg px-4 py-2 text-sm transition-colors md:text-base";
  if (isActive) return `${baseClasses} bg-blue-600 text-white`;
  return `${baseClasses} text-gray-400 hover:bg-gray-800 hover:text-white`;
}

export function HubHeader() {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<HubAuthState>({
    isLoggedIn: false,
    username: "",
    email: "",
    userid: "",
    rolle: "",
    is_admin: false,
  });

  useEffect(() => {
    const syncAuthState = () => setAuthState(readAuthState());
    syncAuthFromCookie().then(syncAuthState);
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, [pathname]);

  const activeHome = pathname === "/";
  const activeLeaderboard = pathname.startsWith("/leaderboard");
  const activeAdmin = pathname.startsWith("/admin");
  const profileLabel = authState.username.trim() || "Profile";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-xl font-semibold">
              GH
            </span>
            <span className="text-xl font-semibold tracking-tight md:text-2xl">GameHub</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/" className={linkClasses(activeHome)}>Home</Link>
            <Link href="/leaderboard" className={linkClasses(activeLeaderboard)}>Leaderboard</Link>
            {authState.is_admin && (
              <Link href="/admin" className={linkClasses(activeAdmin)}>Admin</Link>
            )}
          </div>

          {authState.isLoggedIn ? (
            <Link
              href="/profile"
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700 md:text-base"
            >
              {profileLabel}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 md:text-base"
            >
              Login
            </Link>
          )}
        </div>

        <nav className="grid grid-cols-2 gap-2 md:hidden">
          <Link href="/" className={linkClasses(activeHome)}>Home</Link>
          <Link href="/leaderboard" className={linkClasses(activeLeaderboard)}>Leaderboard</Link>
          {authState.is_admin && (
            <Link href="/admin" className={linkClasses(activeAdmin)}>Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
