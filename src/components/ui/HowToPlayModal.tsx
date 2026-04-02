"use client";

type Game = "both" | "grid" | "trivia";

interface HowToPlayModalProps {
  game: Game;
  onClose: () => void;
}

function MiniGrid() {
  // 3×3 preview: some cells correct (green), one selected (yellow), rest empty
  const cells = [
    { type: "correct" },
    { type: "empty" },
    { type: "correct" },
    { type: "empty" },
    { type: "selected" },
    { type: "empty" },
    { type: "correct" },
    { type: "empty" },
    { type: "empty" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto mb-5">
      {cells.map((cell, i) => (
        <div
          key={i}
          className={[
            "w-11 h-11 rounded-lg border-2 flex items-center justify-center text-xs font-bold",
            cell.type === "correct"
              ? "border-green-500 bg-green-500/20 text-green-400"
              : cell.type === "selected"
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                : "border-zinc-700 bg-zinc-900",
          ].join(" ")}
        >
          {cell.type === "correct" ? "✓" : cell.type === "selected" ? "…" : ""}
        </div>
      ))}
    </div>
  );
}

function TimerBar() {
  return (
    <div className="mb-5">
      <div className="relative h-2.5 w-full rounded-full bg-zinc-700 overflow-hidden mb-1.5">
        <div className="absolute left-0 top-0 h-full w-[55%] rounded-full bg-yellow-400" />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>▶ Q7 of 10</span>
        <span>11s</span>
      </div>
    </div>
  );
}

function GridSection() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🟨</span>
        <h3 className="text-lg font-extrabold text-white">Sports Grid</h3>
      </div>
      <MiniGrid />
      <ul className="space-y-2 text-sm text-zinc-300">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-yellow-400">→</span>
          <span>Find the player that fits <span className="font-semibold text-white">BOTH</span> the row AND column criteria</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-red-400">→</span>
          <span className="font-semibold text-white">9 shots. No retries. No mercy. 💀</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-zinc-400">→</span>
          <span>New grid every day 🗓️</span>
        </li>
      </ul>
    </div>
  );
}

function TriviaSection() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h3 className="text-lg font-extrabold text-white">Solo Trivia</h3>
      </div>
      <TimerBar />
      <ul className="space-y-2 text-sm text-zinc-300">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-yellow-400">→</span>
          <span><span className="font-semibold text-white">10 questions. 20 seconds each.</span></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-orange-400">→</span>
          <span>Think fast or the clock wins 😤</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-red-400">→</span>
          <span>Wrong answer? We&apos;ll roast you gently ❌</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-zinc-400">→</span>
          <span>New questions every day 🗓️</span>
        </li>
      </ul>
    </div>
  );
}

export default function HowToPlayModal({ game, onClose }: HowToPlayModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Close button — top-right corner, always visible */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 flex items-center justify-center text-zinc-300 hover:text-white transition-colors font-bold text-base"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            How to Play
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-6">
          {(game === "both" || game === "grid") && <GridSection />}
          {game === "both" && <div className="border-t border-zinc-800" />}
          {(game === "both" || game === "trivia") && <TriviaSection />}
        </div>
      </div>
    </div>
  );
}
