import Image from "next/image";
import { formatNumber, formatRate } from "@/lib/format";
import type { UnitId } from "@/types/game";
import { PixelPanel } from "./PixelPanel";

interface UnitOverviewCard {
  id: UnitId;
  iconSrc: string;
  name: string;
  owned: number;
  unlocked: boolean;
  unlockLabel: string;
  unlockProgress: {
    current: number;
    target: number;
    ratio: number;
  };
  singleProduction: number;
  totalProduction: number;
}

interface UnitOverviewPanelProps {
  units: UnitOverviewCard[];
}

export function UnitOverviewPanel({ units }: UnitOverviewPanelProps) {
  return (
    <PixelPanel
      title="Enhetsområde"
      subtitle="Produksjonsoversikt per enhet"
      className="farm-scroll-panel"
      bodyClassName="panel-scroll-content"
      bodyRegionLabel="Enhetsområde med scroll"
    >
      <div className="space-y-3">
        {units.map((unit) => (
          <article
            key={unit.id}
            className={`pixel-card unit-overview-card ${unit.unlocked ? "" : "is-locked"}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="shop-icon-tile" aria-hidden>
                  <Image src={unit.iconSrc} alt="" width={26} height={26} />
                </span>
                <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
                  {unit.name}
                </h3>
              </div>
              <span className="pixel-chip">x{formatNumber(unit.owned)}</span>
            </div>

            {unit.unlocked ? (
              <div className="grid gap-1">
                <p className="pixel-subtle">Per unit: {formatRate(unit.singleProduction)}</p>
                <p className="pixel-subtle">Totalt: {formatRate(unit.totalProduction)}</p>
              </div>
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
        ))}
      </div>
    </PixelPanel>
  );
}
