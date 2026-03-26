import { BubbleShooterGame } from "@/components/bubble/BubbleShooterGame";
import { GameGate } from "@/components/hub/GameGate";

export default function BubbleShooterPage() {
  return (
    <GameGate>
      <BubbleShooterGame />
    </GameGate>
  );
}
