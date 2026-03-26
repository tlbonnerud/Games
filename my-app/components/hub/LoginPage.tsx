"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/components/hub/HubHeader";
import { loginWithCredentials } from "@/components/hub/auth";

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      await loginWithCredentials(username.trim(), password);
      router.push("/");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Noe gikk galt");
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
            <h1 className="text-3xl font-semibold">Welcome Back</h1>
            <p className="mt-2 text-gray-400">Login to continue gaming</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-white">
                E-post
              </label>
              <input
                id="username"
                type="email"
                placeholder="din@epost.no"
                autoComplete="email"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logger inn..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
