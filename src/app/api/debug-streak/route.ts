import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const [{ data: grid }, { data: trivia }] = await Promise.all([
    supabase
      .from("game_results")
      .select("score, created_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("solo_trivia_plays")
      .select("questions_answered, play_date, completed_at")
      .eq("user_id", user.id)
      .order("play_date", { ascending: false }),
  ]);

  return NextResponse.json({ userId: user.id, game_results: grid, solo_trivia_plays: trivia });
}
