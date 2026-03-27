import Link from "next/link";
import { GameGate } from "@/components/hub/GameGate";

export default function FreakyTowersPage() {
  return (
    <GameGate>
      <main className="tetris-frame-page">
        <div className="tetris-frame-header">
          <Link href="/" className="hub-back-link">
            Til Game Hub
          </Link>
        </div>
        <section className="tetris-frame-shell" aria-label="Freaky Towers">
          <iframe
            src="/freaky-towers/index.html"
            title="Freaky Towers"
            className="tetris-frame"
            allowFullScreen
          />
        </section>
      </main>
    </GameGate>
  );
}
