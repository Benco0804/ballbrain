-- =============================================================================
-- BallBrain — Seed Data
-- =============================================================================
-- Inserts 6 daily puzzles for today / CURRENT_DATE:
--   NBA easy, NBA medium, NBA hard
--   Soccer easy, Soccer medium, Soccer hard
-- Safe to re-run: deletes then re-inserts for CURRENT_DATE.
-- =============================================================================

DO $$
DECLARE
  v_nba_easy    uuid;
  v_nba_med     uuid;
  v_nba_hard    uuid;
  v_soc_easy    uuid;
  v_soc_med     uuid;
  v_soc_hard    uuid;
BEGIN

  DELETE FROM public.daily_puzzles WHERE puzzle_date = CURRENT_DATE;

  -- ===========================================================================
  -- NBA EASY
  -- Rows:    Lakers | Celtics | Bulls
  -- Columns: NBA Champion | 10+ Seasons | NBA All-Star
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for the Lakers",  "sport": "NBA", "categoryId": "nba-lakers"},
      {"label": "Played for the Celtics", "sport": "NBA", "categoryId": "nba-celtics"},
      {"label": "Played for the Bulls",   "sport": "NBA", "categoryId": "nba-bulls"}
    ]'::jsonb,
    '[
      {"label": "NBA Champion",  "sport": "NBA", "categoryId": "nba-champion"},
      {"label": "10+ Seasons",   "sport": "NBA", "categoryId": "nba-10-plus-seasons"},
      {"label": "NBA All-Star",  "sport": "NBA", "categoryId": "nba-all-star"}
    ]'::jsonb,
    'NBA', 'easy'
  ) RETURNING id INTO v_nba_easy;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_nba_easy, 0, 0, ARRAY['Kobe Bryant','Shaquille O''Neal','LeBron James','Magic Johnson','Kareem Abdul-Jabbar','James Worthy','Pau Gasol','Derek Fisher','Byron Scott']),
    (v_nba_easy, 0, 1, ARRAY['Kobe Bryant','LeBron James','Magic Johnson','Kareem Abdul-Jabbar','Derek Fisher','Pau Gasol','AC Green','James Worthy']),
    (v_nba_easy, 0, 2, ARRAY['Kobe Bryant','LeBron James','Magic Johnson','Kareem Abdul-Jabbar','Shaquille O''Neal','Pau Gasol','James Worthy']),
    (v_nba_easy, 1, 0, ARRAY['Bill Russell','Larry Bird','Paul Pierce','Kevin Garnett','Ray Allen','John Havlicek','Bob Cousy','Dave Cowens']),
    (v_nba_easy, 1, 1, ARRAY['Bill Russell','Larry Bird','Paul Pierce','Kevin Garnett','Ray Allen','John Havlicek','Bob Cousy']),
    (v_nba_easy, 1, 2, ARRAY['Larry Bird','Paul Pierce','Kevin Garnett','Ray Allen','Bill Russell','Bob Cousy','John Havlicek']),
    (v_nba_easy, 2, 0, ARRAY['Michael Jordan','Scottie Pippen','Dennis Rodman','Horace Grant','Toni Kukoc','Steve Kerr']),
    (v_nba_easy, 2, 1, ARRAY['Michael Jordan','Scottie Pippen','Derrick Rose','Luol Deng','Joakim Noah']),
    (v_nba_easy, 2, 2, ARRAY['Michael Jordan','Scottie Pippen','Derrick Rose','Bob Love','Luol Deng']);

  -- ===========================================================================
  -- NBA MEDIUM
  -- Rows:    Golden State Warriors | San Antonio Spurs | Miami Heat
  -- Columns: NBA Champion | Finals MVP | 4+ All-Star Selections
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for the Warriors", "sport": "NBA", "categoryId": "nba-warriors"},
      {"label": "Played for the Spurs",    "sport": "NBA", "categoryId": "nba-spurs"},
      {"label": "Played for the Heat",     "sport": "NBA", "categoryId": "nba-heat"}
    ]'::jsonb,
    '[
      {"label": "NBA Champion",          "sport": "NBA", "categoryId": "nba-champion"},
      {"label": "Finals MVP",            "sport": "NBA", "categoryId": "nba-finals-mvp"},
      {"label": "4+ All-Star Selections","sport": "NBA", "categoryId": "nba-4-plus-allstar"}
    ]'::jsonb,
    'NBA', 'medium'
  ) RETURNING id INTO v_nba_med;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_nba_med, 0, 0, ARRAY['Stephen Curry','Klay Thompson','Draymond Green','Kevin Durant','Andre Iguodala','Andrew Wiggins']),
    (v_nba_med, 0, 1, ARRAY['Andre Iguodala','Kevin Durant','Stephen Curry']),
    (v_nba_med, 0, 2, ARRAY['Stephen Curry','Klay Thompson','Draymond Green','Kevin Durant']),
    (v_nba_med, 1, 0, ARRAY['Tim Duncan','Tony Parker','Manu Ginobili','David Robinson','Kawhi Leonard','Robert Horry','Sean Elliott']),
    (v_nba_med, 1, 1, ARRAY['Tim Duncan','Tony Parker','Kawhi Leonard']),
    (v_nba_med, 1, 2, ARRAY['Tim Duncan','Tony Parker','Manu Ginobili','David Robinson']),
    (v_nba_med, 2, 0, ARRAY['Dwyane Wade','LeBron James','Chris Bosh','Ray Allen','Udonis Haslem','Shaquille O''Neal','Alonzo Mourning']),
    (v_nba_med, 2, 1, ARRAY['Dwyane Wade','LeBron James']),
    (v_nba_med, 2, 2, ARRAY['Dwyane Wade','LeBron James','Chris Bosh','Shaquille O''Neal','Alonzo Mourning']);

  -- ===========================================================================
  -- NBA HARD
  -- Rows:    Detroit Pistons | Houston Rockets | Cleveland Cavaliers
  -- Columns: NBA Champion | 5+ All-Star Selections | 12+ NBA Seasons
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for the Pistons",   "sport": "NBA", "categoryId": "nba-pistons"},
      {"label": "Played for the Rockets",   "sport": "NBA", "categoryId": "nba-rockets"},
      {"label": "Played for the Cavaliers", "sport": "NBA", "categoryId": "nba-cavaliers"}
    ]'::jsonb,
    '[
      {"label": "NBA Champion",          "sport": "NBA", "categoryId": "nba-champion"},
      {"label": "5+ All-Star Selections","sport": "NBA", "categoryId": "nba-5-plus-allstar"},
      {"label": "12+ NBA Seasons",       "sport": "NBA", "categoryId": "nba-12-plus-seasons"}
    ]'::jsonb,
    'NBA', 'hard'
  ) RETURNING id INTO v_nba_hard;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_nba_hard, 0, 0, ARRAY['Isiah Thomas','Joe Dumars','Chauncey Billups','Dennis Rodman','Bill Laimbeer','Vinnie Johnson','Ben Wallace','Rasheed Wallace','Richard Hamilton']),
    (v_nba_hard, 0, 1, ARRAY['Isiah Thomas','Dave Bing','Bob Lanier','Grant Hill','Joe Dumars']),
    (v_nba_hard, 0, 2, ARRAY['Isiah Thomas','Joe Dumars','Bill Laimbeer','Bob Lanier','Grant Hill']),
    (v_nba_hard, 1, 0, ARRAY['Hakeem Olajuwon','Clyde Drexler','Vernon Maxwell','Kenny Smith','Sam Cassell','Robert Horry','Otis Thorpe']),
    (v_nba_hard, 1, 1, ARRAY['Hakeem Olajuwon','Elvin Hayes','James Harden','Clyde Drexler','Yao Ming']),
    (v_nba_hard, 1, 2, ARRAY['Hakeem Olajuwon','Elvin Hayes','Calvin Murphy','Clyde Drexler','James Harden']),
    (v_nba_hard, 2, 0, ARRAY['LeBron James','Kyrie Irving','Kevin Love','J.R. Smith','Tristan Thompson','Richard Jefferson']),
    (v_nba_hard, 2, 1, ARRAY['LeBron James','Kyrie Irving','Kevin Love','Brad Daugherty']),
    (v_nba_hard, 2, 2, ARRAY['LeBron James','Zydrunas Ilgauskas','Anderson Varejao']);

  -- ===========================================================================
  -- SOCCER EASY
  -- Rows:    Maccabi Tel Aviv | Maccabi Haifa | Beitar Jerusalem
  -- Columns: Israeli National Team | Won Israeli Premier League | European Competitions
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for Maccabi Tel Aviv",  "sport": "Soccer", "categoryId": "soccer-maccabi-ta"},
      {"label": "Played for Maccabi Haifa",      "sport": "Soccer", "categoryId": "soccer-maccabi-haifa"},
      {"label": "Played for Beitar Jerusalem",   "sport": "Soccer", "categoryId": "soccer-beitar"}
    ]'::jsonb,
    '[
      {"label": "Israeli National Team",        "sport": "Soccer", "categoryId": "soccer-israel-national"},
      {"label": "Won Israeli Premier League",   "sport": "Soccer", "categoryId": "soccer-israeli-league"},
      {"label": "European Competitions",        "sport": "Soccer", "categoryId": "soccer-european-comp"}
    ]'::jsonb,
    'Soccer', 'easy'
  ) RETURNING id INTO v_soc_easy;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_soc_easy, 0, 0, ARRAY['Eran Zahavi','Munas Dabbur','Tal Ben Haim','Ben Sahar','Beram Kayal','Omer Atzili','Nir Bitton','Almog Cohen']),
    (v_soc_easy, 0, 1, ARRAY['Eran Zahavi','Munas Dabbur','Tal Ben Haim','Beram Kayal','Omer Atzili','Lior Refaelov']),
    (v_soc_easy, 0, 2, ARRAY['Eran Zahavi','Munas Dabbur','Tal Ben Haim','Omer Atzili','Lior Refaelov']),
    (v_soc_easy, 1, 0, ARRAY['Yossi Benayoun','Omer Atzili','Maor Buzaglo','Gal Alberman','Neta Lavi','Shran Yeini']),
    (v_soc_easy, 1, 1, ARRAY['Yossi Benayoun','Omer Atzili','Maor Buzaglo','Salim Tuama','Gal Alberman']),
    (v_soc_easy, 1, 2, ARRAY['Yossi Benayoun','Omer Atzili','Maor Buzaglo','Abdoulaye Seck','Pierre Cornud','Tjaronn Chery']),
    (v_soc_easy, 2, 0, ARRAY['Tomer Hemed','Aviram Baruchyan','Eitan Tibi','Itzhak Assulin','Moshe Lugasi']),
    (v_soc_easy, 2, 1, ARRAY['Tomer Hemed','Aviram Baruchyan','Eitan Tibi','Shlomi Arbeitman']),
    (v_soc_easy, 2, 2, ARRAY['Tomer Hemed','Aviram Baruchyan','Eitan Tibi']);

  -- ===========================================================================
  -- SOCCER MEDIUM
  -- Rows:    Real Madrid | Barcelona | Liverpool
  -- Columns: Champions League Winner | 50+ International Caps | Won National League
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for Real Madrid", "sport": "Soccer", "categoryId": "soccer-real-madrid"},
      {"label": "Played for Barcelona",   "sport": "Soccer", "categoryId": "soccer-barcelona"},
      {"label": "Played for Liverpool",   "sport": "Soccer", "categoryId": "soccer-liverpool"}
    ]'::jsonb,
    '[
      {"label": "Champions League Winner",  "sport": "Soccer", "categoryId": "soccer-ucl-winner"},
      {"label": "50+ International Caps",   "sport": "Soccer", "categoryId": "soccer-50-plus-caps"},
      {"label": "Won National League",      "sport": "Soccer", "categoryId": "soccer-national-league"}
    ]'::jsonb,
    'Soccer', 'medium'
  ) RETURNING id INTO v_soc_med;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_soc_med, 0, 0, ARRAY['Cristiano Ronaldo','Luka Modric','Sergio Ramos','Karim Benzema','Toni Kroos','Zinedine Zidane','Raul','Roberto Carlos','Iker Casillas','Marcelo']),
    (v_soc_med, 0, 1, ARRAY['Cristiano Ronaldo','Sergio Ramos','Luka Modric','Toni Kroos','Zinedine Zidane','Raul','Roberto Carlos','Iker Casillas','Karim Benzema','Marcelo']),
    (v_soc_med, 0, 2, ARRAY['Cristiano Ronaldo','Luka Modric','Sergio Ramos','Karim Benzema','Toni Kroos','Zinedine Zidane','Raul','Roberto Carlos','Iker Casillas','Marcelo']),
    (v_soc_med, 1, 0, ARRAY['Lionel Messi','Xavi','Andres Iniesta','Ronaldinho','Samuel Eto''o','Carles Puyol','Gerard Pique','Neymar','Sergio Busquets']),
    (v_soc_med, 1, 1, ARRAY['Lionel Messi','Xavi','Andres Iniesta','Carles Puyol','Gerard Pique','Sergio Busquets','Ronaldinho','Neymar','Dani Alves']),
    (v_soc_med, 1, 2, ARRAY['Lionel Messi','Xavi','Andres Iniesta','Ronaldinho','Carles Puyol','Gerard Pique','Sergio Busquets','Neymar']),
    (v_soc_med, 2, 0, ARRAY['Steven Gerrard','Jamie Carragher','Robbie Fowler','Ian Rush','Kenny Dalglish','Mohamed Salah','Virgil van Dijk','Sadio Mane']),
    (v_soc_med, 2, 1, ARRAY['Steven Gerrard','Jamie Carragher','Robbie Fowler','Michael Owen','Mohamed Salah','Virgil van Dijk','Sadio Mane','Yossi Benayoun']),
    (v_soc_med, 2, 2, ARRAY['Mohamed Salah','Virgil van Dijk','Sadio Mane','Jordan Henderson','Andrew Robertson','Kenny Dalglish','Ian Rush','Steven Gerrard','Jamie Carragher']);

  -- ===========================================================================
  -- SOCCER HARD
  -- Rows:    Bayern Munich | Ajax | Maccabi Haifa
  -- Columns: Champions League Participant | International Player | Won Multiple League Titles
  -- ===========================================================================
  INSERT INTO public.daily_puzzles (puzzle_date, row_categories, col_categories, sport, difficulty)
  VALUES (
    CURRENT_DATE,
    '[
      {"label": "Played for Bayern Munich", "sport": "Soccer", "categoryId": "soccer-bayern"},
      {"label": "Played for Ajax",          "sport": "Soccer", "categoryId": "soccer-ajax"},
      {"label": "Played for Maccabi Haifa", "sport": "Soccer", "categoryId": "soccer-maccabi-haifa"}
    ]'::jsonb,
    '[
      {"label": "Champions League Participant",    "sport": "Soccer", "categoryId": "soccer-ucl-participant"},
      {"label": "International Player",            "sport": "Soccer", "categoryId": "soccer-international"},
      {"label": "Won 3+ League Titles",            "sport": "Soccer", "categoryId": "soccer-3-plus-leagues"}
    ]'::jsonb,
    'Soccer', 'hard'
  ) RETURNING id INTO v_soc_hard;

  INSERT INTO public.puzzle_cells (puzzle_id, row_index, col_index, valid_players) VALUES
    (v_soc_hard, 0, 0, ARRAY['Thomas Muller','Robert Lewandowski','Manuel Neuer','Franz Beckenbauer','Gerd Muller','Arjen Robben','Franck Ribery','Oliver Kahn','Lothar Matthaus','Karl-Heinz Rummenigge']),
    (v_soc_hard, 0, 1, ARRAY['Thomas Muller','Robert Lewandowski','Manuel Neuer','Franz Beckenbauer','Gerd Muller','Arjen Robben','Franck Ribery','Oliver Kahn','Lothar Matthaus','Karl-Heinz Rummenigge']),
    (v_soc_hard, 0, 2, ARRAY['Thomas Muller','Robert Lewandowski','Manuel Neuer','Franz Beckenbauer','Gerd Muller','Arjen Robben','Oliver Kahn','Lothar Matthaus']),
    (v_soc_hard, 1, 0, ARRAY['Johan Cruyff','Johan Neeskens','Edwin van der Sar','Patrick Kluivert','Clarence Seedorf','Marc Overmars','Edgar Davids','Frank de Boer','Dennis Bergkamp']),
    (v_soc_hard, 1, 1, ARRAY['Johan Cruyff','Johan Neeskens','Edwin van der Sar','Patrick Kluivert','Clarence Seedorf','Marc Overmars','Frank de Boer','Dennis Bergkamp','Marco van Basten']),
    (v_soc_hard, 1, 2, ARRAY['Johan Cruyff','Frank de Boer','Danny Blind','Edwin van der Sar','Marco van Basten','Johan Neeskens']),
    (v_soc_hard, 2, 0, ARRAY['Omer Atzili','Maor Buzaglo','Abdoulaye Seck','Dean David','Pierre Cornud','Tjaronn Chery','Ali Mohammad','Yonatan Cohen']),
    (v_soc_hard, 2, 1, ARRAY['Yossi Benayoun','Omer Atzili','Maor Buzaglo','Gal Alberman','Abdoulaye Seck','Tjaronn Chery','Hatem Abd Elhamed','Dean David']),
    (v_soc_hard, 2, 2, ARRAY['Yossi Benayoun','Omer Atzili','Maor Buzaglo','Gal Alberman','Salim Tuama','Hatem Abd Elhamed']);

END;
$$;
