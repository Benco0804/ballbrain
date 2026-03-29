"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface NavbarActionsProps {
  coins: number | null;
}

export default function NavbarActions({ coins: initialCoins }: NavbarActionsProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);

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
      <Link
        href="/login"
        className="rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 transition-colors"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-yellow-400">
        🪙 {coins.toLocaleString()}
      </span>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
