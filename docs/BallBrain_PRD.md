# BallBrain — Product Requirements Document (PRD)

*Last updated: June 8, 2026 — after Phase 3 (Badge/Trophy Case system)*
*Maintained as a living document — updated at the end of each build phase.*

---

## 1. Vision & Strategy

### What BallBrain is
A **sports-knowledge hub**: one platform where sports fans test and build their sports IQ across multiple game formats, all feeding a single persistent sports identity.

### The core strategic bet
The differentiator is **the hub itself**, not any single game mode. Immaculate Grid owns daily sports grids; many apps do trivia. Nobody owns *"the place where your sports knowledge lives across formats, as one identity."* That position is the moat — but only if the modes feel like one product feeding one identity, not separate mini-games.

### Why NOT a progression/level game (the Arena pivot, rejected)
An early idea was to pivot to a Disney-Solitaire-style level-progression game ("Arena"). **Rejected**, because:
- Solitaire/Match-3 levels work on an *infinitely replayable core loop*. **Trivia questions are consumable** — once you know an answer, that question is dead. A pure level-progression trivia game becomes a content treadmill that eats a solo dev alive.
- The hub spreads content risk across modes instead.
- The *progression instinct* behind Arena was right — it's now expressed as the XP/rank/level identity layer, which climbs based on *performance*, not on finishing hand-authored levels (no content trap).

### The retention engine
**Daily appointment feeding a persistent sports identity.** Two engines working together:
- *Daily appointment* — a fresh puzzle every day; "did you do today's?" becomes habit.
- *Persistent identity* — every game builds XP, rank, per-sport accuracy, streak, badges. People return to *maintain and improve who they are in the app.*

This was the answer to the founder's original problem: "there's no feel of progress." The progress is the identity climbing, refreshed daily.

---

## 2. Audience & Go-to-Market

### Audiences
- **Primary product audience:** sports fans. NBA + Soccer today; NFL/MLB planned.
- **Launch Wave 1 (now):** builder / vibe-coding communities (Reddit, LinkedIn). Judged on craft. Doubles as a portfolio/CV piece during a job search. Hook = the build story + product thinking.
- **Launch Wave 2 (later):** sports fans / gamer forums, ~1–2 weeks after Wave 1, **quality-gated not just time-gated** (only after Wave 1 feedback fixes the obvious rough edges). Hook = the challenge ("how well do you know ball?").

### Why builder-first
More forgiving audience for a rough alpha; serves the urgent CV/job goal; gives usable feedback even at low player counts (builders comment on the loop; cold sports fans just churn silently).

### World Cup lever
2026 World Cup runs **June 11 – July 19**. Treated as a *wave to ride, not a launch deadline* — interest stays high ~6 weeks. Soccer content is weighted toward World Cup / national teams. Don't rush an unpolished launch to hit opening day.

### Two-audience principle
Same product, different *opening hook* per channel. Builders → build story. Sports fans → the challenge. Never water down either; sequence builder-first.

---

## 3. Game Modes (three modes, three jobs)

| Mode | Job | Mechanic | Notes |
|------|-----|----------|-------|
| **Draft Board** | Signature / FTUE entry | Recognition — pick from visible player options | Can't-fail first touch; visually unmistakably "sports"; the face shown to strangers |
| **Solo Trivia** | Engagement / session length | Timed, 10 questions, 4 choices, 2 strikes | "One more round" loop; least differentiated, so not the signature |
| **Sports Grid** | Mastery flex | Recall — type the answer from memory | Expert mode; "I don't need the options, I know ball" |

**Recognition → recall is itself a progression** — easy mode (draft) to hard mode (grid) is a felt mastery curve feeding the identity engine.

**1v1 Trivia Battle:** deferred until a player base exists (schema exists, unused).

---

## 4. Identity Layer (the heart)

