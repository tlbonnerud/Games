export type UnitId =
  | "chicken"
  | "coop"
  | "feed_cart"
  | "egg_sorter"
  | "conveyor"
  | "barn_worker"
  | "mechanical_harvester"
  | "robo_farmer";

export type UpgradeId =
  | "firm_grip_gloves"
  | "steel_beak_drills"
  | "sunrise_shift"
  | "coop_insulation"
  | "quality_feed"
  | "sorting_algorithm"
  | "greased_chains"
  | "barn_union_bonus"
  | "market_contracts"
  | "export_license"
  | "quantum_hatchery"
  | "golden_yolk_protocol";

export type AchievementId =
  | "first_cluck"
  | "hundred_taps"
  | "small_flock"
  | "first_coop"
  | "packing_line"
  | "egg_tycoon"
  | "coin_collector"
  | "automation_rising"
  | "barn_city"
  | "future_farm";

export type Rarity = "common" | "rare" | "epic";

export type UnlockConditionType =
  | "total_eggs"
  | "total_coins"
  | "total_clicks"
  | "units_owned";

export interface UnlockCondition {
  type: UnlockConditionType;
  value: number;
  unitId?: UnitId;
  label: string;
}

export interface UnitDefinition {
  id: UnitId;
  name: string;
  description: string;
  baseCost: number;
  growth: number;
  baseProduction: number;
  unlock: UnlockCondition;
}

export type UpgradeEffect =
  | { type: "click_mult"; multiplier: number }
  | { type: "global_prod_mult"; multiplier: number }
  | { type: "unit_mult"; unitId: UnitId; multiplier: number }
  | { type: "coin_mult"; multiplier: number }
  | { type: "golden_click"; chance: number; multiplier: number };

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  cost: number;
  rarity: Rarity;
  unlock: UnlockCondition;
  effect: UpgradeEffect;
}

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  unlock: UnlockCondition;
}

export interface GameState {
  eggs: number;
  coins: number;
  totalEggsEarned: number;
  totalCoinsEarned: number;
  eggsPerSecond: number;
  coinsPerSecond: number;
  clickPower: number;
  globalProductionMultiplier: number;
  coinMultiplier: number;
  totalClicks: number;
  unitsOwned: Record<UnitId, number>;
  unitMultipliers: Record<UnitId, number>;
  purchasedUpgrades: UpgradeId[];
  achievementsUnlocked: AchievementId[];
  audioEnabled: boolean;
  saveVersion: number;
  goldenClickChance: number;
  goldenClickMultiplier: number;
  prestigePoints: number;
  prestigeReady: boolean;
  playtimeSeconds: number;
  lastUpdated: number;
}

export type GameAction =
  | { type: "HYDRATE"; payload: GameState }
  | { type: "TICK"; deltaSeconds: number }
  | { type: "CLICK"; eggsGain: number; coinsGain: number }
  | { type: "SELL_EGGS"; eggsAmount: number }
  | { type: "BUY_UNIT"; unitId: UnitId; cost: number }
  | { type: "SELL_UNIT"; unitId: UnitId; refund: number }
  | { type: "BUY_UPGRADE"; upgradeId: UpgradeId; cost: number }
  | { type: "TOGGLE_AUDIO" }
  | { type: "RESET"; keepAudio: boolean };

export interface ToastItem {
  id: number;
  kind: "unlock" | "achievement" | "system";
  message: string;
}
