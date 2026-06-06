-- One-time backfill: award XP for all historical game activity.
-- Formula: base + (score × per-cell) + perfect bonus.
-- No mode distinction on historical rows (game_mode not recorded pre-migration).
UPDATE users u
SET xp = (
  SELECT COALESCE(SUM(
    25 +
    (gr.score * 5) +
    CASE WHEN gr.score = 9 THEN 30 ELSE 0 END
  ), 0)
  FROM game_results gr
  WHERE gr.user_id = u.id
    AND gr.completed_at IS NOT NULL
) + (
  SELECT COALESCE(SUM(
    20 +
    (tp.questions_answered * 4) +
    CASE WHEN tp.questions_answered = 10 THEN 40 ELSE 0 END
  ), 0)
  FROM solo_trivia_plays tp
  WHERE tp.user_id = u.id
);
