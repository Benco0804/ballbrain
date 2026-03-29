-- One hint record per cell per user per puzzle. Deduplicates via unique constraint.
CREATE TABLE public.puzzle_hints (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  puzzle_id       uuid        NOT NULL REFERENCES public.daily_puzzles(id) ON DELETE CASCADE,
  cell_key        text        NOT NULL,
  revealed_player text        NOT NULL,
  coins_spent     integer     NOT NULL DEFAULT 50,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, puzzle_id, cell_key)
);

ALTER TABLE public.puzzle_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own hints"
  ON public.puzzle_hints FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hints"
  ON public.puzzle_hints FOR INSERT WITH CHECK (auth.uid() = user_id);
