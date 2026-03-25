import type { UnitId, UpgradeEffect } from "@/types/game";

export const CURRENCY_ICON = {
  egg: "/icons/currency/egg.svg",
  coin: "/icons/currency/coin.svg",
} as const;

export const UNIT_ICON: Record<UnitId, string> = {
  chicken: "/icons/units/chicken.svg",
  coop: "/icons/units/coop.svg",
  feed_cart: "/icons/units/feed_cart.svg",
  egg_sorter: "/icons/units/egg_sorter.svg",
  conveyor: "/icons/units/conveyor.svg",
  barn_worker: "/icons/units/barn_worker.svg",
  mechanical_harvester: "/icons/units/mechanical_harvester.svg",
  robo_farmer: "/icons/units/robo_farmer.svg",
};

export function getUpgradeIcon(effect: UpgradeEffect): string {
  switch (effect.type) {
    case "click_mult":
      return "/icons/upgrades/click.svg";
    case "global_prod_mult":
      return "/icons/upgrades/production.svg";
    case "unit_mult":
      return "/icons/upgrades/unit.svg";
    case "coin_mult":
      return "/icons/upgrades/coin.svg";
    case "golden_click":
      return "/icons/upgrades/golden.svg";
    default:
      return "/icons/upgrades/production.svg";
  }
}
