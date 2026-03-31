import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/profile/AvatarUpload";

export const metadata: Metadata = {
  title: "Profile — BallBrain",
};

function calculateStreak(isoDateStrings: string[]): number {
  if (isoDateStrings.length === 0) return 0;

  const unique = [...new Set(isoDateStrings)].sort((a, b) => b.localeCompare(a));

  // Streak is only "active" if the most recent activity was today or yesterday.
  const todayMs = Date.now();
  const yesterdayStr = new Date(todayMs - 86400000).toISOString().split("T")[0];
  if (unique[0] < yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const d1 = new Date(unique[i - 1] + "T00:00:00Z").getTime();
    const d2 = new Date(unique[i] + "T00:00:00Z").getTime();
    if (Math.round((d1 - d2) / 86400000) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: gridResults },
    { data: triviaPlays },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("username, display_name, coins, gems, avatar_url, created_at")
      .eq("id", user.id)
      .single(),

    supabase
      .from("game_results")
      .select("score, created_at")
      .eq("user_id", user.id),

    supabase
      .from("solo_trivia_plays")
      .select("questions_answered, play_date")
      .eq("user_id", user.id),
  ]);

  const displayName = profile?.display_name || profile?.username || "Player";

  // Stats
  const gridTotal = gridResults?.length ?? 0;
  const gridWins  = gridResults?.filter((r) => r.score === 9).length ?? 0;

  const triviaTotal = triviaPlays?.length ?? 0;
  const triviaWins  = triviaPlays?.filter((p) => p.questions_answered === 15).length ?? 0;
  const triviaWinRate = triviaTotal > 0 ? Math.round((triviaWins / triviaTotal) * 100) : null;

  // Streak: combine all days with any game activity
  const gridDates   = (gridResults ?? []).map((r) => r.created_at.split("T")[0]);
  const triviaDates = (triviaPlays ?? []).map((p) => p.play_date);
  const streak = calculateStreak([...gridDates, ...triviaDates]);

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
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight truncate">{displayName}</h1>
              {profile?.display_name && (
                <p className="text-sm text-zinc-500 truncate">@{profile.username}</p>
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

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Coins"
            value={`🪙 ${(profile?.coins ?? 0).toLocaleString()}`}
            valueClass="text-yellow-400"
          />
          <StatCard
            label="Current Streak"
            value={streak > 0 ? `🔥 ${streak}` : "—"}
            valueClass={streak > 0 ? "text-orange-400" : "text-zinc-500"}
          />
          <StatCard
            label="Gems"
            value={`💎 ${(profile?.gems ?? 0).toLocaleString()}`}
            valueClass="text-cyan-400"
          />
        </div>

        {/* Sports Grid stats */}
        <Section title="Sports Grid">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Games Played" value={gridTotal.toString()} />
            <StatCard
              label="Perfect Puzzles"
              value={gridTotal > 0 ? `${gridWins} (${Math.round((gridWins / gridTotal) * 100)}%)` : "—"}
              valueClass="text-green-400"
            />
          </div>
        </Section>

        {/* Solo Trivia stats */}
        <Section title="Solo Trivia">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Games Played" value={triviaTotal.toString()} />
            <StatCard
              label="Win Rate"
              value={triviaWinRate !== null ? `${triviaWinRate}%` : "—"}
              valueClass="text-green-400"
            />
          </div>
        </Section>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </div>
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
