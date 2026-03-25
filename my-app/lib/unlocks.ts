import type {
  GameState,
  UnlockCondition,
  UnitDefinition,
  UpgradeDefinition,
} from "@/types/game";

export function isUnlockConditionMet(
  condition: UnlockCondition,
  state: GameState,
): boolean {
  switch (condition.type) {
    case "total_eggs":
      return state.totalEggsEarned >= condition.value;
    case "total_coins":
      return state.totalCoinsEarned >= condition.value;
    case "total_clicks":
      return state.totalClicks >= condition.value;
    case "units_owned": {
      if (condition.unitId) {
        return state.unitsOwned[condition.unitId] >= condition.value;
      }

      const totalUnitsOwned = Object.values(state.unitsOwned).reduce(
        (sum, current) => sum + current,
        0,
      );
      return totalUnitsOwned >= condition.value;
    }
    default:
      return false;
  }
}

export function isUnitUnlocked(unit: UnitDefinition, state: GameState): boolean {
  return isUnlockConditionMet(unit.unlock, state);
}

export function isUpgradeUnlocked(
  upgrade: UpgradeDefinition,
  state: GameState,
): boolean {
  return isUnlockConditionMet(upgrade.unlock, state);
}

export function getUnlockProgress(condition: UnlockCondition, state: GameState): {
  current: number;
  target: number;
  ratio: number;
} {
  let current = 0;

  switch (condition.type) {
    case "total_eggs":
      current = state.totalEggsEarned;
      break;
    case "total_coins":
      current = state.totalCoinsEarned;
      break;
    case "total_clicks":
      current = state.totalClicks;
      break;
    case "units_owned":
      if (condition.unitId) {
        current = state.unitsOwned[condition.unitId];
      } else {
        current = Object.values(state.unitsOwned).reduce(
          (sum, owned) => sum + owned,
          0,
        );
      }
      break;
    default:
      current = 0;
  }

  const target = condition.value;
  const ratio = target <= 0 ? 1 : Math.min(1, current / target);

  return { current, target, ratio };
}
