import Link from "next/link";
import { GameGate } from "@/components/hub/GameGate";

export default function EggFactoryPage() {
  return (
    <GameGate>
      <main className="tetris-frame-page">
        <div className="tetris-frame-header">
          <Link href="/" className="hub-back-link">
            Til Game Hub
          </Link>
        </div>
        <section className="tetris-frame-shell" aria-label="Egg Factory">
          <iframe
            src="/egg-factory/index.html"
            title="Egg Factory"
            className="tetris-frame"
            allowFullScreen
          />
        </section>
      </main>
    </GameGate>
  );
}
