import Image from "next/image";
import { formatNumber } from "@/lib/format";
import { PixelPanel } from "./PixelPanel";

interface EggMarketPanelProps {
  eggs: number;
  coinMultiplier: number;
  eggIconSrc: string;
  coinIconSrc: string;
  onSellEggs: (ratio: number) => void;
}

const CONVERSION_RATE = 0.25;

export function EggMarketPanel({
  eggs,
  coinMultiplier,
  eggIconSrc,
  coinIconSrc,
  onSellEggs,
}: EggMarketPanelProps) {
  const estimatedCoins = eggs * CONVERSION_RATE * coinMultiplier;

  return (
    <PixelPanel
      title="Markedsbod"
      subtitle="Selg egg for coins"
      className="market-panel"
    >
      <div className="market-summary">
        <div className="market-row">
          <span className="with-inline-icon">
            <Image src={eggIconSrc} alt="" width={16} height={16} aria-hidden />
            Egg på lager
          </span>
          <strong className="pixel-value">{formatNumber(eggs)}</strong>
        </div>
        <div className="market-row">
          <span className="with-inline-icon">
            <Image src={coinIconSrc} alt="" width={16} height={16} aria-hidden />
            Verdi ved salg
          </span>
          <strong className="pixel-value">{formatNumber(estimatedCoins)}</strong>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" className="pixel-btn" onClick={() => onSellEggs(0.25)}>
          Selg 25%
        </button>
        <button type="button" className="pixel-btn" onClick={() => onSellEggs(0.5)}>
          Selg 50%
        </button>
        <button type="button" className="pixel-btn" onClick={() => onSellEggs(1)}>
          Selg alt
        </button>
      </div>

      <p className="pixel-subtle mt-3 text-sm">
        Rate: 1 egg = {CONVERSION_RATE} coins x {formatNumber(coinMultiplier)}.
      </p>
    </PixelPanel>
  );
}
