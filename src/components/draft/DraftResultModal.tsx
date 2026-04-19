"use client";

import { useRouter } from "next/navigation";
import { ECONOMY } from "@/lib/economy/constants";
import MidnightCountdown from "@/components/ui/MidnightCountdown";

interface GridCategory {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
}

interface DraftResultModalProps {
  won: boolean;
  correctCount: number;
  coinsEarned: number;
  uniquenessBonus: number;
  cellStates: Record<string, { player: string; correct: boolean } | null>;
  validPlayers: Record<string, string[]>;
  draftPlayers: string[];
  rowCategories: GridCategory[];
  colCategories: GridCategory[];
}

export default function DraftResultModal({
  won,
  correctCount,
  coinsEarned,
  uniquenessBonus,
  cellStates,
  validPlayers,
  draftPlayers,
  rowCategories,
  colCategories,
}: DraftResultModalProps) {
  const router = useRouter();
  const isPerfect = correctCount === 9;

  // For missed cells: find which draft card was valid for that cell.
  function answerForCell(cellKey: string): string {
    const placed = cellStates[cellKey];
    if (placed?.correct) return placed.player;
    // Show the draft card that was the intended answer for this cell
    const validForCell = validPlayers[cellKey] ?? [];
    return draftPlayers.find((p) => validForCell.includes(p)) ?? validForCell[0] ?? "—";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-5 text-center border-b ${
            won
              ? "bg-green-500/10 border-green-500/20"
              : "bg-zinc-800 border-zinc-700"
          }`}
        >
          <p className={`text-2xl font-bold ${won ? "text-yellow-400" : "text-white"}`}>
            {won ? "🏆 Perfect Board! You're a scout" : "💀 Better luck tomorrow, coach"}
          </p>
          <p className="mt-1 text-zinc-400 text-sm">
            {won ? "🎉 All 9 players in the right spots!" : `${correctCount} / 9 cells filled`}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Coins earned breakdown */}
          <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Coins Earned
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>
                  {correctCount} correct cell{correctCount !== 1 ? "s" : ""}
                </span>
                <span>+{correctCount * ECONOMY.DRAFT_BOARD.COINS_PER_CORRECT_CELL}</span>
              </div>
              {uniquenessBonus > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Uniqueness bonus</span>
                  <span>+{uniquenessBonus}</span>
                </div>
              )}
              {isPerfect ? (
                <div className="flex justify-between text-green-400">
                  <span>Perfect board bonus</span>
                  <span>+{ECONOMY.DRAFT_BOARD.PERFECT_BONUS}</span>
                </div>
              ) : (
                <div className="flex justify-between text-zinc-300">
                  <span>Participation</span>
                  <span>+{ECONOMY.DRAFT_BOARD.PARTICIPATION}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-yellow-400 pt-2 border-t border-zinc-700 mt-1">
                <span>Total</span>
                <span>+{coinsEarned}</span>
              </div>
            </div>
          </div>

          {/* Lose: mini answer grid */}
          {!won && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Correct Placements
              </p>
              <div className="grid grid-cols-[minmax(0,0.8fr)_1fr_1fr_1fr] gap-1 text-xs">
                {/* Top-left corner */}
                <div />

                {/* Column headers */}
                {colCategories.map((cat, ci) => (
                  <div
                    key={ci}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-1.5 py-2 text-center leading-tight"
                  >
                    <span className="font-semibold text-zinc-300 line-clamp-2">{cat.label}</span>
                  </div>
                ))}

                {/* Rows */}
                {rowCategories.map((rowCat, ri) => (
                  <>
                    <div
                      key={`row-${ri}`}
                      className="rounded-lg bg-zinc-800 border border-zinc-700 px-1.5 py-2 flex items-center justify-center text-center leading-tight"
                    >
                      <span className="font-semibold text-zinc-300 line-clamp-2">{rowCat.label}</span>
                    </div>

                    {colCategories.map((_, ci) => {
                      const key = `${ri}-${ci}`;
                      const isCorrect = cellStates[key]?.correct === true;
                      const answer = answerForCell(key);

                      return (
                        <div
                          key={key}
                          className={[
                            "rounded-lg border px-1.5 py-2 flex items-center justify-center text-center leading-tight min-h-[52px]",
                            isCorrect
                              ? "border-green-600 bg-green-500/15 text-green-300"
                              : "border-zinc-700 bg-zinc-900 text-zinc-400",
                          ].join(" ")}
                        >
                          <span className="line-clamp-2">{answer}</span>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}

          {/* Countdown — Draft Board is 1 play per day, no "Play Again" */}
          <MidnightCountdown />

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold py-3 text-sm hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
