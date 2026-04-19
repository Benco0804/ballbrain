/**
 * Guest play tracking via localStorage.
 * Used to enforce daily limits for unauthenticated users.
 *
 * Storage key: "ballbrain_gp_v1"
 * Structure:
 * {
 *   "grid":  { "NBA": { "date": "2026-04-03", "count": 1 }, "Soccer": { ... } },
 *   "draft": { "NBA": { "date": "2026-04-03", "count": 1 }, "Soccer": { ... } },
 *   "trivia": { "NBA": { "date": "2026-04-03", "count": 1 }, "Soccer": { ... }, "Mix": { ... } }
 * }
 */

// Versioned key — bumping the suffix discards any stale data from previous builds.
const KEY = "ballbrain_gp_v1";

type SportEntry = { date: string; count: number };
type GuestPlays = {
  grid: Record<string, SportEntry>;
  draft: Record<string, SportEntry>;
  trivia: Record<string, SportEntry>;
};

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function isValidEntry(v: unknown): v is SportEntry {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    typeof (v as SportEntry).date === "string" &&
    typeof (v as SportEntry).count === "number" &&
    Number.isFinite((v as SportEntry).count)
  );
}

function load(): GuestPlays {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { grid: {}, draft: {}, trivia: {} };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { grid: {}, draft: {}, trivia: {} };
    }
    const p = parsed as Record<string, unknown>;
    return {
      grid:   typeof p.grid   === "object" && p.grid   !== null ? (p.grid   as Record<string, unknown>) as Record<string, SportEntry> : {},
      draft:  typeof p.draft  === "object" && p.draft  !== null ? (p.draft  as Record<string, unknown>) as Record<string, SportEntry> : {},
      trivia: typeof p.trivia === "object" && p.trivia !== null ? (p.trivia as Record<string, unknown>) as Record<string, SportEntry> : {},
    };
  } catch {
    return { grid: {}, draft: {}, trivia: {} };
  }
}

function save(data: GuestPlays): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or private browsing — silent fail.
  }
}

/** Returns today's play count for a game + sport. Returns 0 if no valid entry exists or date has changed. */
export function getGuestCount(game: "grid" | "draft" | "trivia", sport: string): number {
  const data = load();
  const entry = data[game]?.[sport];
  if (!isValidEntry(entry)) return 0;
  if (entry.date !== today()) return 0;
  return Math.max(0, Math.floor(entry.count));
}

/** Increments today's play count and returns the new total. */
export function incrementGuestCount(game: "grid" | "draft" | "trivia", sport: string): number {
  const data = load();
  const t = today();
  if (!data[game]) data[game] = {};
  const prev = data[game][sport];
  const prevCount = isValidEntry(prev) && prev.date === t ? Math.max(0, Math.floor(prev.count)) : 0;
  const count = prevCount + 1;
  data[game][sport] = { date: t, count };
  save(data);
  return count;
}
