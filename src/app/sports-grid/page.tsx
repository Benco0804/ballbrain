import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SportsGrid from "@/components/grid/SportsGrid";
import GridEmptyState from "@/components/grid/GridEmptyState";
import SportSelector from "@/components/grid/SportSelector";

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

const SPORT_OPTIONS: { sport: Sport; emoji: string; activeColor: string }[] = [
  { sport: "NBA",    emoji: "🏀", activeColor: "text-orange-300 border-orange-400 bg-orange-400/20" },
  { sport: "Soccer", emoji: "⚽", activeColor: "text-green-300 border-green-400 bg-green-400/20" },
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">Sports Grid</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Choose a Sport</h1>
          <p className="text-zinc-400 text-sm mb-10">
            Fill the 3×3 grid by naming athletes who match both criteria.
          </p>
          {/* SportSelector is a client component — reads localStorage for guests to set correct ?play=N */}
          <SportSelector isAuthenticated={!!user} />
        </div>
      </main>
    );
  }

  // ── Game screen ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  // ── Determine play count → puzzle difficulty ─────────────────────────────────
  // Auth users: count rows in game_results (authoritative, server-side).
  // Guests:     client passed ?play=N from localStorage via SportSelector.
  let playsToday = 0;
  if (user) {
    const { count } = await supabase
      .from("game_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("sport", sport)
      .eq("play_date", today);
    playsToday = count ?? 0;
  } else {
    const playParam = typeof params.play === "string" ? parseInt(params.play, 10) : 0;
    playsToday = Number.isFinite(playParam) && playParam > 0 ? playParam : 0;
  }

  console.log("[grid] sport=%s user=%s playsToday=%d limit=%d", sport, user?.id ?? "guest", playsToday, MAX_GRID_PLAYS_PER_SPORT);

  // ── Daily play limit check ───────────────────────────────────────────────────
  if (playsToday >= MAX_GRID_PLAYS_PER_SPORT) {
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

  // Play 0 → easy puzzle; play 1 → medium puzzle.
  const difficulty = playsToday === 0 ? "easy" : "medium";

  console.log("[grid-puzzle] querying sport=%s date=%s difficulty=%s user=%s", sport, today, difficulty, user?.id ?? "guest");

  const { data: puzzle, error } = await supabase
    .from("daily_puzzles")
    .select("id, puzzle_date, sport, difficulty, row_categories, col_categories, puzzle_cells(row_index, col_index, valid_players)")
    .eq("puzzle_date", today)
    .eq("sport", sport)
    .eq("difficulty", difficulty)
    .single();

  if (error) {
    console.error("[grid-puzzle] query failed sport=%s date=%s difficulty=%s code=%s msg=%s", sport, today, difficulty, error.code, error.message);
  } else {
    console.log("[grid-puzzle] found puzzleId=%s cells=%d", puzzle?.id, (puzzle?.puzzle_cells as unknown[])?.length ?? 0);
  }

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
