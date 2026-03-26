import { PRESTIGE_UNLOCK_EGGS } from "@/lib/game-state";
import { usePersistentState } from "@/hooks/usePersistentState";
import { formatInteger, formatNumber, formatRate } from "@/lib/format";
import type { GameState } from "@/types/game";
import { PixelPanel } from "./PixelPanel";

interface StatsPanelProps {
  state: GameState;
  totalUnits: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onRequestReset: () => void;
}

type StatsTab = "session" | "prestige" | "system";

export function StatsPanel({
  state,
  totalUnits,
  audioEnabled,
  onToggleAudio,
  onRequestReset,
}: StatsPanelProps) {
  const [activeTab, setActiveTab] = usePersistentState<StatsTab>(
    "farm-stats-tab",
    "session",
  );

  const prestigeProgress = Math.min(1, state.totalEggsEarned / PRESTIGE_UNLOCK_EGGS);

  return (
    <PixelPanel
      title="Kontrollsenter"
      subtitle="Statistikk, prestige og system"
    >
      <div className="panel-tab-row mb-3">
        <button
          type="button"
          className={`panel-tab ${activeTab === "session" ? "is-active" : ""}`}
          onClick={() => setActiveTab("session")}
        >
          Statistikk
        </button>
        <button
          type="button"
          className={`panel-tab ${activeTab === "prestige" ? "is-active" : ""}`}
          onClick={() => setActiveTab("prestige")}
        >
          Prestige
        </button>
        <button
          type="button"
          className={`panel-tab ${activeTab === "system" ? "is-active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          System
        </button>
      </div>

      {activeTab === "session" ? (
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
            <dt>Total mynter tjent</dt>
            <dd>{formatNumber(state.totalCoinsEarned)}</dd>
          </div>
          <div>
            <dt>Enheter eid</dt>
            <dd>{formatInteger(totalUnits)}</dd>
          </div>
          <div>
            <dt>Egg per sekund</dt>
            <dd>{formatRate(state.eggsPerSecond)}</dd>
          </div>
          <div>
            <dt>Mynter per sekund</dt>
            <dd>{formatRate(state.coinsPerSecond)}</dd>
          </div>
          <div>
            <dt>Klikkstyrke</dt>
            <dd>{formatNumber(state.clickPower)}</dd>
          </div>
          <div>
            <dt>Spilletid</dt>
            <dd>{formatInteger(state.playtimeSeconds)}s</dd>
          </div>
        </dl>
      ) : null}

      {activeTab === "prestige" ? (
        <div className="pixel-card rarity-epic mb-3">
          <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
            Prestige-status
          </h3>
          <p className="pixel-subtle mt-1">
            Låses opp ved {formatNumber(PRESTIGE_UNLOCK_EGGS)} totale egg.
          </p>
          <div className="pixel-progress mt-3">
            <span style={{ width: `${prestigeProgress * 100}%` }} />
          </div>
          <p className="pixel-subtle mt-1">
            {formatNumber(state.totalEggsEarned)} / {formatNumber(PRESTIGE_UNLOCK_EGGS)}
          </p>
          <p className="pixel-subtle mt-2">
            Prestige-poeng: {formatInteger(state.prestigePoints)}
          </p>
          <button type="button" className="pixel-btn mt-3 w-full" disabled>
            {state.prestigeReady ? "Prestige blir tilgjengelig snart" : "Fortsett å bygge"}
          </button>
        </div>
      ) : null}

      {activeTab === "system" ? (
        <div className="space-y-3">
          <button type="button" className="pixel-toggle w-full" onClick={onToggleAudio}>
            Lyd: {audioEnabled ? "På" : "Av"}
          </button>
          <button type="button" className="pixel-btn danger w-full" onClick={onRequestReset}>
            Nullstill fremdrift
          </button>
        </div>
      ) : null}
    </PixelPanel>
  );
}
