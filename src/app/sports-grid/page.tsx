import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SportsGrid from "@/components/grid/SportsGrid";

export const metadata: Metadata = {
  title: "Sports Grid — BallBrain",
  description: "Daily sports trivia grid. Fill every cell to win.",
};

type Sport = "NBA" | "NFL" | "Soccer";

type CategoryData = {
  label: string;
  sport: Sport;
  categoryId: string;
};

type PuzzleCell = {
  row_index: number;
  col_index: number;
  valid_players: string[];
};

const SPORT_TABS: { sport: Sport; param: string; color: string; activeColor: string }[] = [
  { sport: "NBA",    param: "NBA",    color: "text-orange-400 border-orange-500/30 bg-orange-500/10", activeColor: "text-orange-300 border-orange-400 bg-orange-400/20" },
  { sport: "NFL",    param: "NFL",    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",       activeColor: "text-blue-300 border-blue-400 bg-blue-400/20" },
  { sport: "Soccer", param: "Soccer", color: "text-green-400 border-green-500/30 bg-green-500/10",    activeColor: "text-green-300 border-green-400 bg-green-400/20" },
];

function normalizeSport(raw: string | undefined): Sport {
  const upper = (raw ?? "").toUpperCase();
  if (upper === "NFL") return "NFL";
  if (upper === "SOCCER") return "Soccer";
  return "NBA";
}

function formatPuzzleDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function SportsGridPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sport: sportParam } = await searchParams;
  const sport = normalizeSport(typeof sportParam === "string" ? sportParam : undefined);

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: puzzle, error } = await supabase
    .from("daily_puzzles")
    .select("id, puzzle_date, sport, row_categories, col_categories, puzzle_cells(row_index, col_index, valid_players)")
    .eq("puzzle_date", today)
    .eq("sport", sport)
    .single();

  const rowCategories = puzzle ? (puzzle.row_categories as unknown as CategoryData[]) : [];
  const colCategories = puzzle ? (puzzle.col_categories as unknown as CategoryData[]) : [];
  const cells         = puzzle ? (puzzle.puzzle_cells   as unknown as PuzzleCell[]) : [];

  const validPlayers: Record<string, string[]> = {};
  for (const cell of cells) {
    validPlayers[`${cell.row_index}-${cell.col_index}`] = cell.valid_players;
  }

  const sportTab = SPORT_TABS.find((t) => t.sport === sport)!;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sports Grid</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {puzzle
                ? `${formatPuzzleDate(puzzle.puzzle_date)} · Daily Puzzle`
                : "Daily Puzzle"}
            </p>
          </div>
          {/* Active sport badge */}
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold border ${sportTab.activeColor}`}>
            {sport}
          </span>
        </div>

        {/* Sport tabs */}
        <div className="flex gap-2">
          {SPORT_TABS.map(({ sport: s, param, color, activeColor }) => (
            <Link
              key={s}
              href={`/sports-grid?sport=${param}`}
              className={`flex-1 text-center rounded-xl py-2 text-sm font-semibold border transition-colors ${
                s === sport ? activeColor : color
              } hover:opacity-80`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid or no-puzzle fallback */}
      <div className="w-full max-w-2xl">
        {error || !puzzle ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-400 text-lg font-semibold">No {sport} puzzle available today.</p>
            <p className="text-zinc-600 text-sm mt-2">Check back tomorrow!</p>
          </div>
        ) : (
          <SportsGrid
            puzzleId={puzzle.id}
            rowCategories={rowCategories}
            colCategories={colCategories}
            validPlayers={validPlayers}
          />
        )}
      </div>

      <p className="mt-8 text-xs text-zinc-600">
        Click a cell to select it, then enter a player&apos;s name.
      </p>
    </main>
  );
}
