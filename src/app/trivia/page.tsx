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

  // TODO: re-enable daily play limit before launch
  const hasPlayedToday = false;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <TriviaGame isAuthenticated={!!user} hasPlayedToday={hasPlayedToday} />
      </div>
    </div>
  );
}
