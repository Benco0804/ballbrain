-- =============================================================================
-- BallBrain — Multi-difficulty puzzles per sport per day
-- =============================================================================
-- Relaxes the unique constraint from (puzzle_date, sport) to
-- (puzzle_date, sport, difficulty) so each day can have an easy, medium,
-- and hard puzzle per sport.
-- =============================================================================

alter table public.daily_puzzles
  drop constraint daily_puzzles_puzzle_date_sport_key;

alter table public.daily_puzzles
  add constraint daily_puzzles_puzzle_date_sport_difficulty_key
  unique (puzzle_date, sport, difficulty);
