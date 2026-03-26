import Link from "next/link";
import { HUB_GAMES, findGameById } from "@/components/hub/data";
import { HubHeader } from "@/components/hub/HubHeader";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  gamesPlayed: number;
  winRate: number;
}

const BASE_ENTRIES = [
  { username: "ProGamer123", baseScore: 15000, gamesPlayed: 250, winRate: 78 },
  { username: "NinjaWarrior", baseScore: 14200, gamesPlayed: 198, winRate: 72 },
  { username: "SpeedRunner99", baseScore: 13500, gamesPlayed: 312, winRate: 68 },
  { username: "CyberKnight", baseScore: 12800, gamesPlayed: 145, winRate: 85 },
  { username: "PixelMaster", baseScore: 11900, gamesPlayed: 220, winRate: 64 },
  { username: "GhostPlayer", baseScore: 11200, gamesPlayed: 175, winRate: 70 },
  { username: "ThunderBolt", baseScore: 10500, gamesPlayed: 190, winRate: 62 },
  { username: "ShadowHunter", baseScore: 9800, gamesPlayed: 156, winRate: 58 },
  { username: "DragonSlayer", baseScore: 9200, gamesPlayed: 203, winRate: 55 },
  { username: "NeonGamer", baseScore: 8700, gamesPlayed: 128, winRate: 60 },
];

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

function generateLeaderboard(gameId?: number): LeaderboardEntry[] {
  return BASE_ENTRIES.map((entry, index) => ({
    rank: index + 1,
    username: entry.username,
    score: gameId ? entry.baseScore + gameId * 100 : entry.baseScore,
    gamesPlayed: entry.gamesPlayed,
    winRate: entry.winRate,
  }));
}

interface LeaderboardPageProps {
  initialGameId?: string;
}

export function LeaderboardPage({ initialGameId }: LeaderboardPageProps) {
  const selectedGame = findGameById(initialGameId);
  const leaderboardData = generateLeaderboard(selectedGame?.id);

  return (
    <main
      className="min-h-screen bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 to-black px-6 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-semibold tracking-tight">Leaderboard</h1>
            <p className="mt-3 text-lg text-gray-400">
              {selectedGame ? `${selectedGame.title} rankings` : "Global rankings"}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-lg font-medium text-gray-300">Filter by game:</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/leaderboard"
                className={`rounded-md px-4 py-2 transition-colors ${
                  selectedGame
                    ? "border border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "bg-blue-600 text-white"
                }`}
              >
                All Games
              </Link>
              {HUB_GAMES.map((game) => {
                const isSelected = selectedGame?.id === game.id;

                return (
                  <Link
                    key={game.id}
                    href={`/leaderboard/${game.id}`}
                    className={`rounded-md px-4 py-2 transition-colors ${
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

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {leaderboardData.slice(0, 3).map((entry) => (
              <article
                key={entry.rank}
                className={`rounded-2xl border-2 p-6 ${
                  entry.rank === 1
                    ? "border-yellow-500 bg-gradient-to-br from-yellow-900/50 to-yellow-700/30 md:order-1"
                    : entry.rank === 2
                      ? "border-gray-400 bg-gradient-to-br from-gray-700/50 to-gray-600/30 md:order-0"
                      : "border-orange-600 bg-gradient-to-br from-orange-900/50 to-orange-700/30 md:order-2"
                }`}
              >
                <div className="text-center">
                  <p className="text-4xl font-semibold">#{entry.rank}</p>
                  <h3 className="mt-2 text-xl font-medium">{entry.username}</h3>

                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg bg-black/30 p-3">
                      <p className="text-2xl font-semibold text-yellow-400">
                        {entry.score.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300">Score</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-black/30 p-2">
                        <p>{entry.gamesPlayed}</p>
                        <p className="text-xs text-gray-400">Games</p>
                      </div>
                      <div className="rounded-lg bg-black/30 p-2">
                        <p className="text-green-400">{entry.winRate}%</p>
                        <p className="text-xs text-gray-400">Win Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl bg-gray-800/50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">Rank</th>
                    <th className="px-6 py-4 text-left font-medium">Player</th>
                    <th className="px-6 py-4 text-right font-medium">Score</th>
                    <th className="px-6 py-4 text-right font-medium">Games</th>
                    <th className="px-6 py-4 text-right font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.slice(3).map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-t border-gray-700 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-gray-300">#{entry.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                            {entry.username.charAt(0)}
                          </div>
                          <span>{entry.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-400">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">{entry.gamesPlayed}</td>
                      <td className="px-6 py-4 text-right text-green-400">{entry.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
