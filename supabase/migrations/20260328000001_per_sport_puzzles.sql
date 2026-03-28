-- =============================================================================
-- BallBrain — Per-Sport Daily Puzzles
-- =============================================================================
-- Relaxes the unique constraint on daily_puzzles from (puzzle_date) alone to
-- (puzzle_date, sport) so each day can have one NBA, one NFL, and one Soccer
-- puzzle simultaneously.
-- =============================================================================

-- Drop the single-column unique constraint created by the initial schema.
alter table public.daily_puzzles
  drop constraint daily_puzzles_puzzle_date_key;

-- Replace it with a composite constraint.
alter table public.daily_puzzles
  add constraint daily_puzzles_puzzle_date_sport_key unique (puzzle_date, sport);
