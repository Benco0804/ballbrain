"use client";

import React, { useState, useRef, useEffect } from "react";
import { ECONOMY } from "@/lib/economy/constants";
import { getGuestCount, incrementGuestCount } from "@/lib/game/guestPlays";
import DraftResultModal from "./DraftResultModal";

interface GridCategory {
  label: string;
  sport: "NBA" | "NFL" | "Soccer";
  categoryId?: string;
}

interface DraftBoardProps {
  puzzleId: string;
  sport: "NBA" | "Soccer";
  rowCategories: GridCategory[];
  colCategories: GridCategory[];
  /** Maps "row-col" cell keys to accepted player names for that cell. */
  validPlayers: Record<string, string[]>;
  /** 12 player names (9 correct answers + 3 decoys), pre-shuffled. */
  draftPlayers: string[];
  isAuthenticated: boolean;
}

const SPORT_COLORS: Record<GridCategory["sport"], string> = {
  NBA:    "text-orange-400",
  NFL:    "text-blue-400",
  Soccer: "text-green-400",
};

const MAX_DRAFT_PLAYS_PER_SPORT = 1;
const TOTAL_CELLS = 9;

type CellState = { player: string; correct: boolean } | null;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function lsKey(sport: string) {
  return `ballbrain_draft_${sport}_${todayStr()}`;
}

