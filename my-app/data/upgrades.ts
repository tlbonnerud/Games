import type { UpgradeDefinition, UpgradeId } from "@/types/game";

export const UPGRADE_IDS: UpgradeId[] = [
  "firm_grip_gloves",
  "steel_beak_drills",
  "sunrise_shift",
  "coop_insulation",
  "quality_feed",
  "sorting_algorithm",
  "greased_chains",
  "barn_union_bonus",
  "market_contracts",
  "export_license",
  "quantum_hatchery",
  "golden_yolk_protocol",
];

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: "firm_grip_gloves",
    name: "Fast grep-hansker",
    description: "Mer presise klikk gir mer per trykk.",
    cost: 40,
    rarity: "common",
    unlock: {
      type: "total_clicks",
      value: 20,
      label: "Nå 20 klikk",
    },
    effect: {
      type: "click_mult",
      multiplier: 1.5,
    },
  },
  {
    id: "steel_beak_drills",
    name: "Stålnebb-bits",
    description: "Kraftigere tapping av egg ved manuell klikking.",
    cost: 220,
    rarity: "common",
    unlock: {
      type: "total_eggs",
      value: 220,
      label: "Samle 220 egg totalt",
    },
    effect: {
      type: "click_mult",
      multiplier: 2,
    },
  },
  {
    id: "sunrise_shift",
    name: "Soloppgangsskift",
    description: "Morgenskift gir høyere totalproduksjon.",
    cost: 180,
    rarity: "common",
    unlock: {
      type: "units_owned",
      value: 5,
      unitId: "chicken",
      label: "Eie 5 kyllinger",
    },
    effect: {
      type: "global_prod_mult",
      multiplier: 1.25,
    },
  },
  {
    id: "coop_insulation",
    name: "Isolert hønsehus",
    description: "Hønsehus blir mer effektive i all slags vær.",
    cost: 480,
    rarity: "common",
    unlock: {
      type: "units_owned",
      value: 2,
      unitId: "coop",
      label: "Eie 2 hønsehus",
    },
    effect: {
      type: "unit_mult",
      unitId: "coop",
      multiplier: 1.5,
    },
  },
  {
    id: "quality_feed",
    name: "Premiumfôr",
    description: "Høy energi gir raskere egglegging hos kyllinger.",
    cost: 900,
    rarity: "rare",
    unlock: {
      type: "units_owned",
      value: 10,
      unitId: "chicken",
      label: "Eie 10 kyllinger",
    },
    effect: {
      type: "unit_mult",
      unitId: "chicken",
      multiplier: 1.8,
    },
  },
  {
    id: "sorting_algorithm",
    name: "Sorteringsalgoritme",
    description: "Egg-sorterere får smartere prioriteringslogikk.",
    cost: 2400,
    rarity: "rare",
    unlock: {
      type: "units_owned",
      value: 2,
      unitId: "egg_sorter",
      label: "Eie 2 egg-sorterere",
    },
    effect: {
      type: "unit_mult",
      unitId: "egg_sorter",
      multiplier: 1.75,
    },
  },
  {
    id: "greased_chains",
    name: "Smurte kjeder",
    description: "Transportbånd mister mindre fart under last.",
    cost: 6800,
    rarity: "rare",
    unlock: {
      type: "units_owned",
      value: 1,
      unitId: "conveyor",
      label: "Eie 1 transportbånd",
    },
    effect: {
      type: "unit_mult",
      unitId: "conveyor",
      multiplier: 1.7,
    },
  },
  {
    id: "barn_union_bonus",
    name: "Låve-bonus",
    description: "Strukturert skiftplan løfter hele gården.",
    cost: 15000,
    rarity: "rare",
    unlock: {
      type: "units_owned",
      value: 3,
      unitId: "barn_worker",
      label: "Eie 3 låvearbeidere",
    },
    effect: {
      type: "global_prod_mult",
      multiplier: 1.4,
    },
  },
  {
    id: "market_contracts",
    name: "Markedskontrakter",
    description: "Bedre salgsvilkår gir flere coins per egg.",
    cost: 1200,
    rarity: "common",
    unlock: {
      type: "total_coins",
      value: 300,
      label: "Tjen 300 coins totalt",
    },
    effect: {
      type: "coin_mult",
      multiplier: 1.5,
    },
  },
  {
    id: "export_license",
    name: "Eksportlisens",
    description: "Internasjonalt salg dobler myntgevinsten.",
    cost: 14000,
    rarity: "rare",
    unlock: {
      type: "total_coins",
      value: 4000,
      label: "Tjen 4 000 coins totalt",
    },
    effect: {
      type: "coin_mult",
      multiplier: 2,
    },
  },
  {
    id: "quantum_hatchery",
    name: "Kvante-klekkeri",
    description: "En absurd oppgradering som booster alt.",
    cost: 52000,
    rarity: "epic",
    unlock: {
      type: "total_eggs",
      value: 50000,
      label: "Samle 50 000 egg totalt",
    },
    effect: {
      type: "global_prod_mult",
      multiplier: 2,
    },
  },
  {
    id: "golden_yolk_protocol",
    name: "Gylden plomme-protokoll",
    description: "Sjeldne gyldne klikk gir massiv burst.",
    cost: 76000,
    rarity: "epic",
    unlock: {
      type: "total_eggs",
      value: 70000,
      label: "Samle 70 000 egg totalt",
    },
    effect: {
      type: "golden_click",
      chance: 0.08,
      multiplier: 3,
    },
  },
];

export const UPGRADE_MAP: Record<UpgradeId, UpgradeDefinition> = Object.fromEntries(
  UPGRADE_DEFINITIONS.map((upgrade) => [upgrade.id, upgrade]),
) as Record<UpgradeId, UpgradeDefinition>;