### Per-sport accuracy ("the K/D")
A single proud hero stat per sport, COD-K/D style. **Cell Accuracy = correct cells ÷ total guesses**, computed per sport. Supporting stats: games played, perfect puzzles, avg trivia progress, trivia wins.
- *Decision:* accuracy hero comes from **grid/draft** (cleanly computable). Trivia shows "Avg Progress" instead, because the 2-strikes mechanic means stored `questions_answered` ≠ questions correct. *Future improvement:* add `questions_correct` to enable true trivia accuracy.
- Profile is built **sport-agnostic** — sport-cards render from whatever sports exist in the data. Adding NFL/MLB = zero code changes.

### XP → Level → Rank (one global progression)
- **Decision: rank is ONE global identity, NOT per-sport** — per-sport ranks confuse players ("am I All-Star or Rookie?"). Per-sport identity lives in *badges* instead.
- **Decision: rank is driven by XP (engagement + rewarded skill), NOT pure accuracy.** Pure-accuracy ranking punishes casual players and kills motivation. XP rewards *showing up* (base XP per game) *and* skill (bonus XP for perfect/flawless games). Everyone progresses by playing; good players progress faster. Success matters without skill being a wall.
- **XP is separate from coins** — non-spendable, only climbs. Stored as a single `xp` number on the user. Rank and level are **computed** from XP, never stored separately (avoids data drift).
- **Levels within ranks:** 6 ranks × 10 levels = 60 levels. Frequent level-ups (small dopamine) punctuated by rare rank-ups (big milestone).

**Rank ladder:** Rookie → Starter → All-Star → Elite → MVP → Hall of Fame.

**XP values (tunable constants — adjust after real data):**
- Grid: base 25 + 5/correct cell + 30 perfect bonus
- Draft: base 25 + 5/correct cell + 30 flawless bonus (0 wrong)
- Trivia: base 20 + 4/question answered + 40 full-clear bonus

**XP per level by rank:** Rookie 100 → Starter 200 → All-Star 350 → Elite 550 → MVP 800 → Hall of Fame 1,200.

