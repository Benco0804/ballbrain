-- =============================================================================
-- BallBrain — Seed Data
-- =============================================================================
-- Inserts the first daily puzzle (2026-03-28) with valid players per cell.
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING.
-- =============================================================================

DO $$
DECLARE
  v_puzzle_id uuid;
BEGIN

  -- -------------------------------------------------------------------------
  -- Puzzle: 2026-03-28
  -- Rows:    Lakers player | Super Bowl Champion | UCL Winner
  -- Columns: 10+ Seasons   | Pro Bowl Selection  | 50+ International Caps
  -- -------------------------------------------------------------------------
  INSERT INTO public.daily_puzzles (
    puzzle_date,
    row_categories,
    col_categories,
    sport,
    difficulty
  ) VALUES (
    '2026-03-28',
    '[
      {"label": "Played for the Lakers", "sport": "NBA",    "categoryId": "nba-lakers"},
      {"label": "Super Bowl Champion",   "sport": "NFL",    "categoryId": "nfl-super-bowl-champ"},
      {"label": "UCL Winner",            "sport": "Soccer", "categoryId": "soccer-ucl-winner"}
    ]'::jsonb,
    '[
      {"label": "10+ Seasons",            "sport": "NBA",    "categoryId": "career-10-plus-seasons"},
      {"label": "Pro Bowl Selection",     "sport": "NFL",    "categoryId": "nfl-pro-bowl"},
      {"label": "50+ International Caps", "sport": "Soccer", "categoryId": "soccer-50-plus-caps"}
    ]'::jsonb,
    'Mixed',
    'medium'
  )
  ON CONFLICT (puzzle_date) DO NOTHING;

  SELECT id INTO v_puzzle_id
  FROM public.daily_puzzles
  WHERE puzzle_date = '2026-03-28';

  -- -------------------------------------------------------------------------
  -- Cells (row, col) — 9 total
  -- Impossible cross-sport cells get an empty array.
  -- -------------------------------------------------------------------------

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES

    -- (0,0) Lakers  ×  10+ Seasons
    (v_puzzle_id, 0, 0, ARRAY[
      'Kobe Bryant', 'LeBron James', 'Magic Johnson', 'Kareem Abdul-Jabbar',
      'Shaquille O''Neal', 'Pau Gasol', 'Derek Fisher', 'James Worthy',
      'Byron Scott', 'AC Green', 'Nick Young'
    ]),

    -- (0,1) Lakers  ×  Pro Bowl  →  impossible (different sports)
    (v_puzzle_id, 0, 1, ARRAY[]::text[]),

    -- (0,2) Lakers  ×  50+ International Caps  →  impossible (different sports)
    (v_puzzle_id, 0, 2, ARRAY[]::text[]),

    -- (1,0) Super Bowl Champion  ×  10+ Seasons
    (v_puzzle_id, 1, 0, ARRAY[
      'Tom Brady', 'Jerry Rice', 'Emmitt Smith', 'Peyton Manning',
      'Joe Montana', 'John Elway', 'Troy Aikman', 'Terry Bradshaw',
      'Lawrence Taylor', 'Roger Staubach', 'Joe Greene',
      'Drew Brees', 'Aaron Rodgers'
    ]),

    -- (1,1) Super Bowl Champion  ×  Pro Bowl Selection
    (v_puzzle_id, 1, 1, ARRAY[
      'Tom Brady', 'Jerry Rice', 'Emmitt Smith', 'Peyton Manning',
      'Joe Montana', 'John Elway', 'Troy Aikman', 'Terry Bradshaw',
      'Lawrence Taylor', 'Roger Staubach', 'Joe Greene',
      'Drew Brees', 'Aaron Rodgers', 'Patrick Mahomes'
    ]),

    -- (1,2) Super Bowl Champion  ×  50+ International Caps  →  impossible
    (v_puzzle_id, 1, 2, ARRAY[]::text[]),

    -- (2,0) UCL Winner  ×  10+ Seasons
    (v_puzzle_id, 2, 0, ARRAY[
      'Lionel Messi', 'Cristiano Ronaldo', 'Xavi', 'Andres Iniesta',
      'Luka Modric', 'Sergio Ramos', 'Karim Benzema', 'Toni Kroos',
      'Thierry Henry', 'Zinedine Zidane', 'Didier Drogba',
      'Robert Lewandowski', 'Gerard Pique', 'Ronaldinho'
    ]),

    -- (2,1) UCL Winner  ×  Pro Bowl  →  impossible (different sports)
    (v_puzzle_id, 2, 1, ARRAY[]::text[]),

    -- (2,2) UCL Winner  ×  50+ International Caps
    (v_puzzle_id, 2, 2, ARRAY[
      'Lionel Messi', 'Cristiano Ronaldo', 'Xavi', 'Andres Iniesta',
      'Luka Modric', 'Sergio Ramos', 'Karim Benzema', 'Toni Kroos',
      'Thierry Henry', 'Zinedine Zidane', 'Didier Drogba',
      'Robert Lewandowski', 'Gerard Pique', 'Ronaldinho'
    ])

  ON CONFLICT (puzzle_id, row_index, col_index) DO NOTHING;

END;
$$;
