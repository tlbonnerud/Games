import { SnakeGame } from "@/components/snake/SnakeGame";
import { GameGate } from "@/components/hub/GameGate";

export default function SnakePage() {
  return (
    <GameGate>
      <SnakeGame />
    </GameGate>
  );
}
