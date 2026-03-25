import { UNIT_DEFINITIONS } from "@/data/units";
import type { GameState, UnitDefinition, UpgradeDefinition, UpgradeEffect } from "@/types/game";

export const COINS_PER_EGG = 0.25;
export const SELL_REFUND_FACTOR = 0.6;
const MAX_TICK_SECONDS = 2;

export function getUnitCost(unit: UnitDefinition, owned: number): number {
  return Math.floor(unit.baseCost * unit.growth ** owned);
}

export function getUnitSellRefund(unit: UnitDefinition, owned: number): number {
  if (owned <= 0) {
    return 0;
  }

  const lastBuyCost = getUnitCost(unit, owned - 1);
  return Math.floor(lastBuyCost * SELL_REFUND_FACTOR);
}

export function canAfford(walletAmount: number, cost: number): boolean {
  return walletAmount >= cost;
}

export function computeProduction(state: GameState): {
  eggsPerSecond: number;
  coinsPerSecond: number;
} {
  let baseEggsPerSecond = 0;

  for (const unit of UNIT_DEFINITIONS) {
    const owned = state.unitsOwned[unit.id];
    const unitMultiplier = state.unitMultipliers[unit.id];
    baseEggsPerSecond += owned * unit.baseProduction * unitMultiplier;
  }

  const eggsPerSecond = baseEggsPerSecond * state.globalProductionMultiplier;
  const coinsPerSecond = eggsPerSecond * COINS_PER_EGG * state.coinMultiplier;

  return { eggsPerSecond, coinsPerSecond };
}

export function recomputeProduction(state: GameState): GameState {
  const { eggsPerSecond, coinsPerSecond } = computeProduction(state);
  return {
    ...state,
    eggsPerSecond,
    coinsPerSecond,
  };
}

export function applyTick(state: GameState, deltaSeconds: number): GameState {
  const safeDelta = Math.max(0, Math.min(deltaSeconds, MAX_TICK_SECONDS));
  if (safeDelta <= 0) {
    return state;
  }

  const eggGain = state.eggsPerSecond * safeDelta;

  return {
    ...state,
    eggs: state.eggs + eggGain,
    totalEggsEarned: state.totalEggsEarned + eggGain,
    playtimeSeconds: state.playtimeSeconds + safeDelta,
    lastUpdated: Date.now(),
  };
}

export function applyUpgrade(state: GameState, upgrade: UpgradeDefinition): GameState {
  const nextState = {
    ...state,
    purchasedUpgrades: [...state.purchasedUpgrades, upgrade.id],
  };

  return applyUpgradeEffect(nextState, upgrade.effect);
}

function applyUpgradeEffect(state: GameState, effect: UpgradeEffect): GameState {
  switch (effect.type) {
    case "click_mult":
      return {
        ...state,
        clickPower: state.clickPower * effect.multiplier,
      };
    case "global_prod_mult":
      return {
        ...state,
        globalProductionMultiplier:
          state.globalProductionMultiplier * effect.multiplier,
      };
    case "unit_mult":
      return {
        ...state,
        unitMultipliers: {
          ...state.unitMultipliers,
          [effect.unitId]: state.unitMultipliers[effect.unitId] * effect.multiplier,
        },
      };
    case "coin_mult":
      return {
        ...state,
        coinMultiplier: state.coinMultiplier * effect.multiplier,
      };
    case "golden_click":
      return {
        ...state,
        goldenClickChance: Math.min(1, state.goldenClickChance + effect.chance),
        goldenClickMultiplier: state.goldenClickMultiplier * effect.multiplier,
      };
    default:
      return state;
  }
}
