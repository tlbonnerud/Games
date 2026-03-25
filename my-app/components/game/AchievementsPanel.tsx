import { formatNumber } from "@/lib/format";
import type { AchievementId } from "@/types/game";
import { PixelPanel } from "./PixelPanel";

interface AchievementCard {
  id: AchievementId;
  name: string;
  description: string;
  unlocked: boolean;
  unlockLabel: string;
  unlockProgress: {
    current: number;
    target: number;
    ratio: number;
  };
  isFresh: boolean;
}

interface AchievementsPanelProps {
  achievements: AchievementCard[];
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const completed = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <PixelPanel
      title="Achievements"
      subtitle={`${completed}/${achievements.length} låst opp`}
      className="h-full"
    >
      <div className="space-y-3">
        {achievements.map((achievement) => (
          <article
            key={achievement.id}
            className={`pixel-card ${achievement.unlocked ? "" : "is-locked"} ${
              achievement.isFresh ? "is-fresh" : ""
            }`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="pixel-heading text-[0.82rem] uppercase tracking-[0.07em]">
                {achievement.name}
              </h3>
              <span className="pixel-chip">
                {achievement.unlocked ? "Klar" : "Låst"}
              </span>
            </div>
            <p className="pixel-subtle text-sm">{achievement.description}</p>

            {!achievement.unlocked ? (
              <>
                <p className="pixel-subtle mt-2 text-sm">Krav: {achievement.unlockLabel}</p>
                <div className="pixel-progress mt-2">
                  <span style={{ width: `${achievement.unlockProgress.ratio * 100}%` }} />
                </div>
                <p className="pixel-subtle mt-1 text-sm">
                  {formatNumber(achievement.unlockProgress.current)} / {formatNumber(achievement.unlockProgress.target)}
                </p>
              </>
            ) : null}
          </article>
        ))}
      </div>
    </PixelPanel>
  );
}
