import { useMemo } from "react";
import Image from "next/image";
import { formatNumber } from "@/lib/format";
import type { Rarity, UpgradeId } from "@/types/game";
import type { InspectPayload } from "./inspect";
import { PixelPanel } from "./PixelPanel";

type UpgradeCategory = "Klikk" | "Produksjon" | "Marked" | "Spesial";

interface UpgradeCard {
  id: UpgradeId;
  iconSrc: string;
  name: string;
  description: string;
  cost: number;
  rarity: Rarity;
  unlocked: boolean;
  purchased: boolean;
  canAfford: boolean;
  unlockLabel: string;
  unlockProgress: {
    current: number;
    target: number;
    ratio: number;
  };
  effectText: string;
  category: UpgradeCategory;
  isFresh: boolean;
}

interface UpgradePanelProps {
  upgrades: UpgradeCard[];
  coinIconSrc: string;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  inspectPayload: InspectPayload | null;
  onInspectChange: (payload: InspectPayload | null) => void;
}

const CATEGORY_ORDER: UpgradeCategory[] = [
  "Klikk",
  "Produksjon",
  "Marked",
  "Spesial",
];

const rarityWeight: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
};

function getUpgradeStatus(upgrade: UpgradeCard) {
  if (upgrade.purchased) {
    return "purchased" as const;
  }
  if (!upgrade.unlocked) {
    return "locked" as const;
  }
  if (upgrade.canAfford) {
    return "affordable" as const;
  }
  return "unaffordable" as const;
}

function sortUpgrades(items: UpgradeCard[]) {
  const statusOrder: Record<ReturnType<typeof getUpgradeStatus>, number> = {
    affordable: 0,
    unaffordable: 1,
    locked: 2,
    purchased: 3,
  };

  return [...items].sort((a, b) => {
    const statusDiff = statusOrder[getUpgradeStatus(a)] - statusOrder[getUpgradeStatus(b)];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    const rarityDiff = rarityWeight[b.rarity] - rarityWeight[a.rarity];
    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }

    return a.name.localeCompare(b.name);
  });
}

function UpgradeEntry({
  upgrade,
  coinIconSrc,
  inspectPayload,
  onBuyUpgrade,
  onInspectChange,
}: {
  upgrade: UpgradeCard;
  coinIconSrc: string;
  inspectPayload: InspectPayload | null;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onInspectChange: (payload: InspectPayload | null) => void;
}) {
  const status = getUpgradeStatus(upgrade);
  const disabled = status !== "affordable";
  const nextInspectPayload: InspectPayload = {
    kind: "upgrade",
    id: upgrade.id,
    iconSrc: upgrade.iconSrc,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.cost,
    rarity: upgrade.rarity,
    unlocked: upgrade.unlocked,
    purchased: upgrade.purchased,
    canAfford: upgrade.canAfford,
    unlockLabel: upgrade.unlockLabel,
    unlockProgress: upgrade.unlockProgress,
    effectText: upgrade.effectText,
    category: upgrade.category,
  };
  const isInspecting = inspectPayload?.kind === "upgrade" && inspectPayload.id === upgrade.id;

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
      key={upgrade.id}
      className={`store-row store-upgrade-row is-${status} rarity-${upgrade.rarity} ${
        upgrade.isFresh ? "is-fresh" : ""
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
            <Image src={upgrade.iconSrc} alt="" width={24} height={24} />
          </span>
          <div className="store-row-title-copy">
            <h3 className="pixel-heading store-row-name">{upgrade.name}</h3>
          </div>
        </div>
      </div>

      <div className="store-row-side">
        {upgrade.purchased ? <span className="store-row-badge">KJØPT</span> : null}
        {!upgrade.unlocked ? <span className="store-row-badge">LÅST</span> : null}
        <strong className="store-price with-inline-icon">
          <Image src={coinIconSrc} alt="" width={14} height={14} aria-hidden />
          {formatNumber(upgrade.cost)}
        </strong>
      </div>

      {upgrade.unlocked ? (
        <div className="store-row-actions single">
          <button
            type="button"
            className="pixel-btn store-action-btn"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onBuyUpgrade(upgrade.id);
            }}
          >
            {upgrade.purchased ? "Kjøpt" : upgrade.canAfford ? "Kjøp" : "Mangler mynter"}
          </button>
        </div>
      ) : (
        <div className="store-row-lock">
          <p className="store-row-meta">Låses opp: {upgrade.unlockLabel}</p>
          <div className="pixel-progress mt-2">
            <span style={{ width: `${upgrade.unlockProgress.ratio * 100}%` }} />
          </div>
          <p className="store-row-lock-progress">
            {formatNumber(upgrade.unlockProgress.current)} / {formatNumber(upgrade.unlockProgress.target)}
          </p>
        </div>
      )}
    </article>
  );
}

export function UpgradePanel({
  upgrades,
  coinIconSrc,
  onBuyUpgrade,
  inspectPayload,
  onInspectChange,
}: UpgradePanelProps) {
  const visibleUpgrades = useMemo(() => sortUpgrades(upgrades), [upgrades]);
  const purchasedCount = upgrades.filter((upgrade) => upgrade.purchased).length;

  return (
    <PixelPanel
      title="Oppgraderinger"
      subtitle={`${purchasedCount}/${upgrades.length} kjøpt • detaljer via hover-inspektør`}
      className="farm-scroll-panel farm-store-panel"
      bodyClassName="panel-scroll-content store-panel-scroll"
      bodyRegionLabel="Oppgraderingsliste med kompakt scroll"
    >
      <div className="store-list">
        {visibleUpgrades.map((upgrade) => (
          <UpgradeEntry
            key={upgrade.id}
            upgrade={upgrade}
            coinIconSrc={coinIconSrc}
            inspectPayload={inspectPayload}
            onBuyUpgrade={onBuyUpgrade}
            onInspectChange={onInspectChange}
          />
        ))}
      </div>
    </PixelPanel>
  );
}
