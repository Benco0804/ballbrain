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
