-- Allow multiple play sessions per user per puzzle per day.
-- Adds session tracking + direct sport/date columns for reliable limit queries.

ALTER TABLE public.game_results
  ADD COLUMN IF NOT EXISTS session_id  uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS sport       text NOT NULL DEFAULT 'NBA',
  ADD COLUMN IF NOT EXISTS play_date   date NOT NULL DEFAULT CURRENT_DATE;

-- Drop the old one-row-per-puzzle constraint.
ALTER TABLE public.game_results
  DROP CONSTRAINT IF EXISTS game_results_user_id_puzzle_id_key;

-- Each play session is globally unique.
ALTER TABLE public.game_results
  ADD CONSTRAINT game_results_session_id_key UNIQUE (session_id);

-- Fast limit-check query: count plays per user per sport per day.
CREATE INDEX IF NOT EXISTS game_results_limit_idx
  ON public.game_results (user_id, sport, play_date);
