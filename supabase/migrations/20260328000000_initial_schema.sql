-- =============================================================================
-- BallBrain — Initial Schema
-- =============================================================================
-- Tables (in creation order):
--   users, daily_puzzles, puzzle_cells, game_results,
--   players, trivia_questions, trivia_battles, economy_transactions
-- All tables have RLS enabled. Policies are defined at the bottom.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- pg_trgm powers efficient ILIKE autocomplete on players.name
create extension if not exists pg_trgm;


-- ---------------------------------------------------------------------------
-- Utility: auto-update updated_at columns
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ===========================================================================
-- TABLE: users
-- Public profile linked 1-to-1 with auth.users.
-- Created automatically via trigger when a user signs up.
-- ===========================================================================
create table public.users (
  id           uuid        primary key references auth.users(id) on delete cascade,
  username     text        not null unique,
  display_name text,
  coins        integer     not null default 0 check (coins >= 0),
  gems         integer     not null default 0 check (gems >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- runs as DB owner so it can write to public.users
set search_path = public  -- prevent search_path hijacking
as $$
begin
  insert into public.users (id, username, display_name)
  values (
    new.id,
    -- Fall back to "user_<first 8 chars of UUID>" if no username was supplied
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      'user_' || substr(new.id::text, 1, 8)
    ),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), '')
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===========================================================================
-- TABLE: daily_puzzles
-- One row per calendar day. Stores the 3×3 category labels and IDs.
-- ===========================================================================
create table public.daily_puzzles (
  id             uuid  primary key default gen_random_uuid(),
  puzzle_date    date  not null unique,

  -- Each is a JSON array of 3 category objects:
  -- [{ "label": "Played for the Lakers", "sport": "NBA", "category_id": "nba-lakers" }, ...]
  row_categories jsonb not null,
  col_categories jsonb not null,

  -- Primary sport focus of this puzzle. 'Mixed' = spans multiple sports.
  sport          text  not null default 'Mixed'
                       check (sport in ('NBA', 'NFL', 'Soccer', 'Mixed')),

  -- Controls question pool and rarity expectations.
  difficulty     text  not null default 'medium'
                       check (difficulty in ('easy', 'medium', 'hard')),

  created_at     timestamptz not null default now()
);

-- Common lookup: find today's puzzle.
create index daily_puzzles_date_idx       on public.daily_puzzles(puzzle_date);
create index daily_puzzles_sport_diff_idx on public.daily_puzzles(sport, difficulty);


-- ===========================================================================
-- TABLE: puzzle_cells
-- One row per cell (9 per puzzle). Stores the list of accepted player names
-- for that (row, col) intersection.
-- ===========================================================================
create table public.puzzle_cells (
  id            uuid     primary key default gen_random_uuid(),
  puzzle_id     uuid     not null references public.daily_puzzles(id) on delete cascade,
  row_index     smallint not null check (row_index between 0 and 2),
  col_index     smallint not null check (col_index between 0 and 2),

  -- Canonical player names accepted for this cell (case-insensitive match at app layer).
  valid_players text[]   not null default '{}',

  unique (puzzle_id, row_index, col_index)
);

create index puzzle_cells_puzzle_id_idx on public.puzzle_cells(puzzle_id);


-- ===========================================================================
-- TABLE: game_results
-- One row per (user, puzzle) pair — updated in place as the user fills cells.
-- ===========================================================================
create table public.game_results (
  id           uuid     primary key default gen_random_uuid(),

  -- Nullable: allows recording anonymous/guest attempts without a profile row.
  user_id      uuid     references public.users(id) on delete set null,

  puzzle_id    uuid     not null references public.daily_puzzles(id) on delete cascade,

  -- 0–9: number of cells correctly filled.
  score        smallint not null default 0 check (score between 0 and 9),

  -- Total guesses submitted (correct + incorrect), used to compute rarity score.
  guesses_used smallint not null default 0 check (guesses_used >= 0),

  -- Snapshot of which cells were filled and with which player name.
  -- Shape: { "0-0": "Kobe Bryant", "1-1": "Tom Brady", ... }
  cells_filled jsonb    not null default '{}',

  -- Set when the user has no guesses remaining or has filled all 9 cells.
  completed_at timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- A user may only have one result per puzzle.
  unique (user_id, puzzle_id)
);

create trigger game_results_set_updated_at
  before update on public.game_results
  for each row execute function public.set_updated_at();

-- Lookups: user's history, puzzle leaderboard.
create index game_results_user_id_idx   on public.game_results(user_id);
create index game_results_puzzle_id_idx on public.game_results(puzzle_id);


