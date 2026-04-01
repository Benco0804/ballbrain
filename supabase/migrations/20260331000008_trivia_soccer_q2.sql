-- Soccer Trivia Questions — Batch 2 of 3 (40 questions)

INSERT INTO public.trivia_questions
  (sport, difficulty, category, question, correct_answer, wrong_answers)
VALUES

-- ── Easy (10) ─────────────────────────────────────────────────────────────────

('Soccer', 'easy', 'players',
 'Which country does Lionel Messi represent internationally?',
 'Argentina',
 ARRAY['Spain', 'Italy', 'Brazil']),

('Soccer', 'easy', 'players',
 'Which country does Cristiano Ronaldo represent internationally?',
 'Portugal',
 ARRAY['Spain', 'Brazil', 'France']),

('Soccer', 'easy', 'teams',
 'Which club plays its home games at the Santiago Bernabéu stadium?',
 'Real Madrid',
 ARRAY['Atletico Madrid', 'Valencia', 'Sevilla']),

('Soccer', 'easy', 'teams',
 'Which club plays at Camp Nou in Barcelona?',
 'FC Barcelona',
 ARRAY['Espanyol', 'Valencia', 'Atletico Madrid']),

('Soccer', 'easy', 'players',
 'Which legendary Brazilian player is nicknamed "O Rei" (The King)?',
 'Pelé',
 ARRAY['Ronaldo Nazario', 'Zico', 'Garrincha']),

('Soccer', 'easy', 'teams',
 'In which country is the Bundesliga played?',
 'Germany',
 ARRAY['Austria', 'Switzerland', 'Netherlands']),

('Soccer', 'easy', 'stats',
 'What is the maximum number of substitutions each team can make in a modern FIFA-sanctioned match?',
 '5',
 ARRAY['3', '4', '6']),

('Soccer', 'easy', 'players',
 'Which club does Erling Haaland play for?',
 'Manchester City',
 ARRAY['Borussia Dortmund', 'Bayern Munich', 'Liverpool']),

('Soccer', 'easy', 'players',
 'Which country does Neymar represent internationally?',
 'Brazil',
 ARRAY['Colombia', 'Argentina', 'Uruguay']),

('Soccer', 'easy', 'history',
 'Which country won UEFA Euro 2020 (the tournament played in 2021)?',
 'Italy',
 ARRAY['England', 'Spain', 'Denmark']),

-- ── Medium (20) ───────────────────────────────────────────────────────────────

('Soccer', 'medium', 'history',
 'Who scored a hat-trick in the 2022 FIFA World Cup Final for France in the losing effort against Argentina?',
 'Kylian Mbappé',
 ARRAY['Antoine Griezmann', 'Olivier Giroud', 'Ousmane Dembele']),

('Soccer', 'medium', 'players',
 'Which player broke the Messi–Ronaldo Ballon d''Or duopoly by winning the award in 2018?',
 'Luka Modric',
 ARRAY['Antoine Griezmann', 'Raphael Varane', 'Kylian Mbappé']),

('Soccer', 'medium', 'history',
 'Which club won the 2023 UEFA Champions League to complete a historic treble?',
 'Manchester City',
 ARRAY['Real Madrid', 'Bayern Munich', 'Inter Milan']),

('Soccer', 'medium', 'history',
 'Who scored an iconic bicycle kick goal in the 2018 UEFA Champions League Final for Real Madrid against Liverpool?',
 'Gareth Bale',
 ARRAY['Cristiano Ronaldo', 'Karim Benzema', 'Luka Modric']),

('Soccer', 'medium', 'history',
 'Which country hosted and won the 1998 FIFA World Cup?',
 'France',
 ARRAY['Germany', 'Brazil', 'Italy']),

('Soccer', 'medium', 'players',
 'Which player scored twice in the 1998 FIFA World Cup Final to help France beat Brazil 3-0?',
 'Zinedine Zidane',
 ARRAY['Thierry Henry', 'David Trezeguet', 'Emmanuel Petit']),

('Soccer', 'medium', 'records',
 'Which player scored a record 13 goals in a single World Cup tournament, playing for France in 1958?',
 'Just Fontaine',
 ARRAY['Gerd Muller', 'Eusebio', 'Sándor Kocsis']),

('Soccer', 'medium', 'records',
 'Who is the all-time leading scorer in Premier League history with 260 goals?',
 'Alan Shearer',
 ARRAY['Wayne Rooney', 'Andrew Cole', 'Frank Lampard']),

('Soccer', 'medium', 'history',
 'In what year did Brazil win their most recent FIFA World Cup?',
 '2002',
 ARRAY['1994', '1998', '2006']),

('Soccer', 'medium', 'players',
 'Who won the Ballon d''Or in 2005, widely regarded as the best player in the world that year while at Barcelona?',
 'Ronaldinho',
 ARRAY['Thierry Henry', 'Frank Lampard', 'Samuel Eto''o']),

('Soccer', 'medium', 'players',
 'Which MLS club did Lionel Messi join after leaving Paris Saint-Germain in 2023?',
 'Inter Miami',
 ARRAY['LA Galaxy', 'New York City FC', 'Atlanta United']),

