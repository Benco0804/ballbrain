-- Soccer Trivia Questions — Batch 3 of 3 (20 questions)
-- Total Soccer questions after this file: ~100

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (4) ──────────────────────────────────────────────────────────────────

('Soccer', 'easy', 'history',
 'Which country won UEFA Euro 2016, defeating France in the final?',
 'Portugal',
 ARRAY['Germany', 'Croatia', 'Wales']),

('Soccer', 'easy', 'stats',
 'How many yellow cards in the same match result in a player receiving an automatic red card?',
 '2',
 ARRAY['3', '1', '4']),

('Soccer', 'easy', 'players',
 'Which Brazilian striker is nicknamed "O Fenômeno" (The Phenomenon)?',
 'Ronaldo Nazario',
 ARRAY['Romario', 'Rivaldo', 'Ronaldinho']),

('Soccer', 'easy', 'teams',
 'What nickname is given to the UEFA Champions League trophy because of its distinctive large handles?',
 'Big Ears',
 ARRAY['The Jug', 'The Cup with Handles', 'The Silver Giant']),

-- ── Medium (10) ───────────────────────────────────────────────────────────────

('Soccer', 'medium', 'records',
 'Who won the Golden Boot as top scorer at the 2010 FIFA World Cup in South Africa with 5 goals and 3 assists?',
 'Thomas Muller',
 ARRAY['David Villa', 'Miroslav Klose', 'Wesley Sneijder']),

('Soccer', 'medium', 'records',
 'Which English club has won the FA Cup the most times in history?',
 'Arsenal',
 ARRAY['Manchester United', 'Liverpool', 'Chelsea']),

('Soccer', 'medium', 'records',
 'What world-record transfer fee did Paris Saint-Germain pay to sign Neymar from Barcelona in 2017?',
 '€222 million',
 ARRAY['€150 million', '€180 million', '€200 million']),

('Soccer', 'medium', 'history',
 'Who scored both goals as Inter Milan beat Bayern Munich 2-0 in the 2010 UEFA Champions League Final?',
 'Diego Milito',
 ARRAY['Samuel Eto''o', 'Wesley Sneijder', 'Esteban Cambiasso']),

('Soccer', 'medium', 'history',
 'Which country hosted the 2006 FIFA World Cup?',
 'Germany',
 ARRAY['France', 'South Africa', 'Japan']),

('Soccer', 'medium', 'records',
 'Who has scored the most goals in the history of the UEFA European Championship with 14?',
 'Cristiano Ronaldo',
 ARRAY['Michel Platini', 'Antoine Griezmann', 'Thierry Henry']),

('Soccer', 'medium', 'players',
 'Which club signed Cristiano Ronaldo from Sporting CP in 2003 for his first move to England?',
 'Manchester United',
 ARRAY['Arsenal', 'Chelsea', 'Liverpool']),

('Soccer', 'medium', 'history',
 'Which club stunned the world by winning the Premier League in 2015-16 at pre-season odds of 5000-1?',
 'Leicester City',
 ARRAY['Burnley', 'Stoke City', 'Crystal Palace']),

('Soccer', 'medium', 'records',
 'Which player became the world''s most expensive footballer when he joined Real Madrid from Manchester United in 2009 for £80 million?',
 'Cristiano Ronaldo',
 ARRAY['Zlatan Ibrahimovic', 'Kaka', 'David Villa']),

('Soccer', 'medium', 'history',
 'Which country won the first-ever FIFA Women''s World Cup, held in China in 1991?',
 'United States',
 ARRAY['Norway', 'Germany', 'Sweden']),

-- ── Hard (6) ──────────────────────────────────────────────────────────────────

('Soccer', 'hard', 'records',
 'Who holds the record for most World Cup matches played with 25 appearances across five tournaments between 1982 and 1998?',
 'Lothar Matthaus',
 ARRAY['Miroslav Klose', 'Cafu', 'Paolo Maldini']),

('Soccer', 'hard', 'history',
 'In what year was Video Assistant Referee (VAR) technology first used at a FIFA World Cup?',
 '2018',
 ARRAY['2014', '2016', '2022']),

('Soccer', 'hard', 'history',
 'Which country holds the record for most FIFA World Cup final appearances without ever winning the tournament?',
 'Netherlands',
 ARRAY['Hungary', 'Czechoslovakia', 'Sweden']),

('Soccer', 'hard', 'records',
 'Which national team scored a tournament-record 27 goals in just 5 matches at the 1954 FIFA World Cup in Switzerland?',
 'Hungary',
 ARRAY['Brazil', 'West Germany', 'Austria']),

('Soccer', 'hard', 'history',
 'In what year did the new Wembley Stadium open in London, replacing the iconic Twin Towers ground?',
 '2007',
 ARRAY['2003', '2005', '2010']),

('Soccer', 'hard', 'players',
 'Who won the 2022 Ballon d''Or, becoming the first French player to claim the award since Zinedine Zidane in 1998?',
 'Karim Benzema',
 ARRAY['Kylian Mbappé', 'Sadio Mane', 'Luka Modric']);
