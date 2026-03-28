-- =============================================================================
-- BallBrain — Seed Data
-- =============================================================================
-- Inserts three daily puzzles for 2026-03-28 (NBA, NFL, Soccer).
-- All rows and columns in each puzzle share the same sport so every cell
-- intersection has at least one real valid player.
-- Safe to re-run: deletes then re-inserts using explicit IDs.
-- =============================================================================

DO $$
DECLARE
  v_nba_id    uuid;
  v_nfl_id    uuid;
  v_soccer_id uuid;
BEGIN

  -- Remove any pre-existing data for this date so the seed is idempotent.
  DELETE FROM public.daily_puzzles WHERE puzzle_date = '2026-03-28';

  -- -------------------------------------------------------------------------
  -- NBA Puzzle  (2026-03-28)
  -- Rows:    Lakers | Celtics | Bulls
  -- Columns: NBA Champion | 10+ Seasons | NBA All-Star
  -- -------------------------------------------------------------------------
  INSERT INTO public.daily_puzzles (
    puzzle_date, row_categories, col_categories, sport, difficulty
  ) VALUES (
    '2026-03-28',
    '[
      {"label": "Played for the Lakers",  "sport": "NBA", "categoryId": "nba-lakers"},
      {"label": "Played for the Celtics", "sport": "NBA", "categoryId": "nba-celtics"},
      {"label": "Played for the Bulls",   "sport": "NBA", "categoryId": "nba-bulls"}
    ]'::jsonb,
    '[
      {"label": "NBA Champion",   "sport": "NBA", "categoryId": "nba-champion"},
      {"label": "10+ Seasons",    "sport": "NBA", "categoryId": "nba-10-plus-seasons"},
      {"label": "NBA All-Star",   "sport": "NBA", "categoryId": "nba-all-star"}
    ]'::jsonb,
    'NBA',
    'medium'
  )
  RETURNING id INTO v_nba_id;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES

    -- (0,0) Lakers × NBA Champion
    (v_nba_id, 0, 0, ARRAY[
      'Kobe Bryant', 'Shaquille O''Neal', 'LeBron James', 'Magic Johnson',
      'Kareem Abdul-Jabbar', 'James Worthy', 'Byron Scott', 'Michael Cooper',
      'Pau Gasol', 'Derek Fisher'
    ]),

    -- (0,1) Lakers × 10+ Seasons
    (v_nba_id, 0, 1, ARRAY[
      'Kobe Bryant', 'LeBron James', 'Magic Johnson', 'Kareem Abdul-Jabbar',
      'Derek Fisher', 'Pau Gasol', 'AC Green', 'James Worthy'
    ]),

    -- (0,2) Lakers × NBA All-Star
    (v_nba_id, 0, 2, ARRAY[
      'Kobe Bryant', 'LeBron James', 'Magic Johnson', 'Kareem Abdul-Jabbar',
      'Shaquille O''Neal', 'Pau Gasol', 'James Worthy'
    ]),

    -- (1,0) Celtics × NBA Champion
    (v_nba_id, 1, 0, ARRAY[
      'Bill Russell', 'Larry Bird', 'Paul Pierce', 'Kevin Garnett',
      'Ray Allen', 'John Havlicek', 'Bob Cousy', 'Dave Cowens'
    ]),

    -- (1,1) Celtics × 10+ Seasons
    (v_nba_id, 1, 1, ARRAY[
      'Bill Russell', 'Larry Bird', 'Paul Pierce', 'Kevin Garnett',
      'Ray Allen', 'John Havlicek', 'Bob Cousy'
    ]),

    -- (1,2) Celtics × NBA All-Star
    (v_nba_id, 1, 2, ARRAY[
      'Larry Bird', 'Paul Pierce', 'Kevin Garnett', 'Ray Allen',
      'Bill Russell', 'Bob Cousy', 'John Havlicek'
    ]),

    -- (2,0) Bulls × NBA Champion
    (v_nba_id, 2, 0, ARRAY[
      'Michael Jordan', 'Scottie Pippen', 'Dennis Rodman',
      'Horace Grant', 'Toni Kukoc', 'Steve Kerr'
    ]),

    -- (2,1) Bulls × 10+ Seasons
    (v_nba_id, 2, 1, ARRAY[
      'Michael Jordan', 'Scottie Pippen', 'Derrick Rose',
      'Luol Deng', 'Joakim Noah'
    ]),

    -- (2,2) Bulls × NBA All-Star
    (v_nba_id, 2, 2, ARRAY[
      'Michael Jordan', 'Scottie Pippen', 'Derrick Rose',
      'Bob Love', 'Luol Deng'
    ]);


  -- -------------------------------------------------------------------------
  -- NFL Puzzle  (2026-03-28)
  -- Rows:    Patriots | Cowboys | 49ers
  -- Columns: Super Bowl Champion | Pro Bowl Selection | 10+ Seasons
  -- -------------------------------------------------------------------------
  INSERT INTO public.daily_puzzles (
    puzzle_date, row_categories, col_categories, sport, difficulty
  ) VALUES (
    '2026-03-28',
    '[
      {"label": "Played for the Patriots", "sport": "NFL", "categoryId": "nfl-patriots"},
      {"label": "Played for the Cowboys",  "sport": "NFL", "categoryId": "nfl-cowboys"},
      {"label": "Played for the 49ers",    "sport": "NFL", "categoryId": "nfl-49ers"}
    ]'::jsonb,
    '[
      {"label": "Super Bowl Champion",  "sport": "NFL", "categoryId": "nfl-super-bowl-champ"},
      {"label": "Pro Bowl Selection",   "sport": "NFL", "categoryId": "nfl-pro-bowl"},
      {"label": "10+ Seasons",          "sport": "NFL", "categoryId": "nfl-10-plus-seasons"}
    ]'::jsonb,
    'NFL',
    'medium'
  )
  RETURNING id INTO v_nfl_id;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES

    -- (0,0) Patriots × Super Bowl Champion
    (v_nfl_id, 0, 0, ARRAY[
      'Tom Brady', 'Rob Gronkowski', 'Julian Edelman', 'Tedy Bruschi',
      'Ty Law', 'Richard Seymour', 'Deion Branch', 'Troy Brown',
      'Mike Vrabel', 'James White', 'Matthew Slater'
    ]),

    -- (0,1) Patriots × Pro Bowl
    (v_nfl_id, 0, 1, ARRAY[
      'Tom Brady', 'Rob Gronkowski', 'Randy Moss', 'Vince Wilfork',
      'Logan Mankins', 'Ty Law', 'Mike Vrabel', 'Stephon Gilmore'
    ]),

    -- (0,2) Patriots × 10+ Seasons
    (v_nfl_id, 0, 2, ARRAY[
      'Tom Brady', 'Rob Gronkowski', 'Tedy Bruschi', 'Ty Law',
      'Troy Brown', 'Kevin Faulk', 'Matt Light'
    ]),

    -- (1,0) Cowboys × Super Bowl Champion
    (v_nfl_id, 1, 0, ARRAY[
      'Troy Aikman', 'Emmitt Smith', 'Michael Irvin', 'Larry Allen',
      'Darren Woodson', 'Jay Novacek', 'Deion Sanders',
      'Roger Staubach', 'Tony Dorsett', 'Drew Pearson'
    ]),

    -- (1,1) Cowboys × Pro Bowl
    (v_nfl_id, 1, 1, ARRAY[
      'Troy Aikman', 'Emmitt Smith', 'Michael Irvin', 'Tony Romo',
      'DeMarcus Ware', 'Jason Witten', 'Dez Bryant', 'Larry Allen',
      'Roger Staubach', 'Deion Sanders', 'Zack Martin'
    ]),

    -- (1,2) Cowboys × 10+ Seasons
    (v_nfl_id, 1, 2, ARRAY[
      'Troy Aikman', 'Emmitt Smith', 'Tony Romo', 'Jason Witten',
      'Larry Allen', 'Roger Staubach'
    ]),

    -- (2,0) 49ers × Super Bowl Champion
    (v_nfl_id, 2, 0, ARRAY[
      'Joe Montana', 'Jerry Rice', 'Steve Young', 'Ronnie Lott',
      'Roger Craig', 'Dwight Clark', 'Charles Haley', 'John Taylor'
    ]),

    -- (2,1) 49ers × Pro Bowl
    (v_nfl_id, 2, 1, ARRAY[
      'Joe Montana', 'Jerry Rice', 'Steve Young', 'Ronnie Lott',
      'Roger Craig', 'Frank Gore', 'Patrick Willis', 'Vernon Davis'
    ]),

    -- (2,2) 49ers × 10+ Seasons
    (v_nfl_id, 2, 2, ARRAY[
      'Joe Montana', 'Jerry Rice', 'Ronnie Lott', 'Frank Gore', 'Joe Staley'
    ]);


  -- -------------------------------------------------------------------------
  -- Soccer Puzzle  (2026-03-28)
  -- Rows:    Real Madrid | Barcelona | Manchester United
  -- Columns: UCL Winner | 50+ International Caps | Ballon d'Or Winner
  -- -------------------------------------------------------------------------
  INSERT INTO public.daily_puzzles (
    puzzle_date, row_categories, col_categories, sport, difficulty
  ) VALUES (
    '2026-03-28',
    '[
      {"label": "Played for Real Madrid",       "sport": "Soccer", "categoryId": "soccer-real-madrid"},
      {"label": "Played for Barcelona",          "sport": "Soccer", "categoryId": "soccer-barcelona"},
      {"label": "Played for Manchester United",  "sport": "Soccer", "categoryId": "soccer-man-utd"}
    ]'::jsonb,
    '[
      {"label": "UCL Winner",             "sport": "Soccer", "categoryId": "soccer-ucl-winner"},
      {"label": "50+ International Caps", "sport": "Soccer", "categoryId": "soccer-50-plus-caps"},
      {"label": "Ballon d''Or Winner",    "sport": "Soccer", "categoryId": "soccer-ballon-dor"}
    ]'::jsonb,
    'Soccer',
    'medium'
  )
  RETURNING id INTO v_soccer_id;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES

    -- (0,0) Real Madrid × UCL Winner
    (v_soccer_id, 0, 0, ARRAY[
      'Cristiano Ronaldo', 'Luka Modric', 'Sergio Ramos', 'Karim Benzema',
      'Toni Kroos', 'Zinedine Zidane', 'Raul', 'Roberto Carlos',
      'Iker Casillas', 'Marcelo'
    ]),

    -- (0,1) Real Madrid × 50+ International Caps
    (v_soccer_id, 0, 1, ARRAY[
      'Cristiano Ronaldo', 'Sergio Ramos', 'Luka Modric', 'Toni Kroos',
      'Zinedine Zidane', 'Raul', 'Roberto Carlos', 'Iker Casillas',
      'Karim Benzema', 'Marcelo'
    ]),

    -- (0,2) Real Madrid × Ballon d'Or Winner
    (v_soccer_id, 0, 2, ARRAY[
      'Cristiano Ronaldo', 'Luka Modric', 'Karim Benzema', 'Ronaldo'
    ]),

    -- (1,0) Barcelona × UCL Winner
    (v_soccer_id, 1, 0, ARRAY[
      'Lionel Messi', 'Xavi', 'Andres Iniesta', 'Ronaldinho',
      'Samuel Eto''o', 'Carles Puyol', 'Gerard Pique', 'Neymar',
      'Sergio Busquets'
    ]),

    -- (1,1) Barcelona × 50+ International Caps
    (v_soccer_id, 1, 1, ARRAY[
      'Lionel Messi', 'Xavi', 'Andres Iniesta', 'Carles Puyol',
      'Gerard Pique', 'Sergio Busquets', 'Ronaldinho', 'Neymar',
      'Dani Alves'
    ]),

    -- (1,2) Barcelona × Ballon d'Or Winner
    (v_soccer_id, 1, 2, ARRAY[
      'Lionel Messi', 'Ronaldinho', 'Johan Cruyff'
    ]),

    -- (2,0) Manchester United × UCL Winner
    (v_soccer_id, 2, 0, ARRAY[
      'Cristiano Ronaldo', 'Ryan Giggs', 'Roy Keane', 'Paul Scholes',
      'Peter Schmeichel', 'Dwight Yorke', 'Wayne Rooney', 'Rio Ferdinand',
      'David Beckham', 'Andy Cole', 'Bobby Charlton', 'George Best'
    ]),

    -- (2,1) Manchester United × 50+ International Caps
    (v_soccer_id, 2, 1, ARRAY[
      'Cristiano Ronaldo', 'Wayne Rooney', 'Rio Ferdinand', 'Paul Scholes',
      'Ryan Giggs', 'Roy Keane', 'Peter Schmeichel', 'David Beckham',
      'Patrice Evra', 'Nemanja Vidic'
    ]),

    -- (2,2) Manchester United × Ballon d'Or Winner
    (v_soccer_id, 2, 2, ARRAY[
      'Cristiano Ronaldo', 'George Best', 'Denis Law', 'Bobby Charlton'
    ]);

END;
$$;
