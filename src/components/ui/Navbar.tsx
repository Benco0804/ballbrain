import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavbarActions from "./NavbarActions";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let coins: number | null = null;
  let avatarUrl: string | null = null;
  let username: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("coins, avatar_url, username")
      .eq("id", user.id)
      .single();
    coins    = data?.coins     ?? 0;
    avatarUrl = data?.avatar_url ?? null;
    username  = data?.username   ?? null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold text-white tracking-tight hover:text-yellow-400 transition-colors"
        >
          BallBrain
        </Link>
        <NavbarActions coins={coins} avatarUrl={avatarUrl} username={username} />
      </div>
    </nav>
  );
}
