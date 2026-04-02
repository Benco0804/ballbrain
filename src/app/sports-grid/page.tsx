import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SportsGrid from "@/components/grid/SportsGrid";
import GridEmptyState from "@/components/grid/GridEmptyState";

// Always render fresh — never serve a cached version of this page.
export const dynamic = "force-dynamic";

const MAX_GRID_PLAYS_PER_SPORT = 2;

export const metadata: Metadata = {
  title: "Sports Grid — BallBrain",
  description: "Daily sports trivia grid. Fill every cell to win.",
};

type Sport = "NBA" | "Soccer";

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

const SPORT_OPTIONS: { sport: Sport; emoji: string; color: string; activeColor: string }[] = [
  { sport: "NBA",    emoji: "🏀", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", activeColor: "text-orange-300 border-orange-400 bg-orange-400/20" },
  { sport: "Soccer", emoji: "⚽", color: "text-green-400 border-green-500/30 bg-green-500/10",    activeColor: "text-green-300 border-green-400 bg-green-400/20" },
];

function normalizeSport(raw: string | undefined): Sport | null {
  if ((raw ?? "").toUpperCase() === "NBA")    return "NBA";
  if ((raw ?? "").toUpperCase() === "SOCCER") return "Soccer";
  return null;
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
  const params = await searchParams;
  const sport = normalizeSport(typeof params.sport === "string" ? params.sport : undefined);

  // ── Sport selector screen ────────────────────────────────────────────────────
  if (!sport) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">Sports Grid</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Choose a Sport</h1>
          <p className="text-zinc-400 text-sm mb-10">
            Fill the 3×3 grid by naming athletes who match both criteria.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            {SPORT_OPTIONS.map(({ sport: s, emoji, activeColor }) => (
              // Use <a> (not <Link>) to force a full server render and bypass
              // the Next.js Router Cache, so the daily limit check always runs.
              <a
                key={s}
                href={`/sports-grid?sport=${s}`}
                className={[
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-8 font-bold text-lg transition-colors",
                  activeColor,
                  "hover:opacity-90",
                ].join(" ")}
              >
                <span className="text-4xl">{emoji}</span>
                <span>{s}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── Game screen ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  // ── Daily play limit check ───────────────────────────────────────────────────
  // Query game_results directly by sport + play_date — no puzzle_date join needed.
  if (user) {
    const { count: playsToday } = await supabase
      .from("game_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("sport", sport)
      .eq("play_date", today);

    console.log("[grid-limit] sport=%s user=%s playsToday=%d limit=%d", sport, user.id, playsToday, MAX_GRID_PLAYS_PER_SPORT);

    if ((playsToday ?? 0) >= MAX_GRID_PLAYS_PER_SPORT) {
      return (
        <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center text-center max-w-sm w-full gap-4">
            <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-8 w-full">
              <p className="text-white font-bold text-lg mb-2">
                You&apos;ve used all your shots today! 🎯
              </p>
              <p className="text-zinc-400 text-sm">Come back tomorrow for more.</p>
            </div>
            <Link
              href="/sports-grid"
              className="rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-6 py-3 text-sm transition-colors"
            >
              ← Go Back
            </Link>
          </div>
        </main>
      );
    }
  }

  const { data: puzzle, error } = await supabase
    .from("daily_puzzles")
    .select("id, puzzle_date, sport, difficulty, row_categories, col_categories, puzzle_cells(row_index, col_index, valid_players)")
    .eq("puzzle_date", today)
    .eq("sport", sport)
    .eq("difficulty", "easy")
    .single();

  const rowCategories = puzzle ? (puzzle.row_categories as unknown as CategoryData[]) : [];
  const colCategories = puzzle ? (puzzle.col_categories as unknown as CategoryData[]) : [];
  const cells         = puzzle ? (puzzle.puzzle_cells   as unknown as PuzzleCell[]) : [];

  const validPlayers: Record<string, string[]> = {};
  for (const cell of cells) {
    validPlayers[`${cell.row_index}-${cell.col_index}`] = cell.valid_players;
  }

  const sportOption = SPORT_OPTIONS.find((o) => o.sport === sport)!;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sports Grid</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {puzzle ? formatPuzzleDate(puzzle.puzzle_date) : "Daily Puzzle"}
            </p>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold border ${sportOption.activeColor}`}>
            {sportOption.emoji} {sport}
          </span>
        </div>

      </div>

      {/* Grid or no-puzzle fallback */}
      <div className="w-full max-w-2xl">
        {error || !puzzle ? (
          <GridEmptyState />
        ) : (
          <SportsGrid
            puzzleId={puzzle.id}
            sport={sport}
            rowCategories={rowCategories}
            colCategories={colCategories}
            validPlayers={validPlayers}
            isAuthenticated={!!user}
            nextPuzzleUrl={null}
          />
        )}
      </div>

      <p className="mt-8 text-xs text-zinc-600">
        Click a cell to select it, then enter a player&apos;s name.
      </p>
    </main>
  );
}
