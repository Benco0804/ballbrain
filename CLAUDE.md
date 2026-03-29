@AGENTS.md

# BallBrain

Sports trivia gaming platform for fans ages 18–50. Three game modes:

1. **Sports Grid** — daily tic-tac-toe/trivia hybrid. Status: **alpha, live**.
2. **Solo Trivia** — Millionaire-style single-player trivia. Status: **alpha, to build**.
3. **1v1 Trivia Battle** — real-time head-to-head trivia. Status: **beta, post-alpha** (build once player base exists).

Sports covered: NBA, NFL, Soccer. Virtual economy: **Coins** (earned in-game) and **Gems** (premium currency).

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| React | React 19 with React Compiler enabled |

## Project Structure

```
src/
  app/                        # App Router pages and layouts
    (auth)/                   # Auth routes (login, signup, reset)
    (game)/                   # Game routes (grid, battle)
    api/                      # Route handlers
    layout.tsx                # Root layout
    page.tsx                  # Home/landing page
  components/
    ui/                       # Shared primitive components
    grid/                     # Sports Grid game components
    battle/                   # 1v1 Trivia Battle components
    economy/                  # Coins/Gems display, store UI
  lib/
    supabase/
      client.ts               # Browser Supabase client (createBrowserClient)
      server.ts               # Server Supabase client (RSC/Route Handlers)
    game/                     # Game logic (grid generation, scoring)
    sports/                   # Sports data utilities
  types/                      # Shared TypeScript types
src/proxy.ts                  # Next.js Proxy (auth session refresh — middleware renamed in v16)
```

## Key Conventions

### Next.js / App Router
- Default to **Server Components**. Use `"use client"` only when you need interactivity or browser APIs.
- Data fetching happens in Server Components or Route Handlers — never client-side fetch on initial load.
- Route groups `(auth)`, `(game)` organize routes without affecting URL paths.
- Always check `node_modules/next/dist/docs/` before using any Next.js API — this is Next.js 16 and has breaking changes from prior versions.

### Supabase
- Use `@supabase/ssr` for all server-side auth (RSC, Route Handlers, middleware). Never use the plain JS client on the server.
- Browser client: `createBrowserClient` from `@supabase/ssr`.
- Server client: `createServerClient` from `@supabase/ssr`, passing cookies from `next/headers`.
- Row-Level Security (RLS) must be enabled on every table. Never bypass RLS with service role key on the client path.

### TypeScript
- `strict: true` — no `any`, no non-null assertions without a comment explaining why.
- Define all Supabase table types in `src/types/database.ts` (generated or hand-maintained).

### Tailwind
- Tailwind v4 — config is in `postcss.config.mjs`, not `tailwind.config.js`.
- Prefer utility classes; avoid arbitrary values unless necessary.

### Virtual Economy
- **Coins**: earned by playing, used for basic unlocks. Never purchased directly.
- **Gems**: premium currency. All gem grants/deductions must go through a server-side Route Handler — never trust client-reported balances.
- Economy mutations must be idempotent (use a transaction ID to prevent double-credits).
- **All economy values must be imported from `src/lib/economy/constants.ts`** — never hardcode coin/gem amounts in UI components or game logic.

### Games
- **Sports Grid**: one puzzle per day, same for all users. Grid state is stored in Supabase; do not store it only in client state.
- **1v1 Trivia Battle**: real-time matchmaking. Use Supabase Realtime channels for game state sync. Not in active development until alpha games have an established player base.

## Economy Specs

### Starting Balance
- New users receive **100 coins** on account creation.

### Sports Grid Earnings
| Outcome | Coins |
|---|---|
| Correct cell | 10 |
| Perfect puzzle (all 9 correct) | +60 bonus |
| Participation (any loss) | 15 |

### Sports Grid Hint System
- Cost: **50 coins** per hint.
- Max **3 hints** per puzzle.
- Each hint reveals one valid player for the selected cell.
- Hint purchases go through a server-side Route Handler; never deduct client-side.

### Solo Trivia (Millionaire-style)
- **1 free play per day** per user; tracked server-side.
- **20-second timer** per question.
- **4 answer choices** per question.
- **15 questions** total; coins awarded at milestone questions only:

| Question | Coins Awarded |
|---|---|
| Q3 | 20 |
| Q6 | 50 |
| Q9 | 100 |
| Q12 | 200 |
| Q15 (final) | 500 |

- Milestone coins are awarded when the player answers the milestone question correctly (not on reaching it).
- If the player quits or times out before a milestone, no coins are awarded for that milestone.

### Economy Constants File
All values above live in `src/lib/economy/constants.ts`. Example shape:

```ts
export const ECONOMY = {
  STARTING_COINS: 100,
  SPORTS_GRID: {
    COINS_PER_CORRECT_CELL: 10,
    PERFECT_BONUS: 60,
    PARTICIPATION: 15,
    HINT_COST: 50,
    MAX_HINTS_PER_PUZZLE: 3,
  },
  SOLO_TRIVIA: {
    FREE_PLAYS_PER_DAY: 1,
    TIMER_SECONDS: 20,
    ANSWER_CHOICES: 4,
    MILESTONES: {
      3: 20,
      6: 50,
      9: 100,
      12: 200,
      15: 500,
    },
  },
} as const;
```

## Environment Variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Server-only: never expose to client
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never reference it in any file that has or could be imported by a `"use client"` component.
