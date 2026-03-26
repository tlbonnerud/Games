"use client";

import Image from "next/image";
import { useState } from "react";
import { formatNumber, formatRate } from "@/lib/format";

export interface FloatingGain {
  id: number;
  x: number;
  y: number;
  eggText: string;
  coinText?: string;
  isGolden: boolean;
}

interface ClickArenaProps {
  floatingGains: FloatingGain[];
  onManualClick: (event: React.MouseEvent<HTMLButtonElement>) => boolean;
  goldenClickChance: number;
  eggs: number;
  coins: number;
  clickPower: number;
  eggsPerSecond: number;
  coinsPerSecond: number;
  eggIconSrc: string;
  coinIconSrc: string;
  showRateLimitWarning: boolean;
}

export function ClickArena({
  floatingGains,
  onManualClick,
  goldenClickChance,
  eggs,
  coins,
  clickPower,
  eggsPerSecond,
  coinsPerSecond,
  eggIconSrc,
  coinIconSrc,
  showRateLimitWarning,
}: ClickArenaProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const accepted = onManualClick(event);
    if (!accepted) {
      return;
    }

    setIsPressed(true);
    window.setTimeout(() => {
      setIsPressed(false);
    }, 130);
  };

  return (
    <section className="pixel-panel click-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="pixel-heading text-[1.06rem] uppercase tracking-[0.08em]">
          Gårdsplass
        </h2>
        <span className="pixel-subtle">
          Gyldent klikk: {Math.round(goldenClickChance * 100)}%
        </span>
      </div>

      <div className="arena-metrics">
        <p className="arena-metrics-main with-inline-icon">
          <Image src={eggIconSrc} alt="" width={22} height={22} aria-hidden />
          {formatNumber(eggs)} egg
        </p>
        <div className="arena-metrics-secondary">
          <span className="with-inline-icon">
            <Image src={coinIconSrc} alt="" width={17} height={17} aria-hidden />
            {formatNumber(coins)} coins
          </span>
          <span className="with-inline-icon">
            <Image src={eggIconSrc} alt="" width={17} height={17} aria-hidden />
            {formatRate(eggsPerSecond)} egg/s
          </span>
          <span className="with-inline-icon">
            <Image src={coinIconSrc} alt="" width={17} height={17} aria-hidden />
            {formatRate(coinsPerSecond)} coins/s
          </span>
          <span>Klikkstyrke: {formatNumber(clickPower)}</span>
        </div>
        {showRateLimitWarning ? (
          <p className="arena-warning">For raske klikk. Prøv et roligere tempo.</p>
        ) : null}
      </div>

      <div className="click-arena">
        <div className="walker-layer" aria-hidden>
          <Image
            src="/pixel-chicken.svg"
            alt=""
            width={48}
            height={48}
            className="walker walker-a"
          />
          <Image
            src="/pixel-chicken.svg"
            alt=""
            width={44}
            height={44}
            className="walker walker-b"
          />
        </div>
        <button
          type="button"
          aria-label="Samle egg"
          className={`chicken-button ${isPressed ? "is-pressed" : ""}`}
          onClick={handleClick}
        >
          <Image
            src="/pixel-chicken.svg"
            alt="Pixel kylling"
            width={184}
            height={184}
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
      </div>

      <p className="pixel-subtle mt-4">
        Klikk på kyllingen for å samle egg manuelt. Kjøp enheter for full automasjon.
      </p>
    </section>
  );
}
