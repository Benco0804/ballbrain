/**
 * Guest play tracking via localStorage.
 * Used to enforce daily limits for unauthenticated users.
 *
 * Storage key: "ballbrain_guest_plays"
 * Structure:
 * {
 *   grid:   { NBA: { date: "2026-04-03", count: 0 }, Soccer: { date: "...", count: 0 } },
 *   trivia: { NBA: { date: "...", count: 0 }, Soccer: { ... }, Mix: { ... } }
 * }
 */

const KEY = "ballbrain_guest_plays";

type SportEntry = { date: string; count: number };
type GuestPlays = {
  grid: Record<string, SportEntry>;
  trivia: Record<string, SportEntry>;
};

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function load(): GuestPlays {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { grid: {}, trivia: {} };
    return JSON.parse(raw) as GuestPlays;
  } catch {
    return { grid: {}, trivia: {} };
  }
}

function save(data: GuestPlays): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** Returns today's play count for a game + sport. Resets automatically if date changed. */
export function getGuestCount(game: "grid" | "trivia", sport: string): number {
  const data = load();
  const entry = data[game]?.[sport];
  if (!entry || entry.date !== today()) return 0;
  return entry.count;
}

/** Increments today's play count and returns the new total. */
export function incrementGuestCount(game: "grid" | "trivia", sport: string): number {
  const data = load();
  const t = today();
  if (!data[game]) data[game] = {};
  const prev = data[game][sport];
  const count = (prev?.date === t ? prev.count : 0) + 1;
  data[game][sport] = { date: t, count };
  save(data);
  return count;
}
