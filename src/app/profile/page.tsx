import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/profile/AvatarUpload";
import UsernameEdit from "@/components/profile/UsernameEdit";
import SportProfileView, { type SportStats } from "@/components/profile/SportProfileView";
import { ECONOMY } from "@/lib/economy/constants";

export const metadata: Metadata = {
  title: "Profile — BallBrain",
};

function buildSportStats(
  gridResults: { sport: string; score: number; guesses_used: number }[],
  triviaPlays: { sport: string; questions_answered: number }[]
): Record<string, SportStats> {
  const TOTAL_QS = ECONOMY.SOLO_TRIVIA.TOTAL_QUESTIONS;

  type Acc = {
    gamesPlayed: number;
    perfectGames: number;
    scoreSum: number;
    guessesSum: number;
    triviaGamesPlayed: number;
    triviaWins: number;
    questionsSum: number;
  };

  const acc: Record<string, Acc> = {};

  const ensure = (sport: string) => {
    if (!acc[sport]) {
      acc[sport] = {
        gamesPlayed: 0,
        perfectGames: 0,
        scoreSum: 0,
        guessesSum: 0,
        triviaGamesPlayed: 0,
        triviaWins: 0,
        questionsSum: 0,
      };
    }
  };

  for (const r of gridResults) {
    ensure(r.sport);
    acc[r.sport].gamesPlayed++;
    if (r.score === 9) acc[r.sport].perfectGames++;
    if (r.guesses_used > 0) {
      acc[r.sport].scoreSum += r.score;
      acc[r.sport].guessesSum += r.guesses_used;
    }
  }

  for (const p of triviaPlays) {
    if (p.sport === "Mix") continue; // Mix is a trivia mode, not a sport
    ensure(p.sport);
    acc[p.sport].triviaGamesPlayed++;
    if (p.questions_answered === TOTAL_QS) acc[p.sport].triviaWins++;
    acc[p.sport].questionsSum += p.questions_answered;
  }

  const result: Record<string, SportStats> = {};
  for (const [sport, a] of Object.entries(acc)) {
    result[sport] = {
      sport,
      gamesPlayed: a.gamesPlayed,
      perfectGames: a.perfectGames,
      cellAccuracy: a.guessesSum > 0 ? (a.scoreSum / a.guessesSum) * 100 : null,
      triviaGamesPlayed: a.triviaGamesPlayed,
      triviaWins: a.triviaWins,
      avgProgress:
        a.triviaGamesPlayed > 0
          ? (a.questionsSum / a.triviaGamesPlayed / TOTAL_QS) * 100
          : null,
    };
  }

  return result;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: gridResults }, { data: triviaPlays }] = await Promise.all([
    supabase
      .from("users")
      .select("username, display_name, coins, avatar_url, created_at, current_streak, longest_streak")
      .eq("id", user.id)
      .single(),

    supabase
      .from("game_results")
      .select("score, guesses_used, sport")
      .eq("user_id", user.id)
      .not("completed_at", "is", null),

    supabase
      .from("solo_trivia_plays")
      .select("questions_answered, sport")
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
  ]);

  const username    = profile?.username ?? "Player";
  const displayName = profile?.display_name || username;
  const streak      = profile?.current_streak ?? 0;
  const bestStreak  = profile?.longest_streak ?? 0;

  const sportStats = buildSportStats(gridResults ?? [], triviaPlays ?? []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">

        {/* Profile card */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex items-center gap-5">
            <AvatarUpload
              userId={user.id}
              avatarUrl={profile?.avatar_url ?? null}
              displayName={displayName}
            />
            <div className="min-w-0 flex-1">
              <UsernameEdit userId={user.id} initialUsername={username} />
              {profile?.display_name && (
                <p className="text-sm text-zinc-500 truncate">@{username}</p>
              )}
              <p className="text-sm text-zinc-500 truncate mt-0.5">{user.email}</p>
              {profile?.created_at && (
                <p className="text-xs text-zinc-600 mt-1">
                  Member since {formatDate(profile.created_at.split("T")[0])}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Global stats (cross-sport) */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Coins"
            value={`🪙 ${(profile?.coins ?? 0).toLocaleString()}`}
            valueClass="text-yellow-400"
          />
          <StatCard
            label="Streak"
            value={streak > 0 ? `🔥 ${streak}` : "—"}
            valueClass={streak > 0 ? "text-orange-400" : "text-zinc-500"}
          />
          <StatCard
            label="Best Streak"
            value={bestStreak > 0 ? `★ ${bestStreak}` : "—"}
            valueClass={bestStreak > 0 ? "text-amber-400" : "text-zinc-500"}
          />
        </div>

        {/* Per-sport stats */}
        <SportProfileView sportStats={sportStats} />

      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-center">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
