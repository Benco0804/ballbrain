import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY } from "@/lib/economy/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { puzzleId, score, guessesUsed, cellsFilled, completed } = body;

  if (
    typeof puzzleId !== "string" ||
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
    console.log("[game-results] unauthenticated — skipping save");
    return NextResponse.json({ saved: false, reason: "unauthenticated", coinsEarned: 0 });
  }

  console.log("[game-results] user=%s puzzle=%s completed=%s score=%d", user.id, puzzleId, completed, score);

  // Check for an existing row so we can distinguish stub vs. completed.
  const { data: existing } = await supabase
    .from("game_results")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .maybeSingle();

  const alreadyCompleted = !!existing?.completed_at;

  console.log("[game-results] existing=%s alreadyCompleted=%s", !!existing, alreadyCompleted);

  if (existing) {
    // Row already exists. Only update if this is a final completion and it wasn't before.
    if (completed && !alreadyCompleted) {
      await supabase
        .from("game_results")
        .update({
          score,
          guesses_used: guessesUsed,
          cells_filled: cellsFilled,
          completed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
  } else {
    // First interaction — insert a row (stub or complete).
    console.log("[game-results] inserting new row completed=%s", completed);
    const { error } = await supabase.from("game_results").insert({
      user_id: user.id,
      puzzle_id: puzzleId,
      score,
      guesses_used: guessesUsed,
      cells_filled: cellsFilled,
      completed_at: completed ? new Date().toISOString() : null,
    });

    if (error) {
      console.error("[game-results] insert error:", error.message, error.code);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("[game-results] insert OK");
  }

  // Award coins only on new completions.
  if (!completed || alreadyCompleted) {
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
