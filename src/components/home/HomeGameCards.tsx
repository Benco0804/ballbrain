"use client";

import Link from "next/link";
import { useState } from "react";
import HowToPlayModal from "@/components/ui/HowToPlayModal";

type ModalGame = "grid" | "trivia" | "draft";

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

function DraftIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Three stacked cards */}
      <rect x="6"  y="14" width="22" height="16" rx="3" fill="currentColor" opacity="0.25" />
      <rect x="10" y="10" width="22" height="16" rx="3" fill="currentColor" opacity="0.5" />
      <rect x="14" y="6"  width="22" height="16" rx="3" fill="currentColor" opacity="0.9" />
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
    id: "grid" as ModalGame,
    href: "/sports-grid",
    icon: <GridIcon />,
    iconColor: "text-yellow-400",
    accentBorder: "hover:border-yellow-500/50",
    badge: "Daily",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    name: "Sports Grid",
    description: "Fill the grid. Flex your knowledge. No second chances. 💪",
    sports: ["NBA", "Soccer"],
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-zinc-950",
  },
  {
    id: "trivia" as ModalGame,
    href: "/trivia",
    icon: <TriviaIcon />,
    iconColor: "text-indigo-400",
    accentBorder: "hover:border-indigo-500/50",
    badge: "Daily",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    name: "Solo Trivia",
    description: "10 questions. 20 seconds each. How far can you go? 🧠",
    sports: ["NBA", "Soccer"],
    ctaClass: "bg-indigo-500 hover:bg-indigo-400 text-white",
  },
  {
    id: "draft" as ModalGame,
    href: "/draft-board",
    icon: <DraftIcon />,
    iconColor: "text-purple-400",
    accentBorder: "hover:border-purple-500/50",
    badge: "Daily",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    name: "Draft Board",
    description: "12 players. 9 spots. Pick the right one.",
    sports: ["NBA", "Soccer"],
    ctaClass: "bg-purple-500 hover:bg-purple-400 text-white",
  },
] as const;

export default function HomeGameCards() {
  const [modalGame, setModalGame] = useState<ModalGame | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-4xl">
        {GAMES.map((game) => (
          <div
            key={game.href}
            className={[
              "flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6",
              "transition-colors duration-200",
              game.accentBorder,
            ].join(" ")}
          >
            {/* Icon + badge + "?" row */}
            <div className="flex items-start justify-between mb-5">
              <div className={game.iconColor}>{game.icon}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${game.badgeColor}`}>
                  {game.badge}
                </span>
                <button
                  onClick={() => setModalGame(game.id)}
                  className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                  aria-label={`How to play ${game.name}`}
                >
                  ?
                </button>
              </div>
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

      {modalGame && (
        <HowToPlayModal game={modalGame} onClose={() => setModalGame(null)} />
      )}
    </>
  );
}
