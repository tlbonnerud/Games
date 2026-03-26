"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type FloatingGain } from "@/components/game/ClickArena";
import { CompactShop } from "@/components/game/CompactShop";
import { FarmView } from "@/components/game/FarmView";
import { LeftPanel } from "@/components/game/LeftPanel";
import { ResetModal } from "@/components/game/ResetModal";
import { ToastStack } from "@/components/game/ToastStack";
import { UnlockBanner } from "@/components/game/UnlockBanner";
import { UNIT_DEFINITIONS } from "@/data/units";
import { UPGRADE_DEFINITIONS } from "@/data/upgrades";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CURRENCY_ICON, UNIT_ICON, getUpgradeIcon } from "@/data/icons";
import { getUnitCost, getUnitSellRefund } from "@/lib/economy";
import { describeUpgradeEffect, formatNumber } from "@/lib/format";
import { getUnlockProgress } from "@/lib/unlocks";

type UpgradeCategory = "Klikk" | "Produksjon" | "Marked" | "Spesial";

export function GameApp() {
  const {
    state,
    isHydrated,
    unlockedUnitIds,
    unlockedUpgradeIds,
    toasts,
    bannerMessage,
    freshUnitUnlocks,
    freshUpgradeUnlocks,
    handleManualClick,
    sellEggs,
    buyUnit,
    buyUpgrade,
    toggleAudio,
    resetGame,
    dismissToast,
  } = useGameEngine();

  const [floatingGains, setFloatingGains] = useState<FloatingGain[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const floatingIdRef = useRef(1);
  const rateLimitWarningTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rateLimitWarningTimeoutRef.current !== null) {
        window.clearTimeout(rateLimitWarningTimeoutRef.current);
      }
    };
  }, []);

  const unlockedUnitSet = useMemo(() => new Set(unlockedUnitIds), [unlockedUnitIds]);
  const unlockedUpgradeSet = useMemo(
    () => new Set(unlockedUpgradeIds),
    [unlockedUpgradeIds],
  );

  const unitCards = useMemo(() => {
    return UNIT_DEFINITIONS.map((unit) => {
      const owned = state.unitsOwned[unit.id];
      const cost = getUnitCost(unit, owned);
      const unlocked = unlockedUnitSet.has(unit.id);
      const unlockProgress = getUnlockProgress(unit.unlock, state);
      const singleProduction =
        unit.baseProduction * state.unitMultipliers[unit.id] * state.globalProductionMultiplier;
      const refund = getUnitSellRefund(unit, owned);

      return {
        id: unit.id,
        iconSrc: UNIT_ICON[unit.id],
        name: unit.name,
        description: unit.description,
        owned,
        cost,
        refund,
        unlocked,
        canAfford: state.coins >= cost,
        canSell: owned > 0,
        unlockLabel: unit.unlock.label,
        unlockProgress,
        singleProduction,
        totalProduction: singleProduction * owned,
        isFresh: Boolean(freshUnitUnlocks[unit.id]),
      };
    });
  }, [freshUnitUnlocks, state, unlockedUnitSet]);

  const upgradeCards = useMemo(() => {
    return UPGRADE_DEFINITIONS.map((upgrade) => {
      const purchased = state.purchasedUpgrades.includes(upgrade.id);
      const category: UpgradeCategory =
        upgrade.effect.type === "click_mult"
          ? "Klikk"
          : upgrade.effect.type === "coin_mult"
            ? "Marked"
            : upgrade.effect.type === "golden_click"
              ? "Spesial"
              : "Produksjon";

      return {
        id: upgrade.id,
        iconSrc: getUpgradeIcon(upgrade.effect),
        name: upgrade.name,
        description: upgrade.description,
        cost: upgrade.cost,
        rarity: upgrade.rarity,
        unlocked: unlockedUpgradeSet.has(upgrade.id),
        purchased,
        canAfford: state.coins >= upgrade.cost,
        unlockLabel: upgrade.unlock.label,
        unlockProgress: getUnlockProgress(upgrade.unlock, state),
        effectText: describeUpgradeEffect(upgrade.effect),
        category,
        isFresh: Boolean(freshUpgradeUnlocks[upgrade.id]),
      };
    });
  }, [freshUpgradeUnlocks, state, unlockedUpgradeSet]);

  const buyUnitBatch = (unitId: (typeof unitCards)[number]["id"], amount = 1) => {
    const safeAmount = Math.max(1, Math.floor(amount));
    for (let i = 0; i < safeAmount; i += 1) {
      if (!buyUnit(unitId)) break;
    }
  };

  const onArenaClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const outcome = handleManualClick();
    if (!outcome.accepted) {
      if (rateLimitWarningTimeoutRef.current !== null) {
        window.clearTimeout(rateLimitWarningTimeoutRef.current);
      }
      setShowRateLimitWarning(true);
      rateLimitWarningTimeoutRef.current = window.setTimeout(() => {
        setShowRateLimitWarning(false);
        rateLimitWarningTimeoutRef.current = null;
      }, Math.max(280, Math.min(900, outcome.retryInMs)));
      return false;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    const floatingId = floatingIdRef.current;
    floatingIdRef.current += 1;

    const nextGain: FloatingGain = {
      id: floatingId,
      x,
      y,
      eggText: `${outcome.isGolden ? "GYLDEN " : ""}+${formatNumber(outcome.eggGain)} egg`,
      coinText: undefined,
      isGolden: outcome.isGolden,
    };

    setFloatingGains((prev) => [...prev.slice(-5), nextGain]);
    window.setTimeout(() => {
      setFloatingGains((prev) => prev.filter((e) => e.id !== floatingId));
    }, 900);

    return true;
  };

  if (!isHydrated) {
    return (
      <main className="game-shell">
        <section className="pixel-panel text-center">
          <h1 className="pixel-heading text-[1rem] uppercase tracking-[0.09em]">
            Laster kyllingfabrikk...
          </h1>
        </section>
      </main>
    );
  }

  const farmUnits = unitCards.map((u) => ({ id: u.id, iconSrc: u.iconSrc, owned: u.owned }));

  return (
    <>
      <UnlockBanner message={bannerMessage} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="farm-page">
        <div className="cc-shell">
          <LeftPanel
            eggs={state.eggs}
            coins={state.coins}
            eggsPerSecond={state.eggsPerSecond}
            coinsPerSecond={state.coinsPerSecond}
            audioEnabled={state.audioEnabled}
            floatingGains={floatingGains}
            showRateLimitWarning={showRateLimitWarning}
            onManualClick={onArenaClick}
            onSellEggs={sellEggs}
            onToggleAudio={toggleAudio}
            onRequestReset={() => setShowResetModal(true)}
            eggIconSrc={CURRENCY_ICON.egg}
            coinIconSrc={CURRENCY_ICON.coin}
          />
          <FarmView units={farmUnits} />
          <CompactShop
            units={unitCards}
            upgrades={upgradeCards}
            onBuyUnit={buyUnitBatch}
            onBuyUpgrade={buyUpgrade}
          />
        </div>
      </div>

      <ResetModal
        open={showResetModal}
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          resetGame();
          setShowResetModal(false);
        }}
      />
    </>
  );
}
