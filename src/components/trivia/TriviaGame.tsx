"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ECONOMY } from "@/lib/economy/constants";
import { QUESTIONS } from "@/lib/trivia/questions";

const MILESTONES = ECONOMY.SOLO_TRIVIA.MILESTONES as Record<number, number>;
const MILESTONE_QS = new Set(Object.keys(MILESTONES).map(Number));
const TIMER_SECS = ECONOMY.SOLO_TRIVIA.TIMER_SECONDS;
const TOTAL_QS = QUESTIONS.length; // 15

const SPORT_COLORS: Record<string, string> = {
  NBA: "text-orange-400",
  NFL: "text-blue-400",
  Soccer: "text-green-400",
};

const ANSWER_LABELS = ["A", "B", "C", "D"] as const;

type Phase = "start" | "playing" | "revealing" | "done";

interface TriviaGameProps {
  isAuthenticated: boolean;
  hasPlayedToday: boolean;
}

export default function TriviaGame({ isAuthenticated, hasPlayedToday }: TriviaGameProps) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [won, setWon] = useState(false);

  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-fresh ref to handleAnswer — prevents stale closure in timer effect.
  const handleAnswerRef = useRef<(i: number | null) => void>(() => {});

  const questionNumber = questionIndex + 1; // 1-based
  const currentQuestion = QUESTIONS[questionIndex];

  // --- Timer ---
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      handleAnswerRef.current(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Cleanup reveal timeout on unmount.
  useEffect(() => () => { if (revealTimeout.current) clearTimeout(revealTimeout.current); }, []);

  // --- Core answer handler ---
  function handleAnswer(answerIndex: number | null) {
    if (phase !== "playing") return;

    const correct = answerIndex === currentQuestion.correctIndex;
    let newCoins = coinsEarned;
    if (correct && MILESTONE_QS.has(questionNumber)) {
      newCoins = coinsEarned + MILESTONES[questionNumber];
      setCoinsEarned(newCoins);
    }

    setSelectedIndex(answerIndex);
    setPhase("revealing");

    revealTimeout.current = setTimeout(() => {
      if (!correct || questionNumber === TOTAL_QS) {
        setWon(correct);
        setPhase("done");
        savePlay(questionNumber, newCoins);
      } else {
        setQuestionIndex((qi) => qi + 1);
        setTimeLeft(TIMER_SECS);
        setSelectedIndex(null);
        setPhase("playing");
      }
    }, 1800);
  }

  // Keep ref fresh every render.
  handleAnswerRef.current = handleAnswer;

  async function savePlay(questionsAnswered: number, totalCoins: number) {
    try {
      await fetch("/api/trivia/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionsAnswered, coinsEarned: totalCoins }),
      });
      window.dispatchEvent(new CustomEvent("ballbrain:coins-updated"));
    } catch {
      // Silent fail — non-critical
    }
  }

  function startGame() {
    setPhase("playing");
    setQuestionIndex(0);
    setTimeLeft(TIMER_SECS);
    setSelectedIndex(null);
    setCoinsEarned(0);
    setWon(false);
  }

  // ---- Render helpers ----

  function answerButtonClass(i: number): string {
    const base = "w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-colors flex items-center gap-3";
    if (phase !== "revealing") {
      return `${base} border-zinc-700 bg-zinc-900 text-white hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300`;
    }
    const isCorrect = i === currentQuestion.correctIndex;
    const isSelected = i === selectedIndex;
    if (isCorrect) return `${base} border-green-500 bg-green-500/20 text-green-300`;
    if (isSelected && !isCorrect) return `${base} border-red-500 bg-red-500/20 text-red-400`;
    return `${base} border-zinc-800 bg-zinc-900/50 text-zinc-600`;
  }

  // ---- Start screen ----
  if (phase === "start") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">Solo Trivia</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Who Wants to Be a</h1>
        <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400 mb-4">Sports Millionaire?</h1>
        <p className="text-zinc-400 text-sm mb-8 max-w-xs">
          15 questions. 20 seconds each. NBA, NFL &amp; Soccer.
          Earn up to <span className="text-yellow-400 font-semibold">500 coins</span>.
        </p>

        {hasPlayedToday ? (
          <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-6 max-w-sm">
            <p className="text-white font-bold text-lg mb-1">Already played today</p>
            <p className="text-zinc-400 text-sm">Come back tomorrow for your next free play.</p>
          </div>
        ) : (
          <button
            onClick={startGame}
            className="rounded-xl bg-yellow-400 text-zinc-950 font-extrabold text-lg px-10 py-4 hover:bg-yellow-300 transition-colors"
          >
            Play Free Game
          </button>
        )}

        {!isAuthenticated && (
          <p className="mt-4 text-xs text-zinc-500">
            <a href="/login" className="text-yellow-400 hover:underline">Log in</a> to save coins and track your progress.
          </p>
        )}
      </div>
    );
  }

  // ---- Done modal ----
  if (phase === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
          <div className={`px-6 py-5 text-center border-b ${won ? "bg-green-500/10 border-green-500/20" : "bg-zinc-800 border-zinc-700"}`}>
            <p className={`text-2xl font-bold ${won ? "text-green-400" : "text-white"}`}>
              {won ? "Trivia Champion!" : "Game Over"}
            </p>
            <p className="mt-1 text-zinc-400 text-sm">
              {won ? "You answered all 15 questions!" : `You reached Q${questionNumber} of ${TOTAL_QS}`}
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Coins */}
            <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Coins Earned</p>
              <p className="text-3xl font-extrabold text-yellow-400">🪙 {coinsEarned}</p>
            </div>

            {/* Wrong answer reveal */}
            {!won && selectedIndex !== null && (
              <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm">
                <p className="text-zinc-500 text-xs mb-1">Correct answer</p>
                <p className="text-green-400 font-semibold">
                  {ANSWER_LABELS[currentQuestion.correctIndex]}. {currentQuestion.answers[currentQuestion.correctIndex]}
                </p>
              </div>
            )}
            {!won && selectedIndex === null && (
              <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm">
                <p className="text-zinc-500 text-xs mb-1">Time ran out — correct answer was</p>
                <p className="text-green-400 font-semibold">
                  {ANSWER_LABELS[currentQuestion.correctIndex]}. {currentQuestion.answers[currentQuestion.correctIndex]}
                </p>
              </div>
            )}

            {!isAuthenticated && coinsEarned > 0 && (
              <p className="text-center text-xs text-zinc-500">
                <a href="/login" className="text-yellow-400 hover:underline">Log in</a> to save your coins.
              </p>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold py-3 text-sm hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Playing / Revealing ----
  const timerPercent = (timeLeft / TIMER_SECS) * 100;
  const timerColor = timeLeft > 10 ? "bg-yellow-400" : timeLeft > 5 ? "bg-orange-400" : "bg-red-500";

  return (
    <div className="flex gap-6 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Question header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Question {questionNumber} of {TOTAL_QS}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider ${SPORT_COLORS[currentQuestion.sport] ?? "text-zinc-400"}`}>
              · {currentQuestion.sport}
            </span>
          </div>
          {MILESTONE_QS.has(questionNumber) && (
            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2.5 py-0.5">
              🪙 {MILESTONES[questionNumber]} milestone
            </span>
          )}
        </div>

        {/* Timer bar */}
        <div className="mb-1 h-1.5 w-full rounded-full bg-zinc-800">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
        <div className="flex justify-end mb-5">
          <span className={`text-xs font-semibold tabular-nums ${timeLeft <= 5 ? "text-red-400" : "text-zinc-500"}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Question */}
        <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-5 py-5 mb-5">
          <p className="text-white font-semibold text-base leading-snug">{currentQuestion.question}</p>
        </div>

        {/* Answer buttons — 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={phase === "revealing"}
              className={answerButtonClass(i)}
            >
              <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                {ANSWER_LABELS[i]}
              </span>
              <span className="leading-tight">{answer}</span>
            </button>
          ))}
        </div>

        {/* Running coin total */}
        {coinsEarned > 0 && (
          <p className="mt-4 text-center text-sm text-yellow-400 font-semibold">
            🪙 {coinsEarned} earned so far
          </p>
        )}
      </div>

      {/* Question Ladder — desktop only */}
      <div className="hidden md:flex flex-col gap-1 w-36 shrink-0 pt-1">
        {Array.from({ length: TOTAL_QS }, (_, i) => {
          const qNum = TOTAL_QS - i; // Q15 at top, Q1 at bottom
          const isMilestone = MILESTONE_QS.has(qNum);
          const isCurrent = qNum === questionNumber;
          const isPast = qNum < questionNumber;

          return (
            <div
              key={qNum}
              className={[
                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                isCurrent
                  ? "bg-yellow-400/20 border border-yellow-400/50 text-yellow-300"
                  : isPast
                    ? "bg-zinc-800/50 text-zinc-600"
                    : isMilestone
                      ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
                      : "bg-zinc-900 text-zinc-600",
              ].join(" ")}
            >
              <span>Q{qNum}</span>
              {isMilestone && (
                <span className={isPast ? "text-zinc-600" : isCurrent ? "text-yellow-300" : "text-yellow-500"}>
                  🪙{MILESTONES[qNum]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
