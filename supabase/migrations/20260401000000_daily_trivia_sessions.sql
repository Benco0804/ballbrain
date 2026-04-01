-- =============================================================================
-- daily_trivia_sessions
-- Pre-generated trivia question sets for each sport per day.
-- 2 variants per sport per day (variant 1 and 2), each with 10 question IDs.
-- =============================================================================

CREATE TABLE public.daily_trivia_sessions (
  id           uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date     NOT NULL,
  sport        text     NOT NULL CHECK (sport IN ('NBA', 'Soccer')),
  variant      smallint NOT NULL CHECK (variant IN (1, 2)),
  question_ids uuid[]   NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (session_date, sport, variant)
);

CREATE INDEX daily_trivia_sessions_date_sport_idx
  ON public.daily_trivia_sessions (session_date, sport);

ALTER TABLE public.daily_trivia_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read (questions themselves are already public via trivia_questions RLS).
CREATE POLICY "daily_trivia_sessions: public read"
  ON public.daily_trivia_sessions FOR SELECT
  USING (true);

-- Writes go through the Edge Function using the service-role key (no client policy needed).
