"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { UNIT_DEFINITIONS, UNIT_MAP } from "@/data/units";
import { UPGRADE_DEFINITIONS, UPGRADE_MAP } from "@/data/upgrades";
import { createAudioController } from "@/lib/audio";
import {
  COINS_PER_EGG,
  applyTick,
  applyUpgrade,
  canAfford,
  getUnitCost,
  getUnitSellRefund,
  recomputeProduction,
} from "@/lib/economy";
import {
  PRESTIGE_UNLOCK_EGGS,
  createInitialGameState,
} from "@/lib/game-state";
import { loadSave, resetSave, saveGame } from "@/lib/save";
import {
  isUnitUnlocked,
  isUnlockConditionMet,
  isUpgradeUnlocked,
} from "@/lib/unlocks";
import type {
  AchievementId,
  GameAction,
  GameState,
  ToastItem,
  UnitId,
  UpgradeId,
} from "@/types/game";

const AUTO_SAVE_INTERVAL_MS = 10_000;
const TICK_RESOLUTION_SECONDS = 0.1;
const FRESH_UNLOCK_MS = 12_000;
const MANUAL_CLICK_LIMIT_PER_SECOND = 8;
const MANUAL_CLICK_BUCKET_CAPACITY = 4;

function finalizeState(
  state: GameState,
  options: { recomputeRates?: boolean } = {},
): GameState {
  const next = options.recomputeRates === false ? state : recomputeProduction(state);

  const unlockedAchievements = ACHIEVEMENT_DEFINITIONS.filter((achievement) =>
    isUnlockConditionMet(achievement.unlock, next),
  ).map((achievement) => achievement.id);

  const prestigeReady = next.totalEggsEarned >= PRESTIGE_UNLOCK_EGGS;

  const sameAchievements =
    unlockedAchievements.length === next.achievementsUnlocked.length &&
    unlockedAchievements.every((id, index) => id === next.achievementsUnlocked[index]);

  if (sameAchievements && prestigeReady === next.prestigeReady) {
    return next;
  }

  return {
    ...next,
    achievementsUnlocked: unlockedAchievements,
    prestigeReady,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return finalizeState(
        {
          ...action.payload,
          lastUpdated: Date.now(),
        },
        { recomputeRates: true },
      );

    case "TICK":
      return finalizeState(applyTick(state, action.deltaSeconds), {
        recomputeRates: false,
      });

    case "CLICK":
      return finalizeState(
        {
          ...state,
          eggs: state.eggs + action.eggsGain,
          totalEggsEarned: state.totalEggsEarned + action.eggsGain,
          totalClicks: state.totalClicks + 1,
          lastUpdated: Date.now(),
        },
        { recomputeRates: false },
      );

    case "SELL_EGGS": {
      const eggsAmount = Math.max(0, Math.min(action.eggsAmount, state.eggs));
      if (eggsAmount <= 0) {
        return state;
      }

      const coinsGain = eggsAmount * COINS_PER_EGG * state.coinMultiplier;

      return finalizeState(
        {
          ...state,
          eggs: state.eggs - eggsAmount,
          coins: state.coins + coinsGain,
          totalCoinsEarned: state.totalCoinsEarned + coinsGain,
          lastUpdated: Date.now(),
        },
        { recomputeRates: false },
      );
    }

    case "BUY_UNIT": {
      if (!canAfford(state.coins, action.cost)) {
        return state;
      }

      return finalizeState(
        {
          ...state,
          coins: state.coins - action.cost,
          unitsOwned: {
            ...state.unitsOwned,
            [action.unitId]: state.unitsOwned[action.unitId] + 1,
          },
          lastUpdated: Date.now(),
        },
        { recomputeRates: true },
      );
    }

    case "BUY_UPGRADE": {
      if (!canAfford(state.coins, action.cost)) {
        return state;
      }

      if (state.purchasedUpgrades.includes(action.upgradeId)) {
        return state;
      }

      const upgrade = UPGRADE_MAP[action.upgradeId];
      if (!upgrade) {
        return state;
      }

      const afterSpend = {
        ...state,
        coins: state.coins - action.cost,
        lastUpdated: Date.now(),
      };

      return finalizeState(applyUpgrade(afterSpend, upgrade), {
        recomputeRates: true,
      });
    }

    case "SELL_UNIT": {
      if (state.unitsOwned[action.unitId] <= 0) {
        return state;
      }

      return finalizeState(
        {
          ...state,
          coins: state.coins + action.refund,
          unitsOwned: {
            ...state.unitsOwned,
            [action.unitId]: state.unitsOwned[action.unitId] - 1,
          },
          lastUpdated: Date.now(),
        },
        { recomputeRates: true },
      );
    }

    case "TOGGLE_AUDIO":
      return {
        ...state,
        audioEnabled: !state.audioEnabled,
      };

    case "RESET": {
      const resetState = createInitialGameState();
      return {
        ...resetState,
        audioEnabled: action.keepAudio,
      };
    }

    default:
      return state;
  }
}

