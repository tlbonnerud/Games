import { GameApp } from "@/components/game/GameApp";
import { GameGate } from "@/components/hub/GameGate";

export default function ChickenPage() {
  return (
    <GameGate>
      <GameApp />
    </GameGate>
  );
}
