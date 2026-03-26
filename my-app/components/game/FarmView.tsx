"use client";

import Image from "next/image";
import type { UnitId } from "@/types/game";

interface FarmUnit {
  id: UnitId;
  iconSrc: string;
  owned: number;
}

interface FarmViewProps {
  units: FarmUnit[];
}

const LAYOUT: Record<UnitId, { xBase: number; cols: number; row?: number }> = {
  chicken:              { xBase: 10,  cols: 8 },
  coop:                 { xBase: 15,  cols: 5, row: 1 },
  barn_worker:          { xBase: 80,  cols: 5 },
  feed_cart:            { xBase: 155, cols: 5 },
  egg_sorter:           { xBase: 230, cols: 4 },
  conveyor:             { xBase: 300, cols: 4 },
  mechanical_harvester: { xBase: 370, cols: 3 },
  robo_farmer:          { xBase: 440, cols: 3 },
};

export function FarmView({ units }: FarmViewProps) {
  return (
    <div className="farm-canvas">
      <div className="farm-sprite-layer">
        {units.map((unit) => {
          if (unit.owned === 0) return null;
          const layout = LAYOUT[unit.id];
          const count = Math.min(unit.owned, layout.cols * 2);

          return Array.from({ length: count }).map((_, i) => {
            const col = i % layout.cols;
            const row = Math.floor(i / layout.cols);
            const x = layout.xBase + col * 52;
            const yOffset = row * 36;

            return (
              <div
                key={`${unit.id}-${i}`}
                className="farm-sprite"
                data-unit={unit.id}
                style={
                  {
                    left: `${x}px`,
                    bottom: `calc(22% + ${yOffset}px)`,
                    "--unit-delay": `${i * 0.38}s`,
                    "--farm-range": `${30 + col * 6}px`,
                  } as React.CSSProperties
                }
              >
                <Image
                  src={unit.iconSrc}
                  width={32}
                  height={32}
                  alt=""
                  unoptimized
                />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