('Soccer', 'medium', 'players',
 'Which Saudi Arabian club did Cristiano Ronaldo join in January 2023 after leaving Manchester United?',
 'Al Nassr',
 ARRAY['Al Hilal', 'Al Ahli', 'Al Ittihad']),

('Soccer', 'medium', 'history',
 'Which country won the 2021 Copa America, defeating Brazil in the final?',
 'Argentina',
 ARRAY['Uruguay', 'Chile', 'Colombia']),

('Soccer', 'medium', 'records',
 'Which Spanish club holds the record for the most La Liga title wins?',
 'Real Madrid',
 ARRAY['FC Barcelona', 'Atletico Madrid', 'Valencia']),

('Soccer', 'medium', 'records',
 'Who is the all-time top scorer for the German national team with 71 international goals?',
 'Miroslav Klose',
 ARRAY['Gerd Muller', 'Lukas Podolski', 'Thomas Muller']),

('Soccer', 'medium', 'history',
 'Who scored the Golden Goal in extra time to win the UEFA Euro 2000 final for France against Italy?',
 'David Trezeguet',
 ARRAY['Thierry Henry', 'Sylvain Wiltord', 'Nicolas Anelka']),

('Soccer', 'medium', 'players',
 'Which club did Zinedine Zidane retire from as a player following the 2006 FIFA World Cup Final?',
 'Real Madrid',
 ARRAY['Juventus', 'Bordeaux', 'Marseille']),

('Soccer', 'medium', 'history',
 'Which country won UEFA Euro 2024, defeating England 2-1 in the final in Berlin?',
 'Spain',
 ARRAY['France', 'Portugal', 'Germany']),

('Soccer', 'medium', 'records',
 'Who broke Gerd Müller''s Bundesliga record by scoring 41 goals in the 2020-21 season?',
 'Robert Lewandowski',
 ARRAY['Thomas Muller', 'Erling Haaland', 'Serge Gnabry']),

('Soccer', 'medium', 'players',
 'Which legendary player made his World Cup debut at 17 and scored 6 goals to help Brazil win the 1958 tournament?',
 'Pelé',
 ARRAY['Garrincha', 'Zico', 'Rivaldo']),

-- ── Hard (10) ─────────────────────────────────────────────────────────────────

('Soccer', 'hard', 'records',
 'Which player holds the record for most appearances for England''s national team with 125 caps?',
 'Peter Shilton',
 ARRAY['Wayne Rooney', 'Bobby Moore', 'David Beckham']),

('Soccer', 'hard', 'records',
 'Which player scored the most goals for a single club in professional soccer history, netting 672 times for FC Barcelona?',
 'Lionel Messi',
 ARRAY['Cristiano Ronaldo', 'Pelé', 'Gerd Muller']),

('Soccer', 'hard', 'history',
 'Which club won the very first UEFA Champions League title in the 1992-93 season, beating AC Milan 1-0 in the final?',
 'Olympique de Marseille',
 ARRAY['Juventus', 'PSG', 'Ajax']),

('Soccer', 'hard', 'history',
 'Which goalkeeper saved the decisive penalty in the 2005 UEFA Champions League Final shootout to win the trophy for Liverpool?',
 'Jerzy Dudek',
 ARRAY['Pepe Reina', 'Chris Kirkland', 'Scott Carson']),

('Soccer', 'hard', 'records',
 'Which player scored 9 goals in a single UEFA European Championship — the all-time tournament record — at Euro 1984?',
 'Michel Platini',
 ARRAY['Cristiano Ronaldo', 'Marco van Basten', 'Thierry Henry']),

('Soccer', 'hard', 'history',
 'Which country was the first to win back-to-back FIFA World Cups, achieving the feat in 1934 and 1938?',
 'Italy',
 ARRAY['Brazil', 'Germany', 'Uruguay']),

('Soccer', 'hard', 'history',
 'Who scored the winning penalty in the 2006 FIFA World Cup Final shootout to clinch the title for Italy against France?',
 'Fabio Grosso',
 ARRAY['Andrea Pirlo', 'Alessandro Del Piero', 'Francesco Totti']),

('Soccer', 'hard', 'records',
 'Which match holds the record for most goals in a single FIFA World Cup game — a 12-goal thriller in 1954?',
 'Austria 7-5 Switzerland',
 ARRAY['Hungary 10-1 El Salvador', 'West Germany 8-0 Turkey', 'France 7-3 Paraguay']),

('Soccer', 'hard', 'players',
 'Which player won the FIFA World Player of the Year award in the same year he lifted the World Cup with Brazil in 2002?',
 'Ronaldo Nazario',
 ARRAY['Ronaldinho', 'Rivaldo', 'Roberto Carlos']),

('Soccer', 'hard', 'records',
 'Which Real Madrid player holds the all-time record for most UEFA Champions League/European Cup winner''s medals with six?',
 'Francisco Gento',
 ARRAY['Cristiano Ronaldo', 'Alfredo Di Stefano', 'Iker Casillas']);
