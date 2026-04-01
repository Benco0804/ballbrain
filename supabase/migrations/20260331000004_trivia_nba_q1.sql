-- NBA Trivia Questions — Batch 1 of 3 (40 questions)
-- Includes all 5 questions migrated from src/lib/trivia/questions.ts
-- Categories: players, teams, stats, history, records

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (13) ─────────────────────────────────────────────────────────────────

-- migrated from questions.ts
('NBA', 'easy', 'players',
 'Which player is nicknamed "The King" in the NBA?',
 'LeBron James',
 ARRAY['Kobe Bryant', 'Kevin Durant', 'Stephen Curry']),

-- migrated from questions.ts
('NBA', 'easy', 'teams',
 'Which city do the Los Angeles Lakers play their home games in?',
 'Los Angeles',
 ARRAY['Chicago', 'New York', 'Dallas']),

('NBA', 'easy', 'stats',
 'What does NBA stand for?',
 'National Basketball Association',
 ARRAY['National Basketball Academy', 'North American Basketball Association', 'National Ballers Association']),

('NBA', 'easy', 'stats',
 'How many players from each team are on the court at one time in the NBA?',
 '5',
 ARRAY['4', '6', '7']),

('NBA', 'easy', 'stats',
 'How many points is a successful three-point shot worth?',
 '3',
 ARRAY['2', '4', '1']),

('NBA', 'easy', 'stats',
 'How many quarters are in a regulation NBA game?',
 '4',
 ARRAY['2', '3', '6']),

('NBA', 'easy', 'stats',
 'How many minutes long is a regulation NBA game?',
 '48',
 ARRAY['40', '60', '36']),

('NBA', 'easy', 'stats',
 'What is the standard height of an NBA basketball hoop from the floor?',
 '10 feet',
 ARRAY['8 feet', '9 feet', '12 feet']),

('NBA', 'easy', 'players',
 'Which player is nicknamed "The Mailman"?',
 'Karl Malone',
 ARRAY['Charles Barkley', 'Patrick Ewing', 'Dominique Wilkins']),

('NBA', 'easy', 'players',
 'Which player was famously nicknamed "Black Mamba"?',
 'Kobe Bryant',
 ARRAY['LeBron James', 'Dwyane Wade', 'Allen Iverson']),

('NBA', 'easy', 'players',
 'Which player is nicknamed "The Answer"?',
 'Allen Iverson',
 ARRAY['Derrick Rose', 'Tracy McGrady', 'Carmelo Anthony']),

('NBA', 'easy', 'teams',
 'Which NBA team does Stephen Curry play for?',
 'Golden State Warriors',
 ARRAY['Los Angeles Lakers', 'Miami Heat', 'Boston Celtics']),

('NBA', 'easy', 'players',
 'What jersey number did Michael Jordan famously wear for the Chicago Bulls?',
 '23',
 ARRAY['33', '45', '32']),

-- ── Medium (17) ───────────────────────────────────────────────────────────────

-- migrated from questions.ts
('NBA', 'medium', 'records',
 'Who holds the NBA record for most points scored in a single game (100 points)?',
 'Wilt Chamberlain',
 ARRAY['Michael Jordan', 'Kobe Bryant', 'LeBron James']),

-- migrated from questions.ts
('NBA', 'medium', 'history',
 'How many NBA championships did the Chicago Bulls win during the 1990s?',
 '6',
 ARRAY['5', '4', '7']),

-- migrated from questions.ts
('NBA', 'medium', 'players',
 'Kobe Bryant wore jersey number 8 and which other number during his Lakers career?',
 '24',
 ARRAY['33', '23', '32']),

('NBA', 'medium', 'history',
 'Who was the #1 overall pick in the 2003 NBA Draft?',
 'LeBron James',
 ARRAY['Carmelo Anthony', 'Dwyane Wade', 'Chris Bosh']),

('NBA', 'medium', 'teams',
 'Which franchise has won the most NBA championships all time?',
 'Boston Celtics',
 ARRAY['Los Angeles Lakers', 'Chicago Bulls', 'Golden State Warriors']),

('NBA', 'medium', 'stats',
 'What is the shot clock duration in the NBA?',
 '24 seconds',
 ARRAY['30 seconds', '35 seconds', '20 seconds']),

('NBA', 'medium', 'records',
 'Who holds the NBA record for most career assists?',
 'John Stockton',
 ARRAY['Magic Johnson', 'Jason Kidd', 'Chris Paul']),

