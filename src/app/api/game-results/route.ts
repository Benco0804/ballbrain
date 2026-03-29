import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY } from "@/lib/economy/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { puzzleId, score, guessesUsed, cellsFilled } = body;

  if (
    typeof puzzleId !== "string" ||
    typeof score !== "number" ||
    typeof guessesUsed !== "number" ||
    typeof cellsFilled !== "object"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated users: skip save (RLS blocks it anyway)
  if (!user) {
    return NextResponse.json({ saved: false, reason: "unauthenticated", coinsEarned: 0 });
  }

  // Idempotency: if result already exists for this user+puzzle, do not double-credit.
  const { data: existing } = await supabase
    .from("game_results")
    .select("id")
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ saved: false, reason: "already_submitted", coinsEarned: 0 });
  }

  const { error } = await supabase.from("game_results").insert({
    user_id: user.id,
    puzzle_id: puzzleId,
    score,
    guesses_used: guessesUsed,
    cells_filled: cellsFilled,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate coins server-side — never trust client-reported amounts.
  const isPerfect = score === 9;
  const coinsEarned =
    score * ECONOMY.SPORTS_GRID.COINS_PER_CORRECT_CELL +
    (isPerfect ? ECONOMY.SPORTS_GRID.PERFECT_BONUS : ECONOMY.SPORTS_GRID.PARTICIPATION);

  // Read current balance then increment (acceptable TOCTOU risk: one result per puzzle per user).
  const { data: userData } = await supabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  const currentCoins = userData?.coins ?? 0;

  await supabase
    .from("users")
    .update({ coins: currentCoins + coinsEarned })
    .eq("id", user.id);

  return NextResponse.json({ saved: true, coinsEarned });
}
