import type { Metadata } from "next";
import SportsGrid from "@/components/grid/SportsGrid";

export const metadata: Metadata = {
  title: "Sports Grid — BallBrain",
  description: "Daily sports trivia grid. Fill every cell to win.",
};

const ROW_CATEGORIES = [
  { label: "Played for the Lakers", sport: "NBA" as const },
  { label: "Super Bowl Champion", sport: "NFL" as const },
  { label: "UCL Winner", sport: "Soccer" as const },
];

const COL_CATEGORIES = [
  { label: "10+ Seasons", sport: "NBA" as const },
  { label: "Pro Bowl Selection", sport: "NFL" as const },
  { label: "50+ International Caps", sport: "Soccer" as const },
];

export default function SportsGridPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sports Grid</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Saturday, March 28 &middot; Daily Puzzle
            </p>
          </div>
          <div className="flex gap-3 text-sm font-semibold">
            <span className="rounded-full bg-yellow-500/10 text-yellow-400 px-3 py-1 border border-yellow-500/30">
              9 guesses left
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800">
          <div className="h-1.5 rounded-full bg-yellow-400 w-0 transition-all" />
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-2xl">
        <SportsGrid rowCategories={ROW_CATEGORIES} colCategories={COL_CATEGORIES} />
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-xs text-zinc-600">
        Click a cell to select it, then enter a player&apos;s name.
      </p>
    </main>
  );
}
