import { GameApp } from "@/components/game/GameApp";
import { GameGate } from "@/components/hub/GameGate";

export default function FarmPage() {
  return (
    <GameGate>
      <div className="farm-page">
        <GameApp />
      </div>
    </GameGate>
  );
}
