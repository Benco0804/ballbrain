CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_amount  integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_after integer;
BEGIN
  UPDATE users
    SET xp = xp + p_amount
    WHERE id = p_user_id
    RETURNING xp INTO v_xp_after;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  RETURN v_xp_after;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_xp TO authenticated, service_role;
