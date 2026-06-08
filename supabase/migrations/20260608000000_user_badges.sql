-- user_badges: records which badges each user has earned and when.
-- Badge definitions (name, description, tier, icon) live in src/lib/badges/constants.ts.

CREATE TABLE user_badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   text NOT NULL,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX user_badges_user_id_idx ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Awards badges server-side. Returns only the badge_ids that were newly inserted.
-- Already-earned badges are silently skipped via ON CONFLICT DO NOTHING.
CREATE OR REPLACE FUNCTION grant_badges(
  p_user_id   uuid,
  p_badge_ids text[]
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  newly_earned text[] := '{}';
  bid text;
BEGIN
  FOREACH bid IN ARRAY p_badge_ids LOOP
    INSERT INTO user_badges(user_id, badge_id)
    VALUES (p_user_id, bid)
    ON CONFLICT DO NOTHING;

    IF FOUND THEN
      newly_earned := array_append(newly_earned, bid);
    END IF;
  END LOOP;
  RETURN newly_earned;
END;
$$;