### Streak
- **Decision: streak counts PLAYING, not winning.** Its job is the *daily-return habit*, so the bar is "show up," not "perform." A win-gated streak would punish loyal players on a bad day and cause churn (broken-streak = #1 churn event). Mastery/hard-won achievement lives in rank + badges instead.
- Stored on the user (`current_streak`, `longest_streak`, `last_active_date`), written at play-time, UTC-based (consistent with puzzles), idempotent (multiple games/day = no double-count).
- *Streak freeze* mechanic deferred to Phase 4 (column added then, not now).

### Badges *(Phase 3 — shipped)*
WSOP rings/bracelets model — discrete, memorable, collected trophies displayed on the profile (the "trophy case"). **This is where per-sport identity lives** ("NBA Sharpshooter," "Soccer Perfectionist"). 18 badges across 6 categories: milestone, streak, perfection, mastery (per-sport cell accuracy, min 10 games), volume, and rank. Stored in `user_badges` table; awarded server-side via `grant_badges()` SECURITY DEFINER function (pattern consistent with `award_coins`/`award_xp`). Newly-earned badges return from both game-completion API routes and trigger an instant celebration popup on top of the result screen. Profile shows all 18 in a trophy case — earned in full color with date, locked ones greyed with padlock so players see what to chase. Backfill migration credited existing players retroactively without triggering popups.
- *Polish remaining:* real badge art (placeholder emoji icons for now). Possible celebration popup animation tweaks.
- *Possible future addition:* a *"Perfect Week"*-style streak-as-badge (the mastery version of a streak, without risking the core habit streak).

---

## 5. Economy & Monetization

### Currencies
- **Coins** — spendable. Earned by playing. **150 starting coins** (= exactly 3 hints, so a day-one player can fully experience the hint feature on their first puzzle).
- **XP** — non-spendable progression (see §4).

### Coin earn events
Grid: 10/correct cell, +5/unique player, +60 perfect, +15 participation (<9). Draft: 6/cell, +3/cell unique, +40 perfect, +15 participation. Trivia: milestone payouts (+20 Q2, +50 Q4, +100 Q6, +200 Q8, +500 Q10).
- *Decision:* 15-coin participation reward on low/0% games is **intentional** — rewards completion, protects fragile new players from feeling punished. Kept as-is.

### Coin sinks (the monetization)
- **Hints (the volume engine)** — 50 coins, frequent, mid-game "unstick me" moment; scales with rank-driven difficulty. *Currently Sports Grid only.*
- **Streak-freeze (the peak engine)** *(Phase 4)* — rare, highest willingness-to-pay (loss aversion at a long streak).
- **Cosmetic profile flair** *(later)* — pure identity sink.
- **Decision: daily core play stays FREE.** Don't tax the habit you're trying to build.

### Monetization model
- **Now:** rewarded ads as the coin faucet (watch → coins/hint/freeze). Light banners for baseline revenue, kept off core play screens for demo quality.
- **Deferred:** IAP for coins — *architected for, not built.* Switch on when real sports traffic exists.
- **Roadmap-only:** subscription ("BallBrain Pro" — ad-free, cosmetics, streak protection).
- **Thesis:** route every monetization layer through *protecting/extending identity.* You're not selling gameplay; you're selling "don't lose who you've become here."

### Energy / hearts (deferred, post-launch)
A future shared "hearts" pool (~5/day across all modes, with ad/coin/faucet refills). **Not at launch** — no entry-cap until retention is proven; gating fragile early players kills them. When added: gates *replay/extra* sessions only, never the daily.

---

## 6. FTUE / Onboarding (design target — built in redesign phase)

### Progressive feature unlock (games-played gated)
- **Decision: unlock by GAMES PLAYED, not rank.** Games-played rewards *participation* (everyone progresses by showing up); rank rewards skill (could lock out casual players). Different jobs.
- **Unlock ladder:** start with **Draft Board** only → after **2 draft games** unlock **Solo Trivia** → after **2 solo games** unlock **Sports Grid**. All three modes open within ~first session.
- Locked modes shown **visible-but-locked** ("play 2 more to unlock") — creates anticipation, not frustration.
- **Decision: keep gating light/fast at launch**, deepen later with data. Hard/slow gating kills fragile cold users before the habit forms.
- Counts derive from existing `game_results` / `solo_trivia_plays` — likely no new schema.

### Celebration moments *(redesign phase)*
- **Level-up:** small celebration, frequent.
- **Rank-up:** big, full-screen, *screenshot-worthy* moment (doubles as growth — shareable "I hit MVP").
- This is the dopamine payoff that makes the XP engine *felt*, and the monetization-mindset instinct: celebrate progress.

---

## 7. Roadmap

**Done:**
- Cron auto-generation fixed + guardrailed (placeholder URL/secret + JWT issues resolved).
- Content banks filled, World Cup-weighted (Soccer players 158, NBA 121, both trivia ~115).
- **Phase 0** — coin transaction ledger (`award_coins`, logs to `economy_transactions`) + persisted streak.
- **Phase 1** — per-sport accuracy profile (sport-agnostic).
- **Phase 2** — XP/rank/level system (`award_xp`, RankBanner, backfilled).
- **Phase 3** — Badge/trophy case system (18 badges, `user_badges` table, `grant_badges()` function, celebration popup, profile trophy case, retroactive backfill). Polish remaining: real badge art, possible popup tweaks.

**Next:**
- **Phase 4** — Daily faucet (escalating login reward: coins + hints + occasional freeze) + streak-freeze mechanic.
- **Redesign** — look & feel; FTUE unlock ladder; draft-board-as-signature framing; level-up/rank-up celebrations; rank-driven grid difficulty.
- **World Cup theming** — ride the wave.
- **Launch** — Wave 1 builders → Wave 2 sports fans.

**Later / deferred:**
- Automated data pipeline (sports API feed instead of hand-seeding) — *the real long-term data story; defer until after the tournament.*
- True trivia accuracy (`questions_correct` column).
- Hearts/energy system.
- IAP activation; subscription.
- 1v1 Trivia Battle.
- **Prestige perfection badge tier** — a future "flawless" prestige layer on top of the Phase 3 perfection badges. Defined as: perfect score AND zero wrong guesses (`guesses_used = score`) AND no hints used. Would introduce NEW higher-tier badges (e.g. "True Savant") rather than redefining existing ones, so existing badge holders keep what they earned. Data to support this already exists (`guesses_used` column on `game_results`, `puzzle_hints` table). Deferred to keep Phase 3 focused.

---

## 8. Technical Notes & Hard-Won Lessons

### Stack
Next.js (App Router, TypeScript, Tailwind) · Supabase (DB, auth, Edge Functions, pg_cron) · Vercel. Built solo, primarily via Claude Code. Supabase project ref: `wdkzsnkrdqadoiqbjlqr`.

### Key technical patterns
- **`award_coins` / `award_xp`** — atomic Postgres functions (update + return new balance) so balance is race-safe and accurate. Coins also log to `economy_transactions`; XP does NOT (it's not a currency).
- **`update_streak`** — atomic, idempotent, row-locked, UTC-based.
- Rank/level computed from XP via a pure function, never stored.
- Profile stats computed in-app (JS) from existing rows; sport-agnostic rendering.

### Hard-won lessons (don't repeat these)
- **Migration SQL must use real values, never placeholders** (`wdkzsnkrdqadoiqbjlqr`, real secrets). An unsubstituted `YOUR_PROJECT_REF` placeholder silently broke the puzzle cron *for weeks* — and re-broke it on every deploy because the migration file kept re-poisoning the live cron.
- **Deploy edge functions with `--no-verify-jwt`** explicitly. A plain deploy re-enables JWT verification in the cloud (ignoring `config.toml`) and breaks cron with a 401 `NO_AUTH_HEADER`.
- **Migration workflow:** Claude Code writes migration SQL files; Ben runs them manually in the Supabase SQL Editor (Claude Code can't apply migrations). Always provide copy-ready SQL blocks.
- **Large SQL seed files** hit the ~32k token output limit — split into chunks (~75 players or ~40 questions). Keep content-generation prompts tightly scoped to avoid token spirals.
- **Always verify generated trivia for factual accuracy** before uploading — a verification pass once caught 4 wrong questions in a batch of 15.
- **`game_results`:** `score` = correct cells (0–9); `guesses_used` = total attempts; `game_mode` now stored going forward (historical rows null).

### Known bugs / display issues
- **BUG — Cell Accuracy can display over 100%** (observed: 450% on a 9/9 first game). Formula is `correct cells ÷ total guesses`; likely `guesses_used` is not capturing total attempts correctly, or the display needs a clamp to 100%. Cosmetic only (display-side); does not affect coin/XP awards. Fix in a future session.

### Don't-backfill vs backfill decisions
- Coins: **not** backfilled (reconstructing past transactions is lossy; ledger starts clean).
- Streak: **partial** backfill (set `last_active_date` from history; counts start at 0).
- XP: **full** backfill (existing players credited for past games, so they don't start at Rookie L1 despite real history).

---

## 9. Working Method (how this gets built)
- **Claude.ai** for planning, product decisions, strategy, debugging strategy (this document's home).
- **Claude Code** for implementation. Pattern: Plan Mode (+ ultrathink for hard/novel problems only) → review plan together → approve → build → run SQL manually → verify live.
- Build phases sized small and sequential; foundations before features (data the features read from must be trustworthy first).
- **This PRD + the one-pager are updated at the end of every phase.**
