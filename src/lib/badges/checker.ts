import type { SupabaseClient } from "@supabase/supabase-js";
import { BADGES, type BadgeDefinition } from "./constants";
import { computeRankLevel } from "@/lib/economy/xp";

// Minimum completed grid/draft games per sport before accuracy badges unlock.
// Without this gate, a single 9/9 game would grant all three mastery tiers.
const MIN_ACCURACY_GAMES = 10;

export interface BadgeContext {
  userId: string;
  newTotalXp: number; // return value of awardXp() — used for rank check
}

export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  context: BadgeContext
): Promise<BadgeDefinition[]> {
  const { userId, newTotalXp } = context;

  // Fetch all data in parallel — 4 queries
  const [
    { data: earnedRows },
    { data: gridRows },
    { data: triviaRows },
    { data: userRow },
  ] = await Promise.all([
    supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId),

    supabase
      .from("game_results")
      .select("sport, score, guesses_used, game_mode")
      .eq("user_id", userId)
      .not("completed_at", "is", null),

    supabase
      .from("solo_trivia_plays")
      .select("sport, questions_answered")
      .eq("user_id", userId),

    supabase
      .from("users")
      .select("current_streak")
      .eq("id", userId)
      .single(),
  ]);

  const earned = new Set(
    (earnedRows ?? []).map((r: { badge_id: string }) => r.badge_id)
  );
  const grid = gridRows ?? [];
  const trivia = triviaRows ?? [];
  const currentStreak = userRow?.current_streak ?? 0;

  // Totals
  const totalGames = grid.length + trivia.length;
  const totalPerfects =
    grid.filter((r) => r.score === 9).length +
    trivia.filter((r) => r.questions_answered === 10).length;

  // BallBrain Savant: only game_mode='sports-grid' AND score=9
  // Draft Board perfects intentionally excluded — this is a long-haul Sports Grid badge
  const perfectSportsGrids = grid.filter(
    (r) => r.game_mode === "sports-grid" && r.score === 9
  ).length;

  // Per-sport total game counts (grid + trivia)
  const nbaGames =
    grid.filter((r) => r.sport === "NBA").length +
    trivia.filter((r) => r.sport === "NBA").length;
  const soccerGames =
    grid.filter((r) => r.sport === "Soccer").length +
    trivia.filter((r) => r.sport === "Soccer").length;

  // Per-sport accuracy (grid/draft only — trivia accuracy not cleanly computable)
  function sportAccuracy(sport: string): { accuracy: number; games: number } {
    const rows = grid.filter((r) => r.sport === sport && r.guesses_used > 0);
    if (rows.length < MIN_ACCURACY_GAMES) return { accuracy: 0, games: rows.length };
    const scoreSum = rows.reduce((s, r) => s + r.score, 0);
    const guessSum = rows.reduce((s, r) => s + r.guesses_used, 0);
    return {
      accuracy: guessSum > 0 ? scoreSum / guessSum : 0,
      games: rows.length,
    };
  }

  const nba = sportAccuracy("NBA");
  const soccer = sportAccuracy("Soccer");
  const rankName = computeRankLevel(newTotalXp).rankName;

  // Collect candidate badge IDs where criteria is met and badge not yet earned
  const candidates: string[] = [];
  function check(id: string, met: boolean) {
    if (met && !earned.has(id)) candidates.push(id);
  }

  check("rookie_card",      totalGames >= 1);
  check("veteran",          totalGames >= 100);
  check("franchise_player", totalGames >= 500);

  // Use current_streak (just updated by updateStreak) for live detection
  check("on_a_run",    currentStreak >= 7);
  check("ironman",     currentStreak >= 30);
  check("unbreakable", currentStreak >= 100);

  check("flawless",         totalPerfects >= 1);
  check("perfectionist",    totalPerfects >= 10);
  check("ballbrain_savant", perfectSportsGrids >= 25);

  check("nba_role_player",  nba.games >= MIN_ACCURACY_GAMES && nba.accuracy >= 0.70);
  check("nba_starter",      nba.games >= MIN_ACCURACY_GAMES && nba.accuracy >= 0.80);
  check("nba_sharpshooter", nba.games >= MIN_ACCURACY_GAMES && nba.accuracy >= 0.90);

  check("soccer_squad",     soccer.games >= MIN_ACCURACY_GAMES && soccer.accuracy >= 0.70);
  check("soccer_playmaker", soccer.games >= MIN_ACCURACY_GAMES && soccer.accuracy >= 0.80);
  check("soccer_maestro",   soccer.games >= MIN_ACCURACY_GAMES && soccer.accuracy >= 0.90);

  check("gym_rat",       nbaGames >= 50);
  check("sunday_league", soccerGames >= 50);
  check("first_ballot",  rankName === "Hall of Fame");

  if (candidates.length === 0) return [];

  // grant_badges is SECURITY DEFINER — inserts user_badges rows and returns
  // only the IDs that were actually new (already-earned are silently skipped)
  const { data: newlyEarned } = await supabase.rpc("grant_badges", {
    p_user_id: userId,
    p_badge_ids: candidates,
  });

  return ((newlyEarned as string[]) ?? [])
    .map((id) => BADGES[id])
    .filter(Boolean);
}
