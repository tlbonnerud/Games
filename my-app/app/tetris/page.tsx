import { GameGate } from "@/components/hub/GameGate";
import { TetrisWrapper } from "@/components/tetris/TetrisWrapper";

export default function TetrisPage() {
  return (
    <GameGate>
      <TetrisWrapper />
    </GameGate>
  );
}
