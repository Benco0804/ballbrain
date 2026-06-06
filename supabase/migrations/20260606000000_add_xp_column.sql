ALTER TABLE users ADD COLUMN xp integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD CONSTRAINT users_xp_non_negative CHECK (xp >= 0);
