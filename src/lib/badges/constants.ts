export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";
export type BadgeCategory = "milestone" | "streak" | "perfection" | "mastery" | "volume" | "rank";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  rookie_card: {
    id: "rookie_card",
    name: "Rookie Card",
    description: "Play your first game",
    category: "milestone",
    tier: "bronze",
    icon: "🃏",
  },
  veteran: {
    id: "veteran",
    name: "Veteran",
    description: "Play 100 games",
    category: "milestone",
    tier: "silver",
    icon: "📋",
  },
  franchise_player: {
    id: "franchise_player",
    name: "Franchise Player",
    description: "Play 500 games",
    category: "milestone",
    tier: "gold",
    icon: "🏟️",
  },
  on_a_run: {
    id: "on_a_run",
    name: "On a Run",
    description: "Reach a 7-day streak",
    category: "streak",
    tier: "bronze",
    icon: "🔥",
  },
  ironman: {
    id: "ironman",
    name: "Ironman",
    description: "Reach a 30-day streak",
    category: "streak",
    tier: "silver",
    icon: "⚡",
  },
  unbreakable: {
    id: "unbreakable",
    name: "Unbreakable",
    description: "Reach a 100-day streak",
    category: "streak",
    tier: "platinum",
    icon: "💎",
  },
  flawless: {
    id: "flawless",
    name: "Flawless",
    description: "Get a perfect score in any game mode",
    category: "perfection",
    tier: "bronze",
    icon: "⭐",
  },
  perfectionist: {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Get 10 perfect games",
    category: "perfection",
    tier: "gold",
    icon: "🎯",
  },
  ballbrain_savant: {
    id: "ballbrain_savant",
    // "perfect" = score 9/9; only Sports Grid counts here (not Draft Board)
    name: "BallBrain Savant",
    description: "Get 25 perfect Sports Grids",
    category: "perfection",
    tier: "platinum",
    icon: "🧠",
  },
  nba_role_player: {
    id: "nba_role_player",
    name: "NBA Role Player",
    description: "70% cell accuracy in NBA (min 10 games)",
    category: "mastery",
    tier: "bronze",
    icon: "🏀",
  },
  nba_starter: {
    id: "nba_starter",
    name: "NBA Starter",
    description: "80% cell accuracy in NBA (min 10 games)",
    category: "mastery",
    tier: "silver",
    icon: "🏀",
  },
  nba_sharpshooter: {
    id: "nba_sharpshooter",
    name: "NBA Sharpshooter",
    description: "90% cell accuracy in NBA (min 10 games)",
    category: "mastery",
    tier: "gold",
    icon: "🏀",
  },
  soccer_squad: {
    id: "soccer_squad",
    name: "Soccer Squad Player",
    description: "70% cell accuracy in Soccer (min 10 games)",
    category: "mastery",
    tier: "bronze",
    icon: "⚽",
  },
  soccer_playmaker: {
    id: "soccer_playmaker",
    name: "Soccer Playmaker",
    description: "80% cell accuracy in Soccer (min 10 games)",
    category: "mastery",
    tier: "silver",
    icon: "⚽",
  },
  soccer_maestro: {
    id: "soccer_maestro",
    name: "Soccer Maestro",
    description: "90% cell accuracy in Soccer (min 10 games)",
    category: "mastery",
    tier: "gold",
    icon: "⚽",
  },
  gym_rat: {
    id: "gym_rat",
    name: "Gym Rat",
    description: "Play 50 NBA games",
    category: "volume",
    tier: "silver",
    icon: "💪",
  },
  sunday_league: {
    id: "sunday_league",
    name: "Sunday League Legend",
    description: "Play 50 Soccer games",
    category: "volume",
    tier: "silver",
    icon: "🌍",
  },
  first_ballot: {
    id: "first_ballot",
    name: "First-Ballot",
    description: "Reach Hall of Fame rank",
    category: "rank",
    tier: "platinum",
    icon: "🏆",
  },
};

// Display order: grouped by category, ordered bronze→platinum within each group
export const BADGE_DISPLAY_ORDER: string[] = [
  "rookie_card", "veteran", "franchise_player",
  "on_a_run", "ironman", "unbreakable",
  "flawless", "perfectionist", "ballbrain_savant",
  "nba_role_player", "nba_starter", "nba_sharpshooter",
  "soccer_squad", "soccer_playmaker", "soccer_maestro",
  "gym_rat", "sunday_league",
  "first_ballot",
];
