import Link from "next/link";
import { GameApp } from "@/components/game/GameApp";

export default function FarmPage() {
  return (
    <>
      <div className="game-shell pt-4">
        <Link href="/" className="hub-back-link">
          Til Game Hub
        </Link>
      </div>
      <GameApp />
    </>
  );
}
