// =============================================================================
// generate-daily-puzzles — Supabase Edge Function
//
// Generates for TOMORROW:
//   • 3 NBA puzzles  (easy / medium / hard difficulty slots)
//   • 3 Soccer puzzles
//   • 2 trivia sessions per sport (variant 1 and 2, 10 questions each)
//
// Environment variables required:
//   SUPABASE_URL              — injected automatically by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — injected automatically by Supabase
//   CRON_SECRET               — must match x-cron-secret header (set in Supabase dashboard)
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const MIN_PLAYERS_PER_CELL = 3;
const MAX_ATTEMPTS_PER_PUZZLE = 100;
const DIFFICULTY_SLOTS = ["easy", "medium", "hard"] as const;
const QUESTIONS_PER_SESSION = 10;
const SESSIONS_PER_SPORT = 2;

// ---------------------------------------------------------------------------
// Criteria catalogs
// ---------------------------------------------------------------------------
interface Criterion {
  id: string;
  label: string;
}

const NBA_ROW_CRITERIA: Criterion[] = [
  { id: "nba-lakers",    label: "Played for the Lakers" },
  { id: "nba-celtics",   label: "Played for the Celtics" },
  { id: "nba-bulls",     label: "Played for the Bulls" },
  { id: "nba-spurs",     label: "Played for the Spurs" },
  { id: "nba-warriors",  label: "Played for the Warriors" },
  { id: "nba-heat",      label: "Played for the Heat" },
  { id: "nba-76ers",     label: "Played for the 76ers" },
  { id: "nba-knicks",    label: "Played for the Knicks" },
  { id: "nba-pistons",   label: "Played for the Pistons" },
  { id: "nba-rockets",   label: "Played for the Rockets" },
  { id: "nba-cavaliers", label: "Played for the Cavaliers" },
  { id: "nba-suns",      label: "Played for the Suns" },
  { id: "nba-mavericks", label: "Played for the Mavericks" },
  { id: "nba-jazz",      label: "Played for the Jazz" },
  { id: "nba-bucks",     label: "Played for the Bucks" },
];

const NBA_COL_CRITERIA: Criterion[] = [
  { id: "nba-champion",       label: "NBA Champion" },
  { id: "nba-finals-mvp",     label: "Finals MVP" },
  { id: "nba-mvp",            label: "League MVP" },
  { id: "nba-all-nba-first",  label: "All-NBA First Team" },
  { id: "nba-10plus-allstar", label: "10+ All-Star Selections" },
  { id: "nba-5plus-allstar",  label: "5+ All-Star Selections" },
  { id: "nba-scoring-title",  label: "Scoring Title" },
  { id: "nba-career-25ppg",   label: "Career 25+ PPG" },
  { id: "nba-season-30ppg",   label: "30+ PPG Season" },
  { id: "nba-career-20k",     label: "Career 20,000+ Points" },
  { id: "nba-roy",            label: "Rookie of the Year" },
  { id: "nba-draft-top3",     label: "Top 3 Draft Pick" },
  { id: "nba-game-50pts",     label: "Scored 50+ in a Game" },
  { id: "nba-td10-season",    label: "Triple-Double Season" },
  { id: "nba-dpoy",           label: "Defensive Player of the Year" },
];

const SOCCER_ROW_CRITERIA: Criterion[] = [
  { id: "soccer-real-madrid", label: "Played for Real Madrid" },
  { id: "soccer-barcelona",   label: "Played for Barcelona" },
  { id: "soccer-bayern",      label: "Played for Bayern Munich" },
  { id: "soccer-man-united",  label: "Played for Manchester United" },
  { id: "soccer-liverpool",   label: "Played for Liverpool" },
  { id: "soccer-chelsea",     label: "Played for Chelsea" },
  { id: "soccer-arsenal",     label: "Played for Arsenal" },
  { id: "soccer-juventus",    label: "Played for Juventus" },
  { id: "soccer-ac-milan",    label: "Played for AC Milan" },
  { id: "soccer-inter-milan", label: "Played for Inter Milan" },
  { id: "soccer-psg",         label: "Played for PSG" },
  { id: "soccer-atletico",    label: "Played for Atlético Madrid" },
  { id: "soccer-prem",        label: "Played in the Premier League" },
  { id: "soccer-la-liga",     label: "Played in La Liga" },
  { id: "soccer-serie-a",     label: "Played in Serie A" },
  { id: "soccer-bundesliga",  label: "Played in the Bundesliga" },
  { id: "soccer-ligue1",      label: "Played in Ligue 1" },
  { id: "soccer-israeli",     label: "Played in Israeli Premier League" },
];

