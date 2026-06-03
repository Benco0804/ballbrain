-- Phase 0 Step 2: persist streak on users table
-- Adds current_streak, longest_streak, last_active_date and the update_streak()
-- function so streak is written at play-time instead of computed at query time.

-- 1. Add streak columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS current_streak   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- 2. Backfill last_active_date from existing play history so that existing
--    users' next play correctly extends or resets their streak.
--    current_streak and longest_streak start at 0 — can't accurately reconstruct
--    historical sequences without complex recursive SQL.
UPDATE public.users u
SET last_active_date = (
  SELECT GREATEST(
    (SELECT MAX(gr.play_date)
       FROM public.game_results gr
      WHERE gr.user_id = u.id AND gr.completed_at IS NOT NULL),
    (SELECT MAX(st.play_date)
       FROM public.solo_trivia_plays st
      WHERE st.user_id = u.id)
  )
);

-- 3. update_streak: idempotent function that advances current_streak by 1 if
--    called on a consecutive day, resets to 1 on a gap, and is a no-op if
--    already called today. Uses FOR UPDATE to serialize concurrent calls for
--    the same user (e.g. two tabs open at once).
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today   date    := CURRENT_DATE;  -- UTC
  v_last    date;
  v_current integer;
  v_longest integer;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
    INTO v_last, v_current, v_longest
    FROM users WHERE id = p_user_id FOR UPDATE;

  -- Already played today — nothing to change
  IF v_last = v_today THEN
    RETURN;
  END IF;

  -- Played yesterday — extend the streak
  IF v_last = v_today - 1 THEN
    v_current := v_current + 1;
  ELSE
    -- First-ever play (v_last IS NULL) or gap of 2+ days — reset to 1
    v_current := 1;
  END IF;

  IF v_current > v_longest THEN
    v_longest := v_current;
  END IF;

  UPDATE users
    SET current_streak   = v_current,
        longest_streak   = v_longest,
        last_active_date = v_today
    WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_streak TO authenticated, service_role;
