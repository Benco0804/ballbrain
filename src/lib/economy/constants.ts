export const ECONOMY = {
  STARTING_COINS: 150,

  SPORTS_GRID: {
    COINS_PER_CORRECT_CELL: 10,
    UNIQUE_PLAYER_BONUS: 5,
    PERFECT_BONUS: 60,
    PARTICIPATION: 15,
    HINT_COST: 50,
    MAX_HINTS_PER_PUZZLE: 3,
  },

  DRAFT_BOARD: {
    COINS_PER_CORRECT_CELL: 6,
    UNIQUE_PLAYER_BONUS: 3,
    PERFECT_BONUS: 40,
    PARTICIPATION: 15,
    MAX_WRONG_ATTEMPTS: 5,
  },

  SOLO_TRIVIA: {
    FREE_PLAYS_PER_DAY: 1,
    TIMER_SECONDS: 20,
    ANSWER_CHOICES: 4,
    TOTAL_QUESTIONS: 10,
    MILESTONES: {
      2: 20,
      4: 50,
      6: 100,
      8: 200,
      10: 500,
    } as Record<number, number>,
  },
} as const;

export const XP = {
  SPORTS_GRID: {
    BASE: 25,
    PER_CORRECT_CELL: 5,
    PERFECT_BONUS: 30,
  },
  DRAFT_BOARD: {
    BASE: 25,
    PER_CORRECT_CELL: 5,
    FLAWLESS_BONUS: 30,
  },
  SOLO_TRIVIA: {
    BASE: 20,
    PER_QUESTION_ANSWERED: 4,
    FULL_CLEAR_BONUS: 40,
  },
  RANKS: [
    { name: "Rookie",       levels: 10, xp_per_level: 100  },
    { name: "Starter",      levels: 10, xp_per_level: 200  },
    { name: "All-Star",     levels: 10, xp_per_level: 350  },
    { name: "Elite",        levels: 10, xp_per_level: 550  },
    { name: "MVP",          levels: 10, xp_per_level: 800  },
    { name: "Hall of Fame", levels: 10, xp_per_level: 1200 },
  ],
} as const;
