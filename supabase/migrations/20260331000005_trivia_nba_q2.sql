-- NBA Trivia Questions — Batch 2 of 3 (40 questions)

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (12) ─────────────────────────────────────────────────────────────────

('NBA', 'easy', 'teams',
 'How many teams are in the NBA?',
 '30',
 ARRAY['28', '32', '29']),

('NBA', 'easy', 'players',
 'Which player wore jersey #33 for the Boston Celtics and is considered one of the greatest forwards ever?',
 'Larry Bird',
 ARRAY['Kevin McHale', 'Robert Parish', 'Paul Pierce']),

('NBA', 'easy', 'teams',
 'Which city hosts the Boston Celtics?',
 'Boston',
 ARRAY['Philadelphia', 'New York', 'Washington']),

('NBA', 'easy', 'teams',
 'Which NBA team plays its home games at Madison Square Garden?',
 'New York Knicks',
 ARRAY['Brooklyn Nets', 'Boston Celtics', 'Philadelphia 76ers']),

('NBA', 'easy', 'history',
 'What is the NBA championship trophy officially called?',
 'Larry O''Brien Championship Trophy',
 ARRAY['Bill Russell Trophy', 'David Stern Trophy', 'Commissioner''s Cup']),

('NBA', 'easy', 'stats',
 'How many teams qualify for the NBA playoffs each season?',
 '16',
 ARRAY['12', '20', '14']),

('NBA', 'easy', 'players',
 'What number did LeBron James wear during his time with the Miami Heat?',
 '6',
 ARRAY['23', '24', '3']),

('NBA', 'easy', 'players',
 'Which team did Shaquille O''Neal play for when he won his first NBA championship?',
 'Los Angeles Lakers',
 ARRAY['Miami Heat', 'Orlando Magic', 'Boston Celtics']),

('NBA', 'easy', 'players',
 'Which player is nicknamed "The Big Fundamental"?',
 'Tim Duncan',
 ARRAY['David Robinson', 'Hakeem Olajuwon', 'Patrick Ewing']),

('NBA', 'easy', 'players',
 'Which team did Kevin Durant win his first NBA championship with?',
 'Golden State Warriors',
 ARRAY['Oklahoma City Thunder', 'Brooklyn Nets', 'Phoenix Suns']),

('NBA', 'easy', 'players',
 'Which player is nicknamed "The Greek Freak"?',
 'Giannis Antetokounmpo',
 ARRAY['Nikola Jokic', 'Luka Doncic', 'Kristaps Porzingis']),

('NBA', 'easy', 'teams',
 'Which team did Dirk Nowitzki spend his entire 21-year NBA career with?',
 'Dallas Mavericks',
 ARRAY['San Antonio Spurs', 'Houston Rockets', 'Denver Nuggets']),

-- ── Medium (18) ───────────────────────────────────────────────────────────────

('NBA', 'medium', 'history',
 'Which team defeated the Los Angeles Lakers in the 2004 NBA Finals?',
 'Detroit Pistons',
 ARRAY['San Antonio Spurs', 'New Jersey Nets', 'Indiana Pacers']),

('NBA', 'medium', 'history',
 'How many times did LeBron James win the NBA Finals MVP award?',
 '4',
 ARRAY['3', '5', '2']),

('NBA', 'medium', 'history',
 'Who was the #1 overall pick in the 2012 NBA Draft?',
 'Anthony Davis',
 ARRAY['Michael Kidd-Gilchrist', 'Bradley Beal', 'Damian Lillard']),

('NBA', 'medium', 'history',
 'Which team drafted Kobe Bryant 13th overall in 1996 before trading him to the Lakers?',
 'Charlotte Hornets',
 ARRAY['New Jersey Nets', 'Minnesota Timberwolves', 'Philadelphia 76ers']),

('NBA', 'medium', 'history',
 'In what year did the San Antonio Spurs win their fifth and most recent NBA championship?',
 '2014',
 ARRAY['2007', '2012', '2016']),

('NBA', 'medium', 'players',
 'Who won the 2015-16 NBA MVP award as the first unanimous selection in league history?',
 'Stephen Curry',
 ARRAY['LeBron James', 'Kevin Durant', 'Kawhi Leonard']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP award for the Dallas Mavericks in 2011?',
 'Dirk Nowitzki',
 ARRAY['Jason Terry', 'Jason Kidd', 'Shawn Marion']),

('NBA', 'medium', 'records',
 'Who holds the record for most three-pointers made in a single NBA game with 14?',
 'Klay Thompson',
 ARRAY['Stephen Curry', 'Damian Lillard', 'Ray Allen']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2016 when the Cleveland Cavaliers beat the Golden State Warriors?',
 'LeBron James',
 ARRAY['Kyrie Irving', 'Kevin Love', 'Tristan Thompson']),

