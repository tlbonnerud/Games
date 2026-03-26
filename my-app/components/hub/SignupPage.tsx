"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HubHeader } from "@/components/hub/HubHeader";
import { loginWithCredentials } from "@/components/hub/auth";

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passordene stemmer ikke overens");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Noe gikk galt");
        return;
      }
      // Logg inn automatisk etter registrering
      await loginWithCredentials(email, password);
      router.push("/");
    } catch {
      setError("Noe gikk galt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-gradient-to-br from-gray-900 via-black to-blue-900 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold">
              GH
            </div>
            <h1 className="text-3xl font-semibold">Create Account</h1>
            <p className="mt-2 text-gray-400">Join the Game Hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                E-post
              </label>
              <input
                id="email"
                type="email"
                placeholder="din@epost.no"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-white">
                Brukernavn
              </label>
              <input
                id="username"
                type="text"
                placeholder="Velg et brukernavn"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Passord
              </label>
              <input
                id="password"
                type="password"
                placeholder="Minst 6 tegn"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="block text-sm font-medium text-white">
                Bekreft passord
              </label>
              <input
                id="confirm"
                type="password"
                placeholder="Gjenta passordet"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Oppretter konto..." : "Opprett konto"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Har du allerede en konto?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
              Logg inn
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
