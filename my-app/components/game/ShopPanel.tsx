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
  onBuyUnit: (unitId: UnitId) => void;
  onSellUnit: (unitId: UnitId) => void;
}

export function ShopPanel({ units, coinIconSrc, onBuyUnit, onSellUnit }: ShopPanelProps) {
  return (
    <PixelPanel
      title="Unit Shop"
      subtitle="Kjøp og selg produksjonsenheter"
      className="min-h-[22rem]"
    >
      <div className="space-y-3">
        {units.map((unit) => {
          const disabled = !unit.unlocked || !unit.canAfford;

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
              <p className="pixel-subtle mt-1 text-sm">
                {unit.owned} eid • {formatRate(unit.totalProduction)} totalt
              </p>

              {unit.unlocked ? (
                <>
                  <div className="mb-2 grid gap-2 text-sm">
                    <div className="cost-row">
                      <span className="pixel-subtle">Kjøp</span>
                      <strong className="pixel-value text-sm with-inline-icon">
                        <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
                        {formatNumber(unit.cost)}
                      </strong>
                    </div>
                    <div className="cost-row">
                      <span className="pixel-subtle">Selg (60%)</span>
                      <strong className="pixel-value text-sm with-inline-icon">
                        <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
                        {formatNumber(unit.refund)}
                      </strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="pixel-btn w-full"
                      disabled={disabled}
                      onClick={() => onBuyUnit(unit.id)}
                    >
                      {unit.canAfford ? "Kjøp" : "Mangler"}
                    </button>
                    <button
                      type="button"
                      className="pixel-btn w-full"
                      disabled={!unit.canSell}
                      onClick={() => onSellUnit(unit.id)}
                    >
                      Selg
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="pixel-subtle text-sm">Låses opp: {unit.unlockLabel}</p>
                  <div className="pixel-progress mt-2">
                    <span style={{ width: `${unit.unlockProgress.ratio * 100}%` }} />
                  </div>
                  <p className="pixel-subtle mt-1 text-sm">
                    {formatNumber(unit.unlockProgress.current)} / {formatNumber(unit.unlockProgress.target)}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
      <p className="pixel-subtle mt-4 text-sm">
        Units kjøpes og selges i coins. Egg selges i markedsboden.
      </p>
    </PixelPanel>
  );
}
