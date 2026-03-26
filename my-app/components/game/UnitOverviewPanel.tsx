import Image from "next/image";
import { formatNumber, formatRate } from "@/lib/format";
import type { UnitId } from "@/types/game";
import type { InspectPayload } from "./inspect";
import { PixelPanel } from "./PixelPanel";

interface UnitOverviewCard {
  id: UnitId;
  iconSrc: string;
  name: string;
  description: string;
  owned: number;
  cost: number;
  refund: number;
  canAfford: boolean;
  canSell: boolean;
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
  inspectPayload: InspectPayload | null;
  onInspectChange: (payload: InspectPayload | null) => void;
}

export function UnitOverviewPanel({
  units,
  inspectPayload,
  onInspectChange,
}: UnitOverviewPanelProps) {
  const ownedUnits = units
    .filter((unit) => unit.owned > 0)
    .sort((a, b) => b.owned - a.owned || a.cost - b.cost);

  const handleChipBlur = (event: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    onInspectChange(null);
  };

  const renderInspector = () => {
    if (!inspectPayload) {
      return (
        <div className="farm-inspector is-empty">
          <h3 className="pixel-heading text-[0.8rem] uppercase tracking-[0.07em]">
            Hover-inspektør
          </h3>
          <p className="pixel-subtle mt-2">
            Hold musepekeren over en rad i butikken for detaljer.
          </p>
          <p className="pixel-subtle mt-1">
            På mobil: trykk på en rad for å åpne/lukke informasjon.
          </p>
        </div>
      );
    }

    if (inspectPayload.kind === "unit") {
      return (
        <article className="farm-inspector is-active">
          <div className="farm-inspector-header">
            <div className="farm-inspector-title">
              <span className="shop-icon-tile" aria-hidden>
                <Image src={inspectPayload.iconSrc} alt="" width={24} height={24} />
              </span>
              <div>
                <h3 className="pixel-heading text-[0.8rem] uppercase tracking-[0.07em]">
                  {inspectPayload.name}
                </h3>
                <p className="farm-inspector-meta">Eid: x{formatNumber(inspectPayload.owned)}</p>
              </div>
            </div>
            <button
              type="button"
              className="panel-tab"
              onClick={() => onInspectChange(null)}
            >
              Lukk
            </button>
          </div>
          <p className="pixel-subtle mt-2">{inspectPayload.description}</p>
          {inspectPayload.unlocked ? (
            <dl className="farm-inspector-stats mt-3">
              <div>
                <dt>Per enhet</dt>
                <dd>{formatRate(inspectPayload.singleProduction)}</dd>
              </div>
              <div>
                <dt>Totalt</dt>
                <dd>{formatRate(inspectPayload.totalProduction)}</dd>
              </div>
              <div>
                <dt>Neste kostnad</dt>
                <dd>{formatNumber(inspectPayload.cost)}</dd>
              </div>
              <div>
                <dt>Refusjon ved salg</dt>
                <dd>{formatNumber(inspectPayload.refund)}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-3">
              <p className="pixel-subtle">{inspectPayload.unlockLabel}</p>
              <div className="pixel-progress mt-2">
                <span style={{ width: `${inspectPayload.unlockProgress.ratio * 100}%` }} />
              </div>
              <p className="pixel-subtle mt-1">
                {formatNumber(inspectPayload.unlockProgress.current)} /{" "}
                {formatNumber(inspectPayload.unlockProgress.target)}
              </p>
            </div>
          )}
        </article>
      );
    }

    return (
      <article className="farm-inspector is-active is-upgrade">
        <div className="farm-inspector-header">
          <div className="farm-inspector-title">
            <span className="shop-icon-tile" aria-hidden>
              <Image src={inspectPayload.iconSrc} alt="" width={24} height={24} />
            </span>
            <div>
              <h3 className="pixel-heading text-[0.8rem] uppercase tracking-[0.07em]">
                {inspectPayload.name}
              </h3>
              <p className="farm-inspector-meta">
                {inspectPayload.category} • {inspectPayload.purchased ? "Kjøpt" : "Ikke kjøpt"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="panel-tab"
            onClick={() => onInspectChange(null)}
          >
            Lukk
          </button>
        </div>
        <p className="pixel-subtle mt-2">{inspectPayload.description}</p>
        <p className="pixel-subtle mt-2">Effekt: {inspectPayload.effectText}</p>
        <dl className="farm-inspector-stats mt-3">
          <div>
            <dt>Kostnad</dt>
            <dd>{formatNumber(inspectPayload.cost)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {inspectPayload.purchased
                ? "Kjøpt"
                : inspectPayload.canAfford
                  ? "Kjøpbar"
                  : inspectPayload.unlocked
                    ? "Mangler mynter"
                    : "Låst"}
            </dd>
          </div>
        </dl>
        {!inspectPayload.unlocked ? (
          <div className="mt-3">
            <p className="pixel-subtle">{inspectPayload.unlockLabel}</p>
            <div className="pixel-progress mt-2">
              <span style={{ width: `${inspectPayload.unlockProgress.ratio * 100}%` }} />
            </div>
            <p className="pixel-subtle mt-1">
              {formatNumber(inspectPayload.unlockProgress.current)} /{" "}
              {formatNumber(inspectPayload.unlockProgress.target)}
            </p>
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <PixelPanel
      title="Midtbane"
      subtitle="Enheter du eier + detaljvisning på hover"
      className="farm-scroll-panel farm-middle-panel"
      bodyClassName="panel-scroll-content farm-middle-scroll"
      bodyRegionLabel="Midtbane med eierskap og hover-inspektør"
    >
      <div className="ownership-lane">
        {ownedUnits.length === 0 ? (
          <p className="pixel-subtle">Du eier ingen enheter ennå. Kjøp i butikken for å fylle banen.</p>
        ) : (
          ownedUnits.map((unit) => {
            const chipInspectPayload: InspectPayload = {
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
            const isActive =
              inspectPayload?.kind === "unit" && inspectPayload.id === unit.id;

            return (
              <button
                key={unit.id}
                type="button"
                className={`ownership-chip ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => onInspectChange(chipInspectPayload)}
                onMouseLeave={() => onInspectChange(null)}
                onFocus={() => onInspectChange(chipInspectPayload)}
                onBlur={handleChipBlur}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") {
                    return;
                  }
                  onInspectChange(isActive ? null : chipInspectPayload);
                }}
              >
                <span className="shop-icon-tile ownership-chip-icon" aria-hidden>
                  <Image src={unit.iconSrc} alt="" width={22} height={22} />
                </span>
                <span className="ownership-chip-label">{unit.name}</span>
                <span className="ownership-chip-count">x{formatNumber(unit.owned)}</span>
              </button>
            );
          })
        )}
      </div>

      {renderInspector()}
    </PixelPanel>
  );
}
