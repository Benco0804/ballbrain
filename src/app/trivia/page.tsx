import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TriviaGame from "@/components/trivia/TriviaGame";

export const metadata: Metadata = {
  title: "Solo Trivia — BallBrain",
  description: "Millionaire-style sports trivia. 15 questions, 20 seconds each.",
};

export default async function TriviaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasPlayedToday = false;

  if (user) {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("solo_trivia_plays")
      .select("id")
      .eq("user_id", user.id)
      .eq("play_date", today)
      .maybeSingle();
    hasPlayedToday = !!data;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <TriviaGame isAuthenticated={!!user} hasPlayedToday={hasPlayedToday} />
      </div>
    </div>
  );
}
