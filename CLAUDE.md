@AGENTS.md

# BallBrain

Sports trivia gaming platform for fans ages 18–50. Two launch games: **Sports Grid** (daily tic-tac-toe/trivia hybrid) and **1v1 Trivia Battle**. Sports covered: NBA, NFL, Soccer. Virtual economy: **Coins** (earned in-game) and **Gems** (premium currency).

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

### Games
- **Sports Grid**: one puzzle per day, same for all users. Grid state is stored in Supabase; do not store it only in client state.
- **1v1 Trivia Battle**: real-time matchmaking. Use Supabase Realtime channels for game state sync.

## Environment Variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Server-only: never expose to client
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never reference it in any file that has or could be imported by a `"use client"` component.
