-- One-time backfill: grant badges to all users who already qualify.
-- Safe to re-run — ON CONFLICT DO NOTHING prevents duplicates.
-- These inserts bypass the API so no celebration popups fire; players
-- see earned badges in their trophy case on next profile visit.

WITH
game_counts AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM (
    SELECT user_id FROM game_results WHERE completed_at IS NOT NULL
    UNION ALL
    SELECT user_id FROM solo_trivia_plays
  ) g GROUP BY user_id
),
perfect_counts AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM (
    SELECT user_id FROM game_results WHERE score = 9 AND completed_at IS NOT NULL
    UNION ALL
    SELECT user_id FROM solo_trivia_plays WHERE questions_answered = 10
  ) p GROUP BY user_id
),
-- Savant: only game_mode='sports-grid' perfects.
-- Pre-Phase-2 grids had NULL game_mode and are excluded here — by design.
savant_counts AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM game_results
  WHERE game_mode = 'sports-grid' AND score = 9 AND completed_at IS NOT NULL
  GROUP BY user_id
),
nba_grid_counts      AS (SELECT user_id, COUNT(*) AS cnt FROM game_results      WHERE sport = 'NBA'    AND completed_at IS NOT NULL GROUP BY user_id),
soccer_grid_counts   AS (SELECT user_id, COUNT(*) AS cnt FROM game_results      WHERE sport = 'Soccer' AND completed_at IS NOT NULL GROUP BY user_id),
nba_trivia_counts    AS (SELECT user_id, COUNT(*) AS cnt FROM solo_trivia_plays  WHERE sport = 'NBA'    GROUP BY user_id),
soccer_trivia_counts AS (SELECT user_id, COUNT(*) AS cnt FROM solo_trivia_plays  WHERE sport = 'Soccer' GROUP BY user_id),
-- Accuracy: grid/draft only, guesses_used > 0, min 10 qualifying games
nba_accuracy AS (
  SELECT user_id,
    SUM(score)::float / NULLIF(SUM(guesses_used), 0) AS accuracy,
    COUNT(*) AS games
  FROM game_results WHERE sport = 'NBA' AND guesses_used > 0 AND completed_at IS NOT NULL
  GROUP BY user_id
),
soccer_accuracy AS (
  SELECT user_id,
    SUM(score)::float / NULLIF(SUM(guesses_used), 0) AS accuracy,
    COUNT(*) AS games
  FROM game_results WHERE sport = 'Soccer' AND guesses_used > 0 AND completed_at IS NOT NULL
  GROUP BY user_id
)
INSERT INTO user_badges (user_id, badge_id)

SELECT u.id, 'rookie_card'      FROM users u JOIN game_counts gc ON gc.user_id = u.id WHERE gc.cnt >= 1   UNION
SELECT u.id, 'veteran'          FROM users u JOIN game_counts gc ON gc.user_id = u.id WHERE gc.cnt >= 100 UNION
SELECT u.id, 'franchise_player' FROM users u JOIN game_counts gc ON gc.user_id = u.id WHERE gc.cnt >= 500 UNION
-- Streak: use longest_streak to credit players whose streak has since been broken
SELECT id, 'on_a_run'    FROM users WHERE longest_streak >= 7   UNION
SELECT id, 'ironman'     FROM users WHERE longest_streak >= 30  UNION
SELECT id, 'unbreakable' FROM users WHERE longest_streak >= 100 UNION
SELECT u.id, 'flawless'         FROM users u JOIN perfect_counts pc ON pc.user_id = u.id WHERE pc.cnt >= 1  UNION
SELECT u.id, 'perfectionist'    FROM users u JOIN perfect_counts pc ON pc.user_id = u.id WHERE pc.cnt >= 10 UNION
SELECT u.id, 'ballbrain_savant' FROM users u JOIN savant_counts  sc ON sc.user_id = u.id WHERE sc.cnt >= 25 UNION
SELECT u.id, 'nba_role_player'   FROM users u JOIN nba_accuracy na    ON na.user_id = u.id WHERE na.games >= 10 AND na.accuracy >= 0.70 UNION
SELECT u.id, 'nba_starter'       FROM users u JOIN nba_accuracy na    ON na.user_id = u.id WHERE na.games >= 10 AND na.accuracy >= 0.80 UNION
SELECT u.id, 'nba_sharpshooter'  FROM users u JOIN nba_accuracy na    ON na.user_id = u.id WHERE na.games >= 10 AND na.accuracy >= 0.90 UNION
SELECT u.id, 'soccer_squad'      FROM users u JOIN soccer_accuracy sa ON sa.user_id = u.id WHERE sa.games >= 10 AND sa.accuracy >= 0.70 UNION
SELECT u.id, 'soccer_playmaker'  FROM users u JOIN soccer_accuracy sa ON sa.user_id = u.id WHERE sa.games >= 10 AND sa.accuracy >= 0.80 UNION
SELECT u.id, 'soccer_maestro'    FROM users u JOIN soccer_accuracy sa ON sa.user_id = u.id WHERE sa.games >= 10 AND sa.accuracy >= 0.90 UNION
SELECT u.id, 'gym_rat'       FROM users u
  LEFT JOIN nba_grid_counts    ngc ON ngc.user_id = u.id
  LEFT JOIN nba_trivia_counts  ntc ON ntc.user_id = u.id
  WHERE COALESCE(ngc.cnt, 0) + COALESCE(ntc.cnt, 0) >= 50 UNION
SELECT u.id, 'sunday_league' FROM users u
  LEFT JOIN soccer_grid_counts   sgc ON sgc.user_id = u.id
  LEFT JOIN soccer_trivia_counts stc ON stc.user_id = u.id
  WHERE COALESCE(sgc.cnt, 0) + COALESCE(stc.cnt, 0) >= 50 UNION
-- Hall of Fame starts at 20000 XP (Rookie 1000 + Starter 2000 + All-Star 3500 + Elite 5500 + MVP 8000)
SELECT id, 'first_ballot' FROM users WHERE xp >= 20000

ON CONFLICT DO NOTHING;
