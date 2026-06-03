-- Phase 0: economy transaction logging
-- Adds award_coins() function so every coin change is atomically logged to
-- economy_transactions. Also fixes handle_new_user to give 150 starting coins.

-- 1. Extend reference_type constraint to include 'solo_trivia'.
--    PostgreSQL auto-names inline column constraints as <table>_<column>_check.
ALTER TABLE public.economy_transactions
  DROP CONSTRAINT IF EXISTS economy_transactions_reference_type_check;
ALTER TABLE public.economy_transactions
  ADD CONSTRAINT economy_transactions_reference_type_check
  CHECK (reference_type IN ('game_result', 'trivia_battle', 'purchase', 'bonus', 'solo_trivia'));

-- 2. award_coins: atomically increments users.coins and appends an
--    economy_transactions row in the same transaction. Returns the new balance.
--    Called via supabase.rpc('award_coins', {...}) from server-side Route Handlers.
--    Positive amount = earn, negative = spend. The coins >= 0 CHECK on users is the
--    hard guard against overdrafts.
CREATE OR REPLACE FUNCTION public.award_coins(
  p_user_id        uuid,
  p_amount         integer,
  p_reason         text,
  p_reference_id   uuid    DEFAULT NULL,
  p_reference_type text    DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_after integer;
BEGIN
  UPDATE users
    SET coins = coins + p_amount
    WHERE id = p_user_id
    RETURNING coins INTO v_balance_after;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  INSERT INTO economy_transactions
    (user_id, currency, amount, reason, reference_id, reference_type, balance_after)
  VALUES
    (p_user_id, 'coins', p_amount, p_reason, p_reference_id, p_reference_type, v_balance_after);

  RETURN v_balance_after;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_coins TO authenticated, service_role;

-- 3. Fix handle_new_user: was inserting with DEFAULT 0 coins (bug — spec says 150).
--    Now sets coins = 150 and logs the signup bonus so the ledger starts clean.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, coins)
  VALUES (
    new.id,
    COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'username'), ''),
      'user_' || SUBSTR(new.id::text, 1, 8)
    ),
    COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'display_name'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), '')
    ),
    150
  );

  INSERT INTO public.economy_transactions
    (user_id, currency, amount, reason, reference_type, balance_after)
  VALUES
    (new.id, 'coins', 150, 'signup_bonus', 'bonus', 150);

  RETURN new;
END;
$$;
