import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TriviaGame from "@/components/trivia/TriviaGame";

export const metadata: Metadata = {
  title: "Solo Trivia — BallBrain",
  description: "Millionaire-style sports trivia. 10 questions, 20 seconds each.",
};

export default async function TriviaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch which sports the user has already played today.
  let playedSportsToday: string[] = [];
  if (user) {
    const today = new Date().toISOString().split("T")[0];
    const { data: plays } = await supabase
      .from("solo_trivia_plays")
      .select("sport")
      .eq("user_id", user.id)
      .eq("play_date", today);
    playedSportsToday = plays?.map((p) => p.sport) ?? [];
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <TriviaGame isAuthenticated={!!user} playedSportsToday={playedSportsToday} />
      </div>
    </div>
  );
}
