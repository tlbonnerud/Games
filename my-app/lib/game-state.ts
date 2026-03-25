import { UNIT_IDS } from "@/data/units";
import type { GameState, UnitId } from "@/types/game";

export const SAVE_VERSION = 1;
export const PRESTIGE_UNLOCK_EGGS = 250000;

export function buildUnitNumberRecord(defaultValue: number): Record<UnitId, number> {
  return UNIT_IDS.reduce((acc, unitId) => {
    acc[unitId] = defaultValue;
    return acc;
  }, {} as Record<UnitId, number>);
}

export function getTotalUnitsOwned(unitsOwned: Record<UnitId, number>): number {
  return UNIT_IDS.reduce((sum, unitId) => sum + unitsOwned[unitId], 0);
}

export function createInitialGameState(): GameState {
  return {
    eggs: 0,
    coins: 0,
    totalEggsEarned: 0,
    totalCoinsEarned: 0,
    eggsPerSecond: 0,
    coinsPerSecond: 0,
    clickPower: 1,
    globalProductionMultiplier: 1,
    coinMultiplier: 1,
    totalClicks: 0,
    unitsOwned: buildUnitNumberRecord(0),
    unitMultipliers: buildUnitNumberRecord(1),
    purchasedUpgrades: [],
    achievementsUnlocked: [],
    audioEnabled: false,
    saveVersion: SAVE_VERSION,
    goldenClickChance: 0,
    goldenClickMultiplier: 1,
    prestigePoints: 0,
    prestigeReady: false,
    playtimeSeconds: 0,
    lastUpdated: Date.now(),
  };
}
