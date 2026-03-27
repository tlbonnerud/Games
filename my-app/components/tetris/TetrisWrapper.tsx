"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function TetrisWrapper() {
  const savedRef = useRef(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "tetris-gameover") {
        const score = Number(e.data.score ?? 0);
        if (score <= 0) return;
        // Only save once per game session
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: "tetris", score }),
        }).catch(() => {});
      }
      if (e.data?.type === "tetris-sprint") {
        // For sprint, save score as lines cleared (time isn't stored in high_score)
        const lines = Number(e.data.lines ?? 0);
        if (lines <= 0) return;
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: "tetris-sprint", score: lines }),
        }).catch(() => {});
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <main className="tetris-frame-page">
      <div className="tetris-frame-header">
        <Link href="/" className="hub-back-link">Til Game Hub</Link>
      </div>
      <section className="tetris-frame-shell" aria-label="Tetris With Effects">
        <iframe
          src="/tetris-with-effects.html"
          title="Tetris With Effects"
          className="tetris-frame"
        />
      </section>
    </main>
  );
}
