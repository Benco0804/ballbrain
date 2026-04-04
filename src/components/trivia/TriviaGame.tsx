"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ECONOMY } from "@/lib/economy/constants";
import { createClient } from "@/lib/supabase/client";
import { getGuestCount, incrementGuestCount } from "@/lib/game/guestPlays";

const MILESTONES = ECONOMY.SOLO_TRIVIA.MILESTONES as Record<number, number>;
const MILESTONE_QS = new Set(Object.keys(MILESTONES).map(Number));
const TIMER_SECS = ECONOMY.SOLO_TRIVIA.TIMER_SECONDS;
const TOTAL_QS = ECONOMY.SOLO_TRIVIA.TOTAL_QUESTIONS;
const MAX_STRIKES = 2;
const MILESTONE_POPUP_SECS = 15;

const SPORT_COLORS: Record<string, string> = {
  NBA: "text-orange-400",
  Soccer: "text-green-400",
  Mix: "text-purple-400",
};

const ANSWER_LABELS = ["A", "B", "C", "D"] as const;

type Sport = "NBA" | "Soccer" | "Mix";
type Difficulty = "easy" | "medium" | "hard";

function buildDifficultyProgression(): Difficulty[] {
  const prog: Difficulty[] = [];
  for (let i = 0; i < 3; i++) prog.push("easy");
  for (let i = 0; i < 3; i++) prog.push("medium");
  for (let i = 0; i < 2; i++) prog.push(Math.random() < 0.5 ? "medium" : "hard");
  for (let i = 0; i < 2; i++) prog.push("hard");
  return prog;
}

type Phase = "start" | "playing" | "revealing" | "milestone-popup" | "done";

interface GameQuestion {
  question: string;
  sport: string;
  answers: [string, string, string, string];
  correctIndex: number;
}

interface TriviaGameProps {
  isAuthenticated: boolean;
  /** Server-side play count per sport today (auth users only). Max 2 per sport. */
  playCountsBySport: Record<string, number>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGameQuestion(row: {
  question: string;
  sport: string;
  correct_answer: string;
  wrong_answers: string[];
}): GameQuestion {
  const all = shuffle([row.correct_answer, ...row.wrong_answers]);
  return {
    question: row.question,
    sport: row.sport,
    answers: all as [string, string, string, string],
    correctIndex: all.indexOf(row.correct_answer),
  };
}

function getNextMilestoneCoins(currentQ: number): number | null {
  const nextKey = Object.keys(MILESTONES)
    .map(Number)
    .sort((a, b) => a - b)
    .find((q) => q > currentQ);
  return nextKey != null ? MILESTONES[nextKey] : null;
}

export default function TriviaGame({ isAuthenticated, playCountsBySport }: TriviaGameProps) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("start");
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  // Guest play counts per sport, populated from localStorage on mount.
  const [guestPlayCounts, setGuestPlayCounts] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SECS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [won, setWon] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [milestonePopupTimeLeft, setMilestonePopupTimeLeft] = useState(MILESTONE_POPUP_SECS);

  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-fresh ref to handleAnswer — prevents stale closure in timer effect.
  const handleAnswerRef = useRef<(i: number | null) => void>(() => {});
  // Absolute timestamp (ms) when the current question expires.
  const deadlineRef = useRef<number>(0);
  // Variant played in the current session (1 or 2), set in startGame.
  const currentVariantRef = useRef<1 | 2>(1);
  // Popup countdown deadline.
  const milestonePopupDeadlineRef = useRef<number>(0);
  // Always-fresh ref to continueAfterMilestone.
  const continueAfterMilestoneRef = useRef<() => void>(() => {});

  const questionNumber = questionIndex + 1; // 1-based
  const currentQuestion = questions[questionIndex] ?? null;

  // Load guest play counts from localStorage on mount.
  useEffect(() => {
    if (isAuthenticated) return;
    setGuestPlayCounts({
      NBA:    getGuestCount("trivia", "NBA"),
      Soccer: getGuestCount("trivia", "Soccer"),
      Mix:    getGuestCount("trivia", "Mix"),
    });
  }, [isAuthenticated]);

  // --- Question timer ---

