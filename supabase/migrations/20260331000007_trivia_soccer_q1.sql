-- Soccer Trivia Questions — Batch 1 of 3 (40 questions)
-- Includes all 5 questions migrated from src/lib/trivia/questions.ts

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (13) ─────────────────────────────────────────────────────────────────

-- migrated from questions.ts
('Soccer', 'easy', 'stats',
 'How many players does each team field in a regulation soccer match?',
 '11',
 ARRAY['10', '9', '12']),

-- migrated from questions.ts
('Soccer', 'easy', 'history',
 'Which country has won the most FIFA World Cup titles?',
 'Brazil',
 ARRAY['Germany', 'Argentina', 'Italy']),

-- migrated from questions.ts
('Soccer', 'easy', 'players',
 'Who has won the most Ballon d''Or awards in history?',
 'Lionel Messi',
 ARRAY['Cristiano Ronaldo', 'Zinedine Zidane', 'Ronaldinho']),

('Soccer', 'easy', 'stats',
 'How long is a regulation soccer match (excluding stoppage time)?',
 '90 minutes',
 ARRAY['80 minutes', '100 minutes', '120 minutes']),

('Soccer', 'easy', 'players',
 'Which player is known worldwide by the nickname "CR7"?',
 'Cristiano Ronaldo',
 ARRAY['Kylian Mbappé', 'Neymar', 'Gareth Bale']),

('Soccer', 'easy', 'stats',
 'What color card results in a player being immediately sent off in soccer?',
 'Red',
 ARRAY['Yellow', 'Orange', 'Blue']),

('Soccer', 'easy', 'stats',
 'What is the term for a player scoring three goals in a single match?',
 'Hat-trick',
 ARRAY['Triple', 'Golden boot', 'Perfect game']),

('Soccer', 'easy', 'history',
 'Which country won the 2022 FIFA World Cup in Qatar?',
 'Argentina',
 ARRAY['France', 'Brazil', 'Morocco']),

('Soccer', 'easy', 'players',
 'What is Lionel Messi''s Spanish nickname meaning "The Flea"?',
 'La Pulga',
 ARRAY['El Matador', 'La Bestia', 'El Diez']),

('Soccer', 'easy', 'stats',
 'How often is the FIFA World Cup held?',
 'Every 4 years',
 ARRAY['Every 2 years', 'Every 3 years', 'Every 5 years']),

('Soccer', 'easy', 'stats',
 'What does FIFA stand for?',
 'Fédération Internationale de Football Association',
 ARRAY['Federation of International Football Associations', 'Federal Institute of Football Athletics', 'Foundation of International Football Advancement']),

('Soccer', 'easy', 'teams',
 'Which country hosts La Liga, one of the top soccer leagues in the world?',
 'Spain',
 ARRAY['Italy', 'France', 'Portugal']),

('Soccer', 'easy', 'teams',
 'Which country hosts the Premier League?',
 'England',
 ARRAY['Scotland', 'Germany', 'Netherlands']),

-- ── Medium (17) ───────────────────────────────────────────────────────────────

-- migrated from questions.ts
('Soccer', 'medium', 'records',
 'Which club has won the most UEFA Champions League titles?',
 'Real Madrid',
 ARRAY['Barcelona', 'Bayern Munich', 'AC Milan']),

-- migrated from questions.ts
('Soccer', 'medium', 'records',
 'Who was the top scorer at the 2022 FIFA World Cup with 8 goals?',
 'Kylian Mbappé',
 ARRAY['Lionel Messi', 'Olivier Giroud', 'Cody Gakpo']),

('Soccer', 'medium', 'records',
 'How many FIFA World Cup titles has Brazil won?',
 '5',
 ARRAY['4', '6', '3']),

('Soccer', 'medium', 'history',
 'Which country won the very first FIFA World Cup in 1930?',
 'Uruguay',
 ARRAY['Brazil', 'Argentina', 'Italy']),

('Soccer', 'medium', 'history',
 'Which country won the 2018 FIFA World Cup in Russia?',
 'France',
 ARRAY['Croatia', 'Belgium', 'England']),

('Soccer', 'medium', 'records',
 'Who has scored the most goals in UEFA Champions League history?',
 'Cristiano Ronaldo',
 ARRAY['Lionel Messi', 'Karim Benzema', 'Raul Gonzalez']),

('Soccer', 'medium', 'history',
 'Which player scored the infamous "Hand of God" goal at the 1986 FIFA World Cup?',
 'Diego Maradona',
 ARRAY['Hristo Stoichkov', 'Romario', 'Michel Platini']),

('Soccer', 'medium', 'history',
 'In what year did the Premier League begin in England?',
 '1992',
 ARRAY['1988', '1990', '1995']),

