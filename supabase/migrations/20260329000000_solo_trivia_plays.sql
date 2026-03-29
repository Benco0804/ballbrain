-- Solo Trivia: one play per user per day.
CREATE TABLE public.solo_trivia_plays (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  play_date           date        NOT NULL DEFAULT CURRENT_DATE,
  questions_answered  integer     NOT NULL DEFAULT 0,
  coins_earned        integer     NOT NULL DEFAULT 0,
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, play_date)
);

ALTER TABLE public.solo_trivia_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own plays"
  ON public.solo_trivia_plays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plays"
  ON public.solo_trivia_plays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plays"
  ON public.solo_trivia_plays FOR UPDATE
  USING (auth.uid() = user_id);