('NBA', 'medium', 'records',
 'Which player won the NBA scoring title averaging 36.1 points per game in the 2005-06 season?',
 'Kobe Bryant',
 ARRAY['LeBron James', 'Allen Iverson', 'Dwyane Wade']),

('NBA', 'medium', 'history',
 'Who won the 2021 NBA Finals MVP for the Milwaukee Bucks?',
 'Giannis Antetokounmpo',
 ARRAY['Khris Middleton', 'Jrue Holiday', 'Brook Lopez']),

('NBA', 'medium', 'teams',
 'Which team did the Oklahoma City Thunder relocate from before the 2008-09 season?',
 'Seattle SuperSonics',
 ARRAY['Vancouver Grizzlies', 'New Jersey Nets', 'Charlotte Bobcats']),

('NBA', 'medium', 'players',
 'How many NBA championships did Tim Duncan win during his career with the San Antonio Spurs?',
 '5',
 ARRAY['4', '3', '6']),

('NBA', 'medium', 'history',
 'In what year did LeBron James win his first NBA championship?',
 '2012',
 ARRAY['2011', '2013', '2016']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP for the Miami Heat in the 2006 Finals?',
 'Dwyane Wade',
 ARRAY['Shaquille O''Neal', 'Alonzo Mourning', 'Gary Payton']),

('NBA', 'medium', 'history',
 'Who won the NBA Finals MVP in 2020 for the Los Angeles Lakers?',
 'LeBron James',
 ARRAY['Anthony Davis', 'Rajon Rondo', 'Danny Green']),

('NBA', 'medium', 'records',
 'Who holds the NBA career record for most three-pointers made all time?',
 'Stephen Curry',
 ARRAY['Ray Allen', 'Reggie Miller', 'James Harden']),

('NBA', 'medium', 'history',
 'Who was selected #1 overall in the 2014 NBA Draft?',
 'Andrew Wiggins',
 ARRAY['Jabari Parker', 'Joel Embiid', 'Julius Randle']),

-- ── Hard (10) ─────────────────────────────────────────────────────────────────

('NBA', 'hard', 'records',
 'What is the NBA record for most points scored in a single playoff game, set by Michael Jordan in 1986?',
 '63',
 ARRAY['58', '55', '61']),

('NBA', 'hard', 'records',
 'Who holds the NBA record for most blocks in a single game with 17, set in 1973?',
 'Elmore Smith',
 ARRAY['Manute Bol', 'Mark Eaton', 'Dikembe Mutombo']),

('NBA', 'hard', 'history',
 'Who served as head coach of the 1992 US Olympic "Dream Team" in Barcelona?',
 'Chuck Daly',
 ARRAY['Pat Riley', 'Larry Brown', 'Don Nelson']),

('NBA', 'hard', 'history',
 'Which team drafted Dirk Nowitzki 9th overall in 1998 and immediately traded him to the Dallas Mavericks?',
 'Milwaukee Bucks',
 ARRAY['Indiana Pacers', 'Toronto Raptors', 'Denver Nuggets']),

('NBA', 'hard', 'records',
 'Who was the first player in NBA history to score 30,000 career regular season points?',
 'Kareem Abdul-Jabbar',
 ARRAY['Wilt Chamberlain', 'Karl Malone', 'Elvin Hayes']),

('NBA', 'hard', 'history',
 'In what year was the NBA founded (as the Basketball Association of America)?',
 '1946',
 ARRAY['1949', '1952', '1940']),

('NBA', 'hard', 'history',
 'Who won the 1983 NBA Finals MVP for the Philadelphia 76ers, averaging 25.8 points and 18.0 rebounds per game?',
 'Moses Malone',
 ARRAY['Julius Erving', 'Andrew Toney', 'Bobby Jones']),

('NBA', 'hard', 'records',
 'Who holds the NBA career record for most triple-doubles, surpassing Oscar Robertson''s long-standing mark?',
 'Russell Westbrook',
 ARRAY['LeBron James', 'Magic Johnson', 'Jason Kidd']),

('NBA', 'hard', 'players',
 'Which player was nicknamed "The Iceman" and won four NBA scoring titles in the late 1970s and early 1980s?',
 'George Gervin',
 ARRAY['Pete Maravich', 'World B. Free', 'Adrian Dantley']),

('NBA', 'hard', 'history',
 'Who won the very first NBA Sixth Man of the Year award in the 1982-83 season?',
 'Bobby Jones',
 ARRAY['Kevin McHale', 'Ricky Pierce', 'Detlef Schrempf']);
