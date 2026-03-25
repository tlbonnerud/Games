import type { UnitDefinition, UnitId } from "@/types/game";

export const UNIT_IDS: UnitId[] = [
  "chicken",
  "coop",
  "feed_cart",
  "egg_sorter",
  "conveyor",
  "barn_worker",
  "mechanical_harvester",
  "robo_farmer",
];

export const UNIT_DEFINITIONS: UnitDefinition[] = [
  {
    id: "chicken",
    name: "Kylling",
    description: "En rask liten høne som legger egg jevnt.",
    baseCost: 10,
    growth: 1.15,
    baseProduction: 0.2,
    unlock: {
      type: "total_clicks",
      value: 0,
      label: "Starten av gården",
    },
  },
  {
    id: "coop",
    name: "Hønsehus",
    description: "Trygt hus med bedre rutiner og høyere eggflyt.",
    baseCost: 60,
    growth: 1.17,
    baseProduction: 1.2,
    unlock: {
      type: "total_eggs",
      value: 40,
      label: "Samle 40 egg totalt",
    },
  },
  {
    id: "feed_cart",
    name: "Fôrvogn",
    description: "Automatisk fôring som holder flokken effektiv.",
    baseCost: 250,
    growth: 1.18,
    baseProduction: 4,
    unlock: {
      type: "total_eggs",
      value: 180,
      label: "Samle 180 egg totalt",
    },
  },
  {
    id: "egg_sorter",
    name: "Egg-sorterer",
    description: "Sorterer og pakker egg med minimalt svinn.",
    baseCost: 900,
    growth: 1.19,
    baseProduction: 12,
    unlock: {
      type: "total_eggs",
      value: 600,
      label: "Samle 600 egg totalt",
    },
  },
  {
    id: "conveyor",
    name: "Transportbånd",
    description: "Kontinuerlig logistikk mellom hus, lager og marked.",
    baseCost: 3000,
    growth: 1.2,
    baseProduction: 35,
    unlock: {
      type: "total_eggs",
      value: 2200,
      label: "Samle 2 200 egg totalt",
    },
  },
  {
    id: "barn_worker",
    name: "Låvearbeider",
    description: "Menneskelig kapasitet gir bedre flyt og kontroll.",
    baseCost: 9000,
    growth: 1.21,
    baseProduction: 90,
    unlock: {
      type: "total_eggs",
      value: 8000,
      label: "Samle 8 000 egg totalt",
    },
  },
  {
    id: "mechanical_harvester",
    name: "Mekanisk innhøster",
    description: "Tung maskin som løfter produksjonen kraftig.",
    baseCost: 28000,
    growth: 1.22,
    baseProduction: 250,
    unlock: {
      type: "total_eggs",
      value: 25000,
      label: "Samle 25 000 egg totalt",
    },
  },
  {
    id: "robo_farmer",
    name: "Robo-bonde",
    description: "Autonom superenhet for ekte fabrikktempo.",
    baseCost: 92000,
    growth: 1.23,
    baseProduction: 700,
    unlock: {
      type: "total_eggs",
      value: 80000,
      label: "Samle 80 000 egg totalt",
    },
  },
];

export const UNIT_MAP: Record<UnitId, UnitDefinition> = Object.fromEntries(
  UNIT_DEFINITIONS.map((unit) => [unit.id, unit]),
) as Record<UnitId, UnitDefinition>;
