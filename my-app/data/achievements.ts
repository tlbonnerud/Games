import type { AchievementDefinition } from "@/types/game";

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_cluck",
    name: "Første kakel",
    description: "Klikk én gang på kyllingen.",
    unlock: {
      type: "total_clicks",
      value: 1,
      label: "Nå 1 klikk",
    },
  },
  {
    id: "hundred_taps",
    name: "Hundre trykk",
    description: "Nå 100 totale klikk.",
    unlock: {
      type: "total_clicks",
      value: 100,
      label: "Nå 100 klikk",
    },
  },
  {
    id: "small_flock",
    name: "Liten flokk",
    description: "Eie 10 kyllinger.",
    unlock: {
      type: "units_owned",
      value: 10,
      unitId: "chicken",
      label: "Eie 10 kyllinger",
    },
  },
  {
    id: "first_coop",
    name: "Første hønsehus",
    description: "Bygg ditt første hønsehus.",
    unlock: {
      type: "units_owned",
      value: 1,
      unitId: "coop",
      label: "Eie 1 hønsehus",
    },
  },
  {
    id: "packing_line",
    name: "Pakkelinje",
    description: "Eie minst ett transportbånd.",
    unlock: {
      type: "units_owned",
      value: 1,
      unitId: "conveyor",
      label: "Eie 1 transportbånd",
    },
  },
  {
    id: "egg_tycoon",
    name: "Egg-tycoon",
    description: "Samle 10 000 egg totalt.",
    unlock: {
      type: "total_eggs",
      value: 10000,
      label: "Samle 10 000 egg",
    },
  },
  {
    id: "coin_collector",
    name: "Coin-samler",
    description: "Tjen 2 500 coins totalt.",
    unlock: {
      type: "total_coins",
      value: 2500,
      label: "Tjen 2 500 coins",
    },
  },
  {
    id: "automation_rising",
    name: "Automasjon i vekst",
    description: "Eie minst 40 units totalt.",
    unlock: {
      type: "units_owned",
      value: 40,
      label: "Eie 40 units totalt",
    },
  },
  {
    id: "barn_city",
    name: "Låveby",
    description: "Eie 12 låvearbeidere.",
    unlock: {
      type: "units_owned",
      value: 12,
      unitId: "barn_worker",
      label: "Eie 12 låvearbeidere",
    },
  },
  {
    id: "future_farm",
    name: "Framtidsfarm",
    description: "Bygg din første robo-bonde.",
    unlock: {
      type: "units_owned",
      value: 1,
      unitId: "robo_farmer",
      label: "Eie 1 robo-bonde",
    },
  },
];
