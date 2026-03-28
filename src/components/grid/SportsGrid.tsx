"use client";

import React, { useState } from "react";

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
  const [filledCells, setFilledCells] = useState<Set<string>>(new Set());

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function handleCellClick(row: number, col: number) {
    const key = cellKey(row, col);
    setSelectedCell((prev) => (prev === key ? null : key));
  }

  return (
    <div className="select-none">
      {/* Grid: 4 columns (1 label + 3 cells), 4 rows (1 label + 3 cells) */}
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
            <div
              className="flex flex-col items-center justify-center rounded-xl bg-zinc-800 px-3 py-3 text-center min-w-[80px]"
            >
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
              const isFilled = filledCells.has(key);

              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(ri, ci)}
                  className={[
                    "flex items-center justify-center rounded-xl min-h-[96px] transition-all duration-150",
                    "border-2 font-bold text-lg",
                    isFilled
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : isSelected
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 scale-[1.03]"
                        : "border-zinc-700 bg-zinc-900 text-zinc-600 hover:border-zinc-500 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {isFilled ? "✓" : isSelected ? "?" : ""}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
