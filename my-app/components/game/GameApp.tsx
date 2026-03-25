"use client";

import { useMemo, useRef, useState } from "react";
import { AchievementsPanel } from "@/components/game/AchievementsPanel";
import { ClickArena, type FloatingGain } from "@/components/game/ClickArena";
import { EggMarketPanel } from "@/components/game/EggMarketPanel";
import { ResetModal } from "@/components/game/ResetModal";
import { ShopPanel } from "@/components/game/ShopPanel";
import { StatsPanel } from "@/components/game/StatsPanel";
import { ToastStack } from "@/components/game/ToastStack";
import { TopHud } from "@/components/game/TopHud";
import { UnlockBanner } from "@/components/game/UnlockBanner";
import { UpgradePanel } from "@/components/game/UpgradePanel";
import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { UNIT_DEFINITIONS } from "@/data/units";
import { UPGRADE_DEFINITIONS } from "@/data/upgrades";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CURRENCY_ICON, UNIT_ICON, getUpgradeIcon } from "@/data/icons";
import { getUnitCost, getUnitSellRefund } from "@/lib/economy";
import { describeUpgradeEffect, formatNumber } from "@/lib/format";
import { getTotalUnitsOwned } from "@/lib/game-state";
import { getUnlockProgress } from "@/lib/unlocks";

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
    freshAchievementUnlocks,
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
  const floatingIdRef = useRef(1);
  const lastFloatingAtRef = useRef(0);

  const totalUnits = useMemo(() => getTotalUnitsOwned(state.unitsOwned), [state.unitsOwned]);

  const unlockedUnitSet = useMemo(() => new Set(unlockedUnitIds), [unlockedUnitIds]);
  const unlockedUpgradeSet = useMemo(
    () => new Set(unlockedUpgradeIds),
    [unlockedUpgradeIds],
  );
  const achievementSet = useMemo(
    () => new Set(state.achievementsUnlocked),
    [state.achievementsUnlocked],
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
        isFresh: Boolean(freshUpgradeUnlocks[upgrade.id]),
      };
    });
  }, [freshUpgradeUnlocks, state, unlockedUpgradeSet]);

  const achievementCards = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      unlocked: achievementSet.has(achievement.id),
      unlockLabel: achievement.unlock.label,
      unlockProgress: getUnlockProgress(achievement.unlock, state),
      isFresh: Boolean(freshAchievementUnlocks[achievement.id]),
    }));
  }, [achievementSet, freshAchievementUnlocks, state]);

  const onArenaClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const gain = handleManualClick();
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

    const now = Date.now();
    if (now - lastFloatingAtRef.current < 220) {
      return;
    }
    lastFloatingAtRef.current = now;

    setFloatingGains([nextGain]);
    window.setTimeout(() => {
      setFloatingGains((prev) => prev.filter((entry) => entry.id !== floatingId));
    }, 900);
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

      <main className="game-shell">
        <TopHud
          eggIconSrc={CURRENCY_ICON.egg}
          coinIconSrc={CURRENCY_ICON.coin}
          eggs={state.eggs}
          coins={state.coins}
          eggsPerSecond={state.eggsPerSecond}
          coinsPerSecond={state.coinsPerSecond}
          clickPower={state.clickPower}
          totalUnits={totalUnits}
          audioEnabled={state.audioEnabled}
          onToggleAudio={toggleAudio}
        />

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4 xl:row-span-2">
            <ClickArena
              floatingGains={floatingGains}
              onManualClick={onArenaClick}
              goldenClickChance={state.goldenClickChance}
            />
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
              onRequestReset={() => setShowResetModal(true)}
            />
          </div>

          <ShopPanel
            units={unitCards}
            coinIconSrc={CURRENCY_ICON.coin}
            onBuyUnit={buyUnit}
            onSellUnit={sellUnit}
          />
          <UpgradePanel
            upgrades={upgradeCards}
            coinIconSrc={CURRENCY_ICON.coin}
            onBuyUpgrade={buyUpgrade}
          />

          <div className="xl:col-span-2">
            <AchievementsPanel achievements={achievementCards} />
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
