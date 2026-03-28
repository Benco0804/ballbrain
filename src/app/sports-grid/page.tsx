import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SportsGrid from "@/components/grid/SportsGrid";

export const metadata: Metadata = {
  title: "Sports Grid — BallBrain",
  description: "Daily sports trivia grid. Fill every cell to win.",
};

type CategoryData = {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
  categoryId: string;
};

type PuzzleCell = {
  row_index: number;
  col_index: number;
  valid_players: string[];
};

function formatPuzzleDate(dateStr: string): string {
  // dateStr is "YYYY-MM-DD" from Postgres; append T00:00:00 to parse as local midnight.
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function SportsGridPage() {
  const supabase = await createClient();

  // Fetch today's puzzle in UTC. Adjust timezone handling here when ready for production.
  const today = new Date().toISOString().split("T")[0];

  const { data: puzzle, error } = await supabase
    .from("daily_puzzles")
    .select("id, puzzle_date, row_categories, col_categories, puzzle_cells(row_index, col_index, valid_players)")
    .eq("puzzle_date", today)
    .single();

  if (error || !puzzle) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
        <p className="text-zinc-400 text-lg font-semibold">No puzzle available today.</p>
        <p className="text-zinc-600 text-sm mt-2">Check back tomorrow!</p>
      </main>
    );
  }

  const rowCategories = puzzle.row_categories as unknown as CategoryData[];
  const colCategories = puzzle.col_categories as unknown as CategoryData[];
  const cells         = puzzle.puzzle_cells   as unknown as PuzzleCell[];

  // Build a "row-col" → valid player names map for client-side validation.
  const validPlayers: Record<string, string[]> = {};
  for (const cell of cells) {
    validPlayers[`${cell.row_index}-${cell.col_index}`] = cell.valid_players;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sports Grid</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {formatPuzzleDate(puzzle.puzzle_date)} &middot; Daily Puzzle
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
        <SportsGrid
          rowCategories={rowCategories}
          colCategories={colCategories}
          validPlayers={validPlayers}
        />
      </div>

      <p className="mt-8 text-xs text-zinc-600">
        Click a cell to select it, then enter a player&apos;s name.
      </p>
    </main>
  );
}