const SOCCER_COL_CRITERIA: Criterion[] = [
  { id: "soccer-ucl-winner",   label: "Champions League Winner" },
  { id: "soccer-world-cup",    label: "World Cup Winner" },
  { id: "soccer-ballon-dor",   label: "Ballon d'Or Winner" },
  { id: "soccer-league-title", label: "Won a League Title" },
  { id: "soccer-top-scorer",   label: "League Top Scorer" },
  { id: "soccer-wc-boot",      label: "World Cup Golden Boot" },
  { id: "soccer-30goals",      label: "30+ Goals in a Season" },
  { id: "soccer-ucl-50apps",   label: "50+ UCL Appearances" },
  { id: "soccer-100caps",      label: "100+ International Caps" },
  { id: "soccer-captain",      label: "National Team Captain" },
  { id: "soccer-no-ucl",       label: "Never Won the UCL" },
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Puzzle generation
// ---------------------------------------------------------------------------
type CellMap = Record<string, string[]>;

interface ValidPuzzle {
  rows: Criterion[];
  cols: Criterion[];
  cells: CellMap;
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>;

/**
 * Randomly samples row+col combos until one passes the cell-count check,
 * or MAX_ATTEMPTS is exhausted. Each attempt is a single RPC call.
 */
async function tryFindValidCombo(
  supabase: SupabaseClient,
  sport: string,
  rowPool: Criterion[],
  colPool: Criterion[],
): Promise<ValidPuzzle | null> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PUZZLE; attempt++) {
    const rows = shuffle(rowPool).slice(0, 3);
    const cols = shuffle(colPool).slice(0, 3);

    const { data, error } = await supabase.rpc("validate_puzzle_criteria", {
      p_sport: sport,
      p_row_crits: rows.map((r) => r.id),
      p_col_crits: cols.map((c) => c.id),
      p_min_players: MIN_PLAYERS_PER_CELL,
    });

    if (!error && data !== null) {
      return { rows, cols, cells: data as CellMap };
    }
  }
  return null;
}

/**
 * Generates 3 puzzles for one sport (one per difficulty slot) and inserts them.
 * Uses a shrinking criteria pool so each puzzle uses distinct criteria.
 */
async function generatePuzzlesForSport(
  supabase: SupabaseClient,
  sport: string,
  targetDate: string,
  rowCriteria: Criterion[],
  colCriteria: Criterion[],
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  // Delete any existing puzzles for this sport/date so the run is idempotent.
  const { error: delError } = await supabase
    .from("daily_puzzles")
    .delete()
    .eq("puzzle_date", targetDate)
    .eq("sport", sport);

  if (delError) {
    errors.push(`${sport}: delete failed: ${delError.message}`);
    return { inserted, errors };
  }

  // Start with the full pool; shrink it after each successful puzzle so the
  // three difficulty slots get meaningfully different criteria combinations.
  let rowPool = [...rowCriteria];
  let colPool = [...colCriteria];

  for (const difficulty of DIFFICULTY_SLOTS) {
    const result = await tryFindValidCombo(supabase, sport, rowPool, colPool);

    if (!result) {
      errors.push(
        `${sport}/${difficulty}: no valid combo found after ${MAX_ATTEMPTS_PER_PUZZLE} attempts`,
      );
      continue;
    }

    const { rows, cols, cells } = result;

    // Build category arrays in the format the game expects.
    const rowCategories = rows.map((r) => ({
      label: r.label,
      sport,
      categoryId: r.id,
    }));
    const colCategories = cols.map((c) => ({
      label: c.label,
      sport,
      categoryId: c.id,
    }));

    // Insert the puzzle header.
    const { data: puzzle, error: puzzleErr } = await supabase
      .from("daily_puzzles")
      .insert({
        puzzle_date: targetDate,
        sport,
        difficulty,
        row_categories: rowCategories,
        col_categories: colCategories,
      })
      .select("id")
      .single();

    if (puzzleErr || !puzzle) {
      errors.push(`${sport}/${difficulty}: puzzle insert failed: ${puzzleErr?.message}`);
      continue;
    }

    // Insert all 9 cells.
    const cellRows = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cellRows.push({
          puzzle_id: puzzle.id,
          row_index: r,
          col_index: c,
          valid_players: cells[`${r}-${c}`],
        });
      }
    }

    const { error: cellsErr } = await supabase.from("puzzle_cells").insert(cellRows);

    if (cellsErr) {
      errors.push(`${sport}/${difficulty}: cells insert failed: ${cellsErr.message}`);
      // Roll back the orphaned puzzle header.
      await supabase.from("daily_puzzles").delete().eq("id", puzzle.id);
      continue;
    }

    inserted++;

    // Remove used criteria so the next puzzle picks different ones.
    const usedRowIds = new Set(rows.map((r) => r.id));
    const usedColIds = new Set(cols.map((c) => c.id));
    rowPool = rowPool.filter((r) => !usedRowIds.has(r.id));
    colPool = colPool.filter((c) => !usedColIds.has(c.id));

    // Reset pools if they've shrunk too small (prevents starvation on slot 3).
    if (rowPool.length < 3) rowPool = [...rowCriteria];
    if (colPool.length < 3) colPool = [...colCriteria];
  }

  return { inserted, errors };
}

