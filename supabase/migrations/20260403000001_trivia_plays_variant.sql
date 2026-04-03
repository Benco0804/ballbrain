-- Allow 2 trivia plays per sport per day (variant 1 and variant 2).
-- Previously: UNIQUE (user_id, play_date, sport) → 1 play max.
-- Now:        UNIQUE (user_id, play_date, sport, variant) → 2 plays max.

ALTER TABLE public.solo_trivia_plays
  ADD COLUMN IF NOT EXISTS variant smallint NOT NULL DEFAULT 1
    CHECK (variant IN (1, 2));

ALTER TABLE public.solo_trivia_plays
  DROP CONSTRAINT IF EXISTS solo_trivia_plays_user_id_play_date_sport_key;

ALTER TABLE public.solo_trivia_plays
  ADD CONSTRAINT solo_trivia_plays_user_id_play_date_sport_variant_key
  UNIQUE (user_id, play_date, sport, variant);
