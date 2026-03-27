"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HUB_GAMES, findGameById } from "@/components/hub/data";
import { HubHeader } from "@/components/hub/HubHeader";

interface LeaderboardEntry {
  rank: number;
  username: string;
  high_score: number;
  games_played: number;
  last_played: string | null;
}

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function formatScore(n: number): string {
  return Number(n).toLocaleString("no-NO");
}

interface LeaderboardPageProps {
  initialGameId?: string;
}

export function LeaderboardPage({ initialGameId }: LeaderboardPageProps) {
  const selectedGame = findGameById(initialGameId);

  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = selectedGame
      ? `/api/leaderboard?game_id=${encodeURIComponent(selectedGame.gameKey ?? String(selectedGame.id))}`
      : "/api/leaderboard";

    fetch(url)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setError("Kunne ikke laste leaderboard"))
      .finally(() => setLoading(false));
  }, [selectedGame]);

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];

  return (
    <main
      className="min-h-screen bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 to-black px-6 py-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-semibold tracking-tight">Leaderboard</h1>
            <p className="mt-3 text-lg text-gray-400">
              {selectedGame ? `${selectedGame.title}` : "Alle spill – beste score"}
            </p>
          </div>

          {/* Game filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/leaderboard"
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  !selectedGame
                    ? "bg-blue-600 text-white"
                    : "border border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                Alle spill
              </Link>
              {HUB_GAMES.filter((g) => g.gameKey).map((game) => {
                const isSelected = selectedGame?.id === game.id;
                return (
                  <Link
                    key={game.id}
                    href={`/leaderboard/${game.id}`}
                    className={`rounded-md px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "border border-gray-600 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {game.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* States */}
          {loading && (
            <p className="py-20 text-center text-gray-400">Laster...</p>
          )}
          {error && (
            <p className="py-20 text-center text-red-400">{error}</p>
          )}
          {!loading && !error && entries?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-2xl text-gray-400">Ingen scores ennå</p>
              <p className="mt-2 text-gray-500">Spill et spill for å komme på leaderboardet!</p>
            </div>
          )}

          {!loading && !error && entries && entries.length > 0 && (
            <>
              {/* Top 3 podium */}
              {top3.length > 0 && (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {top3.map((entry) => (
                    <article
                      key={entry.rank}
                      className={`rounded-2xl border-2 p-6 text-center ${
                        entry.rank === 1
                          ? "border-yellow-500 bg-gradient-to-br from-yellow-900/40 to-yellow-700/20 sm:order-2"
                          : entry.rank === 2
                            ? "border-gray-400 bg-gradient-to-br from-gray-700/40 to-gray-600/20 sm:order-1"
                            : "border-orange-600 bg-gradient-to-br from-orange-900/40 to-orange-700/20 sm:order-3"
                      }`}
                    >
                      <p className="text-3xl">{MEDAL[entry.rank] ?? `#${entry.rank}`}</p>
                      <h3 className="mt-2 text-lg font-semibold">{entry.username}</h3>
                      <div className="mt-4 rounded-lg bg-black/30 p-3">
                        <p className="text-2xl font-semibold text-yellow-400">
                          {formatScore(entry.high_score)}
                        </p>
                        <p className="text-sm text-gray-300">Score</p>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        {entry.games_played} {entry.games_played === 1 ? "spill" : "spill"}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {/* Rest of the table */}
              {rest.length > 0 && (
                <div className="overflow-hidden rounded-2xl bg-gray-800/50">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Spiller</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Score</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Spill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((entry) => (
                        <tr
                          key={entry.rank}
                          className="border-t border-gray-700 transition-colors hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-3 text-gray-400">#{entry.rank}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold">
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <span>{entry.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right font-medium text-yellow-400">
                            {formatScore(entry.high_score)}
                          </td>
                          <td className="px-6 py-3 text-right text-gray-300">{entry.games_played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
