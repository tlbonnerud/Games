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
            src="https://itch.io/embed-upload/8420865?uuid=6ab9f3f4d19e56503d9ee3d2d202ee39&color=333333"
            title="Freaky Towers"
            className="tetris-frame"
            allowFullScreen
          />
        </section>
      </main>
    </GameGate>
  );
}
