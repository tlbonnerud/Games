import { UNIT_MAP } from "@/data/units";
import type { UnitId, UpgradeEffect } from "@/types/game";

const compactFormatter = new Intl.NumberFormat("nb-NO", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

const oneDecimalFormatter = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return compactFormatter.format(value);
  }

  if (absValue >= 100) {
    return integerFormatter.format(Math.round(value));
  }

  if (absValue >= 10) {
    return oneDecimalFormatter.format(value);
  }

  return oneDecimalFormatter.format(value);
}

export function formatInteger(value: number): string {
  return integerFormatter.format(Math.floor(value));
}

export function formatRate(value: number): string {
  return `${formatNumber(value)}/s`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatUnitLabel(unitId: UnitId): string {
  return UNIT_MAP[unitId].name;
}

export function describeUpgradeEffect(effect: UpgradeEffect): string {
  switch (effect.type) {
    case "click_mult":
      return `Klikkstyrke x${effect.multiplier}`;
    case "global_prod_mult":
      return `Total produksjon x${effect.multiplier}`;
    case "unit_mult":
      return `${formatUnitLabel(effect.unitId)} x${effect.multiplier}`;
    case "coin_mult":
      return `Mynter per egg x${effect.multiplier}`;
    case "golden_click":
      return `Gyldent klikk +${formatPercent(effect.chance)} sjanse, boost x${effect.multiplier}`;
    default:
      return "Spesiell effekt";
  }
}