  // Set a fresh deadline whenever a new question starts.
  useEffect(() => {
    if (phase === "playing") {
      deadlineRef.current = Date.now() + TIMER_SECS * 1000;
    }
  }, [phase, questionIndex]);

  // Poll every 200 ms; derive displayed time from the real deadline so drift
  // and browser throttling in background tabs can't desync the countdown.
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) handleAnswerRef.current(null);
    }, 200);
    return () => clearInterval(interval);
  }, [phase, questionIndex]);

  // When the tab becomes visible again, immediately reconcile elapsed time.
  useEffect(() => {
    if (phase !== "playing") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        handleAnswerRef.current(null);
      } else {
        setTimeLeft(remaining);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [phase, questionIndex]);

  // --- Milestone popup timer ---

  // Set popup deadline when entering milestone-popup phase.
  useEffect(() => {
    if (phase !== "milestone-popup") return;
    milestonePopupDeadlineRef.current = Date.now() + MILESTONE_POPUP_SECS * 1000;
    setMilestonePopupTimeLeft(MILESTONE_POPUP_SECS);
  }, [phase]);

  // Poll popup countdown; auto-continue when it hits 0.
  useEffect(() => {
    if (phase !== "milestone-popup") return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((milestonePopupDeadlineRef.current - Date.now()) / 1000));
      setMilestonePopupTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        continueAfterMilestoneRef.current();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  // Cleanup reveal timeout on unmount.
  useEffect(() => () => { if (revealTimeout.current) clearTimeout(revealTimeout.current); }, []);

  // --- Core answer handler ---
  function handleAnswer(answerIndex: number | null) {
    if (phase !== "playing" || !currentQuestion) return;

    const correct = answerIndex === currentQuestion.correctIndex;
    let newCoins = coinsEarned;
    if (correct && MILESTONE_QS.has(questionNumber)) {
      newCoins = coinsEarned + MILESTONES[questionNumber];
      setCoinsEarned(newCoins);
    }

    setSelectedIndex(answerIndex);
    setPhase("revealing");

    revealTimeout.current = setTimeout(() => {
      if (!correct) {
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);
        if (newStrikes >= MAX_STRIKES || questionNumber === TOTAL_QS) {
          setWon(false);
          setPhase("done");
          savePlay(questionNumber, newCoins);
        } else {
          // First strike — keep playing.
          setQuestionIndex((qi) => qi + 1);
          setTimeLeft(TIMER_SECS);
          setSelectedIndex(null);
          setPhase("playing");
        }
      } else if (questionNumber === TOTAL_QS) {
        setWon(true);
        setPhase("done");
        savePlay(questionNumber, newCoins);
      } else if (MILESTONE_QS.has(questionNumber)) {
        // Show "take the money" popup before continuing.
        setPhase("milestone-popup");
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

  function continueAfterMilestone() {
    if (phase !== "milestone-popup") return;
    setQuestionIndex((qi) => qi + 1);
    setTimeLeft(TIMER_SECS);
    setSelectedIndex(null);
    setPhase("playing");
  }

  continueAfterMilestoneRef.current = continueAfterMilestone;

  async function savePlay(questionsAnswered: number, totalCoins: number) {
    if (!isAuthenticated) {
      // Guest: track locally and update state so same-session re-selection is blocked.
      if (selectedSport) {
        incrementGuestCount("trivia", selectedSport);
        setGuestPlayCounts((prev) => ({
          ...prev,
          [selectedSport]: (prev[selectedSport] ?? 0) + 1,
        }));
      }
      return;
    }
    try {
      await fetch("/api/trivia/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionsAnswered,
          coinsEarned: totalCoins,
          sport: selectedSport,
          variant: currentVariantRef.current,
        }),
      });
      window.dispatchEvent(new CustomEvent("ballbrain:coins-updated"));
    } catch {
      // Silent fail — non-critical
    }
  }

  async function startGame() {
    if (!selectedSport) return;
    setLoadingQuestions(true);

    // Determine which variant to serve based on today's play count.
    const currentPlayCount = isAuthenticated
      ? (playCountsBySport[selectedSport] ?? 0)
      : (guestPlayCounts[selectedSport] ?? 0);
    const variant: 1 | 2 = currentPlayCount === 0 ? 1 : 2;
    currentVariantRef.current = variant;

    try {
      const supabase = createClient();

      type QuestionRow = { question: string; sport: string; correct_answer: string; wrong_answers: string[]; difficulty: string };
      let selectedQuestions: QuestionRow[] | null = null;

      // NBA/Soccer: fetch the pre-curated question set from daily_trivia_sessions.
      // This guarantees variant 1 and variant 2 are different question sets.
      if (selectedSport !== "Mix") {
        const today = new Date().toISOString().split("T")[0];
        const { data: session } = await supabase
          .from("daily_trivia_sessions")
          .select("question_ids")
          .eq("session_date", today)
          .eq("sport", selectedSport)
          .eq("variant", variant)
          .maybeSingle();

        if (session?.question_ids?.length) {
          const { data: qData } = await supabase
            .from("trivia_questions")
            .select("question, sport, correct_answer, wrong_answers, difficulty")
            .in("id", session.question_ids)
            .eq("status", "active");

          if (qData && qData.length > 0) {
            selectedQuestions = shuffle(qData).slice(0, TOTAL_QS);
          }
        }
      }

      // Fallback: Mix mode or no session found — build set via difficulty progression.
      if (!selectedQuestions) {
        let query = supabase
          .from("trivia_questions")
          .select("question, sport, correct_answer, wrong_answers, difficulty")
          .eq("status", "active");

        if (selectedSport !== "Mix") {
          query = query.eq("sport", selectedSport);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          setLoadingQuestions(false);
          return;
        }

        const byDiff: Record<Difficulty, typeof data> = {
          easy:   shuffle(data.filter((q) => q.difficulty === "easy")),
          medium: shuffle(data.filter((q) => q.difficulty === "medium")),
          hard:   shuffle(data.filter((q) => q.difficulty === "hard")),
        };
        const usedIdx: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
        const FALLBACK: Record<Difficulty, Difficulty[]> = {
          easy:   ["easy", "medium", "hard"],
          medium: ["medium", "easy", "hard"],
          hard:   ["hard", "medium", "easy"],
        };

        const selected: typeof data = [];
        for (const diff of buildDifficultyProgression()) {
          for (const d of FALLBACK[diff]) {
            if (usedIdx[d] < byDiff[d].length) {
              selected.push(byDiff[d][usedIdx[d]]);
              usedIdx[d]++;
              break;
            }
          }
          if (selected.length === TOTAL_QS) break;
        }
        selectedQuestions = selected;
      }

      if (!selectedQuestions || selectedQuestions.length === 0) {
        setLoadingQuestions(false);
        return;
      }

      setQuestions(selectedQuestions.map(buildGameQuestion));
    } catch {
      setLoadingQuestions(false);
      return;
    }

    setLoadingQuestions(false);
    setPhase("playing");
    setQuestionIndex(0);
    setTimeLeft(TIMER_SECS);
    setSelectedIndex(null);
    setCoinsEarned(0);
    setStrikes(0);
    setWon(false);
    setCashedOut(false);
  }

  // ---- Render helpers ----

  function answerButtonClass(i: number): string {
    const base = "w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-colors flex items-center gap-3";
    if (phase !== "revealing" || !currentQuestion) {
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
          10 questions. 20 seconds each.
          Earn up to <span className="text-yellow-400 font-semibold">500 coins</span>.
        </p>

        {selectedSport && (isAuthenticated ? playCountsBySport[selectedSport] ?? 0 : guestPlayCounts[selectedSport] ?? 0) >= 2 ? (
          /* Already played this sport today */
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-6 text-center w-full">
              <p className="text-white font-bold text-lg mb-2">
                {selectedSport === "NBA"
                  ? "You've already conquered today's NBA trivia! 🧠"
                  : selectedSport === "Soccer"
                    ? "You've already conquered today's Soccer trivia! ⚽"
                    : "You've already conquered today's Mix trivia! 🔀"}
              </p>
              <p className="text-zinc-400 text-sm">Come back tomorrow for another shot.</p>
            </div>
            <button
              onClick={() => setSelectedSport(null)}
              className="rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-6 py-3 text-sm transition-colors"
            >
              ← Go Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <p className="text-sm font-semibold text-zinc-400">Choose a sport</p>
            <div className="grid grid-cols-3 gap-3 w-full">
              <button
                onClick={() => setSelectedSport("NBA")}
                className={[
                  "rounded-xl border-2 py-4 font-bold text-sm transition-colors",
                  selectedSport === "NBA"
                    ? "border-orange-400 bg-orange-400/10 text-orange-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-orange-400 hover:text-orange-300",
                ].join(" ")}
              >
                🏀 NBA
              </button>
              <button
                onClick={() => setSelectedSport("Mix")}
                className={[
                  "rounded-xl border-2 py-4 font-bold text-sm transition-colors",
                  selectedSport === "Mix"
                    ? "border-purple-400 bg-purple-400/10 text-purple-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-purple-400 hover:text-purple-300",
                ].join(" ")}
              >
                🔀 Mix
              </button>
              <button
                onClick={() => setSelectedSport("Soccer")}
                className={[
                  "rounded-xl border-2 py-4 font-bold text-sm transition-colors",
                  selectedSport === "Soccer"
                    ? "border-green-400 bg-green-400/10 text-green-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-green-400 hover:text-green-300",
                ].join(" ")}
              >
                ⚽ Soccer
              </button>
            </div>
            <button
              onClick={startGame}
              disabled={!selectedSport || loadingQuestions}
              className="w-full rounded-xl bg-yellow-400 text-zinc-950 font-extrabold text-lg px-10 py-4 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingQuestions
                ? "Loading…"
                : selectedSport === "NBA"
                  ? "Let's Go! 🏀"
                  : selectedSport === "Soccer"
                    ? "Kick Off! ⚽"
                    : selectedSport === "Mix"
                      ? "Mix It Up! 🔀"
                      : "Let's Go!"}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p className="mt-4 text-xs text-zinc-500">
            <a href="/login" className="text-yellow-400 hover:underline">Log in</a> to save coins and track your progress.
          </p>
        )}
      </div>
    );
  }

  // ---- Done screen ----
  if (phase === "done") {
    const doneTitle = cashedOut ? "💰 Smart move!" : won ? "🧠 You're a genius!" : "Game Over";
    const doneSubtitle = cashedOut
      ? `You walked away at Q${questionNumber} with ${coinsEarned} coins.`
      : won
        ? "You answered all 10 questions!"
        : `You reached Q${questionNumber} of ${TOTAL_QS}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
          <div className={`px-6 py-5 text-center border-b ${(won || cashedOut) ? "bg-green-500/10 border-green-500/20" : "bg-zinc-800 border-zinc-700"}`}>
            <p className={`text-2xl font-bold ${(won || cashedOut) ? "text-green-400" : "text-white"}`}>
              {doneTitle}
            </p>
            <p className="mt-1 text-zinc-400 text-sm">{doneSubtitle}</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Coins */}
            <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Coins Earned</p>
              <p className="text-3xl font-extrabold text-yellow-400">🪙 {coinsEarned}</p>
            </div>

            {/* Wrong answer reveal */}
            {!won && !cashedOut && currentQuestion && selectedIndex !== null && (
              <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm">
                <p className="text-zinc-500 text-xs mb-1">Correct answer</p>
                <p className="text-green-400 font-semibold">
                  {ANSWER_LABELS[currentQuestion.correctIndex]}. {currentQuestion.answers[currentQuestion.correctIndex]}
                </p>
              </div>
            )}
            {!won && !cashedOut && currentQuestion && selectedIndex === null && (
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
  if (!currentQuestion) return null;

  const timerPercent = (timeLeft / TIMER_SECS) * 100;
  const timerColor = timeLeft > 10 ? "bg-yellow-400" : timeLeft > 5 ? "bg-orange-400" : "bg-red-500";
  const nextMilestoneCoins = getNextMilestoneCoins(questionNumber);

  // ---- Milestone popup overlay ----
  const milestonePopup = phase === "milestone-popup" && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-yellow-400/40 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center border-b border-yellow-400/20 bg-yellow-400/10">
          <p className="text-2xl font-bold text-yellow-300">💰 Take the money and run?</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <p className="text-zinc-300 text-sm text-center leading-relaxed">
            You&apos;ve earned <span className="text-yellow-400 font-bold">{coinsEarned} coins</span> so far.
            Walk away now&hellip; or risk it all for{" "}
            <span className="text-yellow-400 font-bold">
              {nextMilestoneCoins != null ? `${nextMilestoneCoins} coins` : "the win"}
            </span>.
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
            <div className="h-1 flex-1 rounded-full bg-zinc-800">
              <div
                className="h-1 rounded-full bg-yellow-400 transition-all duration-200"
                style={{ width: `${(milestonePopupTimeLeft / MILESTONE_POPUP_SECS) * 100}%` }}
              />
            </div>
            <span className="tabular-nums font-semibold text-xs w-8 text-right">{milestonePopupTimeLeft}s</span>
          </div>
          <p className="text-zinc-600 text-xs text-center -mt-2">Timer expires → game continues automatically</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCashedOut(true);
                setWon(false);
                setPhase("done");
                savePlay(questionNumber, coinsEarned);
              }}
              className="rounded-xl bg-green-500/20 border border-green-500/50 text-green-300 font-bold py-3.5 text-sm hover:bg-green-500/30 transition-colors"
            >
              🏃 Take the Money
            </button>
            <button
              onClick={continueAfterMilestone}
              className="rounded-xl bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-bold py-3.5 text-sm hover:bg-yellow-400/30 transition-colors"
            >
              🎯 Keep Going
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {milestonePopup}
      <div className="pt-6 md:pt-0 md:grid md:grid-cols-[1fr_9rem] md:gap-6 md:items-start">
        {/* Main content — on mobile this is plain block flow, no flex wrapper */}
        <div>
          {/* Final question banner */}
          {questionNumber === TOTAL_QS && (
            <div className="mb-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 px-4 py-2 text-center text-sm font-bold text-yellow-400">
              🎯 Final question! Make it count
            </div>
          )}

          {/* Progress label + strikes */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Question {questionNumber} of {TOTAL_QS}
              {selectedSport === "Mix" ? (
                <span className="ml-1.5 text-purple-400">· MIX</span>
              ) : (
                <span className={`ml-1.5 ${SPORT_COLORS[currentQuestion.sport] ?? "text-zinc-400"}`}>
                  · {currentQuestion.sport}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {MILESTONE_QS.has(questionNumber) && (
                <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2.5 py-0.5">
                  🪙 {MILESTONES[questionNumber]}
                </span>
              )}
              {/* Strike indicators */}
              <span className="text-sm" title={`${MAX_STRIKES - strikes} lives left`}>
                {Array.from({ length: MAX_STRIKES }, (_, i) => (
                  <span key={i}>{i < strikes ? "🖤" : "❤️"}</span>
                ))}
              </span>
            </div>
          </div>

          {/* Timer bar + countdown */}
          <div className="mb-1 h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className={`h-1.5 rounded-full transition-all duration-200 ${timerColor}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          <div className="flex justify-end mb-3">
            <span className={`text-xs font-semibold tabular-nums ${timeLeft <= 5 ? "text-red-400" : "text-zinc-500"}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Question card */}
          <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-5 py-5 mb-4">
            <p className="text-white font-semibold text-base leading-snug">{currentQuestion.question}</p>
          </div>

          {/* Answer choices */}
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

          {/* Reveal feedback */}
          {phase === "revealing" && currentQuestion && (
            <p className={`mt-4 text-center text-sm font-bold ${selectedIndex === currentQuestion.correctIndex ? "text-green-400" : "text-red-400"}`}>
              {selectedIndex === currentQuestion.correctIndex
                ? "✅ Nailed it!"
                : selectedIndex !== null
                  ? strikes + 1 < MAX_STRIKES
                    ? `❌ Wrong! ${MAX_STRIKES - strikes - 1} life left — keep going`
                    : `❌ Ouch! The answer was ${currentQuestion.answers[currentQuestion.correctIndex]}`
                  : null}
            </p>
          )}

          {/* Running coin total */}
          {coinsEarned > 0 && phase !== "revealing" && (
            <p className="mt-3 text-center text-sm text-yellow-400 font-semibold">
              🪙 {coinsEarned} earned so far
            </p>
          )}
        </div>

        {/* Question Ladder — desktop only */}
        <div className="hidden md:flex flex-col gap-1 pt-1">
          {Array.from({ length: TOTAL_QS }, (_, i) => {
            const qNum = TOTAL_QS - i; // Q10 at top, Q1 at bottom
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
    </>
  );
}
