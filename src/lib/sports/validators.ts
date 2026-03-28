import { PLAYERS, type Player } from "./players";
import { normalize } from "./normalize";

type CategoryPredicate = (player: Player) => boolean;

const CATEGORY_PREDICATES: Record<string, CategoryPredicate> = {
  "nba-lakers":             (p) => p.nbaTeams?.includes("Lakers") ?? false,
  "nfl-super-bowl-champ":   (p) => (p.superBowlWins ?? 0) > 0,
  "soccer-ucl-winner":      (p) => (p.uclWins ?? 0) > 0,
  // Sport-agnostic: checks whichever career seasons field is populated.
  // In practice each player only has one sport, so the right field is checked.
  "career-10-plus-seasons": (p) =>
    (p.nbaSeasons ?? 0) >= 10 ||
    (p.nflSeasons ?? 0) >= 10 ||
    (p.soccerSeasons ?? 0) >= 10,
  "nfl-pro-bowl":           (p) => (p.proBowls ?? 0) > 0,
  "soccer-50-plus-caps":    (p) => (p.internationalCaps ?? 0) >= 50,
};


export type ValidationResult =
  | { status: "correct"; player: Player }
  | { status: "wrong";   player: Player }
  | { status: "unknown" };

export function validateGuess(
  playerName: string,
  rowCategoryId: string,
  colCategoryId: string
): ValidationResult {
  const normalizedInput = normalize(playerName);
  const player = PLAYERS.find((p) => normalize(p.name) === normalizedInput);

  if (!player) return { status: "unknown" };

  const rowPredicate = CATEGORY_PREDICATES[rowCategoryId];
  const colPredicate = CATEGORY_PREDICATES[colCategoryId];

  if (!rowPredicate || !colPredicate) {
    throw new Error(`Unknown category ID: "${rowCategoryId}" or "${colCategoryId}"`);
  }

  return rowPredicate(player) && colPredicate(player)
    ? { status: "correct", player }
    : { status: "wrong", player };
}
