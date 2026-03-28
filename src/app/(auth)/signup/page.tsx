"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Passed to handle_new_user trigger via raw_user_meta_data.
        data: { username },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M4 11l5 5 9-9" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-400">
            We sent a confirmation link to{" "}
            <span className="text-white font-semibold">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Create account</h1>
        <p className="text-sm text-zinc-400 mb-7">Join BallBrain and start playing.</p>

        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Letters, numbers, and underscores only"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              placeholder="ballbrain_fan"
            />
          </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
              placeholder="Min. 8 characters"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-500 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
