"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Game = "both" | "grid" | "trivia" | "draft";

interface HowToPlayModalProps {
  game: Game;
  onClose: () => void;
}

function MiniGrid() {
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

function DraftBoardSection() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🃏</span>
        <h3 className="text-lg font-extrabold text-white">Draft Board</h3>
      </div>
      {/* Mini card tray illustration */}
      <div className="flex gap-2 justify-center mb-5">
        {["Kobe", "Messi", "LeBron"].map((name, i) => (
          <div
            key={i}
            className={[
              "rounded-lg border-2 px-2 py-2 text-xs font-bold text-center w-20",
              i === 1
                ? "border-purple-400 bg-purple-400/20 text-purple-200"
                : "border-zinc-600 bg-zinc-800 text-zinc-400",
            ].join(" ")}
          >
            {name}
          </div>
        ))}
      </div>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-purple-400">→</span>
          <span>You get <span className="font-semibold text-white">12 player cards</span> — 9 correct answers and 3 decoys</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-yellow-400">→</span>
          <span>Select a card, then tap the cell it belongs in</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-red-400">→</span>
          <span className="font-semibold text-white">5 wrong placements and you&apos;re done 💀</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-zinc-400">→</span>
          <span>One draft per sport per day 🗓️</span>
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

const SLIDES = [
  { key: "grid",   label: "Sports Grid", emoji: "🟨" },
  { key: "trivia", label: "Solo Trivia",  emoji: "🧠" },
] as const;

function ModalContent({ game, onClose }: HowToPlayModalProps) {
  const [slide, setSlide] = useState(game === "trivia" ? 1 : 0);
  const isCarousel = game === "both";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0,0,0,0.85)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ position: "relative", width: "100%", maxWidth: "24rem" }}
        className="rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden"
      >
        {/* X close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-400 flex items-center justify-center text-zinc-300 hover:text-white transition-colors font-bold text-sm"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            How to Play
          </p>
          {isCarousel && (
            <p className="mt-0.5 text-base font-extrabold text-white">
              {SLIDES[slide].emoji} {SLIDES[slide].label}
            </p>
          )}
        </div>

        {/* Carousel body */}
        {isCarousel ? (
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                transform: `translateX(-${slide * 100}%)`,
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                willChange: "transform",
              }}
            >
              <div style={{ minWidth: "100%" }} className="px-6 py-5">
                <GridSection />
              </div>
              <div style={{ minWidth: "100%" }} className="px-6 py-5">
                <TriviaSection />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "65vh" }}>
            {game === "grid"   && <GridSection />}
            {game === "trivia" && <TriviaSection />}
            {game === "draft"  && <DraftBoardSection />}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-zinc-800 flex flex-col gap-3">
          {/* Carousel navigation */}
          {isCarousel && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSlide(0)}
                disabled={slide === 0}
                className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                aria-label="Previous"
              >
                ←
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={SLIDES[i].label}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === slide ? "bg-yellow-400" : "bg-zinc-600 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setSlide(1)}
                disabled={slide === 1}
                className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                aria-label="Next"
              >
                →
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-yellow-400 text-zinc-950 font-extrabold py-3 text-sm hover:bg-yellow-300 transition-colors"
          >
            Got it! 💪
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HowToPlayModal(props: HowToPlayModalProps) {
  // Mount only on the client to avoid SSR mismatch with document.body
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(<ModalContent {...props} />, document.body);
}
