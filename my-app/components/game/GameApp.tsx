"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ClickArena, type FloatingGain } from "@/components/game/ClickArena";
import { EggMarketPanel } from "@/components/game/EggMarketPanel";
import { ResetModal } from "@/components/game/ResetModal";
import { ShopPanel } from "@/components/game/ShopPanel";
import { StatsPanel } from "@/components/game/StatsPanel";
import { ToastStack } from "@/components/game/ToastStack";
import { UnitOverviewPanel } from "@/components/game/UnitOverviewPanel";
import { UnlockBanner } from "@/components/game/UnlockBanner";
import { UpgradePanel } from "@/components/game/UpgradePanel";
import { UNIT_DEFINITIONS } from "@/data/units";
import { UPGRADE_DEFINITIONS } from "@/data/upgrades";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CURRENCY_ICON, UNIT_ICON, getUpgradeIcon } from "@/data/icons";
import { getUnitCost, getUnitSellRefund } from "@/lib/economy";
import { describeUpgradeEffect, formatNumber } from "@/lib/format";
import { getTotalUnitsOwned } from "@/lib/game-state";
import { getUnlockProgress } from "@/lib/unlocks";
import type { InspectPayload } from "./inspect";

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
    sellUnit,
    buyUpgrade,
    toggleAudio,
    resetGame,
    dismissToast,
  } = useGameEngine();

  const [floatingGains, setFloatingGains] = useState<FloatingGain[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [rightPanelMode, setRightPanelMode] = usePersistentState<"units" | "upgrades">(
    "farm-right-panel-mode",
    "units",
  );
  const [inspectPayload, setInspectPayload] = useState<InspectPayload | null>(null);
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

  const totalUnits = useMemo(() => getTotalUnitsOwned(state.unitsOwned), [state.unitsOwned]);

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

  const sellUnitBatch = (unitId: (typeof unitCards)[number]["id"], amount = 1) => {
    const safeAmount = Math.max(1, Math.floor(amount));
    for (let i = 0; i < safeAmount; i += 1) {
      if (!sellUnit(unitId)) break;
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
    const gain = outcome;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    const floatingId = floatingIdRef.current;
    floatingIdRef.current += 1;

    const nextGain: FloatingGain = {
      id: floatingId,
      x,
      y,
      eggText: `${gain.isGolden ? "GYLDEN " : ""}+${formatNumber(gain.eggGain)} egg`,
      coinText: undefined,
      isGolden: gain.isGolden,
    };

    setFloatingGains((prev) => [...prev.slice(-5), nextGain]);
    window.setTimeout(() => {
      setFloatingGains((prev) => prev.filter((entry) => entry.id !== floatingId));
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

  return (
    <>
      <UnlockBanner message={bannerMessage} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main className="game-shell farm-game-shell">
        <section className="farm-main-layout">
          <div className="farm-focus-column">
            <ClickArena
              floatingGains={floatingGains}
              onManualClick={onArenaClick}
              goldenClickChance={state.goldenClickChance}
              eggs={state.eggs}
              coins={state.coins}
              clickPower={state.clickPower}
              eggsPerSecond={state.eggsPerSecond}
              coinsPerSecond={state.coinsPerSecond}
              eggIconSrc={CURRENCY_ICON.egg}
              coinIconSrc={CURRENCY_ICON.coin}
              showRateLimitWarning={showRateLimitWarning}
            />
            <div
              className="farm-focus-scroll"
              role="region"
              aria-label="Venstre panel: marked og kontrollsenter"
              tabIndex={0}
            >
              <EggMarketPanel
                eggs={state.eggs}
                coinMultiplier={state.coinMultiplier}
                eggIconSrc={CURRENCY_ICON.egg}
                coinIconSrc={CURRENCY_ICON.coin}
                onSellEggs={sellEggs}
              />
              <StatsPanel
                state={state}
                totalUnits={totalUnits}
                audioEnabled={state.audioEnabled}
                onToggleAudio={toggleAudio}
                onRequestReset={() => setShowResetModal(true)}
              />
            </div>
          </div>

          <div className="farm-scroll-column">
            <UnitOverviewPanel
              units={unitCards}
              inspectPayload={inspectPayload}
              onInspectChange={setInspectPayload}
            />
          </div>
          <div className="farm-scroll-column farm-control-column">
            <div className="panel-tab-row farm-side-switch farm-store-header">
              <button
                type="button"
                className={`panel-tab ${rightPanelMode === "units" ? "is-active" : ""}`}
                onClick={() => setRightPanelMode("units")}
              >
                Enhetsbutikk
              </button>
              <button
                type="button"
                className={`panel-tab ${rightPanelMode === "upgrades" ? "is-active" : ""}`}
                onClick={() => setRightPanelMode("upgrades")}
              >
                Oppgraderinger
              </button>
            </div>
            <div className="farm-store-body">
              {rightPanelMode === "units" ? (
                <ShopPanel
                  units={unitCards}
                  coinIconSrc={CURRENCY_ICON.coin}
                  totalUnits={totalUnits}
                  onBuyUnit={buyUnitBatch}
                  onSellUnit={sellUnitBatch}
                  inspectPayload={inspectPayload}
                  onInspectChange={setInspectPayload}
                />
              ) : (
                <UpgradePanel
                  upgrades={upgradeCards}
                  coinIconSrc={CURRENCY_ICON.coin}
                  onBuyUpgrade={buyUpgrade}
                  inspectPayload={inspectPayload}
                  onInspectChange={setInspectPayload}
                />
              )}
            </div>
          </div>
        </section>
      </main>

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
