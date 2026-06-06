-- Captures which game mode produced each result.
-- Historical rows remain NULL — that's expected and fine.
ALTER TABLE game_results ADD COLUMN game_mode text;