('Soccer', 'medium', 'history',
 'Which country won the 2014 FIFA World Cup in Brazil?',
 'Germany',
 ARRAY['Argentina', 'Brazil', 'Netherlands']),

('Soccer', 'medium', 'records',
 'Who was the top scorer at the 2018 FIFA World Cup in Russia with 6 goals?',
 'Harry Kane',
 ARRAY['Antoine Griezmann', 'Romelu Lukaku', 'Cristiano Ronaldo']),

('Soccer', 'medium', 'history',
 'Who scored the winning goal in the 2010 FIFA World Cup Final for Spain?',
 'Andres Iniesta',
 ARRAY['David Villa', 'Fernando Torres', 'Xavi Hernandez']),

('Soccer', 'medium', 'players',
 'How many FIFA World Cup titles did Pelé win during his playing career?',
 '3',
 ARRAY['2', '4', '1']),

('Soccer', 'medium', 'players',
 'Which club did Ronaldinho leave to join FC Barcelona in 2003?',
 'Paris Saint-Germain',
 ARRAY['AC Milan', 'Juventus', 'Manchester United']),

('Soccer', 'medium', 'history',
 'Which club won the 2022 UEFA Champions League, beating Liverpool in the final?',
 'Real Madrid',
 ARRAY['Manchester City', 'Chelsea', 'Bayern Munich']),

('Soccer', 'medium', 'history',
 'In what year was the UEFA Champions League format introduced, replacing the old European Cup?',
 '1992',
 ARRAY['1988', '1995', '1999']),

('Soccer', 'medium', 'players',
 'Who won the Golden Ball (best player award) at the 2022 FIFA World Cup?',
 'Lionel Messi',
 ARRAY['Kylian Mbappé', 'Luka Modric', 'Emiliano Martinez']),

('Soccer', 'medium', 'records',
 'Who holds the all-time record for most international goals scored in men''s soccer?',
 'Cristiano Ronaldo',
 ARRAY['Lionel Messi', 'Ali Daei', 'Robert Lewandowski']),

-- ── Hard (10) ─────────────────────────────────────────────────────────────────

('Soccer', 'hard', 'history',
 'Diego Maradona scored two goals against England at the 1986 World Cup. What is his second goal — a solo run past five defenders — commonly known as?',
 'Goal of the Century',
 ARRAY['The Perfect Goal', 'The Greatest Goal', 'The Solo Wonder']),

('Soccer', 'hard', 'records',
 'Who holds the record for most goals scored across all FIFA World Cup tournaments with 16 goals?',
 'Miroslav Klose',
 ARRAY['Ronaldo Nazario', 'Gerd Muller', 'Just Fontaine']),

('Soccer', 'hard', 'history',
 'Which club won the first five UEFA Champions League (European Cup) titles consecutively from 1956 to 1960?',
 'Real Madrid',
 ARRAY['Benfica', 'Inter Milan', 'AC Milan']),

('Soccer', 'hard', 'history',
 'Which African nation became the first ever to reach the FIFA World Cup semifinals, achieving the feat in 2022?',
 'Morocco',
 ARRAY['Cameroon', 'Senegal', 'Ghana']),

('Soccer', 'hard', 'history',
 'Which player scored the famous "Panenka" penalty — chipping the ball softly down the middle — to win the 1976 European Championship for Czechoslovakia?',
 'Antonín Panenka',
 ARRAY['Josef Masopust', 'Ladislav Kubala', 'Frantisek Veselý']),

('Soccer', 'hard', 'records',
 'What was the score when Germany defeated Brazil in the 2014 FIFA World Cup semifinal, shocking the host nation on home soil?',
 '7-1',
 ARRAY['5-1', '6-0', '4-0']),

('Soccer', 'hard', 'history',
 'Who was the first person to win the FIFA World Cup as both a player and a head coach, achieving the feat with Brazil?',
 'Mario Zagallo',
 ARRAY['Didier Deschamps', 'Franz Beckenbauer', 'Johan Cruyff']),

('Soccer', 'hard', 'records',
 'In what year did Cristiano Ronaldo score his 110th international goal to surpass Ali Daei and become the all-time top scorer in men''s international soccer?',
 '2021',
 ARRAY['2020', '2022', '2019']),

('Soccer', 'hard', 'teams',
 'Which stadium hosted the 2022 FIFA World Cup Final between Argentina and France in Qatar?',
 'Lusail Stadium',
 ARRAY['Al Bayt Stadium', 'Khalifa International Stadium', 'Education City Stadium']),

('Soccer', 'hard', 'records',
 'Who set the UEFA Champions League record for most goals in a single season with 17, in the 2013-14 campaign?',
 'Cristiano Ronaldo',
 ARRAY['Lionel Messi', 'Karim Benzema', 'Robert Lewandowski']);
