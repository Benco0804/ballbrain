import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BallBrain — Sports Trivia Gaming",
  description: "Daily sports trivia challenges. Test your knowledge of NBA and Soccer.",
};

function GridIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="15" y="2"  width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="28" y="2"  width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="2"  y="15" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="15" y="15" width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="28" y="15" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="2"  y="28" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="15" y="28" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="28" y="28" width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function TriviaIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="bold" fill="currentColor" opacity="0.9">?</text>
    </svg>
  );
}

const GAMES = [
  {
    href: "/sports-grid",
    icon: <GridIcon />,
    iconColor: "text-yellow-400",
    accentBorder: "hover:border-yellow-500/50",
    badge: "Daily",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    name: "Sports Grid",
    description:
      "Fill the grid. Flex your knowledge. No second chances. 💪",
    sports: ["NBA", "Soccer"],
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-zinc-950",
  },
  {
    href: "/trivia",
    icon: <TriviaIcon />,
    iconColor: "text-indigo-400",
    accentBorder: "hover:border-indigo-500/50",
    badge: "Daily",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    name: "Solo Trivia",
    description:
      "10 questions. 20 seconds each. How far can you go? 🧠",
    sports: ["NBA", "Soccer"],
    ctaClass: "bg-indigo-500 hover:bg-indigo-400 text-white",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Logo + tagline */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-5">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-label="Trophy" className="text-yellow-400" xmlns="http://www.w3.org/2000/svg">
            {/* Cup body */}
            <path d="M14 6h20v18a10 10 0 0 1-20 0V6Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Left handle */}
            <path d="M14 10H8a4 4 0 0 0 0 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Right handle */}
            <path d="M34 10h6a4 4 0 0 1 0 8h-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Stem */}
            <path d="M24 34v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Base */}
            <path d="M16 40h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Star inside cup */}
            <path d="M24 14l1.5 4h4l-3.2 2.4 1.2 3.9L24 22l-3.5 2.3 1.2-3.9L18.5 18h4z" fill="currentColor" opacity="0.8" />
          </svg>
          <h1 className="text-5xl font-black tracking-tight">BallBrain</h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Sports trivia. Daily challenges.<br />Bragging rights.
        </p>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {GAMES.map((game) => (
          <div
            key={game.href}
            className={[
              "flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6",
              "transition-colors duration-200",
              game.accentBorder,
            ].join(" ")}
          >
            {/* Icon + badge row */}
            <div className="flex items-start justify-between mb-5">
              <div className={game.iconColor}>{game.icon}</div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${game.badgeColor}`}>
                {game.badge}
              </span>
            </div>

            {/* Name + description */}
            <h2 className="text-xl font-extrabold tracking-tight mb-2">{game.name}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed flex-1 mb-6">
              {game.description}
            </p>

            {/* Sport tags */}
            <div className="flex gap-2 mb-6">
              {game.sports.map((s) => (
                <span key={s} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
                  {s}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={game.href}
              className={[
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold",
                "transition-colors duration-150",
                game.ctaClass,
              ].join(" ")}
            >
              Play
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-zinc-600">
        NBA · Soccer &nbsp;·&nbsp; New puzzles daily
      </p>
    </main>
  );
}
