-- =============================================================================
-- Draft Board: widen difficulty check + add draft_players column
-- =============================================================================

-- 1. Replace the difficulty check constraint to include 'draft'.
ALTER TABLE public.daily_puzzles
  DROP CONSTRAINT daily_puzzles_difficulty_check;

ALTER TABLE public.daily_puzzles
  ADD CONSTRAINT daily_puzzles_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'draft'));

-- 2. draft_players — nullable JSON array of 12 player name strings.
--    Only populated for difficulty = 'draft'.
--    Layout: 9 correct answers (one per cell, in row-major order 0-0..2-2)
--    + 3 decoys, pre-shuffled so the client can display them as-is.
ALTER TABLE public.daily_puzzles
  ADD COLUMN IF NOT EXISTS draft_players jsonb;
