import Link from "next/link";
import { GameApp } from "@/components/game/GameApp";
import { GameGate } from "@/components/hub/GameGate";

export default function FarmPage() {
  return (
    <GameGate>
      <div className="game-shell pt-4">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
      </div>
      <GameApp />
    </GameGate>
  );
}
