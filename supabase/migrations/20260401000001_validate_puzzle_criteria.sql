-- =============================================================================
-- validate_puzzle_criteria(sport, row_crits[3], col_crits[3], min_players)
--
-- For a given 3×3 criteria grid, queries all 9 cells in a single PL/pgSQL call.
-- Returns a JSONB cell map {"0-0": ["Player","..."], "0-1": [...], ...}
-- or NULL if any cell has fewer than min_players valid players.
--
-- Row/col criteria IDs map to metadata JSONB conditions defined in the CASE block.
-- Adding a new criterion: add a WHEN clause to the CASE in get_criterion_sql().
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: maps a criterion ID to its SQL WHERE fragment.
-- Returns NULL for unknown IDs (caller must handle).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_criterion_sql(p_crit_id text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_crit_id

    -- ── NBA row criteria (team membership) ───────────────────────────────────
    WHEN 'nba-lakers'     THEN 'metadata->''teams'' @> ''["Lakers"]'''
    WHEN 'nba-celtics'    THEN 'metadata->''teams'' @> ''["Celtics"]'''
    WHEN 'nba-bulls'      THEN 'metadata->''teams'' @> ''["Bulls"]'''
    WHEN 'nba-spurs'      THEN 'metadata->''teams'' @> ''["Spurs"]'''
    WHEN 'nba-warriors'   THEN 'metadata->''teams'' @> ''["Warriors"]'''
    WHEN 'nba-heat'       THEN 'metadata->''teams'' @> ''["Heat"]'''
    WHEN 'nba-76ers'      THEN 'metadata->''teams'' @> ''["76ers"]'''
    WHEN 'nba-knicks'     THEN 'metadata->''teams'' @> ''["Knicks"]'''
    WHEN 'nba-pistons'    THEN 'metadata->''teams'' @> ''["Pistons"]'''
    WHEN 'nba-rockets'    THEN 'metadata->''teams'' @> ''["Rockets"]'''
    WHEN 'nba-cavaliers'  THEN 'metadata->''teams'' @> ''["Cavaliers"]'''
    WHEN 'nba-suns'       THEN 'metadata->''teams'' @> ''["Suns"]'''
    WHEN 'nba-mavericks'  THEN 'metadata->''teams'' @> ''["Mavericks"]'''
    WHEN 'nba-jazz'       THEN 'metadata->''teams'' @> ''["Jazz"]'''
    WHEN 'nba-bucks'      THEN 'metadata->''teams'' @> ''["Bucks"]'''

    -- ── NBA col criteria (achievements / stats) ──────────────────────────────
    WHEN 'nba-champion'        THEN 'metadata->>''champion'' = ''true'''
    WHEN 'nba-finals-mvp'      THEN 'metadata->>''finals_mvp'' = ''true'''
    WHEN 'nba-mvp'             THEN 'metadata->>''mvp'' = ''true'''
    WHEN 'nba-all-nba-first'   THEN 'metadata->>''all_nba_first'' = ''true'''
    WHEN 'nba-10plus-allstar'  THEN '(metadata->>''all_star_count'')::int >= 10'
    WHEN 'nba-5plus-allstar'   THEN '(metadata->>''all_star_count'')::int >= 5'
    WHEN 'nba-scoring-title'   THEN 'metadata->>''scoring_title'' = ''true'''
    WHEN 'nba-career-25ppg'    THEN 'metadata->>''career_25ppg'' = ''true'''
    WHEN 'nba-season-30ppg'    THEN 'metadata->>''season_30ppg'' = ''true'''
    WHEN 'nba-career-20k'      THEN 'metadata->>''career_20k'' = ''true'''
    WHEN 'nba-roy'             THEN 'metadata->>''roy'' = ''true'''
    WHEN 'nba-draft-top3'      THEN 'metadata->>''draft_top3'' = ''true'''
    WHEN 'nba-game-50pts'      THEN 'metadata->>''game_50pts'' = ''true'''
    WHEN 'nba-td10-season'     THEN 'metadata->>''td10_season'' = ''true'''
    WHEN 'nba-dpoy'            THEN 'metadata->>''dpoy'' = ''true'''

    -- ── Soccer row criteria (club / league) ──────────────────────────────────
    WHEN 'soccer-real-madrid'  THEN 'metadata->''teams'' @> ''["Real Madrid"]'''
    WHEN 'soccer-barcelona'    THEN 'metadata->''teams'' @> ''["Barcelona"]'''
    WHEN 'soccer-bayern'       THEN 'metadata->''teams'' @> ''["Bayern Munich"]'''
    WHEN 'soccer-man-united'   THEN 'metadata->''teams'' @> ''["Manchester United"]'''
    WHEN 'soccer-liverpool'    THEN 'metadata->''teams'' @> ''["Liverpool"]'''
    WHEN 'soccer-chelsea'      THEN 'metadata->''teams'' @> ''["Chelsea"]'''
    WHEN 'soccer-arsenal'      THEN 'metadata->''teams'' @> ''["Arsenal"]'''
    WHEN 'soccer-juventus'     THEN 'metadata->''teams'' @> ''["Juventus"]'''
    WHEN 'soccer-ac-milan'     THEN 'metadata->''teams'' @> ''["AC Milan"]'''
    WHEN 'soccer-inter-milan'  THEN 'metadata->''teams'' @> ''["Inter Milan"]'''
    WHEN 'soccer-psg'          THEN 'metadata->''teams'' @> ''["PSG"]'''
    WHEN 'soccer-atletico'     THEN 'metadata->''teams'' @> ''["Atletico Madrid"]'''
    WHEN 'soccer-prem'         THEN 'metadata->''top5_leagues'' @> ''["Premier League"]'''
    WHEN 'soccer-la-liga'      THEN 'metadata->''top5_leagues'' @> ''["La Liga"]'''
    WHEN 'soccer-serie-a'      THEN 'metadata->''top5_leagues'' @> ''["Serie A"]'''
    WHEN 'soccer-bundesliga'   THEN 'metadata->''top5_leagues'' @> ''["Bundesliga"]'''
    WHEN 'soccer-ligue1'       THEN 'metadata->''top5_leagues'' @> ''["Ligue 1"]'''
    WHEN 'soccer-israeli'      THEN 'metadata->>''played_israeli_league'' = ''true'''

    -- ── Soccer col criteria (achievements / stats) ───────────────────────────
    WHEN 'soccer-ucl-winner'   THEN 'metadata->>''ucl_winner'' = ''true'''
    WHEN 'soccer-world-cup'    THEN 'metadata->>''world_cup_winner'' = ''true'''
    WHEN 'soccer-ballon-dor'   THEN 'metadata->>''ballon_dor'' = ''true'''
    WHEN 'soccer-league-title' THEN 'metadata->>''league_title'' = ''true'''
    WHEN 'soccer-top-scorer'   THEN 'metadata->>''league_top_scorer'' = ''true'''
    WHEN 'soccer-wc-boot'      THEN 'metadata->>''wc_golden_boot'' = ''true'''
    WHEN 'soccer-30goals'      THEN 'metadata->>''season_30goals'' = ''true'''
    WHEN 'soccer-ucl-50apps'   THEN 'metadata->>''ucl_50apps'' = ''true'''
    WHEN 'soccer-100caps'      THEN 'metadata->>''caps_100plus'' = ''true'''
    WHEN 'soccer-captain'      THEN 'metadata->>''national_captain'' = ''true'''
    WHEN 'soccer-no-ucl'       THEN 'metadata->>''no_ucl'' = ''true'''

    ELSE NULL
  END;
END;
$$;


-- ---------------------------------------------------------------------------
-- Main validator: checks all 9 cells of a criteria grid in one call.
--
-- Returns JSONB {"0-0": ["Name",...], "0-1": [...], ..., "2-2": [...]}
-- or NULL if any cell has fewer than p_min_players valid players
-- (short-circuits on the first failing cell).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_puzzle_criteria(
  p_sport       text,
  p_row_crits   text[],           -- exactly 3 criterion IDs
  p_col_crits   text[],           -- exactly 3 criterion IDs
  p_min_players integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result   jsonb := '{}';
  v_row_sql  text;
  v_col_sql  text;
  v_cell_sql text;
  v_players  text[];
  r          integer;
  c          integer;
BEGIN
  FOR r IN 1..3 LOOP
    v_row_sql := get_criterion_sql(p_row_crits[r]);
    IF v_row_sql IS NULL THEN
      RETURN NULL;  -- unknown criterion ID
    END IF;

    FOR c IN 1..3 LOOP
      v_col_sql := get_criterion_sql(p_col_crits[c]);
      IF v_col_sql IS NULL THEN
        RETURN NULL;
      END IF;

      v_cell_sql := format(
        'SELECT array_agg(name ORDER BY name) '
        'FROM public.players '
        'WHERE sport = %L AND active = true AND (%s) AND (%s)',
        p_sport, v_row_sql, v_col_sql
      );

      EXECUTE v_cell_sql INTO v_players;
      v_players := COALESCE(v_players, '{}');

      -- Short-circuit: return NULL immediately if this cell is too thin.
      IF array_length(v_players, 1) IS NULL
         OR array_length(v_players, 1) < p_min_players
      THEN
        RETURN NULL;
      END IF;

      v_result := v_result
        || jsonb_build_object(
             (r - 1)::text || '-' || (c - 1)::text,
             to_jsonb(v_players)
           );
    END LOOP;
  END LOOP;

  RETURN v_result;
END;
$$;

-- Allow the anon / authenticated roles to call these (Edge Function uses service role, but
-- the admin API route also needs access through the server Supabase client).
GRANT EXECUTE ON FUNCTION public.get_criterion_sql(text)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_puzzle_criteria(text, text[], text[], integer) TO anon, authenticated;
