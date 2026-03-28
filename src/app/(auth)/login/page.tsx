"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-400 mb-7">Log in to your BallBrain account.</p>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
          Sign up
        </Link>
      </p>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <button
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full rounded-xl border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 text-sm font-semibold py-3 transition-colors disabled:opacity-50"
      >
        Continue as Guest
      </button>
      <p className="text-center text-xs text-zinc-600 mt-2">
        Progress won&apos;t be saved. You can create an account later.
      </p>
    </div>
  );
}
