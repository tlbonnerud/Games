"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/components/hub/HubHeader";

const FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

type User = {
  userid: string;
  email: string;
  username: string;
  is_admin: boolean;
  created_at: string;
  last_seen: string | null;
  games_played: number;
  last_game: string | null;
};

type Stats = {
  total_users: number;
  total_admins: number;
  active_now: number;
  active_users: { userid: string; username: string; last_seen: string }[];
  per_game: { game_id: string; players: number; sessions: number }[];
  signups_14d: { day: string; count: number }[];
};

function timeAgo(iso: string | null): string {
  if (!iso) return "–";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "akkurat nå";
  if (mins < 60) return `${mins}m siden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}t siden`;
  return `${Math.floor(hrs / 24)}d siden`;
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchAll() {
    const [uRes, sRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/stats"),
    ]);

    if (uRes.status === 403 || sRes.status === 403) {
      router.push("/");
      return;
    }

    const uData = await uRes.json();
    const sData = await sRes.json();
    setUsers(uData.users ?? []);
    setStats(sData);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    // Poll stats every 30s for live active count
    intervalRef.current = setInterval(() => {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white" style={{ fontFamily: FONT }}>
        <HubHeader />
        <div className="flex items-center justify-center py-32 text-gray-400">Laster...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white" style={{ fontFamily: FONT }}>
        <HubHeader />
        <div className="flex items-center justify-center py-32 text-red-400">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white" style={{ fontFamily: FONT }}>
      <HubHeader />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin-dashbord</h1>
            <p className="mt-1 text-sm text-gray-400">Oppdateres hvert 30. sekund</p>
          </div>
          <button
            onClick={fetchAll}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {/* Stat-kort */}
        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Totale brukere" value={stats.total_users} />
            <StatCard
              label="Aktive nå"
              value={stats.active_now}
              sub="sist sett < 5 min siden"
            />
            <StatCard label="Admins" value={stats.total_admins} />
            <StatCard
              label="Spill-sesjoner"
              value={stats.per_game.reduce((s, g) => s + g.sessions, 0)}
              sub="totalt på tvers av alle spill"
            />
          </div>
        )}

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* Aktive brukere */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5">
            <h2 className="mb-4 text-lg font-medium">
              Aktive brukere{" "}
              <span className="ml-2 rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                {stats?.active_now ?? 0} online
              </span>
            </h2>
            {stats?.active_users.length === 0 ? (
              <p className="text-sm text-gray-500">Ingen aktive akkurat nå</p>
            ) : (
              <ul className="space-y-2">
                {stats?.active_users.map((u) => (
                  <li key={u.userid} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{u.username}</span>
                    <span className="text-gray-400">{timeAgo(u.last_seen)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Per spill */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5">
            <h2 className="mb-4 text-lg font-medium">Spill-statistikk</h2>
            {!stats?.per_game.length ? (
              <p className="text-sm text-gray-500">Ingen spilldata ennå</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="pb-2">Spill</th>
                    <th className="pb-2 text-right">Spillere</th>
                    <th className="pb-2 text-right">Sesjoner</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.per_game.map((g) => (
                    <tr key={g.game_id} className="border-t border-gray-700">
                      <td className="py-2 font-medium">{g.game_id}</td>
                      <td className="py-2 text-right text-gray-300">{g.players}</td>
                      <td className="py-2 text-right text-gray-300">{g.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Registreringer siste 14 dager */}
        {stats && stats.signups_14d.length > 0 && (
          <div className="mb-10 rounded-xl border border-gray-700 bg-gray-800/40 p-5">
            <h2 className="mb-4 text-lg font-medium">Nye registreringer – siste 14 dager</h2>
            <div className="flex items-end gap-1 overflow-x-auto pb-2">
              {[...stats.signups_14d].reverse().map((d) => {
                const max = Math.max(...stats.signups_14d.map((x) => x.count), 1);
                const height = Math.max(4, (d.count / max) * 80);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{d.count}</span>
                    <div
                      className="w-7 rounded-t bg-blue-600"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[10px] text-gray-500">
                      {new Date(d.day).toLocaleDateString("no", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brukertabell */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium">Alle brukere ({users.length})</h2>
            <input
              type="text"
              placeholder="Søk etter bruker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-700">
                  <th className="pb-3 pr-4">Bruker</th>
                  <th className="pb-3 pr-4">E-post</th>
                  <th className="pb-3 pr-4 text-center">Spill</th>
                  <th className="pb-3 pr-4">Sist aktiv</th>
                  <th className="pb-3">Registrert</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.userid} className="border-t border-gray-700/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold">
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.username}</span>
                        {u.is_admin && (
                          <span className="rounded bg-yellow-600/20 px-1.5 py-0.5 text-[10px] text-yellow-400">
                            admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-3 pr-4 text-center text-gray-300">{u.games_played}</td>
                    <td className="py-3 pr-4 text-gray-400">{timeAgo(u.last_seen)}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString("no")}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Ingen brukere funnet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