('NBA', 'medium', 'records',
 'Who holds the NBA all-time career scoring record?',
 'LeBron James',
 ARRAY['Kareem Abdul-Jabbar', 'Karl Malone', 'Kobe Bryant']),

('NBA', 'medium', 'players',
 'What jersey number did Magic Johnson wear for the Los Angeles Lakers?',
 '32',
 ARRAY['33', '34', '23']),

('NBA', 'medium', 'players',
 'Which player is nicknamed "The Glove"?',
 'Gary Payton',
 ARRAY['Jason Kidd', 'John Stockton', 'Scottie Pippen']),

('NBA', 'medium', 'players',
 'How many NBA MVP awards did Kareem Abdul-Jabbar win during his career?',
 '6',
 ARRAY['4', '5', '3']),

('NBA', 'medium', 'history',
 'In what year did the NBA introduce the three-point line?',
 '1979',
 ARRAY['1975', '1984', '1972']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2019 for the Toronto Raptors?',
 'Kawhi Leonard',
 ARRAY['Pascal Siakam', 'Kyle Lowry', 'Fred VanVleet']),

('NBA', 'medium', 'records',
 'Who holds the NBA record for most career rebounds?',
 'Wilt Chamberlain',
 ARRAY['Bill Russell', 'Dennis Rodman', 'Kareem Abdul-Jabbar']),

('NBA', 'medium', 'stats',
 'How many personal fouls does it take for a player to foul out of an NBA game?',
 '6',
 ARRAY['5', '7', '4']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2023 when the Denver Nuggets won their first championship?',
 'Nikola Jokic',
 ARRAY['Jamal Murray', 'Michael Porter Jr.', 'Aaron Gordon']),

('NBA', 'medium', 'players',
 'Which player was selected #1 overall in the 1984 NBA Draft?',
 'Hakeem Olajuwon',
 ARRAY['Michael Jordan', 'Charles Barkley', 'Sam Bowie']),

-- ── Hard (10) ─────────────────────────────────────────────────────────────────

('NBA', 'hard', 'history',
 'Which head coach has won the most NBA championships?',
 'Phil Jackson',
 ARRAY['Gregg Popovich', 'Pat Riley', 'Red Auerbach']),

('NBA', 'hard', 'records',
 'What was the Golden State Warriors'' win-loss record when they set the all-time regular season wins record in 2015-16?',
 '73-9',
 ARRAY['72-10', '74-8', '70-12']),

('NBA', 'hard', 'history',
 'Who is the only player in NBA history to win the Finals MVP award while playing for the losing team?',
 'Jerry West',
 ARRAY['Elgin Baylor', 'Oscar Robertson', 'Bill Russell']),

('NBA', 'hard', 'records',
 'Who scored 81 points in a single NBA game in January 2006, the second-highest total in history?',
 'Kobe Bryant',
 ARRAY['LeBron James', 'Dwyane Wade', 'Carmelo Anthony']),

('NBA', 'hard', 'history',
 'Who won the very first NBA Defensive Player of the Year award in 1983?',
 'Sidney Moncrief',
 ARRAY['Michael Jordan', 'Mark Eaton', 'Dennis Rodman']),

('NBA', 'hard', 'history',
 'In what year did the NBA merge with the ABA, absorbing four ABA franchises?',
 '1976',
 ARRAY['1972', '1980', '1969']),

('NBA', 'hard', 'records',
 'Which player averaged a triple-double across the entire 2016-17 NBA season?',
 'Russell Westbrook',
 ARRAY['Magic Johnson', 'LeBron James', 'Oscar Robertson']),

('NBA', 'hard', 'records',
 'Which NBA franchise holds the record for the longest winning streak at 33 consecutive games?',
 'Los Angeles Lakers',
 ARRAY['Golden State Warriors', 'Chicago Bulls', 'Miami Heat']),

('NBA', 'hard', 'players',
 'Which player has won the most career NBA scoring titles?',
 'Michael Jordan',
 ARRAY['Wilt Chamberlain', 'LeBron James', 'Kevin Durant']),

('NBA', 'hard', 'records',
 'Which player holds the NBA record for highest scoring average in a single season at 50.4 points per game?',
 'Wilt Chamberlain',
 ARRAY['Michael Jordan', 'Elgin Baylor', 'LeBron James']);
