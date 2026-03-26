"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatNumber, formatRate } from "@/lib/format";
import type { FloatingGain } from "@/components/game/ClickArena";

interface LeftPanelProps {
  eggs: number;
  coins: number;
  eggsPerSecond: number;
  coinsPerSecond: number;
  audioEnabled: boolean;
  floatingGains: FloatingGain[];
  showRateLimitWarning: boolean;
  onManualClick: (event: React.MouseEvent<HTMLButtonElement>) => boolean;
  onSellEggs: (ratio: number) => void;
  onToggleAudio: () => void;
  onRequestReset: () => void;
  eggIconSrc: string;
  coinIconSrc: string;
}

export function LeftPanel({
  eggs,
  coins,
  eggsPerSecond,
  coinsPerSecond,
  audioEnabled,
  floatingGains,
  showRateLimitWarning,
  onManualClick,
  onSellEggs,
  onToggleAudio,
  onRequestReset,
  eggIconSrc,
  coinIconSrc,
}: LeftPanelProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const accepted = onManualClick(event);
    if (!accepted) return;
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 130);
  };

  return (
    <div className="left-panel">
      {/* Counters */}
      <div className="left-counters">
        <div className="left-counter-eggs">
          <Image src={eggIconSrc} alt="" width={18} height={18} aria-hidden />
          {formatNumber(eggs)} egg
        </div>
        <div className="left-counter-coins">
          <Image src={coinIconSrc} alt="" width={15} height={15} aria-hidden />
          {formatNumber(coins)} coins
        </div>
        <div className="left-counter-rates">
          <span>{formatRate(eggsPerSecond)}/s 🥚</span>
          <span>{formatRate(coinsPerSecond)}/s 🪙</span>
        </div>
      </div>

      {/* Click arena */}
      <div className="left-arena">
        <div className="walker-layer" aria-hidden>
          <Image src="/pixel-chicken.svg" alt="" width={38} height={38} className="walker walker-a" />
          <Image src="/pixel-chicken.svg" alt="" width={34} height={34} className="walker walker-b" />
        </div>
        <button
          type="button"
          aria-label="Samle egg"
          className={`chicken-button ${isPressed ? "is-pressed" : ""}`}
          onClick={handleClick}
        >
          <Image
            src="/pixel-chicken.svg"
            alt="Kylling"
            width={160}
            height={160}
            priority
            className="pixel-sprite"
          />
        </button>

        {floatingGains.map((gain) => (
          <div
            key={gain.id}
            className={`floating-gain ${gain.isGolden ? "is-golden" : ""}`}
            style={{ left: `${gain.x}%`, top: `${gain.y}%` }}
          >
            <span>{gain.eggText}</span>
            {gain.coinText ? <span>{gain.coinText}</span> : null}
          </div>
        ))}

        {showRateLimitWarning ? (
          <p className="arena-warning">Saktere!</p>
        ) : null}
      </div>

      {/* Sell eggs */}
      <div className="left-market">
        <button className="market-btn" type="button" onClick={() => onSellEggs(0.25)}>
          Selg 25%
        </button>
        <button className="market-btn" type="button" onClick={() => onSellEggs(0.5)}>
          Selg 50%
        </button>
        <button className="market-btn" type="button" onClick={() => onSellEggs(1)}>
          Selg alt
        </button>
      </div>

      {/* Footer */}
      <div className="left-footer">
        <Link href="/" className="left-footer-btn">
          ← Hub
        </Link>
        <button className="left-footer-btn" type="button" onClick={onToggleAudio}>
          {audioEnabled ? "🔊" : "🔇"}
        </button>
        <button className="left-footer-btn" type="button" onClick={onRequestReset}>
          ↺
        </button>
      </div>
    </div>
  );
}
