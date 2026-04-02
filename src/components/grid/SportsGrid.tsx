"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalize } from "@/lib/sports/normalize";
import { ECONOMY } from "@/lib/economy/constants";
import ResultModal from "./ResultModal";

interface GridCategory {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
  categoryId?: string;
}

interface SportsGridProps {
  puzzleId: string;
  sport: "NBA" | "Soccer";
  rowCategories: GridCategory[];
  colCategories: GridCategory[];
  /** Maps "row-col" cell keys to the list of accepted player names for that cell. */
  validPlayers: Record<string, string[]>;
  isAuthenticated: boolean;
  nextPuzzleUrl: string | null;
}

const SPORT_OPTIONS: { sport: "NBA" | "Soccer"; emoji: string; color: string; activeColor: string }[] = [
  { sport: "NBA",    emoji: "🏀", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", activeColor: "text-orange-300 border-orange-400 bg-orange-400/20" },
  { sport: "Soccer", emoji: "⚽", color: "text-green-400 border-green-500/30 bg-green-500/10",    activeColor: "text-green-300 border-green-400 bg-green-400/20" },
];

const SPORT_COLORS: Record<GridCategory["sport"], string> = {
  NBA: "text-orange-400",
  NFL: "text-blue-400",
  Soccer: "text-green-400",
};

const MAX_GUESSES = 9;
const TOTAL_CELLS = 9;
const MAX_PLAYS_PER_SPORT = 2;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function lsKey(sport: string) {
  return `ballbrain_grid_${sport}_${todayStr()}`;
}

type CellState = { status: "correct"; name: string } | { status: "wrong" } | { status: "idle" };

export default function SportsGrid({ puzzleId, sport, rowCategories, colCategories, validPlayers, isAuthenticated, nextPuzzleUrl }: SportsGridProps) {
  const router = useRouter();
  const [clientBlocked, setClientBlocked] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [pendingNavSport, setPendingNavSport] = useState<"NBA" | "Soccer" | null>(null);
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [positiveFeedback, setPositiveFeedback] = useState<string | null>(null);
  const [justCorrectCell, setJustCorrectCell] = useState<string | null>(null);
  const [inputShaking, setInputShaking] = useState(false);
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stubSavedRef = useRef(false);
  // Stable session ID for this play — identifies this row in game_results.
  const sessionIdRef = useRef(crypto.randomUUID());

  // Client-side play count check (catches Router Cache / bfcache bypasses).
  useEffect(() => {
    if (!isAuthenticated) return;
    const plays = parseInt(localStorage.getItem(lsKey(sport)) ?? "0");
    if (plays >= MAX_PLAYS_PER_SPORT) setClientBlocked(true);
  }, [sport, isAuthenticated]);

  function cellKey(row: number, col: number) {
    return `${row}-${col}`;
  }

  function handleCellClick(row: number, col: number) {
    if (gameOver) return;
    const key = cellKey(row, col);
    if (cellStates[key]?.status === "correct") return;
    setSelectedCell((prev) => (prev === key ? null : key));
    setInputValue("");
    setFeedback(null);
    setPositiveFeedback(null);
  }

  async function handleHint() {
    if (!selectedCell || hintLoading || hintsUsedCount >= ECONOMY.SPORTS_GRID.MAX_HINTS_PER_PUZZLE) return;
    setHintLoading(true);
    setHintError(null);
    try {
      const res = await fetch("/api/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleId, cellKey: selectedCell }),
      });
      const data = await res.json();
      if (!res.ok) {
        const messages: Record<string, string> = {
          insufficient_coins: "Not enough coins.",
          hint_limit_reached: "No hints remaining.",
        };
        setHintError(messages[data.error] ?? "Could not load hint.");
      } else {
        // Auto-answer the cell — hint acts as a correct submission.
        const cell = selectedCell;
        const newStates = { ...cellStates, [cell]: { status: "correct" as const, name: data.player } };
        const score = Object.values(newStates).filter((s) => s.status === "correct").length;

        setCellStates(newStates);
        setSelectedCell(null);
        setInputValue("");
        setFeedback(null);
        setHintsUsedCount((n) => n + 1);
        window.dispatchEvent(new CustomEvent("ballbrain:coins-updated"));

        if (score === TOTAL_CELLS) {
          setGameOver(true);
          saveResult(score, guessesUsed, newStates);
        }
      }
    } catch {
      setHintError("Could not load hint.");
    } finally {
      setHintLoading(false);
    }
  }

  async function saveResult(
    score: number,
    totalGuesses: number,
    states: Record<string, CellState>
  ) {
    const cellsFilled: Record<string, string> = {};
    for (const [key, state] of Object.entries(states)) {
      if (state.status === "correct") cellsFilled[key] = state.name;
    }

    // Calculate coins locally for immediate display — server validates and persists.
    const isPerfect = score === 9;
    const earned =
      score * ECONOMY.SPORTS_GRID.COINS_PER_CORRECT_CELL +
      (isPerfect ? ECONOMY.SPORTS_GRID.PERFECT_BONUS : ECONOMY.SPORTS_GRID.PARTICIPATION);
    setCoinsEarned(earned);

    // Show modal after a brief pause so the player sees their final board.
    setTimeout(() => setShowModal(true), 700);

    try {
      await fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, puzzleId, sport, score, guessesUsed: totalGuesses, cellsFilled, completed: true }),
      });
      // Notify the navbar to refresh the coin balance.
      window.dispatchEvent(new CustomEvent("ballbrain:coins-updated"));
    } catch {
      // Silent fail — game result saving is non-critical
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCell || !inputValue.trim() || gameOver) return;
    setPositiveFeedback(null);

    const accepted = validPlayers[selectedCell] ?? [];

    if (accepted.length === 0) {
      setFeedback("No valid answer exists for this combination.");
      return;
    }

    // On first guess, write a stub row so the daily limit kicks in immediately.
    if (!stubSavedRef.current && isAuthenticated) {
      stubSavedRef.current = true;
      // Increment localStorage play count for client-side gating.
      const key = lsKey(sport);
      const plays = parseInt(localStorage.getItem(key) ?? "0") + 1;
      localStorage.setItem(key, String(plays));
      fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, puzzleId, sport, score: 0, guessesUsed: 0, cellsFilled: {}, completed: false }),
      }).catch(() => {});
    }

    const normalizedInput = normalize(inputValue.trim());
    const match = accepted.find((name) => normalize(name) === normalizedInput);
    const newGuessesUsed = guessesUsed + 1;

    if (match) {
      // Reject if this player is already placed in another cell.
      const duplicate = Object.entries(cellStates).some(
        ([key, state]) =>
          key !== selectedCell &&
          state.status === "correct" &&
          normalize(state.name) === normalizedInput
      );
      if (duplicate) {
        setFeedback("🙄 Already used that one");
        return;
      }

      const cell = selectedCell; // capture before state updates clear it
      const newStates = { ...cellStates, [cell]: { status: "correct" as const, name: match } };
      const score = Object.values(newStates).filter((s) => s.status === "correct").length;
      const isComplete = score === TOTAL_CELLS || newGuessesUsed >= MAX_GUESSES;

      setCellStates(newStates);
      setGuessesUsed(newGuessesUsed);
      setSelectedCell(null);
      setInputValue("");
      setFeedback(null);
      setJustCorrectCell(cell);
      setPositiveFeedback("🔥 Got it!");
      setTimeout(() => {
        setJustCorrectCell(null);
        setPositiveFeedback(null);
      }, 900);

      if (isComplete) {
        setGameOver(true);
        saveResult(score, newGuessesUsed, newStates);
      }
    } else {
      const newStates = { ...cellStates, [selectedCell]: { status: "wrong" as const } };
      setCellStates(newStates);
      setGuessesUsed(newGuessesUsed);
      setFeedback("❌ Nope!");
      setInputShaking(true);
      setTimeout(() => setInputShaking(false), 400);

      const score = Object.values(cellStates).filter((s) => s.status === "correct").length;
      const isComplete = newGuessesUsed >= MAX_GUESSES;

      if (isComplete) {
        setGameOver(true);
        saveResult(score, newGuessesUsed, cellStates);
      } else {
        setTimeout(() => {
          setCellStates((prev) => {
            const next = { ...prev };
            if (next[selectedCell]?.status === "wrong") delete next[selectedCell];
            return next;
          });
        }, 1200);
      }
    }
  }

  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedCell]);

  const correctCount = Object.values(cellStates).filter((s) => s.status === "correct").length;
  const guessesLeft = MAX_GUESSES - guessesUsed;

  // Client-side blocked screen (catches Router Cache / bfcache hits).
  if (clientBlocked) {
    const sportOption = SPORT_OPTIONS.find((o) => o.sport === sport)!;
    return (
      <div className="flex flex-col items-center text-center max-w-sm mx-auto gap-4 py-12">
        <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-8 w-full">
          <p className="text-white font-bold text-lg mb-2">
            You&apos;ve used all your shots today! 🎯
          </p>
          <p className="text-zinc-400 text-sm">Come back tomorrow for more.</p>
        </div>
        <a
          href="/sports-grid"
          className="rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-6 py-3 text-sm transition-colors"
        >
          ← Go Back
        </a>
      </div>
    );
  }

  function handleSportTabClick(s: "NBA" | "Soccer") {
    if (s === sport) return;
    if (guessesUsed > 0) {
      setPendingNavSport(s);
    } else {
      router.push(`/sports-grid?sport=${s}`);
    }
  }

  return (
    <div className="select-none">
      {/* Sport switcher */}
      <div className="flex gap-2 mb-6">
        {SPORT_OPTIONS.map(({ sport: s, emoji, color, activeColor }) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSportTabClick(s)}
            className={`flex-1 text-center rounded-xl py-2 text-sm font-semibold border transition-colors hover:opacity-80 ${
              s === sport ? activeColor : color
            }`}
          >
            {emoji} {s}
          </button>
        ))}
      </div>

      {/* Confirmation modal */}
      {pendingNavSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-6 flex flex-col gap-4">
            <h2 className="text-xl font-extrabold text-white">Quitting already? 👀</h2>
            <p className="text-sm text-zinc-400">
              Your current game will be abandoned and you&apos;ll lose your progress.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPendingNavSport(null)}
                className="w-full rounded-xl bg-green-500 text-white font-bold py-3 text-sm hover:bg-green-400 transition-colors"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = "/sports-grid"; }}
                className="w-full rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-3 text-sm hover:bg-red-500/30 transition-colors"
              >
                Yes, I Give Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">{correctCount} / {TOTAL_CELLS} cells filled</span>
          {hintsUsedCount > 0 && (
            <span className="text-xs text-zinc-600">
              {hintsUsedCount}/{ECONOMY.SPORTS_GRID.MAX_HINTS_PER_PUZZLE} hints used
            </span>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold border ${
          guessesLeft <= 2
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
        }`}>
          {guessesLeft === 1 ? "😬 Last shot..." : `${guessesLeft} shots 🎯`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${(correctCount / TOTAL_CELLS) * 100}%` }}
        />
      </div>

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
                  disabled={isCorrect || gameOver}
                  className={[
                    "flex items-center justify-center rounded-xl min-h-[96px] transition-all duration-300 px-2",
                    "border-2 text-sm text-center leading-tight font-semibold",
                    isCorrect
                      ? key === justCorrectCell
                        ? "border-green-400 bg-green-400/50 text-green-200 scale-[1.05]"
                        : "border-green-500 bg-green-500/20 text-green-300 cursor-default"
                      : isWrong
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : isSelected
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 scale-[1.03]"
                          : gameOver
                            ? "border-zinc-700 bg-zinc-900 text-zinc-600 cursor-default"
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

      {/* Brief positive feedback — visible after correct answer even when form is hidden */}
      {positiveFeedback && (
        <p className="mt-3 text-center text-sm font-bold text-green-400">{positiveFeedback}</p>
      )}

      {/* Guess input — hidden once game ends */}
      {!gameOver && selectedCell && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setFeedback(null); }}
              placeholder="Type a player name…"
              className={`flex-1 rounded-xl bg-zinc-800 border-2 border-zinc-700 focus:border-yellow-400 outline-none px-4 py-3 text-white placeholder-zinc-500 text-sm transition-colors${inputShaking ? " animate-shake" : ""}`}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="rounded-xl bg-yellow-400 text-zinc-950 font-bold px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
            >
              Lock it in 🔒
            </button>
          </div>
          {feedback && (
            <p className="text-sm text-red-400 px-1">{feedback}</p>
          )}

          {/* Hint row */}
          <div className="flex items-center gap-3 px-1">
            {!isAuthenticated ? (
              <a href="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Log in to use hints
              </a>
            ) : hintsUsedCount >= ECONOMY.SPORTS_GRID.MAX_HINTS_PER_PUZZLE ? (
              <span className="text-xs text-zinc-600">No hints remaining</span>
            ) : (
              <button
                type="button"
                onClick={handleHint}
                disabled={hintLoading}
                className="text-xs text-zinc-400 hover:text-yellow-400 border border-zinc-700 hover:border-yellow-400/50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hintLoading ? "Revealing…" : `Hint · 🪙 ${ECONOMY.SPORTS_GRID.HINT_COST}`}
              </button>
            )}
            {hintError && <span className="text-xs text-red-400">{hintError}</span>}
          </div>
        </form>
      )}

      {/* Result modal — shown 700ms after game ends */}
      {showModal && (
        <ResultModal
          won={correctCount === TOTAL_CELLS}
          correctCount={correctCount}
          coinsEarned={coinsEarned}
          cellStates={cellStates}
          validPlayers={validPlayers}
          rowCategories={rowCategories}
          colCategories={colCategories}
          nextPuzzleUrl={nextPuzzleUrl}
        />
      )}
    </div>
  );
}
