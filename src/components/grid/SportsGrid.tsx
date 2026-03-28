"use client";

import React, { useState, useRef, useEffect } from "react";
import { normalize } from "@/lib/sports/normalize";

interface GridCategory {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
  categoryId?: string;
}

interface SportsGridProps {
  rowCategories: GridCategory[];
  colCategories: GridCategory[];
  /** Maps "row-col" cell keys to the list of accepted player names for that cell. */
  validPlayers: Record<string, string[]>;
}

const SPORT_COLORS: Record<GridCategory["sport"], string> = {
  NBA: "text-orange-400",
  NFL: "text-blue-400",
  Soccer: "text-green-400",
};

type CellState = { status: "correct"; name: string } | { status: "wrong" } | { status: "idle" };

export default function SportsGrid({ rowCategories, colCategories, validPlayers }: SportsGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function handleCellClick(row: number, col: number) {
    const key = cellKey(row, col);
    if (cellStates[key]?.status === "correct") return;
    setSelectedCell((prev) => (prev === key ? null : key));
    setInputValue("");
    setFeedback(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCell || !inputValue.trim()) return;

    const accepted = validPlayers[selectedCell] ?? [];

    if (accepted.length === 0) {
      setFeedback("No valid answer exists for this combination.");
      return;
    }

    const normalizedInput = normalize(inputValue.trim());
    const match = accepted.find((name) => normalize(name) === normalizedInput);

    if (match) {
      setCellStates((prev) => ({
        ...prev,
        [selectedCell]: { status: "correct", name: match },
      }));
      setSelectedCell(null);
      setInputValue("");
      setFeedback(null);
    } else {
      setCellStates((prev) => ({ ...prev, [selectedCell]: { status: "wrong" } }));
      setFeedback("That answer doesn't work for this cell. Try again.");
      setTimeout(() => {
        setCellStates((prev) => {
          const next = { ...prev };
          if (next[selectedCell]?.status === "wrong") delete next[selectedCell];
          return next;
        });
      }, 1200);
    }
  }

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
              const state = cellStates[key];
              const isCorrect = state?.status === "correct";
              const isWrong = state?.status === "wrong";

              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(ri, ci)}
                  disabled={isCorrect}
                  className={[
                    "flex items-center justify-center rounded-xl min-h-[96px] transition-all duration-150 px-2",
                    "border-2 text-sm text-center leading-tight font-semibold",
                    isCorrect
                      ? "border-green-500 bg-green-500/20 text-green-300 cursor-default"
                      : isWrong
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : isSelected
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 scale-[1.03]"
                          : "border-zinc-700 bg-zinc-900 text-zinc-600 hover:border-zinc-500 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {isCorrect && state.status === "correct" ? state.name : isSelected ? "…" : ""}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Guess input */}
      {selectedCell && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setFeedback(null); }}
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
          </div>
          {feedback && (
            <p className="text-sm text-red-400 px-1">{feedback}</p>
          )}
        </form>
      )}
    </div>
  );
}
