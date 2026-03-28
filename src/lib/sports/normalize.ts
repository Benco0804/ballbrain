/**
 * Normalise a player name for case-insensitive, accent-insensitive matching.
 * Used on both the stored canonical names and user-typed input.
 */
export function normalize(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ");
}
