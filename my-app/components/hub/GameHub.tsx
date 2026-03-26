"use client";

import Link from "next/link";
import { useState } from "react";
import { HUB_GAMES } from "@/components/hub/data";
import { HubHeader } from "@/components/hub/HubHeader";

const MODERN_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function GameHub() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const currentGame = HUB_GAMES[currentGameIndex];

  const handlePrevGame = () => {
    setCurrentGameIndex((prevIndex) => (prevIndex === 0 ? HUB_GAMES.length - 1 : prevIndex - 1));
  };

  const handleNextGame = () => {
    setCurrentGameIndex((prevIndex) => (prevIndex === HUB_GAMES.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <main
      className="min-h-screen overflow-y-auto bg-black text-base text-white"
      style={{ fontFamily: MODERN_FONT, imageRendering: "auto" }}
    >
      <HubHeader />

      <section className="relative flex min-h-[640px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentGame.image}
            alt={currentGame.title}
            className="h-full w-full scale-105 object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <button
          type="button"
          onClick={handlePrevGame}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-4 text-2xl leading-none transition-all hover:bg-white/20 md:left-8"
          aria-label="Previous game"
        >
          &#8249;
        </button>

        <button
          type="button"
          onClick={handleNextGame}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-4 text-2xl leading-none transition-all hover:bg-white/20 md:right-8"
          aria-label="Next game"
        >
          &#8250;
        </button>

        <div className="relative z-10 space-y-8 px-6 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">{currentGame.genre}</p>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">{currentGame.title}</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-200 md:text-xl">{currentGame.description}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={currentGame.href}
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-medium text-black transition-colors hover:bg-white/90"
            >
              Play Game
            </Link>
            <button
              type="button"
              onClick={() => {
                document.getElementById("all-games")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700"
            >
              Browse Games
            </button>
          </div>

          <div className="flex justify-center gap-2 pt-6">
            {HUB_GAMES.map((game, index) => (
              <button
                key={game.id}
                type="button"
                onClick={() => setCurrentGameIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentGameIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${game.title}`}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="rounded-full border-2 border-blue-400 bg-blue-600/85 px-6 py-3 text-sm font-medium md:text-base">
              More Games Below
            </span>
            <span className="text-3xl leading-none">&darr;</span>
          </div>
        </div>
      </section>

      <section id="all-games" className="bg-gradient-to-b from-black to-gray-900 px-6 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">All Games</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {HUB_GAMES.map((game) => (
              <article
                key={game.id}
                className="group overflow-hidden rounded-lg bg-gray-800 transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={game.href}
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Play Now
                    </Link>
                  </div>
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400">{game.genre}</p>
                  <h3 className="text-lg font-medium">{game.title}</h3>
                  <Link
                    href={`/leaderboard/${game.id}`}
                    className="text-sm text-blue-400 underline transition-colors hover:text-blue-300"
                  >
                    View Leaderboard
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
