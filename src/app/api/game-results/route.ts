import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY } from "@/lib/economy/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, puzzleId, sport, score, guessesUsed, cellsFilled, completed } = body;

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

  if (existing) {
    // Session row exists — only update if this is the first completion.
    if (completed && !existing.completed_at) {
      await supabase
        .from("game_results")
        .update({ score, guesses_used: guessesUsed, cells_filled: cellsFilled, completed_at: new Date().toISOString() })
        .eq("id", existing.id);
      console.log("[game-results] updated session to completed");
    }
  } else {
    // New session — insert stub or complete row.
    const { error } = await supabase.from("game_results").insert({
      session_id: sessionId,
      user_id: user.id,
      puzzle_id: puzzleId,
      sport,
      play_date: today,
      score,
      guesses_used: guessesUsed,
      cells_filled: cellsFilled,
      completed_at: completed ? new Date().toISOString() : null,
    });

    if (error) {
      console.error("[game-results] insert error:", error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
  const coinsEarned =
    score * ECONOMY.SPORTS_GRID.COINS_PER_CORRECT_CELL +
    (isPerfect ? ECONOMY.SPORTS_GRID.PERFECT_BONUS : ECONOMY.SPORTS_GRID.PARTICIPATION);

  const { data: userData } = await supabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  await supabase
    .from("users")
    .update({ coins: (userData?.coins ?? 0) + coinsEarned })
    .eq("id", user.id);

  return NextResponse.json({ saved: true, coinsEarned });
}
