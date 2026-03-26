"use client";

import Image from "next/image";
import { useState } from "react";

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
}

export function ClickArena({
  floatingGains,
  onManualClick,
  goldenClickChance,
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
        <h2 className="pixel-heading text-[0.92rem] uppercase tracking-[0.08em]">
          Gårdsplass
        </h2>
        <span className="pixel-subtle text-sm">
          Gyldent klikk: {Math.round(goldenClickChance * 100)}%
        </span>
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

      <p className="pixel-subtle mt-4 text-sm">
        Klikk på kyllingen for å samle egg manuelt. Kjøp units for full automasjon.
      </p>
    </section>
  );
}
