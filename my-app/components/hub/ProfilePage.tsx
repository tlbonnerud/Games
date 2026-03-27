"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/components/hub/HubHeader";
import {
  AUTH_CHANGE_EVENT,
  HubAuthState,
  logout,
  readAuthState,
  syncAuthFromCookie,
} from "@/components/hub/auth";

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

type SettingsTab = "username" | "password";

export function ProfilePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<HubAuthState>(() => readAuthState());

  // Settings state
  const [activeTab, setActiveTab] = useState<SettingsTab>("username");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    const sync = () => setAuthState(readAuthState());
    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!authState.isLoggedIn) router.replace("/login");
  }, [authState.isLoggedIn, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsMsg({ text: data.error || "Noe gikk galt", ok: false });
        return;
      }
      await syncAuthFromCookie();
      setNewUsername("");
      setSettingsMsg({ text: "Brukernavn oppdatert!", ok: true });
    } catch {
      setSettingsMsg({ text: "Noe gikk galt", ok: false });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    if (newPassword !== confirmPassword) {
      setSettingsMsg({ text: "Passordene stemmer ikke overens", ok: false });
      return;
    }
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsMsg({ text: data.error || "Noe gikk galt", ok: false });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSettingsMsg({ text: "Passord oppdatert!", ok: true });
    } catch {
      setSettingsMsg({ text: "Noe gikk galt", ok: false });
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!authState.isLoggedIn) {
    return null;
  }

  const initials = authState.username.slice(0, 2).toUpperCase();

  return (
    <main
      className="min-h-screen bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="min-h-[calc(100vh-96px)] bg-gradient-to-b from-gray-900 to-black px-6 py-12 md:px-8">
        <div className="mx-auto max-w-2xl space-y-8">

          {/* Header card */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
            <div className="flex items-center gap-6">
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-semibold truncate">{authState.username}</h1>
                <p className="mt-1 text-sm text-white/70 truncate">{authState.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
              >
                Logg ut
              </button>
            </div>
          </div>

          {/* Settings card */}
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 overflow-hidden">
            <div className="px-6 pt-6 pb-0">
              <h2 className="text-xl font-semibold mb-4">Kontoinnstillinger</h2>
              <div className="flex gap-1 border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => { setActiveTab("username"); setSettingsMsg(null); }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    activeTab === "username"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Endre brukernavn
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("password"); setSettingsMsg(null); }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    activeTab === "password"
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Endre passord
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "username" && (
                <form onSubmit={handleUsernameSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nåværende brukernavn
                    </label>
                    <p className="text-white font-medium">{authState.username}</p>
                  </div>
                  <div>
                    <label htmlFor="new-username" className="block text-sm font-medium text-gray-300 mb-1">
                      Nytt brukernavn
                    </label>
                    <input
                      id="new-username"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Velg et nytt brukernavn"
                      minLength={2}
                      required
                      className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2.5 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {settingsMsg && (
                    <p className={`text-sm ${settingsMsg.ok ? "text-green-400" : "text-red-400"}`}>
                      {settingsMsg.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {settingsLoading ? "Lagrer..." : "Lagre brukernavn"}
                  </button>
                </form>
              )}

              {activeTab === "password" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-1">
                      Nåværende passord
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ditt nåværende passord"
                      required
                      className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2.5 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1">
                      Nytt passord
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minst 6 tegn"
                      minLength={6}
                      required
                      className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2.5 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
                      Bekreft nytt passord
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Gjenta nytt passord"
                      required
                      className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2.5 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {settingsMsg && (
                    <p className={`text-sm ${settingsMsg.ok ? "text-green-400" : "text-red-400"}`}>
                      {settingsMsg.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {settingsLoading ? "Lagrer..." : "Lagre passord"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
