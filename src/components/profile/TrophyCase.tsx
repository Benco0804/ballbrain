import { BADGES, BADGE_DISPLAY_ORDER } from "@/lib/badges/constants";

const TIER_EARNED: Record<string, string> = {
  bronze:   "border-amber-600/70  bg-amber-600/10",
  silver:   "border-zinc-400/70   bg-zinc-400/10",
  gold:     "border-yellow-400/70 bg-yellow-400/10",
  platinum: "border-purple-400/70 bg-purple-400/10",
};

const CATEGORY_LABELS: Record<string, string> = {
  milestone:  "Milestone",
  streak:     "Streak",
  perfection: "Perfection",
  mastery:    "Mastery",
  volume:     "Volume",
  rank:       "Rank",
};

interface TrophyCaseProps {
  earnedBadgeIds: Set<string>;
  earnedAt: Record<string, string>; // badge_id → ISO timestamp
}

function formatEarned(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TrophyCase({ earnedBadgeIds, earnedAt }: TrophyCaseProps) {
  // Group badges by category in display order
  const groups: Record<string, string[]> = {};
  for (const id of BADGE_DISPLAY_ORDER) {
    const badge = BADGES[id];
    if (!badge) continue;
    if (!groups[badge.category]) groups[badge.category] = [];
    groups[badge.category].push(id);
  }

  const categoryOrder = ["milestone", "streak", "perfection", "mastery", "volume", "rank"];

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Trophy Case</h2>

      {categoryOrder.map((cat) => {
        const ids = groups[cat];
        if (!ids?.length) return null;

        return (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ids.map((id) => {
                const badge = BADGES[id];
                const isEarned = earnedBadgeIds.has(id);
                const earnedDate = isEarned ? earnedAt[id] : null;

                if (isEarned) {
                  return (
                    <div
                      key={id}
                      className={`rounded-xl border px-3 py-3 flex flex-col items-center text-center gap-1.5 ${TIER_EARNED[badge.tier] ?? ""}`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-xs font-bold text-white leading-tight">{badge.name}</p>
                      {earnedDate && (
                        <p className="text-[10px] text-zinc-500">{formatEarned(earnedDate)}</p>
                      )}
                    </div>
                  );
                }

                // Locked — greyed out with padlock; visible so players see what to chase
                return (
                  <div
                    key={id}
                    className="relative rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 flex flex-col items-center text-center gap-1.5 opacity-40"
                  >
                    <span className="text-2xl grayscale">{badge.icon}</span>
                    <p className="text-xs font-bold text-zinc-500 leading-tight">{badge.name}</p>
                    <span className="absolute top-1.5 right-1.5 text-[10px] text-zinc-600">🔒</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
