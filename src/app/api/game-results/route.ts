import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY, XP } from "@/lib/economy/constants";
import { awardCoins } from "@/lib/economy/coins";
import { awardXp } from "@/lib/economy/xp";
import { updateStreak } from "@/lib/game/streak";
import { checkAndAwardBadges } from "@/lib/badges/checker";
import type { BadgeDefinition } from "@/lib/badges/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, puzzleId, sport, score, guessesUsed, cellsFilled, completed, gameMode } = body;

  if (
    typeof sessionId !== "string" ||
    typeof puzzleId !== "string" ||
    typeof sport !== "string" ||
    typeof score !== "number" ||
    typeof guessesUsed !== "number" ||
    typeof cellsFilled !== "object" ||
    typeof completed !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const resolvedGameMode: "sports-grid" | "draft-board" =
    gameMode === "draft-board" ? "draft-board" : "sports-grid";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ saved: false, reason: "unauthenticated", coinsEarned: 0 });
  }

  const today = new Date().toISOString().split("T")[0];
  console.log("[game-results] user=%s sport=%s sessionId=%s completed=%s", user.id, sport, sessionId, completed);

  // Check if this session already has a row.
  const { data: existing } = await supabase
    .from("game_results")
    .select("id, completed_at")
    .eq("session_id", sessionId)
    .maybeSingle();

  let gameResultId: string | null = existing?.id ?? null;

  if (existing) {
    // Session row exists — only update if this is the first completion.
    if (completed && !existing.completed_at) {
      await supabase
        .from("game_results")
        .update({ score, guesses_used: guessesUsed, cells_filled: cellsFilled, completed_at: new Date().toISOString(), game_mode: resolvedGameMode })
        .eq("id", existing.id);
      console.log("[game-results] updated session to completed");
    }
  } else {
    // New session — insert stub or complete row.
    const { data: insertedRow, error } = await supabase
      .from("game_results")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        puzzle_id: puzzleId,
        sport,
        play_date: today,
        score,
        guesses_used: guessesUsed,
        cells_filled: cellsFilled,
        completed_at: completed ? new Date().toISOString() : null,
        game_mode: resolvedGameMode,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[game-results] insert error:", error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    gameResultId = insertedRow?.id ?? null;
    console.log("[game-results] inserted new session row completed=%s", completed);
  }

  // Award coins only on new completions, and only once per puzzle per day.
  if (!completed || existing?.completed_at) {
    return NextResponse.json({ saved: true, coinsEarned: 0 });
  }

  // Check if any other session already awarded coins for this puzzle today.
  const { count: priorCompletions } = await supabase
    .from("game_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .eq("play_date", today)
    .not("session_id", "eq", sessionId)
    .not("completed_at", "is", null);

  if ((priorCompletions ?? 0) > 0) {
    return NextResponse.json({ saved: true, coinsEarned: 0 });
  }

  const isPerfect = score === 9;
  let coinsEarned: number;
  if (resolvedGameMode === "draft-board") {
    // In Draft Board each card is unique, so the uniqueness bonus always applies.
    const uniqueBonus = score * ECONOMY.DRAFT_BOARD.UNIQUE_PLAYER_BONUS;
    coinsEarned =
      score * ECONOMY.DRAFT_BOARD.COINS_PER_CORRECT_CELL +
      uniqueBonus +
      (isPerfect ? ECONOMY.DRAFT_BOARD.PERFECT_BONUS : ECONOMY.DRAFT_BOARD.PARTICIPATION);
  } else {
    coinsEarned =
      score * ECONOMY.SPORTS_GRID.COINS_PER_CORRECT_CELL +
      (isPerfect ? ECONOMY.SPORTS_GRID.PERFECT_BONUS : ECONOMY.SPORTS_GRID.PARTICIPATION);
  }

  await awardCoins(supabase, {
    userId: user.id,
    amount: coinsEarned,
    reason: resolvedGameMode === "draft-board" ? "draft_completion" : "grid_completion",
    referenceId: gameResultId,
    referenceType: "game_result",
  });

  let xpEarned: number;
  if (resolvedGameMode === "draft-board") {
    const isFlawless = guessesUsed === score;
    xpEarned =
      XP.DRAFT_BOARD.BASE +
      score * XP.DRAFT_BOARD.PER_CORRECT_CELL +
      (isFlawless ? XP.DRAFT_BOARD.FLAWLESS_BONUS : 0);
  } else {
    xpEarned =
      XP.SPORTS_GRID.BASE +
      score * XP.SPORTS_GRID.PER_CORRECT_CELL +
      (isPerfect ? XP.SPORTS_GRID.PERFECT_BONUS : 0);
  }
  const newTotalXp = await awardXp(supabase, user.id, xpEarned);

  await updateStreak(supabase, user.id);

  let newBadges: BadgeDefinition[] = [];
  try {
    newBadges = await checkAndAwardBadges(supabase, { userId: user.id, newTotalXp });
  } catch {
    // Badge check is non-critical — game completion succeeds regardless
  }

  return NextResponse.json({ saved: true, coinsEarned, newBadges });
}
