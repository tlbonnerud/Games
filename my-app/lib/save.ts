import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { UNIT_IDS } from "@/data/units";
import { UPGRADE_IDS } from "@/data/upgrades";
import { buildUnitNumberRecord, createInitialGameState, SAVE_VERSION } from "@/lib/game-state";
import type { AchievementId, GameState, UnitId, UpgradeId } from "@/types/game";

export const SAVE_KEY = "pixel-chicken-factory-save-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeUnitsOwned(input: unknown): Record<UnitId, number> {
  const sanitized = buildUnitNumberRecord(0);
  if (!isRecord(input)) {
    return sanitized;
  }

  for (const unitId of UNIT_IDS) {
    sanitized[unitId] = Math.max(0, Math.floor(toFiniteNumber(input[unitId], 0)));
  }

  return sanitized;
}

function sanitizeUnitMultipliers(input: unknown): Record<UnitId, number> {
  const sanitized = buildUnitNumberRecord(1);
  if (!isRecord(input)) {
    return sanitized;
  }

  for (const unitId of UNIT_IDS) {
    sanitized[unitId] = Math.max(0.01, toFiniteNumber(input[unitId], 1));
  }

  return sanitized;
}

function sanitizeUpgradeList(input: unknown): UpgradeId[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const valid = new Set(UPGRADE_IDS);
  return input.filter((id): id is UpgradeId => typeof id === "string" && valid.has(id as UpgradeId));
}

function sanitizeAchievementList(input: unknown): AchievementId[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const valid = new Set(ACHIEVEMENT_DEFINITIONS.map((achievement) => achievement.id));
  return input.filter(
    (id): id is AchievementId => typeof id === "string" && valid.has(id as AchievementId),
  );
}

export function loadSave(): GameState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return null;
    }

    const base = createInitialGameState();

    const hydrated: GameState = {
      ...base,
      eggs: Math.max(0, toFiniteNumber(parsed.eggs, base.eggs)),
      coins: Math.max(0, toFiniteNumber(parsed.coins, base.coins)),
      totalEggsEarned: Math.max(
        0,
        toFiniteNumber(parsed.totalEggsEarned, base.totalEggsEarned),
      ),
      totalCoinsEarned: Math.max(
        0,
        toFiniteNumber(parsed.totalCoinsEarned, base.totalCoinsEarned),
      ),
      eggsPerSecond: Math.max(0, toFiniteNumber(parsed.eggsPerSecond, base.eggsPerSecond)),
      coinsPerSecond: Math.max(0, toFiniteNumber(parsed.coinsPerSecond, base.coinsPerSecond)),
      clickPower: Math.max(0.1, toFiniteNumber(parsed.clickPower, base.clickPower)),
      globalProductionMultiplier: Math.max(
        0.1,
        toFiniteNumber(
          parsed.globalProductionMultiplier,
          base.globalProductionMultiplier,
        ),
      ),
      coinMultiplier: Math.max(0.1, toFiniteNumber(parsed.coinMultiplier, base.coinMultiplier)),
      totalClicks: Math.max(0, Math.floor(toFiniteNumber(parsed.totalClicks, base.totalClicks))),
      unitsOwned: sanitizeUnitsOwned(parsed.unitsOwned),
      unitMultipliers: sanitizeUnitMultipliers(parsed.unitMultipliers),
      purchasedUpgrades: sanitizeUpgradeList(parsed.purchasedUpgrades),
      achievementsUnlocked: sanitizeAchievementList(parsed.achievementsUnlocked),
      audioEnabled:
        typeof parsed.audioEnabled === "boolean"
          ? parsed.audioEnabled
          : base.audioEnabled,
      saveVersion: Math.max(
        SAVE_VERSION,
        Math.floor(toFiniteNumber(parsed.saveVersion, SAVE_VERSION)),
      ),
      goldenClickChance: Math.min(
        1,
        Math.max(0, toFiniteNumber(parsed.goldenClickChance, base.goldenClickChance)),
      ),
      goldenClickMultiplier: Math.max(
        1,
        toFiniteNumber(parsed.goldenClickMultiplier, base.goldenClickMultiplier),
      ),
      prestigePoints: Math.max(
        0,
        Math.floor(toFiniteNumber(parsed.prestigePoints, base.prestigePoints)),
      ),
      prestigeReady:
        typeof parsed.prestigeReady === "boolean"
          ? parsed.prestigeReady
          : base.prestigeReady,
      playtimeSeconds: Math.max(
        0,
        toFiniteNumber(parsed.playtimeSeconds, base.playtimeSeconds),
      ),
      // No offline gain: when loading, we always restart tick timing from now.
      lastUpdated: Date.now(),
    };

    return hydrated;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or serialization issues gracefully.
  }

  // Lagre til database i bakgrunnen hvis innlogget
  saveGameToDb(state).catch(() => {});
}

export async function saveGameToDb(state: GameState): Promise<void> {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: "chicken-farm",
        score: Math.floor(state.totalCoinsEarned),
        metadata: {
          coins: state.coins,
          totalEggsEarned: state.totalEggsEarned,
          totalCoinsEarned: state.totalCoinsEarned,
          eggsPerSecond: state.eggsPerSecond,
          coinsPerSecond: state.coinsPerSecond,
          unitsOwned: state.unitsOwned,
          purchasedUpgrades: state.purchasedUpgrades,
          achievementsUnlocked: state.achievementsUnlocked,
          prestigePoints: state.prestigePoints,
          playtimeSeconds: state.playtimeSeconds,
          saveVersion: state.saveVersion,
        },
      }),
    });
  } catch {
    // Ignorer nettverksfeil – localStorage er alltid backup
  }
}

export async function loadSaveFromDb(): Promise<GameState | null> {
  try {
    const res = await fetch("/api/progress");
    if (!res.ok) return null;
    const { progress } = await res.json();
    const entry = progress?.find((p: { game_id: string }) => p.game_id === "chicken-farm");
    if (!entry?.metadata) return null;
    // Bruk eksisterende loadSave-logikk ved å serialisere til localStorage og laste derfra
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(entry.metadata));
    return loadSave();
  } catch {
    return null;
  }
}

export function resetSave(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SAVE_KEY);
}