// ---------------------------------------------------------------------------
// Trivia session generation
// ---------------------------------------------------------------------------
async function generateTriviaSessions(
  supabase: SupabaseClient,
  sport: string,
  targetDate: string,
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  const needed = QUESTIONS_PER_SESSION * SESSIONS_PER_SPORT;

  // Fetch all active question IDs for this sport.
  const { data: questions, error: fetchErr } = await supabase
    .from("trivia_questions")
    .select("id")
    .eq("sport", sport)
    .eq("status", "active");

  if (fetchErr) {
    errors.push(`${sport} trivia: fetch failed: ${fetchErr.message}`);
    return { inserted: 0, errors };
  }

  if (!questions || questions.length < needed) {
    errors.push(
      `${sport} trivia: need ${needed} active questions, found ${questions?.length ?? 0}`,
    );
    return { inserted: 0, errors };
  }

  // Delete existing sessions for this sport/date (idempotent).
  await supabase
    .from("daily_trivia_sessions")
    .delete()
    .eq("session_date", targetDate)
    .eq("sport", sport);

  // Shuffle once; slice into non-overlapping windows for each variant.
  const shuffledIds = shuffle(questions.map((q: { id: string }) => q.id));

  const sessionRows = Array.from({ length: SESSIONS_PER_SPORT }, (_, i) => ({
    session_date: targetDate,
    sport,
    variant: i + 1,
    question_ids: shuffledIds.slice(
      i * QUESTIONS_PER_SESSION,
      (i + 1) * QUESTIONS_PER_SESSION,
    ),
  }));

  const { error: insertErr } = await supabase
    .from("daily_trivia_sessions")
    .insert(sessionRows);

  if (insertErr) {
    errors.push(`${sport} trivia: insert failed: ${insertErr.message}`);
    return { inserted: 0, errors };
  }

  return { inserted: SESSIONS_PER_SPORT, errors };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // CORS pre-flight (allows calls from the admin API route in local dev).
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, x-cron-secret",
      },
    });
  }

  // Authenticate via shared secret (set CRON_SECRET in Supabase Edge Function secrets).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const incoming = req.headers.get("x-cron-secret");
    if (incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Service-role client — bypasses RLS for writes.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Target date: tomorrow in UTC.
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const targetDate = tomorrow.toISOString().split("T")[0];

  // Allow overriding the target date via request body (useful for backfilling).
  let body: { date?: string } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }
  const date = body.date ?? targetDate;

  const summary = {
    targetDate: date,
    nba: { puzzlesInserted: 0, triviaInserted: 0, errors: [] as string[] },
    soccer: { puzzlesInserted: 0, triviaInserted: 0, errors: [] as string[] },
  };

  // ── NBA ────────────────────────────────────────────────────────────────────
  const [nbaPuzzles, nbaTriva] = await Promise.all([
    generatePuzzlesForSport(supabase, "NBA", date, NBA_ROW_CRITERIA, NBA_COL_CRITERIA),
    generateTriviaSessions(supabase, "NBA", date),
  ]);
  summary.nba.puzzlesInserted = nbaPuzzles.inserted;
  summary.nba.triviaInserted = nbaTriva.inserted;
  summary.nba.errors = [...nbaPuzzles.errors, ...nbaTriva.errors];

  // ── Soccer ─────────────────────────────────────────────────────────────────
  const [soccerPuzzles, soccerTrivia] = await Promise.all([
    generatePuzzlesForSport(supabase, "Soccer", date, SOCCER_ROW_CRITERIA, SOCCER_COL_CRITERIA),
    generateTriviaSessions(supabase, "Soccer", date),
  ]);
  summary.soccer.puzzlesInserted = soccerPuzzles.inserted;
  summary.soccer.triviaInserted = soccerTrivia.inserted;
  summary.soccer.errors = [...soccerPuzzles.errors, ...soccerTrivia.errors];

  const hasErrors =
    summary.nba.errors.length > 0 || summary.soccer.errors.length > 0;

  return new Response(JSON.stringify(summary, null, 2), {
    status: hasErrors ? 207 : 200,
    headers: { "Content-Type": "application/json" },
  });
});
