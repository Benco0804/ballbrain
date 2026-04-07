"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  async function handleGuest() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInAnonymously();
    window.location.href = "/";
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="text-yellow-400" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 6h20v18a10 10 0 0 1-20 0V6Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M14 10H8a4 4 0 0 0 0 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M34 10h6a4 4 0 0 1 0 8h-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 34v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 40h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 14l1.5 4h4l-3.2 2.4 1.2 3.9L24 22l-3.5 2.3 1.2-3.9L18.5 18h4z" fill="currentColor" opacity="0.8" />
          </svg>
          <span className="text-2xl font-black tracking-tight">BallBrain</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="text-yellow-400 mx-auto mb-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 6h20v18a10 10 0 0 1-20 0V6Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M14 10H8a4 4 0 0 0 0 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M34 10h6a4 4 0 0 1 0 8h-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 34v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 40h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 14l1.5 4h4l-3.2 2.4 1.2 3.9L24 22l-3.5 2.3 1.2-3.9L18.5 18h4z" fill="currentColor" opacity="0.8" />
          </svg>
          <h1 className="text-3xl font-black tracking-tight mb-3">Think you know sports?</h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Daily challenges. Bragging rights.<br />Prove it.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3 mb-4">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3.5 text-sm text-center transition-colors"
          >
            Sign up, it&apos;s free
          </Link>
          <button
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-300 hover:text-white font-semibold py-3.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading…" : "Continue as guest"}
          </button>
        </div>
        <p className="text-xs text-zinc-600 text-center mb-8">
          Guests can play but won&apos;t save streaks, scores, or progress.
        </p>

        {/* Divider + login link */}
        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>
        <Link
          href="/login"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Already have an account?{" "}
          <span className="text-yellow-400 hover:text-yellow-300 font-semibold">Log in</span>
        </Link>

        {/* Sport tags */}
        <div className="flex gap-2 mt-12 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5">
            🏀 <span>NBA</span> <span className="text-orange-400/50 font-normal">· Daily grid</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5">
            ⚽ <span>Soccer</span> <span className="text-green-400/50 font-normal">· Daily grid</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1.5">
            🧠 <span>Trivia</span> <span className="text-yellow-400/50 font-normal">· Daily challenge</span>
          </span>
        </div>

      </div>
    </div>
  );
}