export default function DraftBoard({
  puzzleId,
  sport,
  rowCategories,
  colCategories,
  validPlayers,
  draftPlayers,
  isAuthenticated,
}: DraftBoardProps) {
  const [clientBlocked, setClientBlocked] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [placedCards, setPlacedCards] = useState<Set<string>>(new Set());
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [flashingCell, setFlashingCell] = useState<string | null>(null);
  const [justCorrectCell, setJustCorrectCell] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [uniquenessBonus, setUniquenessBonus] = useState(0);
  const [showModal, setShowModal] = useState(false);
  // Drag-and-drop state (desktop only — HTML5 drag API does not fire on touch).
  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const stubSavedRef = useRef(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  // Client-side blocked check (catches Router Cache / bfcache hits).
  useEffect(() => {
    if (isAuthenticated) {
      const plays = parseInt(localStorage.getItem(lsKey(sport)) ?? "0");
      if (plays >= MAX_DRAFT_PLAYS_PER_SPORT) setClientBlocked(true);
    } else {
      if (getGuestCount("draft", sport) >= MAX_DRAFT_PLAYS_PER_SPORT) setClientBlocked(true);
    }
  }, [sport, isAuthenticated]);

  const correctCount = Object.values(cellStates).filter((s) => s?.correct).length;
  const attemptsLeft = ECONOMY.DRAFT_BOARD.MAX_WRONG_ATTEMPTS - wrongAttempts;

  function writeStubRow() {
    if (stubSavedRef.current) return;
    stubSavedRef.current = true;
    if (isAuthenticated) {
      const key = lsKey(sport);
      const plays = parseInt(localStorage.getItem(key) ?? "0") + 1;
      localStorage.setItem(key, String(plays));
      fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          puzzleId,
          sport,
          gameMode: "draft-board",
          score: 0,
          guessesUsed: 0,
          cellsFilled: {},
          completed: false,
        }),
      }).catch(() => {});
    }
    // Guests: count incremented in saveResult on game completion.
  }

  async function saveResult(
    finalCellStates: Record<string, CellState>,
    finalWrongAttempts: number,
  ) {
    const score = Object.values(finalCellStates).filter((s) => s?.correct).length;
    const isPerfect = score === TOTAL_CELLS;

    // In Draft Board each placed card is unique, so uniqueness bonus always applies.
    const bonus = score * ECONOMY.DRAFT_BOARD.UNIQUE_PLAYER_BONUS;
    const earned =
      score * ECONOMY.DRAFT_BOARD.COINS_PER_CORRECT_CELL +
      bonus +
      (isPerfect ? ECONOMY.DRAFT_BOARD.PERFECT_BONUS : ECONOMY.DRAFT_BOARD.PARTICIPATION);

    setCoinsEarned(earned);
    setUniquenessBonus(bonus);

    setTimeout(() => setShowModal(true), 700);

    if (!isAuthenticated) {
      incrementGuestCount("draft", sport);
    }

    const cellsFilled: Record<string, string> = {};
    for (const [key, state] of Object.entries(finalCellStates)) {
      if (state?.correct) cellsFilled[key] = state.player;
    }

    try {
      await fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          puzzleId,
          sport,
          gameMode: "draft-board",
          score,
          guessesUsed: finalWrongAttempts,
          cellsFilled,
          completed: true,
        }),
      });
      window.dispatchEvent(new CustomEvent("ballbrain:coins-updated"));
    } catch {
      // Silent fail — non-critical
    }
  }

  function handleCardClick(name: string) {
    if (gameOver || placedCards.has(name)) return;
    setSelectedCard((prev) => (prev === name ? null : name));
  }

  // Shared placement logic — called from both click and drag-drop paths.
  function attemptPlacement(player: string, cellKey: string) {
    if (gameOver) return;
    if (cellStates[cellKey]?.correct) return;

    writeStubRow();

    const isCorrect = (validPlayers[cellKey] ?? []).includes(player);

    if (isCorrect) {
      const newCellStates = { ...cellStates, [cellKey]: { player, correct: true } };
      const newPlaced = new Set(placedCards).add(player);

      setCellStates(newCellStates);
      setPlacedCards(newPlaced);
      setSelectedCard(null);
      setJustCorrectCell(cellKey);
      setTimeout(() => setJustCorrectCell(null), 800);

      const newCorrectCount = Object.values(newCellStates).filter((s) => s?.correct).length;
      if (newCorrectCount === TOTAL_CELLS) {
        setGameOver(true);
        saveResult(newCellStates, wrongAttempts);
      }
    } else {
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      setSelectedCard(null);
      setFlashingCell(cellKey);
      setTimeout(() => setFlashingCell(null), 1000);

      if (newWrong >= ECONOMY.DRAFT_BOARD.MAX_WRONG_ATTEMPTS) {
        setGameOver(true);
        saveResult(cellStates, newWrong);
      }
    }
  }

  function handleCellClick(row: number, col: number) {
    if (!selectedCard) return;
    attemptPlacement(selectedCard, `${row}-${col}`);
  }

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, name: string) {
    e.dataTransfer.setData("text/plain", name);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCard(name);
    // Deselect any click-selected card so the two modes don't collide.
    setSelectedCard(null);
  }

  function handleDragEnd() {
    setDraggingCard(null);
    setDragOverCell(null);
  }

  function handleDragOver(e: React.DragEvent) {
    // Required to allow the drop event to fire.
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(cellKey: string) {
    setDragOverCell(cellKey);
  }

  function handleDragLeave(e: React.DragEvent, cellKey: string) {
    // Only clear if leaving to an element outside this cell (not a child).
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverCell((prev) => (prev === cellKey ? null : prev));
    }
  }

  function handleDrop(e: React.DragEvent, row: number, col: number) {
    e.preventDefault();
    const player = e.dataTransfer.getData("text/plain");
    setDraggingCard(null);
    setDragOverCell(null);
    if (player) attemptPlacement(player, `${row}-${col}`);
  }

  if (clientBlocked) {
    return (
      <div className="flex flex-col items-center text-center max-w-sm mx-auto gap-4 py-12">
        <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-8 w-full">
          <p className="text-white font-bold text-lg mb-2">
            You&apos;ve played your draft today! 🃏
          </p>
          <p className="text-zinc-400 text-sm">Come back tomorrow for a new board.</p>
        </div>
        <a
          href="/draft-board"
          className="rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-6 py-3 text-sm transition-colors"
        >
          ← Go Back
        </a>
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* Status bar */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{correctCount} / {TOTAL_CELLS} placed</span>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold border ${
          attemptsLeft <= 1
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-purple-500/10 text-purple-400 border-purple-500/30"
        }`}>
          {attemptsLeft === 1 ? "😬 Last chance..." : `${attemptsLeft} misses left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full bg-purple-400 transition-all duration-300"
          style={{ width: `${(correctCount / TOTAL_CELLS) * 100}%` }}
        />
      </div>

      {/* Selected card indicator */}
      {selectedCard && !gameOver && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Selected:</span>
          <span className="text-sm font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-1">
            {selectedCard}
          </span>
          <button
            type="button"
            onClick={() => setSelectedCard(null)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] grid-rows-[auto_1fr_1fr_1fr] gap-2">
        {/* Top-left corner */}
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
              const cellKey = `${ri}-${ci}`;
              const state = cellStates[cellKey];
              const isCorrect = state?.correct === true;
              const isFlashing = flashingCell === cellKey;
              const isJustCorrect = justCorrectCell === cellKey;
              const isClickable = !gameOver && !isCorrect && !!selectedCard;
              const isDragTarget = !gameOver && !isCorrect && dragOverCell === cellKey;

              return (
                <button
                  key={cellKey}
                  type="button"
                  onClick={() => handleCellClick(ri, ci)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(cellKey)}
                  onDragLeave={(e) => handleDragLeave(e, cellKey)}
                  onDrop={(e) => handleDrop(e, ri, ci)}
                  disabled={gameOver && !isCorrect}
                  className={[
                    "relative flex items-center justify-center rounded-xl min-h-[96px] transition-all duration-200 px-2",
                    "border-2 text-sm text-center leading-tight font-semibold",
                    isJustCorrect
                      ? "border-green-400 bg-green-400/50 text-green-200 scale-[1.05]"
                      : isCorrect
                        ? "border-green-500 bg-green-500/20 text-green-300"
                        : isFlashing
                          ? "border-red-500 bg-red-500/20 text-red-400 animate-pulse"
                          : isDragTarget
                            ? "border-purple-400 bg-purple-400/25 text-purple-200 scale-[1.03]"
                            : isClickable
                              ? "border-purple-500/60 bg-purple-500/10 text-purple-200 hover:border-purple-400 hover:bg-purple-500/20 cursor-pointer"
                              : gameOver
                                ? "border-zinc-700 bg-zinc-900 text-zinc-600 cursor-default"
                                : "border-zinc-700 bg-zinc-900 text-zinc-600 hover:border-zinc-600",
                  ].join(" ")}
                >
                  {isCorrect && state ? state.player : ""}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Card tray */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Player Cards — tap to select then tap a cell · drag to a cell on desktop
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {draftPlayers.map((name) => {
            const isPlaced = placedCards.has(name);
            const isSelected = selectedCard === name;
            const isDragging = draggingCard === name;

            if (isPlaced) return null;

            return (
              <button
                key={name}
                type="button"
                draggable={!gameOver}
                onClick={() => handleCardClick(name)}
                onDragStart={(e) => handleDragStart(e, name)}
                onDragEnd={handleDragEnd}
                disabled={gameOver}
                className={[
                  "min-h-[44px] rounded-xl border-2 px-3 py-3 text-sm font-semibold text-center leading-tight transition-all duration-150",
                  isDragging
                    ? "border-purple-400 bg-purple-400/20 text-purple-300 opacity-50 scale-[0.97] cursor-grabbing"
                    : isSelected
                      ? "border-purple-400 bg-purple-400/20 text-purple-200 scale-[1.04] shadow-lg shadow-purple-900/40"
                      : gameOver
                        ? "border-zinc-700 bg-zinc-900 text-zinc-600 cursor-default"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.97] cursor-grab",
                ].join(" ")}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Show a ghost placeholder grid so the tray doesn't collapse as cards disappear */}
        {correctCount > 0 && correctCount < TOTAL_CELLS && (
          <p className="mt-3 text-xs text-zinc-600 text-center">
            {TOTAL_CELLS - correctCount} card{TOTAL_CELLS - correctCount !== 1 ? "s" : ""} still to place
          </p>
        )}
      </div>

      {/* Result modal */}
      {showModal && (
        <DraftResultModal
          won={correctCount === TOTAL_CELLS}
          correctCount={correctCount}
          coinsEarned={coinsEarned}
          uniquenessBonus={uniquenessBonus}
          cellStates={cellStates}
          validPlayers={validPlayers}
          draftPlayers={draftPlayers}
          rowCategories={rowCategories}
          colCategories={colCategories}
        />
      )}
    </div>
  );
}
