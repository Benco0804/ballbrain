import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ saved: false, reason: "unauthenticated" });
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

  return NextResponse.json({ saved: true });
}
