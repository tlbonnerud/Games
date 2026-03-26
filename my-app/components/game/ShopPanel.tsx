import { useMemo, useState } from "react";
import Image from "next/image";
import { formatNumber, formatRate } from "@/lib/format";
import type { UnitId } from "@/types/game";
import { PixelPanel } from "./PixelPanel";
import { TooltipHint } from "./TooltipHint";

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
}

type UnitSortMode = "cost" | "owned" | "production";

function UnitEntry({
  unit,
  coinIconSrc,
  onBuyUnit,
  onSellUnit,
}: {
  unit: ShopCard;
  coinIconSrc: string;
  onBuyUnit: (unitId: UnitId, quantity?: number) => void;
  onSellUnit: (unitId: UnitId, quantity?: number) => void;
}) {
  const buyDisabled = !unit.unlocked || !unit.canAfford;

  return (
    <article
      key={unit.id}
      className={`pixel-card ${unit.unlocked ? "" : "is-locked"} ${
        unit.isFresh ? "is-fresh" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="shop-icon-tile" aria-hidden>
            <Image src={unit.iconSrc} alt="" width={26} height={26} />
          </span>
          <div className="flex items-center gap-2">
            <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
              {unit.name}
            </h3>
            <TooltipHint label={`Info om ${unit.name}`}>
              {unit.description}
            </TooltipHint>
          </div>
        </div>
        <span className="pixel-chip">+{formatRate(unit.singleProduction)}</span>
      </div>

      <p className="pixel-subtle mt-1">
        {unit.owned} eid • {formatRate(unit.totalProduction)} totalt
      </p>

      {unit.unlocked ? (
        <>
          <div className="mb-2 grid gap-2">
            <div className="cost-row">
              <span className="pixel-subtle">Kostnad neste</span>
              <strong className="pixel-value with-inline-icon">
                <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
                {formatNumber(unit.cost)}
              </strong>
            </div>
            <div className="cost-row">
              <span className="pixel-subtle">Refusjon ved salg</span>
              <strong className="pixel-value with-inline-icon">
                <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
                {formatNumber(unit.refund)}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={buyDisabled}
              onClick={() => onBuyUnit(unit.id, 1)}
            >
              Kjøp 1
            </button>
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={!unit.unlocked}
              onClick={() => onBuyUnit(unit.id, 10)}
            >
              Kjøp 10
            </button>
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={!unit.unlocked}
              onClick={() => onBuyUnit(unit.id, 25)}
            >
              Kjøp 25
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={!unit.canSell}
              onClick={() => onSellUnit(unit.id, 1)}
            >
              Selg 1
            </button>
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={!unit.canSell}
              onClick={() => onSellUnit(unit.id, 10)}
            >
              Selg 10
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="pixel-subtle">Låses opp: {unit.unlockLabel}</p>
          <div className="pixel-progress mt-2">
            <span style={{ width: `${unit.unlockProgress.ratio * 100}%` }} />
          </div>
          <p className="pixel-subtle mt-1">
            {formatNumber(unit.unlockProgress.current)} / {formatNumber(unit.unlockProgress.target)}
          </p>
        </>
      )}
    </article>
  );
}

export function ShopPanel({
  units,
  coinIconSrc,
  totalUnits,
  onBuyUnit,
  onSellUnit,
}: ShopPanelProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<UnitSortMode>("cost");
  const [showLocked, setShowLocked] = useState(false);

  const visibleUnits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = units.filter((unit) => {
      if (!showLocked && !unit.unlocked) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return unit.name.toLowerCase().includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "owned") {
        return b.owned - a.owned;
      }
      if (sortMode === "production") {
        return b.totalProduction - a.totalProduction;
      }
      return a.cost - b.cost;
    });
  }, [query, showLocked, sortMode, units]);

  const unlockedCount = units.filter((unit) => unit.unlocked).length;

  return (
    <PixelPanel
      title="Enhetsbutikk"
      subtitle={`${unlockedCount}/${units.length} enheter låst opp`}
      rightSlot={<span className="pixel-chip">Enheter: {formatNumber(totalUnits)}</span>}
      className="farm-scroll-panel"
      bodyClassName="panel-scroll-content"
      bodyRegionLabel="Enhetsbutikk med scroll"
    >
      <div className="panel-control-grid mb-3">
        <input
          type="search"
          className="pixel-input"
          placeholder="Søk enhet..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div>
          <p className="panel-control-label">Sortering</p>
          <div className="panel-tab-row">
            <button
              type="button"
              className={`panel-tab ${sortMode === "cost" ? "is-active" : ""}`}
              onClick={() => setSortMode("cost")}
            >
              Kostnad
            </button>
            <button
              type="button"
              className={`panel-tab ${sortMode === "owned" ? "is-active" : ""}`}
              onClick={() => setSortMode("owned")}
            >
              Eierskap
            </button>
            <button
              type="button"
              className={`panel-tab ${sortMode === "production" ? "is-active" : ""}`}
              onClick={() => setSortMode("production")}
            >
              Produksjon
            </button>
          </div>
        </div>
        <div>
          <p className="panel-control-label">Visning</p>
          <div className="panel-tab-row">
            <button
              type="button"
              className={`panel-tab ${!showLocked ? "is-active" : ""}`}
              onClick={() => setShowLocked(false)}
            >
              Kun opplåste
            </button>
            <button
              type="button"
              className={`panel-tab ${showLocked ? "is-active" : ""}`}
              onClick={() => setShowLocked(true)}
            >
              Inkluder låste
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {visibleUnits.map((unit) => (
          <UnitEntry
            key={unit.id}
            unit={unit}
            coinIconSrc={coinIconSrc}
            onBuyUnit={onBuyUnit}
            onSellUnit={onSellUnit}
          />
        ))}
      </div>
      <p className="pixel-subtle mt-4">
        Kjøp enheter for automatisering. Selg egg i markedet for å finansiere vekst.
      </p>
    </PixelPanel>
  );
}
