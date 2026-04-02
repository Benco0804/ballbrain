"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import HowToPlayModal from "@/components/ui/HowToPlayModal";

interface NavbarActionsProps {
  coins: number | null;
  avatarUrl: string | null;
  username: string | null;
}

export default function NavbarActions({ coins: initialCoins, avatarUrl, username }: NavbarActionsProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    async function refreshCoins() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("coins")
        .eq("id", user.id)
        .single();
      if (data) setCoins(data.coins);
    }

    window.addEventListener("ballbrain:coins-updated", refreshCoins);
    return () => window.removeEventListener("ballbrain:coins-updated", refreshCoins);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (coins === null) {
    return (
      <>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
        >
          New here? 👀
        </button>
        <Link
          href="/login"
          className="rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 transition-colors"
        >
          Log in
        </Link>
        {showHowToPlay && <HowToPlayModal game="both" onClose={() => setShowHowToPlay(false)} />}
      </>
    );
  }

  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowHowToPlay(true)}
        className="hidden sm:block rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
      >
        New here? 👀
      </button>
      <span className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-yellow-400">
        🪙 {coins.toLocaleString()}
      </span>
      <Link
        href="/profile"
        className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 hover:border-yellow-400 transition-colors flex-shrink-0"
        title="Profile"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
            {initials}
          </div>
        )}
      </Link>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
      >
        Log out
      </button>
    </div>
    {showHowToPlay && <HowToPlayModal game="both" onClose={() => setShowHowToPlay(false)} />}
    </>
  );
}
