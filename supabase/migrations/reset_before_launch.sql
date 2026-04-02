-- =============================================================================
-- BallBrain — Pre-launch data reset
-- Run once in the Supabase SQL editor before F&F launch.
--
-- SAFE TO RUN: does NOT touch users, players, or trivia_questions.
-- All statements are wrapped in a transaction — if anything fails the
-- whole reset rolls back, leaving the DB in its original state.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Clear Sports Grid gameplay
-- ---------------------------------------------------------------------------

-- puzzle_hints references game_results indirectly (both reference puzzle_id),
-- so clear hints first to avoid any FK issues.
DELETE FROM public.puzzle_hints;

-- All grid attempts by all users.
DELETE FROM public.game_results;

-- ---------------------------------------------------------------------------
-- 2. Clear Solo Trivia gameplay
-- ---------------------------------------------------------------------------

DELETE FROM public.solo_trivia_plays;

-- ---------------------------------------------------------------------------
-- 3. Reset user balances
--    NOTE: there are no streak/longest_streak columns in users — streak is
--    computed at query time from game_results + solo_trivia_plays, so
--    clearing those tables above is sufficient.
-- ---------------------------------------------------------------------------

UPDATE public.users
SET coins = 0,
    gems  = 0;

-- Wipe the coin/gem audit ledger so balances start clean.
DELETE FROM public.economy_transactions;

-- ---------------------------------------------------------------------------
-- 4. Clear old puzzles — keep today's (2026-04-02)
--    puzzle_cells rows cascade-delete with their parent puzzle.
-- ---------------------------------------------------------------------------

DELETE FROM public.daily_puzzles
WHERE puzzle_date <> '2026-04-02';

-- ---------------------------------------------------------------------------
-- 5. Clear old trivia sessions — keep today's (2026-04-02)
-- ---------------------------------------------------------------------------

DELETE FROM public.daily_trivia_sessions
WHERE session_date <> '2026-04-02';

-- ---------------------------------------------------------------------------
-- 6. Clear trivia battles (test data only — feature not yet live)
-- ---------------------------------------------------------------------------

DELETE FROM public.trivia_battles;

-- ---------------------------------------------------------------------------
-- Sanity check — print row counts after reset (visible in SQL editor output)
-- ---------------------------------------------------------------------------

SELECT
  'puzzle_hints'          AS table_name, COUNT(*) AS rows_remaining FROM public.puzzle_hints
UNION ALL SELECT 'game_results',          COUNT(*) FROM public.game_results
UNION ALL SELECT 'solo_trivia_plays',     COUNT(*) FROM public.solo_trivia_plays
UNION ALL SELECT 'economy_transactions',  COUNT(*) FROM public.economy_transactions
UNION ALL SELECT 'trivia_battles',        COUNT(*) FROM public.trivia_battles
UNION ALL SELECT 'daily_puzzles',         COUNT(*) FROM public.daily_puzzles
UNION ALL SELECT 'daily_trivia_sessions', COUNT(*) FROM public.daily_trivia_sessions
UNION ALL SELECT 'users (total)',         COUNT(*) FROM public.users
UNION ALL SELECT 'users with coins > 0',  COUNT(*) FROM public.users WHERE coins > 0
ORDER BY table_name;

COMMIT;
