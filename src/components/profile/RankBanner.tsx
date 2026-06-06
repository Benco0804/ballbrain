import { XP } from "@/lib/economy/constants";
import { computeRankLevel } from "@/lib/economy/xp";

interface RankBannerProps {
  xp: number;
}

const LAST_RANK = XP.RANKS[XP.RANKS.length - 1];

export default function RankBanner({ xp }: RankBannerProps) {
  const { rankName, level, xpIntoLevel, xpForLevel, totalXp } = computeRankLevel(xp);

  const isMaxLevel = rankName === LAST_RANK.name && level === LAST_RANK.levels;
  const progressPct = isMaxLevel ? 100 : Math.round((xpIntoLevel / xpForLevel) * 100);

  let nextLabel: string;
  if (isMaxLevel) {
    nextLabel = "Max level";
  } else if (level === 10) {
    nextLabel = "to next rank";
  } else {
    nextLabel = `to L${level + 1}`;
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Rank</p>
          <p className="text-2xl font-bold">
            <span className="text-white">{rankName}</span>
            <span className="text-zinc-400 ml-2">L{level}</span>
          </p>
        </div>
        <p className="text-sm text-zinc-500">{totalXp.toLocaleString()} XP</p>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 text-right">
          {isMaxLevel
            ? "Max level reached"
            : `${xpIntoLevel.toLocaleString()} / ${xpForLevel.toLocaleString()} XP ${nextLabel}`}
        </p>
      </div>
    </div>
  );
}
