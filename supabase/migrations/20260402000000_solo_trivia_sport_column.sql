-- Add sport column to solo_trivia_plays so limits are tracked per sport.
-- One play per (user, date, sport) instead of per (user, date).

ALTER TABLE public.solo_trivia_plays
  ADD COLUMN IF NOT EXISTS sport text NOT NULL DEFAULT 'NBA';

-- Swap the unique constraint.
ALTER TABLE public.solo_trivia_plays
  DROP CONSTRAINT IF EXISTS solo_trivia_plays_user_id_play_date_key;

ALTER TABLE public.solo_trivia_plays
  ADD CONSTRAINT solo_trivia_plays_user_id_play_date_sport_key
  UNIQUE (user_id, play_date, sport);
