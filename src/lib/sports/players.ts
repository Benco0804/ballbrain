export interface Player {
  name: string;
  nbaTeams?: string[];
  nbaSeasons?: number;
  superBowlWins?: number;
  nflSeasons?: number;
  proBowls?: number;
  uclWins?: number;
  soccerSeasons?: number;
  internationalCaps?: number;
}

export const PLAYERS: Player[] = [
  // NBA — Lakers players (various career lengths)
  { name: "Kobe Bryant",          nbaTeams: ["Lakers"],                                              nbaSeasons: 20 },
  { name: "LeBron James",         nbaTeams: ["Cavaliers", "Heat", "Lakers"],                         nbaSeasons: 21 },
  { name: "Magic Johnson",        nbaTeams: ["Lakers"],                                              nbaSeasons: 13 },
  { name: "Kareem Abdul-Jabbar",  nbaTeams: ["Bucks", "Lakers"],                                     nbaSeasons: 20 },
  { name: "Shaquille O'Neal",     nbaTeams: ["Magic", "Lakers", "Heat", "Suns", "Cavaliers", "Celtics"], nbaSeasons: 19 },
  { name: "Pau Gasol",            nbaTeams: ["Grizzlies", "Lakers", "Bulls", "Spurs", "Bucks"],      nbaSeasons: 18 },
  { name: "Derek Fisher",         nbaTeams: ["Lakers", "Jazz", "Thunder", "Mavericks", "Knicks"],    nbaSeasons: 18 },
  { name: "James Worthy",         nbaTeams: ["Lakers"],                                              nbaSeasons: 12 },
  { name: "Byron Scott",          nbaTeams: ["Lakers", "Nets", "Suns", "Cavaliers"],                 nbaSeasons: 14 },
  { name: "AC Green",             nbaTeams: ["Lakers", "Suns", "Mavericks", "Heat"],                 nbaSeasons: 16 },
  // Lakers players with fewer than 10 seasons (should fail column predicate)
  { name: "Nick Young",           nbaTeams: ["Lakers", "Wizards", "76ers", "Warriors"],              nbaSeasons: 10 },
  { name: "D'Angelo Russell",     nbaTeams: ["Lakers", "Nets", "Warriors", "Timberwolves"],          nbaSeasons: 9  },

  // NFL — Super Bowl winners
  { name: "Tom Brady",       superBowlWins: 7,  nflSeasons: 23, proBowls: 15 },
  { name: "Jerry Rice",      superBowlWins: 3,  nflSeasons: 20, proBowls: 13 },
  { name: "Emmitt Smith",    superBowlWins: 3,  nflSeasons: 15, proBowls: 8  },
  { name: "Peyton Manning",  superBowlWins: 2,  nflSeasons: 18, proBowls: 14 },
  { name: "Joe Montana",     superBowlWins: 4,  nflSeasons: 16, proBowls: 8  },
  { name: "John Elway",      superBowlWins: 2,  nflSeasons: 16, proBowls: 9  },
  { name: "Troy Aikman",     superBowlWins: 3,  nflSeasons: 12, proBowls: 6  },
  { name: "Terry Bradshaw",  superBowlWins: 4,  nflSeasons: 14, proBowls: 3  },
  { name: "Lawrence Taylor", superBowlWins: 2,  nflSeasons: 13, proBowls: 10 },
  { name: "Roger Staubach",  superBowlWins: 2,  nflSeasons: 11, proBowls: 6  },
  { name: "Joe Greene",      superBowlWins: 4,  nflSeasons: 13, proBowls: 10 },
  { name: "Drew Brees",      superBowlWins: 1,  nflSeasons: 20, proBowls: 13 },
  { name: "Aaron Rodgers",   superBowlWins: 1,  nflSeasons: 19, proBowls: 10 },
  { name: "Patrick Mahomes", superBowlWins: 3,  nflSeasons: 8,  proBowls: 7  },
  // NFL — no Super Bowl (should fail row predicate)
  { name: "Dan Marino",      superBowlWins: 0,  nflSeasons: 17, proBowls: 9  },
  { name: "Barry Sanders",   superBowlWins: 0,  nflSeasons: 10, proBowls: 10 },

  // Soccer — UCL winners
  { name: "Lionel Messi",        uclWins: 4, soccerSeasons: 22, internationalCaps: 187 },
  { name: "Cristiano Ronaldo",   uclWins: 5, soccerSeasons: 22, internationalCaps: 212 },
  { name: "Xavi",                uclWins: 4, soccerSeasons: 22, internationalCaps: 133 },
  { name: "Andres Iniesta",      uclWins: 4, soccerSeasons: 22, internationalCaps: 131 },
  { name: "Luka Modric",         uclWins: 5, soccerSeasons: 22, internationalCaps: 176 },
  { name: "Sergio Ramos",        uclWins: 4, soccerSeasons: 22, internationalCaps: 180 },
  { name: "Karim Benzema",       uclWins: 5, soccerSeasons: 22, internationalCaps: 97  },
  { name: "Toni Kroos",          uclWins: 4, soccerSeasons: 18, internationalCaps: 106 },
  { name: "Thierry Henry",       uclWins: 1, soccerSeasons: 20, internationalCaps: 123 },
  { name: "Zinedine Zidane",     uclWins: 1, soccerSeasons: 17, internationalCaps: 108 },
  { name: "Didier Drogba",       uclWins: 1, soccerSeasons: 20, internationalCaps: 105 },
  { name: "Robert Lewandowski",  uclWins: 1, soccerSeasons: 20, internationalCaps: 148 },
  { name: "Gerard Pique",        uclWins: 3, soccerSeasons: 17, internationalCaps: 102 },
  // Soccer — no UCL (should fail row predicate)
  { name: "Ronaldinho",          uclWins: 1, soccerSeasons: 18, internationalCaps: 97  },
  { name: "Zlatan Ibrahimovic",  uclWins: 0, soccerSeasons: 24, internationalCaps: 120 },
];
