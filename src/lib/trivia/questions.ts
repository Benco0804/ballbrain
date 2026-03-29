export interface TriviaQuestion {
  id: number;
  sport: "NBA" | "NFL" | "Soccer";
  question: string;
  answers: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

// 15 hardcoded questions — ordered easiest to hardest.
// TODO: migrate to database.
export const QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    sport: "NBA",
    question: "Which player is nicknamed \"The King\" in the NBA?",
    answers: ["Kobe Bryant", "LeBron James", "Kevin Durant", "Stephen Curry"],
    correctIndex: 1,
  },
  {
    id: 2,
    sport: "NFL",
    question: "How many points is a touchdown worth in the NFL?",
    answers: ["3", "7", "6", "8"],
    correctIndex: 2,
  },
  {
    id: 3, // MILESTONE — 20 coins
    sport: "Soccer",
    question: "How many players does each team field in a soccer match?",
    answers: ["10", "11", "9", "12"],
    correctIndex: 1,
  },
  {
    id: 4,
    sport: "NBA",
    question: "Which city do the Lakers play in?",
    answers: ["Chicago", "New York", "Dallas", "Los Angeles"],
    correctIndex: 3,
  },
  {
    id: 5,
    sport: "NFL",
    question: "Which team has won the most Super Bowl championships?",
    answers: ["Dallas Cowboys", "Pittsburgh Steelers", "New England Patriots", "San Francisco 49ers"],
    correctIndex: 2,
  },
  {
    id: 6, // MILESTONE — 50 coins
    sport: "Soccer",
    question: "Which country has won the most FIFA World Cup titles?",
    answers: ["Germany", "Argentina", "Italy", "Brazil"],
    correctIndex: 3,
  },
  {
    id: 7,
    sport: "NBA",
    question: "Who holds the NBA record for most points scored in a single game?",
    answers: ["Michael Jordan", "Wilt Chamberlain", "Kobe Bryant", "LeBron James"],
    correctIndex: 1,
  },
  {
    id: 8,
    sport: "NFL",
    question: "Who holds the NFL record for most career passing touchdowns?",
    answers: ["Peyton Manning", "Brett Favre", "Drew Brees", "Tom Brady"],
    correctIndex: 3,
  },
  {
    id: 9, // MILESTONE — 100 coins
    sport: "Soccer",
    question: "Who has won the most Ballon d'Or awards?",
    answers: ["Cristiano Ronaldo", "Zinedine Zidane", "Ronaldinho", "Lionel Messi"],
    correctIndex: 3,
  },
  {
    id: 10,
    sport: "NBA",
    question: "How many NBA championships did the Chicago Bulls win during the 1990s?",
    answers: ["5", "4", "7", "6"],
    correctIndex: 3,
  },
  {
    id: 11,
    sport: "NFL",
    question: "Who holds the NFL record for most career rushing yards?",
    answers: ["Barry Sanders", "Emmitt Smith", "Walter Payton", "Frank Gore"],
    correctIndex: 1,
  },
  {
    id: 12, // MILESTONE — 200 coins
    sport: "Soccer",
    question: "Which club has won the most UEFA Champions League titles?",
    answers: ["Barcelona", "Bayern Munich", "AC Milan", "Real Madrid"],
    correctIndex: 3,
  },
  {
    id: 13,
    sport: "NBA",
    question: "Kobe Bryant wore jersey number 8 and which other number during his Lakers career?",
    answers: ["33", "23", "24", "32"],
    correctIndex: 2,
  },
  {
    id: 14,
    sport: "NFL",
    question: "In what year was the first Super Bowl played?",
    answers: ["1969", "1964", "1967", "1972"],
    correctIndex: 2,
  },
  {
    id: 15, // MILESTONE — 500 coins
    sport: "Soccer",
    question: "Who was the top scorer at the 2022 FIFA World Cup with 8 goals?",
    answers: ["Lionel Messi", "Olivier Giroud", "Cody Gakpo", "Kylian Mbappé"],
    correctIndex: 3,
  },
];