function removeFreshMarker<T extends string>(
  source: Partial<Record<T, boolean>>,
  key: T,
): Partial<Record<T, boolean>> {
  if (!source[key]) {
    return source;
  }

  const next = { ...source };
  delete next[key];
  return next;
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialGameState(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [freshUnitUnlocks, setFreshUnitUnlocks] = useState<
    Partial<Record<UnitId, boolean>>
  >({});
  const [freshUpgradeUnlocks, setFreshUpgradeUnlocks] = useState<
    Partial<Record<UpgradeId, boolean>>
  >({});
  const [freshAchievementUnlocks, setFreshAchievementUnlocks] = useState<
    Partial<Record<AchievementId, boolean>>
  >({});

  const audioController = useMemo(() => createAudioController(), []);

  const nextToastIdRef = useRef(1);
  const bannerTimeoutRef = useRef<number | null>(null);
  const latestStateRef = useRef(state);
  const manualClickBucketRef = useRef({
    tokens: MANUAL_CLICK_BUCKET_CAPACITY,
    lastRefillAt: performance.now(),
  });

  const unlockTrackingReadyRef = useRef(false);
  const previousUnlockedUnitsRef = useRef<Set<UnitId>>(new Set());
  const previousUnlockedUpgradesRef = useRef<Set<UpgradeId>>(new Set());
  const previousUnlockedAchievementsRef = useRef<Set<AchievementId>>(new Set());

  useEffect(() => {
    const loaded = loadSave();
    if (loaded) {
      dispatch({ type: "HYDRATE", payload: loaded });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const addToast = useCallback((kind: ToastItem["kind"], message: string) => {
    const toastId = nextToastIdRef.current;
    nextToastIdRef.current += 1;

    setToasts((prev) => [...prev, { id: toastId, kind, message }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    }, 4200);
  }, []);

  const showBanner = useCallback((message: string) => {
    setBannerMessage(message);

    if (bannerTimeoutRef.current !== null) {
      window.clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = window.setTimeout(() => {
      setBannerMessage(null);
      bannerTimeoutRef.current = null;
    }, 2800);
  }, []);

  const persistSoon = useCallback(() => {
    window.setTimeout(() => {
      saveGame(latestStateRef.current);
    }, 0);
  }, []);

  const dismissToast = useCallback((toastId: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current !== null) {
        window.clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frameId = 0;
    let last = performance.now();
    let accumulated = 0;

    const loop = (now: number) => {
      const deltaSeconds = (now - last) / 1000;
      last = now;
      accumulated += deltaSeconds;

      if (accumulated >= TICK_RESOLUTION_SECONDS) {
        dispatch({ type: "TICK", deltaSeconds: accumulated });
        accumulated = 0;
      }

      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      saveGame(latestStateRef.current);
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const flushSave = () => {
      saveGame(latestStateRef.current);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushSave();
      }
    };

    window.addEventListener("beforeunload", flushSave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", flushSave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const unlockedUnitIds = useMemo(
    () =>
      UNIT_DEFINITIONS.filter((unit) => isUnitUnlocked(unit, state)).map(
        (unit) => unit.id,
      ),
    [state],
  );

  const unlockedUpgradeIds = useMemo(
    () =>
      UPGRADE_DEFINITIONS.filter((upgrade) =>
        isUpgradeUnlocked(upgrade, state),
      ).map((upgrade) => upgrade.id),
    [state],
  );

  useEffect(() => {
    const currentUnitSet = new Set(unlockedUnitIds);
    const currentUpgradeSet = new Set(unlockedUpgradeIds);
    const currentAchievementSet = new Set(state.achievementsUnlocked);

    if (!unlockTrackingReadyRef.current) {
      unlockTrackingReadyRef.current = true;
      previousUnlockedUnitsRef.current = currentUnitSet;
      previousUnlockedUpgradesRef.current = currentUpgradeSet;
      previousUnlockedAchievementsRef.current = currentAchievementSet;
      return;
    }

    const newUnitUnlocks = [...currentUnitSet].filter(
      (unitId) => !previousUnlockedUnitsRef.current.has(unitId),
    );

    const newUpgradeUnlocks = [...currentUpgradeSet].filter(
      (upgradeId) => !previousUnlockedUpgradesRef.current.has(upgradeId),
    );

    const newAchievementUnlocks = [...currentAchievementSet].filter(
      (achievementId) => !previousUnlockedAchievementsRef.current.has(achievementId),
    );

    previousUnlockedUnitsRef.current = currentUnitSet;
    previousUnlockedUpgradesRef.current = currentUpgradeSet;
    previousUnlockedAchievementsRef.current = currentAchievementSet;

    if (
      newUnitUnlocks.length === 0 &&
      newUpgradeUnlocks.length === 0 &&
      newAchievementUnlocks.length === 0
    ) {
      return;
    }

    window.setTimeout(() => {
      for (const unitId of newUnitUnlocks) {
        addToast("unlock", `Ny unit låst opp: ${UNIT_MAP[unitId].name}`);
        showBanner(`Låste opp ${UNIT_MAP[unitId].name}!`);
        setFreshUnitUnlocks((prev) => ({ ...prev, [unitId]: true }));
        audioController.play("unlock", state.audioEnabled);

        window.setTimeout(() => {
          setFreshUnitUnlocks((prev) => removeFreshMarker(prev, unitId));
        }, FRESH_UNLOCK_MS);
      }

      for (const upgradeId of newUpgradeUnlocks) {
        addToast("unlock", `Ny oppgradering klar: ${UPGRADE_MAP[upgradeId].name}`);
        showBanner(`Oppgradering klar: ${UPGRADE_MAP[upgradeId].name}`);
        setFreshUpgradeUnlocks((prev) => ({ ...prev, [upgradeId]: true }));
        audioController.play("unlock", state.audioEnabled);

        window.setTimeout(() => {
          setFreshUpgradeUnlocks((prev) => removeFreshMarker(prev, upgradeId));
        }, FRESH_UNLOCK_MS);
      }

      for (const achievementId of newAchievementUnlocks) {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(
          (entry) => entry.id === achievementId,
        );

        addToast(
          "achievement",
          `Achievement: ${achievement?.name ?? "Ukjent prestasjon"}`,
        );
        setFreshAchievementUnlocks((prev) => ({ ...prev, [achievementId]: true }));

        window.setTimeout(() => {
          setFreshAchievementUnlocks((prev) =>
            removeFreshMarker(prev, achievementId),
          );
        }, FRESH_UNLOCK_MS);
      }
    }, 0);
  }, [
    addToast,
    audioController,
    showBanner,
    state.achievementsUnlocked,
    state.audioEnabled,
    unlockedUnitIds,
    unlockedUpgradeIds,
  ]);

  const handleManualClick = useCallback(() => {
    const now = performance.now();
    const bucket = manualClickBucketRef.current;
    const elapsedSeconds = Math.max(0, (now - bucket.lastRefillAt) / 1000);
    bucket.tokens = Math.min(
      MANUAL_CLICK_BUCKET_CAPACITY,
      bucket.tokens + elapsedSeconds * MANUAL_CLICK_LIMIT_PER_SECOND,
    );
    bucket.lastRefillAt = now;

    if (bucket.tokens < 1) {
      const missingTokens = 1 - bucket.tokens;
      return {
        accepted: false as const,
        retryInMs: Math.ceil((missingTokens / MANUAL_CLICK_LIMIT_PER_SECOND) * 1000),
      };
    }

    bucket.tokens -= 1;

    const current = latestStateRef.current;
    const isGolden =
      current.goldenClickChance > 0 && Math.random() < current.goldenClickChance;
    const eggGain = current.clickPower * (isGolden ? current.goldenClickMultiplier : 1);

    dispatch({ type: "CLICK", eggsGain: eggGain, coinsGain: 0 });
    audioController.play("click", current.audioEnabled);

    return {
      accepted: true as const,
      eggGain,
      coinGain: 0,
      isGolden,
    };
  }, [audioController]);

  const sellEggs = useCallback(
    (ratio: number) => {
      const current = latestStateRef.current;
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const eggsAmount = Math.floor(current.eggs * clampedRatio);

      if (eggsAmount <= 0) {
        return false;
      }

      dispatch({ type: "SELL_EGGS", eggsAmount });
      audioController.play("purchase", current.audioEnabled);
      persistSoon();
      return true;
    },
    [audioController, persistSoon],
  );

  const buyUnit = useCallback(
    (unitId: UnitId) => {
      const current = latestStateRef.current;
      const unit = UNIT_MAP[unitId];

      if (!isUnitUnlocked(unit, current)) {
        return false;
      }

      const cost = getUnitCost(unit, current.unitsOwned[unitId]);
      if (!canAfford(current.coins, cost)) {
        return false;
      }

      dispatch({ type: "BUY_UNIT", unitId, cost });
      audioController.play("purchase", current.audioEnabled);
      persistSoon();
      return true;
    },
    [audioController, persistSoon],
  );

  const buyUpgrade = useCallback(
    (upgradeId: UpgradeId) => {
      const current = latestStateRef.current;
      const upgrade = UPGRADE_MAP[upgradeId];

      if (current.purchasedUpgrades.includes(upgradeId)) {
        return false;
      }

      if (!isUpgradeUnlocked(upgrade, current)) {
        return false;
      }

      if (!canAfford(current.coins, upgrade.cost)) {
        return false;
      }

      dispatch({ type: "BUY_UPGRADE", upgradeId, cost: upgrade.cost });
      audioController.play("purchase", current.audioEnabled);
      persistSoon();
      return true;
    },
    [audioController, persistSoon],
  );

  const sellUnit = useCallback(
    (unitId: UnitId) => {
      const current = latestStateRef.current;
      const unit = UNIT_MAP[unitId];
      const owned = current.unitsOwned[unitId];

      if (owned <= 0) {
        return false;
      }

      const refund = getUnitSellRefund(unit, owned);
      if (refund <= 0) {
        return false;
      }

      dispatch({ type: "SELL_UNIT", unitId, refund });
      audioController.play("purchase", current.audioEnabled);
      persistSoon();
      return true;
    },
    [audioController, persistSoon],
  );

  const toggleAudio = useCallback(() => {
    dispatch({ type: "TOGGLE_AUDIO" });
    persistSoon();
  }, [persistSoon]);

  const resetGame = useCallback(() => {
    const keepAudio = latestStateRef.current.audioEnabled;
    dispatch({ type: "RESET", keepAudio });
    resetSave();
    persistSoon();
    addToast("system", "Fremdrift nullstilt.");
    showBanner("Ny sesjon startet!");
  }, [addToast, persistSoon, showBanner]);

  return {
    state,
    isHydrated,
    unlockedUnitIds,
    unlockedUpgradeIds,
    toasts,
    bannerMessage,
    freshUnitUnlocks,
    freshUpgradeUnlocks,
    freshAchievementUnlocks,
    handleManualClick,
    sellEggs,
    buyUnit,
    sellUnit,
    buyUpgrade,
    toggleAudio,
    resetGame,
    dismissToast,
  };
}
