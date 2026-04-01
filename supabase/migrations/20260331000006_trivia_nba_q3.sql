-- NBA Trivia Questions — Batch 3 of 3 (20 questions)
-- Total NBA questions after this file: ~100

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (4) ──────────────────────────────────────────────────────────────────

('NBA', 'easy', 'teams',
 'What city do the Miami Heat play their home games in?',
 'Miami',
 ARRAY['Orlando', 'Tampa', 'Atlanta']),

('NBA', 'easy', 'players',
 'What team does Nikola Jokic play for?',
 'Denver Nuggets',
 ARRAY['Utah Jazz', 'Minnesota Timberwolves', 'Oklahoma City Thunder']),

('NBA', 'easy', 'teams',
 'In which city do the Golden State Warriors currently play their home games?',
 'San Francisco',
 ARRAY['Oakland', 'Los Angeles', 'Sacramento']),

('NBA', 'easy', 'players',
 'Which player was widely known by the nickname "Penny"?',
 'Anfernee Hardaway',
 ARRAY['Gary Payton', 'Tim Hardaway', 'Muggsy Bogues']),

-- ── Medium (10) ───────────────────────────────────────────────────────────────

('NBA', 'medium', 'players',
 'Who won the 1993 NBA MVP award while playing for the Phoenix Suns?',
 'Charles Barkley',
 ARRAY['Kevin Johnson', 'Dan Majerle', 'Danny Ainge']),

('NBA', 'medium', 'history',
 'Who was the #1 overall pick in the 2019 NBA Draft?',
 'Zion Williamson',
 ARRAY['Ja Morant', 'RJ Barrett', 'De''Andre Hunter']),

('NBA', 'medium', 'history',
 'Which team was Ray Allen playing for when he hit his famous corner three to tie Game 6 of the 2013 NBA Finals?',
 'Miami Heat',
 ARRAY['Boston Celtics', 'Oklahoma City Thunder', 'Los Angeles Lakers']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2000 when the Los Angeles Lakers began their three-peat?',
 'Shaquille O''Neal',
 ARRAY['Kobe Bryant', 'Rick Fox', 'Robert Horry']),

('NBA', 'medium', 'players',
 'How many NBA seasons did Kobe Bryant play for the Los Angeles Lakers?',
 '20',
 ARRAY['18', '19', '21']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2018 for the Golden State Warriors?',
 'Kevin Durant',
 ARRAY['Stephen Curry', 'Klay Thompson', 'Draymond Green']),

('NBA', 'medium', 'players',
 'What jersey number did Shaquille O''Neal wear for the Los Angeles Lakers?',
 '34',
 ARRAY['32', '33', '31']),

('NBA', 'medium', 'history',
 'Who was the head coach of the Golden State Warriors when they won the 2015 NBA championship?',
 'Steve Kerr',
 ARRAY['Mark Jackson', 'Mike Brown', 'Don Nelson']),

('NBA', 'medium', 'history',
 'Who was selected #1 overall in the 1996 NBA Draft?',
 'Allen Iverson',
 ARRAY['Kobe Bryant', 'Stephon Marbury', 'Ray Allen']),

('NBA', 'medium', 'history',
 'Who won the 2003 NBA Finals MVP for the San Antonio Spurs?',
 'Tim Duncan',
 ARRAY['Tony Parker', 'David Robinson', 'Manu Ginobili']),

-- ── Hard (6) ──────────────────────────────────────────────────────────────────

('NBA', 'hard', 'records',
 'Who holds the NBA record for most assists in a single game with 30, set in 1990?',
 'Scott Skiles',
 ARRAY['John Stockton', 'Magic Johnson', 'Isiah Thomas']),

('NBA', 'hard', 'history',
 'What player did the Los Angeles Lakers trade to the Charlotte Hornets to acquire the draft rights to Kobe Bryant in 1996?',
 'Vlade Divac',
 ARRAY['Eddie Jones', 'Nick Van Exel', 'Elden Campbell']),

('NBA', 'hard', 'records',
 'Who scored a record 52 points in the 2017 NBA All-Star Game?',
 'Anthony Davis',
 ARRAY['LeBron James', 'Kevin Durant', 'Russell Westbrook']),

('NBA', 'hard', 'history',
 'Which coach led the Boston Celtics to their 18th NBA championship in 2024?',
 'Joe Mazzulla',
 ARRAY['Brad Stevens', 'Ime Udoka', 'Doc Rivers']),

('NBA', 'hard', 'records',
 'Which player holds the NBA record for highest single-season field goal percentage at 72.7%, set in the 1972-73 season?',
 'Wilt Chamberlain',
 ARRAY['DeAndre Jordan', 'Shaquille O''Neal', 'Artis Gilmore']),

('NBA', 'hard', 'teams',
 'What was the name of the arena the Los Angeles Lakers called home before moving to the Staples Center in 1999?',
 'The Forum',
 ARRAY['The Fabulous Forum', 'The LA Coliseum', 'The Sports Arena']);
