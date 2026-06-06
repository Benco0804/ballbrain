import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY, XP } from "@/lib/economy/constants";
import { awardCoins } from "@/lib/economy/coins";
import { awardXp } from "@/lib/economy/xp";
import { updateStreak } from "@/lib/game/streak";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { questionsAnswered, coinsEarned, sport, variant } = body;

  if (
    typeof questionsAnswered !== "number" ||
    typeof coinsEarned !== "number" ||
    typeof sport !== "string" ||
    (variant !== 1 && variant !== 2)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ saved: false, reason: "unauthenticated" });
  }

  const today = new Date().toISOString().split("T")[0];

  // Idempotent insert — unique on (user_id, play_date, sport, variant).
  const { data: insertedPlay, error: insertError } = await supabase
    .from("solo_trivia_plays")
    .insert({
      user_id: user.id,
      play_date: today,
      sport,
      variant,
      questions_answered: questionsAnswered,
      coins_earned: coinsEarned,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // Unique constraint violation (23505) means already played today — not an error we surface.
  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Award coins and advance streak on any new play record.
  if (!insertError) {
    if (coinsEarned > 0) {
      await awardCoins(supabase, {
        userId: user.id,
        amount: coinsEarned,
        reason: "trivia_completion",
        referenceId: insertedPlay?.id ?? null,
        referenceType: "solo_trivia",
      });
    }

    const xpEarned =
      XP.SOLO_TRIVIA.BASE +
      questionsAnswered * XP.SOLO_TRIVIA.PER_QUESTION_ANSWERED +
      (questionsAnswered === ECONOMY.SOLO_TRIVIA.TOTAL_QUESTIONS ? XP.SOLO_TRIVIA.FULL_CLEAR_BONUS : 0);
    await awardXp(supabase, user.id, xpEarned);

    await updateStreak(supabase, user.id);
  }

  return NextResponse.json({ saved: !insertError, coinsEarned: insertError ? 0 : coinsEarned });
}
