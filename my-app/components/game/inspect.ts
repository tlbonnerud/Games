import type { Rarity, UnitId, UpgradeId } from "@/types/game";

export interface InspectProgress {
  current: number;
  target: number;
  ratio: number;
}

export type InspectUpgradeCategory = "Klikk" | "Produksjon" | "Marked" | "Spesial";

export interface UnitInspectPayload {
  kind: "unit";
  id: UnitId;
  iconSrc: string;
  name: string;
  description: string;
  owned: number;
  cost: number;
  refund: number;
  unlocked: boolean;
  canAfford: boolean;
  canSell: boolean;
  unlockLabel: string;
  unlockProgress: InspectProgress;
  singleProduction: number;
  totalProduction: number;
}

export interface UpgradeInspectPayload {
  kind: "upgrade";
  id: UpgradeId;
  iconSrc: string;
  name: string;
  description: string;
  cost: number;
  rarity: Rarity;
  unlocked: boolean;
  purchased: boolean;
  canAfford: boolean;
  unlockLabel: string;
  unlockProgress: InspectProgress;
  effectText: string;
  category: InspectUpgradeCategory;
}

export type InspectPayload = UnitInspectPayload | UpgradeInspectPayload;
