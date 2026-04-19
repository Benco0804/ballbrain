"use client";

import { useEffect, useState } from "react";
import { getGuestCount } from "@/lib/game/guestPlays";

type Sport = "NBA" | "Soccer";

const SPORT_OPTIONS: { sport: Sport; emoji: string; activeColor: string }[] = [
  { sport: "NBA",    emoji: "🏀", activeColor: "text-orange-300 border-orange-400 bg-orange-400/20" },
  { sport: "Soccer", emoji: "⚽", activeColor: "text-green-300 border-green-400 bg-green-400/20" },
];

interface SportSelectorProps {
  isAuthenticated: boolean;
  /** Base path for sport links. Defaults to "/sports-grid". */
  hrefBase?: string;
  /** Guest play tracking game key. Defaults to "grid". */
  game?: "grid" | "draft";
}

export default function SportSelector({ isAuthenticated, hrefBase = "/sports-grid", game = "grid" }: SportSelectorProps) {
  // For guests: read play count from localStorage so we can pass ?play=N to the server.
  // Initialized to 0; updated after mount once localStorage is accessible.
  const [guestCounts, setGuestCounts] = useState<Record<Sport, number>>({ NBA: 0, Soccer: 0 });

  useEffect(() => {
    if (isAuthenticated) return;
    setGuestCounts({
      NBA:    getGuestCount(game, "NBA"),
      Soccer: getGuestCount(game, "Soccer"),
    });
  }, [isAuthenticated, game]);

  function href(sport: Sport): string {
    if (isAuthenticated) {
      // Auth users: server determines play count from DB — no ?play param needed.
      return `${hrefBase}?sport=${sport}`;
    }
    // Guests: pass current play count so the server can serve the right puzzle difficulty.
    return `${hrefBase}?sport=${sport}&play=${guestCounts[sport]}`;
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {SPORT_OPTIONS.map(({ sport, emoji, activeColor }) => (
        // Use <a> (not <Link>) to force a full server render and bypass
        // the Next.js Router Cache, so the daily limit check always runs.
        <a
          key={sport}
          href={href(sport)}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-8 font-bold text-lg transition-colors",
            activeColor,
            "hover:opacity-90",
          ].join(" ")}
        >
          <span className="text-4xl">{emoji}</span>
          <span>{sport}</span>
        </a>
      ))}
    </div>
  );
}
