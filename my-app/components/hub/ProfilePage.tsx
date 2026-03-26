"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/components/hub/HubHeader";
import {
  AUTH_CHANGE_EVENT,
  HubAuthState,
  logout,
  readAuthState,
} from "@/components/hub/auth";

interface Achievement {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: "First Victory",
    description: "Win your first game",
    unlocked: true,
    date: "2026-03-20",
  },
  {
    id: 2,
    title: "Speed Demon",
    description: "Complete a racing game in under 2 minutes",
    unlocked: true,
    date: "2026-03-22",
  },
  {
    id: 3,
    title: "Champion",
    description: "Reach #1 on any leaderboard",
    unlocked: true,
    date: "2026-03-25",
  },
  {
    id: 4,
    title: "Perfect Score",
    description: "Achieve a perfect score in any game",
    unlocked: false,
  },
  {
    id: 5,
    title: "Master Gamer",
    description: "Complete all games",
    unlocked: false,
  },
];

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function ProfilePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<HubAuthState>(() => readAuthState());

  useEffect(() => {
    const syncAuthState = () => setAuthState(readAuthState());

    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!authState.isLoggedIn) {
      router.replace("/login");
    }
  }, [authState.isLoggedIn, router]);

  const unlockedCount = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => achievement.unlocked).length,
    [],
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main
      className="min-h-screen bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 to-black px-6 py-12 md:px-8">
        {!authState.isLoggedIn ? (
          <div className="mx-auto max-w-6xl">
            <p className="text-gray-300">Laster profil...</p>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold">
                  {authState.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-semibold">{authState.username}</h1>
                  <p className="mt-2 text-lg text-white/80">Level 12 - Master Gamer</p>

                  <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                    <div className="rounded-lg bg-white/10 px-4 py-2">
                      <p className="text-2xl font-semibold">156</p>
                      <p className="text-sm text-white/70">Games Played</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-4 py-2">
                      <p className="text-2xl font-semibold">42</p>
                      <p className="text-sm text-white/70">Wins</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-4 py-2">
                      <p className="text-2xl font-semibold">{unlockedCount}</p>
                      <p className="text-sm text-white/70">Achievements</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            </div>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-semibold">Achievements</h2>
                <p className="text-gray-400">
                  {unlockedCount} / {ACHIEVEMENTS.length} unlocked
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ACHIEVEMENTS.map((achievement) => (
                  <article
                    key={achievement.id}
                    className={`rounded-xl border-2 p-6 transition-all ${
                      achievement.unlocked
                        ? "border-yellow-600/60 bg-gradient-to-br from-yellow-900/30 to-orange-900/30"
                        : "border-gray-700 bg-gray-800/50 opacity-70"
                    }`}
                  >
                    <h3 className="text-lg font-medium">{achievement.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">{achievement.description}</p>
                    {achievement.unlocked && achievement.date ? (
                      <p className="mt-3 text-xs text-yellow-400">
                        Unlocked {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">Locked</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
