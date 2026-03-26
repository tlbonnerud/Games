import { useMemo, useState } from "react";
import Image from "next/image";
import { formatNumber } from "@/lib/format";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { Rarity, UpgradeId } from "@/types/game";
import { PixelPanel } from "./PixelPanel";
import { TooltipHint } from "./TooltipHint";

type UpgradeCategory = "Klikk" | "Produksjon" | "Marked" | "Spesial";
type UpgradeTab = "available" | "purchased";
type UpgradeFilter = "all" | "unlocked" | "affordable";
type UpgradeSort = "cost" | "rarity" | "name";

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

function sortUpgrades(items: UpgradeCard[], sortBy: UpgradeSort): UpgradeCard[] {
  const sorted = [...items];
  if (sortBy === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortBy === "rarity") {
    return sorted.sort((a, b) => rarityWeight[b.rarity] - rarityWeight[a.rarity]);
  }
  return sorted.sort((a, b) => a.cost - b.cost);
}

function UpgradeEntry({
  upgrade,
  coinIconSrc,
  onBuyUpgrade,
}: {
  upgrade: UpgradeCard;
  coinIconSrc: string;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
}) {
  const disabled = !upgrade.unlocked || !upgrade.canAfford || upgrade.purchased;

  return (
    <article
      key={upgrade.id}
      className={`pixel-card rarity-${upgrade.rarity} ${
        upgrade.unlocked ? "" : "is-locked"
      } ${upgrade.isFresh ? "is-fresh" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="shop-icon-tile" aria-hidden>
            <Image src={upgrade.iconSrc} alt="" width={26} height={26} />
          </span>
          <div className="flex items-center gap-2">
            <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
              {upgrade.name}
            </h3>
            <TooltipHint label={`Info om ${upgrade.name}`}>
              {upgrade.description}
              <br />
              Effekt: {upgrade.effectText}
            </TooltipHint>
          </div>
        </div>
        <span className={`pixel-chip rarity-${upgrade.rarity}`}>{upgrade.rarity}</span>
      </div>
      <p className="pixel-subtle mt-1">{upgrade.effectText}</p>

      {upgrade.unlocked ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="pixel-subtle">Kostnad</span>
            <strong className="pixel-value with-inline-icon">
              <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
              {formatNumber(upgrade.cost)}
            </strong>
          </div>
          <button
            type="button"
            className="pixel-btn w-full"
            disabled={disabled}
            onClick={() => onBuyUpgrade(upgrade.id)}
          >
            {upgrade.canAfford ? "Kjøp oppgradering" : "Mangler mynter"}
          </button>
        </>
      ) : (
        <>
          <p className="pixel-subtle">Låses opp: {upgrade.unlockLabel}</p>
          <div className="pixel-progress mt-2">
            <span style={{ width: `${upgrade.unlockProgress.ratio * 100}%` }} />
          </div>
          <p className="pixel-subtle mt-1">
            {formatNumber(upgrade.unlockProgress.current)} / {formatNumber(upgrade.unlockProgress.target)}
          </p>
        </>
      )}
    </article>
  );
}

export function UpgradePanel({ upgrades, coinIconSrc, onBuyUpgrade }: UpgradePanelProps) {
  const [activeTab, setActiveTab] = usePersistentState<UpgradeTab>(
    "farm-upgrade-tab",
    "available",
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UpgradeFilter>("all");
  const [sortBy, setSortBy] = useState<UpgradeSort>("cost");

  const purchasedUpgrades = useMemo(
    () => sortUpgrades(upgrades.filter((upgrade) => upgrade.purchased), sortBy),
    [sortBy, upgrades],
  );

  const filteredAvailable = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const available = upgrades.filter((upgrade) => !upgrade.purchased);
    const matching = available.filter((upgrade) => {
      if (filter === "unlocked" && !upgrade.unlocked) {
        return false;
      }
      if (filter === "affordable" && (!upgrade.unlocked || !upgrade.canAfford)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return upgrade.name.toLowerCase().includes(normalizedQuery);
    });

    return sortUpgrades(matching, sortBy);
  }, [filter, query, sortBy, upgrades]);

  const categorizedAvailable = useMemo(() => {
    return CATEGORY_ORDER.map((category) => {
      const categoryItems = filteredAvailable.filter(
        (upgrade) => upgrade.category === category,
      );
      const unlockedItems = categoryItems.filter((upgrade) => upgrade.unlocked);
      const lockedItems = categoryItems.filter((upgrade) => !upgrade.unlocked);
      const purchasableCount = unlockedItems.filter((upgrade) => upgrade.canAfford).length;

      return {
        category,
        unlockedItems,
        lockedItems,
        total: categoryItems.length,
        purchasableCount,
      };
    }).filter((group) => group.total > 0);
  }, [filteredAvailable]);

  return (
    <PixelPanel
      title="Oppgraderinger"
      subtitle="Søk, filtrering og tydelig kategori-oppsett"
      className="farm-scroll-panel"
      bodyClassName="panel-scroll-content"
      bodyRegionLabel="Oppgraderingsliste med scroll"
    >
      <div className="panel-tab-row mb-3">
        <button
          type="button"
          className={`panel-tab ${activeTab === "available" ? "is-active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Tilgjengelige
        </button>
        <button
          type="button"
          className={`panel-tab ${activeTab === "purchased" ? "is-active" : ""}`}
          onClick={() => setActiveTab("purchased")}
        >
          Kjøpte
        </button>
      </div>

      <div className="panel-control-grid mb-3">
        <input
          type="search"
          className="pixel-input"
          placeholder="Søk oppgradering..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div>
          <p className="panel-control-label">Filter</p>
          <div className="panel-tab-row">
            <button
              type="button"
              className={`panel-tab ${filter === "all" ? "is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Alle
            </button>
            <button
              type="button"
              className={`panel-tab ${filter === "unlocked" ? "is-active" : ""}`}
              onClick={() => setFilter("unlocked")}
            >
              Opplåste
            </button>
            <button
              type="button"
              className={`panel-tab ${filter === "affordable" ? "is-active" : ""}`}
              onClick={() => setFilter("affordable")}
            >
              Kjøpbare nå
            </button>
          </div>
        </div>
        <div>
          <p className="panel-control-label">Sortering</p>
          <div className="panel-tab-row">
            <button
              type="button"
              className={`panel-tab ${sortBy === "cost" ? "is-active" : ""}`}
              onClick={() => setSortBy("cost")}
            >
              Kostnad
            </button>
            <button
              type="button"
              className={`panel-tab ${sortBy === "rarity" ? "is-active" : ""}`}
              onClick={() => setSortBy("rarity")}
            >
              Sjeldenhet
            </button>
            <button
              type="button"
              className={`panel-tab ${sortBy === "name" ? "is-active" : ""}`}
              onClick={() => setSortBy("name")}
            >
              Navn
            </button>
          </div>
        </div>
      </div>

      {activeTab === "available" ? (
        <div className="space-y-5">
          {categorizedAvailable.length === 0 ? (
            <p className="pixel-subtle">Ingen tilgjengelige oppgraderinger i dette filteret.</p>
          ) : null}

          {categorizedAvailable.map((group) => (
            <section key={group.category} className="upgrade-category-group">
              <div className="upgrade-category-header">
                <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.08em]">
                  {group.category}
                </h3>
                <span className="pixel-chip">
                  {group.purchasableCount}/{group.total} kjøpbare
                </span>
              </div>

              {group.unlockedItems.length > 0 ? (
                <div className="space-y-3">
                  {group.unlockedItems.map((upgrade) => (
                    <UpgradeEntry
                      key={upgrade.id}
                      upgrade={upgrade}
                      coinIconSrc={coinIconSrc}
                      onBuyUpgrade={onBuyUpgrade}
                    />
                  ))}
                </div>
              ) : null}

              {group.lockedItems.length > 0 ? (
                <div className="mt-3 space-y-3">
                  <p className="pixel-subtle">Låste i denne kategorien:</p>
                  {group.lockedItems.map((upgrade) => (
                    <UpgradeEntry
                      key={upgrade.id}
                      upgrade={upgrade}
                      coinIconSrc={coinIconSrc}
                      onBuyUpgrade={onBuyUpgrade}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {purchasedUpgrades.length === 0 ? (
            <p className="pixel-subtle">Du har ikke kjøpt noen oppgraderinger ennå.</p>
          ) : null}
          {purchasedUpgrades.map((upgrade) => (
            <article key={upgrade.id} className={`pixel-card rarity-${upgrade.rarity}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="shop-icon-tile" aria-hidden>
                    <Image src={upgrade.iconSrc} alt="" width={26} height={26} />
                  </span>
                  <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
                    {upgrade.name}
                  </h3>
                </div>
                <span className={`pixel-chip rarity-${upgrade.rarity}`}>{upgrade.rarity}</span>
              </div>
              <p className="pixel-subtle">{upgrade.description}</p>
              <p className="pixel-subtle mt-2">Effekt: {upgrade.effectText}</p>
              <p className="pixel-subtle mt-1">Kategori: {upgrade.category}</p>
            </article>
          ))}
        </div>
      )}
    </PixelPanel>
  );
}
