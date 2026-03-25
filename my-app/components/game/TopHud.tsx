import Image from "next/image";
import { formatNumber, formatRate } from "@/lib/format";

interface TopHudProps {
  eggIconSrc: string;
  coinIconSrc: string;
  eggs: number;
  coins: number;
  eggsPerSecond: number;
  coinsPerSecond: number;
  clickPower: number;
  totalUnits: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function TopHud({
  eggIconSrc,
  coinIconSrc,
  eggs,
  coins,
  eggsPerSecond,
  coinsPerSecond,
  clickPower,
  totalUnits,
  audioEnabled,
  onToggleAudio,
}: TopHudProps) {
  return (
    <header className="pixel-hud">
      <div className="pixel-hud-grid">
        <div className="pixel-hud-item eggs">
          <span className="pixel-hud-label with-icon">
            <Image src={eggIconSrc} alt="" width={18} height={18} aria-hidden />
            Egg
          </span>
          <span className="pixel-hud-value">{formatNumber(eggs)}</span>
        </div>
        <div className="pixel-hud-item coins">
          <span className="pixel-hud-label with-icon">
            <Image src={coinIconSrc} alt="" width={18} height={18} aria-hidden />
            Coins
          </span>
          <span className="pixel-hud-value">{formatNumber(coins)}</span>
        </div>
        <div className="pixel-hud-item rate">
          <span className="pixel-hud-label with-icon">
            <Image src={eggIconSrc} alt="" width={16} height={16} aria-hidden />
            Egg/s
          </span>
          <span className="pixel-hud-value">{formatRate(eggsPerSecond)}</span>
        </div>
        <div className="pixel-hud-item rate">
          <span className="pixel-hud-label with-icon">
            <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
            Pot. coins/s
          </span>
          <span className="pixel-hud-value">{formatRate(coinsPerSecond)}</span>
        </div>
        <div className="pixel-hud-item power">
          <span className="pixel-hud-label">Klikkstyrke</span>
          <span className="pixel-hud-value">{formatNumber(clickPower)}</span>
        </div>
        <div className="pixel-hud-item units">
          <span className="pixel-hud-label">Units</span>
          <span className="pixel-hud-value">{formatNumber(totalUnits)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="pixel-toggle" type="button" onClick={onToggleAudio}>
          Lyd: {audioEnabled ? "På" : "Av"}
        </button>
        <p className="economy-note">
          Selg egg i markedsboden for å få coins.
        </p>
      </div>
    </header>
  );
}