-- ===========================================================================
-- TABLE: players
-- Master list of athletes used for Sports Grid autocomplete and cell validation.
-- Replaces / mirrors the static src/lib/sports/players.ts at the DB layer.
-- ===========================================================================
create table public.players (
  id           uuid  primary key default gen_random_uuid(),
  name         text  not null,
  sport        text  not null check (sport in ('NBA', 'NFL', 'Soccer')),

  -- Lowercase, accent-stripped version of name for fast autocomplete matching.
  -- Kept in sync by the players_set_search_name trigger below.
  search_name  text  not null,

  -- Flexible bag for sport-specific stats used by cell validators:
  -- NBA:    { "teams": ["Lakers","Heat"], "seasons": 20 }
  -- NFL:    { "super_bowl_wins": 7, "seasons": 23, "pro_bowls": 15 }
  -- Soccer: { "ucl_wins": 4, "seasons": 22, "international_caps": 187 }
  metadata     jsonb not null default '{}',

  -- Whether this player should appear in autocomplete suggestions.
  active       boolean not null default true,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (name, sport)
);

-- Trigger to keep search_name in sync with name on insert/update.
create or replace function public.players_sync_search_name()
returns trigger
language plpgsql
as $$
begin
  -- Lower-case; strip common punctuation (apostrophes, hyphens, dots).
  new.search_name = lower(regexp_replace(new.name, '[^a-zA-Z\s]', '', 'g'));
  return new;
end;
$$;

create trigger players_set_search_name
  before insert or update of name on public.players
  for each row execute function public.players_sync_search_name();

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

-- GIN trigram index: supports fast ILIKE '%query%' for autocomplete.
create index players_search_name_trgm_idx on public.players using gin (search_name gin_trgm_ops);
-- Exact-prefix lookup (e.g. search_name LIKE 'kobe%').
create index players_search_name_idx      on public.players(search_name);
create index players_sport_idx            on public.players(sport);


