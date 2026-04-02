import type { Metadata } from "next";
import HomeGameCards from "@/components/home/HomeGameCards";

export const metadata: Metadata = {
  title: "BallBrain — Sports Trivia Gaming",
  description: "Daily sports trivia challenges. Test your knowledge of NBA and Soccer.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Logo + tagline */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-5">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-label="Trophy" className="text-yellow-400" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 6h20v18a10 10 0 0 1-20 0V6Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M14 10H8a4 4 0 0 0 0 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M34 10h6a4 4 0 0 1 0 8h-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 34v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 40h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 14l1.5 4h4l-3.2 2.4 1.2 3.9L24 22l-3.5 2.3 1.2-3.9L18.5 18h4z" fill="currentColor" opacity="0.8" />
          </svg>
          <h1 className="text-5xl font-black tracking-tight">BallBrain</h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Sports trivia. Daily challenges.<br />Bragging rights.
        </p>
      </div>

      {/* Game cards (client component — handles "?" modal state) */}
      <HomeGameCards />

      {/* Footer */}
      <p className="mt-16 text-xs text-zinc-600">
        NBA · Soccer &nbsp;·&nbsp; New puzzles daily
      </p>
    </main>
  );
}
