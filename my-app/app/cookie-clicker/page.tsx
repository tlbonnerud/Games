import Link from "next/link";
import { GameGate } from "@/components/hub/GameGate";

export default function CookieClickerPage() {
  return (
    <GameGate>
      <main className="tetris-frame-page">
        <div className="tetris-frame-header">
          <Link href="/" className="hub-back-link">
            Til Game Hub
          </Link>
        </div>
        <section className="tetris-frame-shell" aria-label="Cookie Clicker">
          <iframe
            src="/cookie-clicker/index.html"
            title="Cookie Clicker"
            className="tetris-frame"
            allowFullScreen
          />
        </section>
      </main>
    </GameGate>
  );
}
