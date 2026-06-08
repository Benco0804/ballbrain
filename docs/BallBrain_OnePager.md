# BallBrain — One-Pager

*Last updated: June 6, 2026 — after Phase 2 (XP/Rank system)*

## What it is
BallBrain is a **sports-knowledge hub** — a web platform where sports fans test and build their sports IQ across multiple game formats, all feeding one persistent sports identity. Live at `ballbrain-kappa.vercel.app`.

The core bet: nobody owns *"the place where your sports knowledge lives across formats."* That hub identity is the differentiator — not any single game mode.

## Who it's for
- **Primary audience:** sports fans (NBA + Soccer today; NFL/MLB planned).
- **Launch audience #1 (now):** builder / vibe-coding communities — for feedback and as a portfolio/CV piece.
- **Launch audience #2 (later):** sports fans, riding the 2026 World Cup wave (June 11 – July 19).

## The core loop / why people come back
**Daily appointment feeding a persistent sports identity.** A fresh puzzle every day pulls players back; every game they play builds their identity (XP, rank, per-sport accuracy, streak). The reason to return isn't "one more level" — it's *maintaining and improving who you are in the app.*

## Game modes (three modes, three jobs)
- **Draft Board** — the signature mode. Recognition-based (pick from visible options), can't-fail entry point, the FTUE starting experience. Visually unmistakably "sports."
- **Solo Trivia** — the engagement / session-length mode. Timed, 10 questions, "one more round" feel.
- **Sports Grid** — the mastery flex. Recall-based (type the answer from memory), the "expert mode" that proves you know ball.

## Identity layer (the heart of the product)
- **Per-sport accuracy** — a "K/D"-style hero stat per sport (e.g. "NBA: 83%").
- **XP → Level → Rank** — one global progression. XP rewards engagement + skill; levels are frequent small wins; ranks (Rookie → Starter → All-Star → Elite → MVP → Hall of Fame) are rare milestones.
- **Streak** — daily-return habit (counts *playing*, not winning).
- **Badges** *(coming, Phase 3)* — WSOP-style discrete trophies; this is where per-sport identity lives.

## Economy (free-to-play)
- **Coins** — spendable currency. Earned by playing; sinks are hints (volume engine) and, later, streak-freeze (peak engine) + cosmetics.
- **XP** — non-spendable progression currency (separate from coins).
- **Monetization** — rewarded ads as the faucet now; IAP architected-but-deferred; subscription is roadmap-only. Thesis: *route every layer through protecting/extending identity.*

## Current state (June 2026)
- Live, alpha launched. Daily puzzle auto-generation working. Content banks healthy and World Cup-weighted.
- Built: coin ledger, persisted streak, per-sport accuracy profile, XP/rank/level system.

## What's next
Badges → daily faucet + streak freeze → look-and-feel redesign (incl. FTUE unlock ladder + level-up/rank-up celebrations) → World Cup theming → launch.

## Tech stack
Next.js (App Router, TypeScript, Tailwind) · Supabase (DB, auth, Edge Functions, pg_cron) · Vercel. Built solo, primarily via Claude Code.
