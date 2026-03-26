import { useMemo, useState } from "react";
import Image from "next/image";
import { formatNumber } from "@/lib/format";
import type { UnitId } from "@/types/game";
import type { InspectPayload } from "./inspect";
import { PixelPanel } from "./PixelPanel";

interface ShopCard {
  id: UnitId;
  iconSrc: string;
  name: string;
  description: string;
  owned: number;
  cost: number;
  refund: number;
  unlocked: boolean;
  canAfford: boolean;
  canSell: boolean;
  unlockLabel: string;
  unlockProgress: {
    current: number;
    target: number;
    ratio: number;
  };
  totalProduction: number;
  singleProduction: number;
  isFresh: boolean;
}

interface ShopPanelProps {
  units: ShopCard[];
  coinIconSrc: string;
  totalUnits: number;
  onBuyUnit: (unitId: UnitId, quantity?: number) => void;
  onSellUnit: (unitId: UnitId, quantity?: number) => void;
  inspectPayload: InspectPayload | null;
  onInspectChange: (payload: InspectPayload | null) => void;
}

type BuyAmount = 1 | 10 | 100;

function UnitEntry({
  unit,
  coinIconSrc,
  buyAmount,
  inspectPayload,
  onBuyUnit,
  onSellUnit,
  onInspectChange,
}: {
  unit: ShopCard;
  coinIconSrc: string;
  buyAmount: BuyAmount;
  inspectPayload: InspectPayload | null;
  onBuyUnit: (unitId: UnitId, quantity?: number) => void;
  onSellUnit: (unitId: UnitId, quantity?: number) => void;
  onInspectChange: (payload: InspectPayload | null) => void;
}) {
  const buyDisabled = !unit.unlocked || !unit.canAfford;
  const rowStatusClass = !unit.unlocked
    ? "is-locked"
    : unit.canAfford
      ? "is-affordable"
      : "is-unaffordable";
  const nextInspectPayload: InspectPayload = {
    kind: "unit",
    id: unit.id,
    iconSrc: unit.iconSrc,
    name: unit.name,
    description: unit.description,
    owned: unit.owned,
    cost: unit.cost,
    refund: unit.refund,
    unlocked: unit.unlocked,
    canAfford: unit.canAfford,
    canSell: unit.canSell,
    unlockLabel: unit.unlockLabel,
    unlockProgress: unit.unlockProgress,
    singleProduction: unit.singleProduction,
    totalProduction: unit.totalProduction,
  };
  const isInspecting = inspectPayload?.kind === "unit" && inspectPayload.id === unit.id;

  const openInspect = () => {
    onInspectChange(nextInspectPayload);
  };

  const closeInspect = () => {
    onInspectChange(null);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    closeInspect();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onInspectChange(isInspecting ? null : nextInspectPayload);
  };

  return (
    <article
      key={unit.id}
      className={`store-row ${rowStatusClass} ${unit.owned > 0 ? "is-owned" : ""} ${
        unit.isFresh ? "is-fresh" : ""
      } ${isInspecting ? "is-inspecting" : ""}`}
      tabIndex={0}
      onMouseEnter={openInspect}
      onMouseLeave={closeInspect}
      onFocus={openInspect}
      onBlur={handleBlur}
      onPointerUp={handlePointerUp}
    >
      <div className="store-row-main">
        <div className="store-row-title">
          <span className="shop-icon-tile store-row-icon" aria-hidden>
            <Image src={unit.iconSrc} alt="" width={24} height={24} />
          </span>
          <div className="store-row-title-copy">
            <h3 className="pixel-heading store-row-name">{unit.name}</h3>
          </div>
        </div>
      </div>

      <div className="store-row-side">
        <strong className="store-price with-inline-icon">
          <Image src={coinIconSrc} alt="" width={14} height={14} aria-hidden />
          {formatNumber(unit.cost)}
        </strong>
      </div>

      {unit.unlocked ? (
        <div className="store-row-actions">
          <button
            type="button"
            className="pixel-btn store-action-btn"
            disabled={buyDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onBuyUnit(unit.id, buyAmount);
            }}
          >
            Kjøp
          </button>
          <button
            type="button"
            className="pixel-btn store-action-btn sell"
            disabled={!unit.canSell}
            onClick={(event) => {
              event.stopPropagation();
              onSellUnit(unit.id, buyAmount);
            }}
          >
            Selg
          </button>
        </div>
      ) : null}

      {!unit.unlocked ? (
        <div className="store-row-lock">
          <div className="pixel-progress">
            <span style={{ width: `${unit.unlockProgress.ratio * 100}%` }} />
          </div>
          <p className="store-row-lock-progress">
            {unit.unlockLabel} •{" "}
            {formatNumber(unit.unlockProgress.current)} / {formatNumber(unit.unlockProgress.target)}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function ShopPanel({
  units,
  coinIconSrc,
  totalUnits,
  onBuyUnit,
  onSellUnit,
  inspectPayload,
  onInspectChange,
}: ShopPanelProps) {
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1);

  const visibleUnits = useMemo(
    () =>
      [...units].sort((a, b) => {
        if (a.unlocked !== b.unlocked) {
          return a.unlocked ? -1 : 1;
        }
        if (a.unlocked && b.unlocked && a.canAfford !== b.canAfford) {
          return a.canAfford ? -1 : 1;
        }
        return a.cost - b.cost;
      }),
    [units],
  );

  const unlockedCount = units.filter((unit) => unit.unlocked).length;

  return (
    <PixelPanel
      title="Enhetsbutikk"
      subtitle={`${unlockedCount}/${units.length} opplåst • kompakt visning`}
      rightSlot={<span className="pixel-chip">x{formatNumber(totalUnits)}</span>}
      className="farm-scroll-panel farm-store-panel"
      bodyClassName="panel-scroll-content store-panel-scroll"
      bodyRegionLabel="Enhetsbutikk med kompakt scroll-liste"
    >
      <div className="store-toolbar">
        <span className="store-toolbar-label">Kjøp/Selg mengde</span>
        <div className="panel-tab-row store-amount-tabs" role="group" aria-label="Kjøpsmengde">
          {[1, 10, 100].map((amount) => (
            <button
              key={amount}
              type="button"
              className={`panel-tab ${buyAmount === amount ? "is-active" : ""}`}
              onClick={() => setBuyAmount(amount as BuyAmount)}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      <div className="store-list">
        {visibleUnits.map((unit) => (
          <UnitEntry
            key={unit.id}
            unit={unit}
            coinIconSrc={coinIconSrc}
            buyAmount={buyAmount}
            inspectPayload={inspectPayload}
            onBuyUnit={onBuyUnit}
            onSellUnit={onSellUnit}
            onInspectChange={onInspectChange}
          />
        ))}
      </div>
    </PixelPanel>
  );
}