-- ===========================================================================
-- TABLE: trivia_questions
-- Question bank for 1v1 Trivia Battle.
-- ===========================================================================
create table public.trivia_questions (
  id             uuid     primary key default gen_random_uuid(),
  sport          text     not null check (sport in ('NBA', 'NFL', 'Soccer')),
  difficulty     text     not null default 'medium'
                          check (difficulty in ('easy', 'medium', 'hard')),

  -- e.g. 'players', 'teams', 'stats', 'history', 'records'
  category       text     not null,

  question       text     not null,
  correct_answer text     not null,

  -- Three distractors for multiple-choice presentation.
  wrong_answers  text[]   not null check (array_length(wrong_answers, 1) = 3),

  -- Optional: tie this question to a specific season (e.g. 2023).
  season         smallint,

  -- Soft-delete / QA gate: only 'active' questions are served to players.
  status         text     not null default 'active'
                          check (status in ('active', 'retired', 'under_review')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trivia_questions_set_updated_at
  before update on public.trivia_questions
  for each row execute function public.set_updated_at();

create index trivia_questions_sport_diff_idx on public.trivia_questions(sport, difficulty);
create index trivia_questions_status_idx     on public.trivia_questions(status);


-- ===========================================================================
-- TABLE: trivia_battles
-- One row per 1v1 match. Lifecycle: waiting → active → completed | abandoned.
--
-- Matchmaking flow:
--   1. player_one creates a row (status = 'waiting', player_two = NULL).
--   2. player_two joins via a server-side Route Handler (status → 'active').
--   3. Both players submit answers; scores accumulate.
--   4. First to reach the win threshold (or when all questions answered) →
--      status = 'completed', winner_id set.
-- ===========================================================================
create table public.trivia_battles (
  id               uuid     primary key default gen_random_uuid(),

  player_one_id    uuid     not null references public.users(id) on delete cascade,
  -- NULL until an opponent joins.
  player_two_id    uuid     references public.users(id) on delete set null,

  sport            text     not null check (sport in ('NBA', 'NFL', 'Soccer')),
  difficulty       text     not null default 'medium'
                            check (difficulty in ('easy', 'medium', 'hard')),

  status           text     not null default 'waiting'
                            check (status in ('waiting', 'active', 'completed', 'abandoned')),

  -- Ordered array of trivia_questions.id values for this match.
  question_ids     uuid[]   not null default '{}',

  -- Answer maps: { "<question_id>": "<answer_text>" }
  player_one_answers jsonb  not null default '{}',
  player_two_answers jsonb  not null default '{}',

  player_one_score smallint not null default 0 check (player_one_score >= 0),
  player_two_score smallint not null default 0 check (player_two_score >= 0),

  -- NULL until the battle is completed.
  winner_id        uuid     references public.users(id) on delete set null,

  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trivia_battles_set_updated_at
  before update on public.trivia_battles
  for each row execute function public.set_updated_at();

create index trivia_battles_player_one_idx on public.trivia_battles(player_one_id);
create index trivia_battles_player_two_idx on public.trivia_battles(player_two_id);
-- Open lobby: find 'waiting' battles a second player can join.
create index trivia_battles_status_idx     on public.trivia_battles(status)
  where status = 'waiting';


-- ===========================================================================
-- TABLE: economy_transactions
-- Immutable append-only ledger for every coins/gems credit and debit.
-- The users.coins / users.gems columns are the live balance; this table is
-- the audit trail. Never update or delete rows here.
-- ===========================================================================
create table public.economy_transactions (
  id             uuid    primary key default gen_random_uuid(),
  user_id        uuid    not null references public.users(id) on delete cascade,

  currency       text    not null check (currency in ('coins', 'gems')),

  -- Positive = credit, negative = debit.
  amount         integer not null check (amount <> 0),

  -- Machine-readable reason codes, e.g.:
  --   'grid_complete', 'grid_perfect', 'battle_win', 'battle_loss',
  --   'daily_bonus', 'gem_purchase', 'gem_spend_hint'
  reason         text    not null,

  -- Optional FK to the row that caused this transaction.
  reference_id   uuid,
  reference_type text    check (reference_type in ('game_result', 'trivia_battle', 'purchase', 'bonus')),

  -- Denormalised balance snapshot at the moment of this transaction.
  -- Allows auditing without summing all prior rows.
  balance_after  integer not null check (balance_after >= 0),

  created_at     timestamptz not null default now()

  -- No updated_at: this table is append-only.
);

create index economy_transactions_user_id_idx  on public.economy_transactions(user_id);
create index economy_transactions_currency_idx on public.economy_transactions(user_id, currency);
create index economy_transactions_reason_idx   on public.economy_transactions(reason);


-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

alter table public.users                enable row level security;
alter table public.daily_puzzles        enable row level security;
alter table public.puzzle_cells         enable row level security;
alter table public.game_results         enable row level security;
alter table public.players              enable row level security;
alter table public.trivia_questions     enable row level security;
alter table public.trivia_battles       enable row level security;
alter table public.economy_transactions enable row level security;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

create policy "users: public read"
  on public.users for select
  using (true);

-- Coins and gems must be mutated via server-side Route Handlers only.
create policy "users: owner update"
  on public.users for update
  using    (auth.uid() = id)
  with check (auth.uid() = id);

-- Inserts are handled exclusively by the handle_new_user trigger.

-- ---------------------------------------------------------------------------
-- daily_puzzles
-- ---------------------------------------------------------------------------

create policy "daily_puzzles: public read"
  on public.daily_puzzles for select
  using (true);

-- Service-role only writes (no client-side policy needed).

-- ---------------------------------------------------------------------------
-- puzzle_cells
-- ---------------------------------------------------------------------------

create policy "puzzle_cells: public read"
  on public.puzzle_cells for select
  using (true);

-- ---------------------------------------------------------------------------
-- game_results
-- ---------------------------------------------------------------------------

create policy "game_results: public read"
  on public.game_results for select
  using (true);

create policy "game_results: owner insert"
  on public.game_results for insert
  with check (auth.uid() = user_id);

create policy "game_results: owner update"
  on public.game_results for update
  using    (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------

-- Public read for autocomplete.
create policy "players: public read"
  on public.players for select
  using (true);

-- Service-role only writes.

-- ---------------------------------------------------------------------------
-- trivia_questions
-- ---------------------------------------------------------------------------

-- Active questions are public so the client can render them.
create policy "trivia_questions: public read active"
  on public.trivia_questions for select
  using (status = 'active');

-- Service-role only writes.

-- ---------------------------------------------------------------------------
-- trivia_battles
-- ---------------------------------------------------------------------------

-- A battle is visible to its participants, or to anyone while still in the
-- lobby (status = 'waiting') so matchmaking can find it.
create policy "trivia_battles: participant or lobby read"
  on public.trivia_battles for select
  using (
    status = 'waiting'
    or auth.uid() = player_one_id
    or auth.uid() = player_two_id
  );

-- Player one creates the battle.
create policy "trivia_battles: player one insert"
  on public.trivia_battles for insert
  with check (auth.uid() = player_one_id);

-- Participants may update (submit answers, join as player two).
-- Sensitive state transitions (winner, status) must be validated server-side.
create policy "trivia_battles: participant update"
  on public.trivia_battles for update
  using (
    auth.uid() = player_one_id
    or auth.uid() = player_two_id
  )
  with check (
    auth.uid() = player_one_id
    or auth.uid() = player_two_id
  );

-- ---------------------------------------------------------------------------
-- economy_transactions
-- ---------------------------------------------------------------------------

-- Users can see only their own transaction history.
create policy "economy_transactions: owner read"
  on public.economy_transactions for select
  using (auth.uid() = user_id);

-- All writes go through server-side Route Handlers using the service-role key.
-- No client insert/update/delete policy — client cannot create transactions.
