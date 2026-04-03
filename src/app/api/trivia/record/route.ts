import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const { error: insertError } = await supabase.from("solo_trivia_plays").insert({
    user_id: user.id,
    play_date: today,
    sport,
    variant,
    questions_answered: questionsAnswered,
    coins_earned: coinsEarned,
    completed_at: new Date().toISOString(),
  });

  // Unique constraint violation (23505) means already played today — not an error we surface.
  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Only award coins if this was a new play record.
  if (!insertError && coinsEarned > 0) {
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
  }

  return NextResponse.json({ saved: !insertError, coinsEarned: insertError ? 0 : coinsEarned });
}
