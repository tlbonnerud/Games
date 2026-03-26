"use client";

import Image from "next/image";
import { formatNumber, formatRate } from "@/lib/format";
import type { UnitId, UpgradeId } from "@/types/game";

interface UnitCard {
  id: UnitId;
  iconSrc: string;
  name: string;
  description: string;
  owned: number;
  cost: number;
  unlocked: boolean;
  canAfford: boolean;
  unlockLabel: string;
  unlockProgress: { ratio: number; current: number; target: number };
  singleProduction: number;
  totalProduction: number;
}

interface UpgradeCard {
  id: UpgradeId;
  iconSrc: string;
  name: string;
  description: string;
  cost: number;
  rarity: "common" | "rare" | "epic";
  unlocked: boolean;
  purchased: boolean;
  canAfford: boolean;
  unlockLabel: string;
  unlockProgress: { ratio: number; current: number; target: number };
  effectText: string;
}

interface CompactShopProps {
  units: UnitCard[];
  upgrades: UpgradeCard[];
  onBuyUnit: (id: UnitId, qty?: number) => void;
  onBuyUpgrade: (id: UpgradeId) => void;
}

export function CompactShop({ units, upgrades, onBuyUnit, onBuyUpgrade }: CompactShopProps) {
  const availableUpgrades = upgrades.filter((u) => !u.purchased);

  return (
    <div className="cshop">
      <div className="cshop-scroll">
        <div className="cshop-label">Enheter</div>

        {units.map((unit) => (
          <button
            key={unit.id}
            type="button"
            className={`cshop-unit-row${unit.canAfford && unit.unlocked ? " can-afford" : ""}${!unit.unlocked ? " is-locked" : ""}`}
            onClick={() => {
              if (unit.unlocked && unit.canAfford) onBuyUnit(unit.id, 1);
            }}
            disabled={!unit.unlocked}
          >
            <Image src={unit.iconSrc} width={24} height={24} alt="" unoptimized />
            <span className="cshop-unit-name">{unit.name}</span>
            <span className="cshop-unit-owned">{unit.owned}</span>
            <span className={unit.canAfford ? "price-green" : "price-red"}>
              {formatNumber(unit.cost)}
            </span>

            <div className="cshop-tooltip">
              <strong>{unit.name}</strong>
              <div style={{ marginTop: "0.15rem", color: "var(--ink-soft)" }}>
                {unit.description}
              </div>
              {unit.unlocked ? (
                <div className="cshop-tooltip-rate">
                  {formatRate(unit.singleProduction)} egg/s per enhet
                  {unit.owned > 0 && (
                    <span> · {formatRate(unit.totalProduction)} totalt</span>
                  )}
                </div>
              ) : (
                <div className="cshop-tooltip-progress">
                  Låses opp: {unit.unlockLabel}
                  <div className="cshop-tooltip-bar">
                    <div
                      className="cshop-tooltip-bar-fill"
                      style={{ width: `${unit.unlockProgress.ratio * 100}%` }}
                    />
                  </div>
                  <div style={{ color: "var(--ink-soft)", marginTop: "0.15rem" }}>
                    {formatNumber(unit.unlockProgress.current)} /{" "}
                    {formatNumber(unit.unlockProgress.target)}
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}

        {availableUpgrades.length > 0 && (
          <>
            <div className="cshop-divider" />
            <div className="cshop-label">Oppgraderinger</div>

            {availableUpgrades.map((upgrade) => (
              <button
                key={upgrade.id}
                type="button"
                className={`cshop-upgrade-row${upgrade.canAfford && upgrade.unlocked ? " can-afford" : ""}`}
                onClick={() => {
                  if (upgrade.unlocked && upgrade.canAfford) onBuyUpgrade(upgrade.id);
                }}
                disabled={!upgrade.unlocked}
              >
                <Image src={upgrade.iconSrc} width={20} height={20} alt="" unoptimized />
                <span className="cshop-upgrade-name">{upgrade.name}</span>
                <span className={`cshop-rarity-dot rarity-${upgrade.rarity}`} />
                <span className={upgrade.canAfford && upgrade.unlocked ? "price-green" : "price-red"}>
                  {formatNumber(upgrade.cost)}
                </span>

                <div className="cshop-tooltip">
                  <strong>{upgrade.name}</strong>
                  <div style={{ marginTop: "0.15rem", color: "var(--ink-soft)" }}>
                    {upgrade.effectText}
                  </div>
                  {!upgrade.unlocked && (
                    <div className="cshop-tooltip-progress">
                      Låses opp: {upgrade.unlockLabel}
                      <div className="cshop-tooltip-bar">
                        <div
                          className="cshop-tooltip-bar-fill"
                          style={{ width: `${upgrade.unlockProgress.ratio * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
