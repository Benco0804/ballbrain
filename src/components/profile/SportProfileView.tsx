"use client";

import { useState } from "react";

export type SportStats = {
  sport: string;
  gamesPlayed: number;
  perfectGames: number;
  cellAccuracy: number | null;   // SUM(score) / SUM(guesses_used) * 100; null if no data
  triviaGamesPlayed: number;
  triviaWins: number;
  avgProgress: number | null;    // AVG(questions_answered) / TOTAL_QS * 100; null if no data
};

interface Props {
  sportStats: Record<string, SportStats>;
}

export default function SportProfileView({ sportStats }: Props) {
  const sports = Object.keys(sportStats).sort();
  const [selected, setSelected] = useState<string>("All");

  if (sports.length === 0) {
    return (
      <p className="text-center text-zinc-500 text-sm py-8">
        Play a game to see your sport stats here.
      </p>
    );
  }

  const tabs = ["All", ...sports];
  const visibleSports = selected === "All" ? sports : sports.filter((s) => s === selected);

  return (
    <div className="space-y-4">
      {/* Sport filter tabs — driven by data, not hardcoded */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelected(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === tab
                ? "bg-white text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Per-sport cards */}
      <div className="space-y-4">
        {visibleSports.map((sport) => (
          <SportCard key={sport} stats={sportStats[sport]} />
        ))}
      </div>
    </div>
  );
}

function SportCard({ stats }: { stats: SportStats }) {
  const { sport, gamesPlayed, perfectGames, cellAccuracy, triviaGamesPlayed, triviaWins, avgProgress } =
    stats;
  const perfectPct = gamesPlayed > 0 ? Math.round((perfectGames / gamesPlayed) * 100) : null;

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{sport}</h2>

      {/* Hero: Cell Accuracy */}
      {cellAccuracy !== null && (
        <div className="text-center py-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Cell Accuracy</p>
          <p className="text-5xl font-bold text-white tabular-nums">{cellAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-zinc-600 mt-1">correct guesses per grid attempt</p>
        </div>
      )}

      {/* Supporting stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Games Played" value={gamesPlayed > 0 ? String(gamesPlayed) : "—"} />
        <Stat
          label="Perfect Puzzles"
          value={perfectPct !== null ? `${perfectGames} (${perfectPct}%)` : "—"}
          valueClass="text-green-400"
        />
        <Stat
          label="Avg Trivia Progress"
          value={avgProgress !== null ? `${avgProgress.toFixed(0)}%` : "—"}
        />
        <Stat
          label="Trivia Wins"
          value={triviaGamesPlayed > 0 ? String(triviaWins) : "—"}
          valueClass={triviaWins > 0 ? "text-green-400" : "text-white"}
        />
      </div>
    </div>
  );
}

function Stat({
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
