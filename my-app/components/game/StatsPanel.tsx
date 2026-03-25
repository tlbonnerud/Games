import { formatInteger, formatNumber, formatRate } from "@/lib/format";
import type { GameState } from "@/types/game";
import { PixelPanel } from "./PixelPanel";

interface StatsPanelProps {
  state: GameState;
  totalUnits: number;
  onRequestReset: () => void;
}

export function StatsPanel({ state, totalUnits, onRequestReset }: StatsPanelProps) {
  return (
    <PixelPanel title="Statistikk" subtitle="Oversikt over sesjonen" className="h-full">
      <dl className="stats-grid mb-4">
        <div>
          <dt>Total klikk</dt>
          <dd>{formatInteger(state.totalClicks)}</dd>
        </div>
        <div>
          <dt>Total egg tjent</dt>
          <dd>{formatNumber(state.totalEggsEarned)}</dd>
        </div>
        <div>
          <dt>Total coins tjent</dt>
          <dd>{formatNumber(state.totalCoinsEarned)}</dd>
        </div>
        <div>
          <dt>Units eid</dt>
          <dd>{formatInteger(totalUnits)}</dd>
        </div>
        <div>
          <dt>Aktiv produksjon</dt>
          <dd>{formatRate(state.eggsPerSecond)}</dd>
        </div>
        <div>
          <dt>Spilletid</dt>
          <dd>{formatInteger(state.playtimeSeconds)}s</dd>
        </div>
      </dl>

      <div className="pixel-card rarity-epic mb-3">
        <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">Prestige</h3>
        <p className="pixel-subtle mt-1 text-sm">
          Rebirth-system er klargjort, men ikke aktivt i denne versjonen.
        </p>
        <button type="button" className="pixel-btn mt-3 w-full" disabled>
          {state.prestigeReady
            ? "Prestige kommer snart"
            : "Låses opp ved 250 000 egg"}
        </button>
      </div>

      <button type="button" className="pixel-btn danger w-full" onClick={onRequestReset}>
        Nullstill fremdrift
      </button>
    </PixelPanel>
  );
}
