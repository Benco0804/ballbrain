"use client";

import React, { useState, useRef, useEffect } from "react";

interface GridCategory {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
}

interface SportsGridProps {
  rowCategories: GridCategory[];
  colCategories: GridCategory[];
}

const SPORT_COLORS: Record<GridCategory["sport"], string> = {
  NBA: "text-orange-400",
  NFL: "text-blue-400",
  Soccer: "text-green-400",
};

export default function SportsGrid({ rowCategories, colCategories }: SportsGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function handleCellClick(row: number, col: number) {
    const key = cellKey(row, col);
    // Don't allow re-clicking a filled cell
    if (guesses[key]) return;
    setSelectedCell((prev) => (prev === key ? null : key));
    setInputValue("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCell || !inputValue.trim()) return;
    setGuesses((prev) => ({ ...prev, [selectedCell]: inputValue.trim() }));
    setSelectedCell(null);
    setInputValue("");
  }

  // Focus input whenever a cell is selected
  useEffect(() => {
    if (selectedCell) inputRef.current?.focus();
  }, [selectedCell]);

  return (
    <div className="select-none">
      {/* Grid */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] grid-rows-[auto_1fr_1fr_1fr] gap-2">

        {/* Top-left corner — empty */}
        <div />

        {/* Column headers */}
        {colCategories.map((cat, ci) => (
          <div
            key={ci}
            className="flex flex-col items-center justify-center rounded-xl bg-zinc-800 px-3 py-3 text-center min-h-[72px]"
          >
            <span className={`text-xs font-bold uppercase tracking-wider ${SPORT_COLORS[cat.sport]}`}>
              {cat.sport}
            </span>
            <span className="mt-1 text-sm font-semibold text-white leading-tight">
              {cat.label}
            </span>
          </div>
        ))}

        {/* Rows */}
        {rowCategories.map((rowCat, ri) => (
          <React.Fragment key={ri}>
            {/* Row header */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-800 px-3 py-3 text-center min-w-[80px]">
              <span className={`text-xs font-bold uppercase tracking-wider ${SPORT_COLORS[rowCat.sport]}`}>
                {rowCat.sport}
              </span>
              <span className="mt-1 text-sm font-semibold text-white leading-tight">
                {rowCat.label}
              </span>
            </div>

            {/* Cells */}
            {colCategories.map((_, ci) => {
              const key = cellKey(ri, ci);
              const isSelected = selectedCell === key;
              const guess = guesses[key];

              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(ri, ci)}
                  disabled={!!guess}
                  className={[
                    "flex items-center justify-center rounded-xl min-h-[96px] transition-all duration-150 px-2",
                    "border-2 font-bold text-sm text-center leading-tight",
                    guess
                      ? "border-green-500 bg-green-500/20 text-green-300 cursor-default"
                      : isSelected
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 scale-[1.03]"
                        : "border-zinc-700 bg-zinc-900 text-zinc-600 hover:border-zinc-500 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {guess ?? (isSelected ? "…" : "")}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Guess input — shown only when a cell is selected */}
      {selectedCell && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a player name…"
            className="flex-1 rounded-xl bg-zinc-800 border-2 border-zinc-700 focus:border-yellow-400 outline-none px-4 py-3 text-white placeholder-zinc-500 text-sm transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-xl bg-yellow-400 text-zinc-950 font-bold px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
