import Image from "next/image";
import { formatNumber } from "@/lib/format";
import type { Rarity, UpgradeId } from "@/types/game";
import { PixelPanel } from "./PixelPanel";
import { TooltipHint } from "./TooltipHint";

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
  isFresh: boolean;
}

interface UpgradePanelProps {
  upgrades: UpgradeCard[];
  coinIconSrc: string;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
}

export function UpgradePanel({ upgrades, coinIconSrc, onBuyUpgrade }: UpgradePanelProps) {
  return (
    <PixelPanel
      title="Oppgraderinger"
      subtitle="Permanente boosts for klikk og fabrikk"
      className="min-h-[22rem]"
    >
      <div className="space-y-3">
        {upgrades.map((upgrade) => {
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
              <p className="pixel-subtle mt-1 text-sm">{upgrade.effectText}</p>

              {upgrade.unlocked ? (
                <>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="pixel-subtle">Kostnad</span>
                    <strong className="pixel-value text-sm with-inline-icon">
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
                    {upgrade.purchased
                      ? "Kjøpt"
                      : upgrade.canAfford
                        ? "Aktiver"
                        : "Mangler coins"}
                  </button>
                </>
              ) : (
                <>
                  <p className="pixel-subtle text-sm">Låses opp: {upgrade.unlockLabel}</p>
                  <div className="pixel-progress mt-2">
                    <span style={{ width: `${upgrade.unlockProgress.ratio * 100}%` }} />
                  </div>
                  <p className="pixel-subtle mt-1 text-sm">
                    {formatNumber(upgrade.unlockProgress.current)} / {formatNumber(upgrade.unlockProgress.target)}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </PixelPanel>
  );
}
