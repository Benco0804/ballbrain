import type { SupabaseClient } from "@supabase/supabase-js";
import { XP } from "./constants";

type RankDef = { readonly name: string; readonly levels: number; readonly xp_per_level: number };

export async function awardXp(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<number> {
  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw error;
  return data as number;
}

export interface RankLevel {
  rankName: string;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  totalXp: number;
}

export function computeRankLevel(totalXp: number): RankLevel {
  const ranks = XP.RANKS as ReadonlyArray<RankDef>;
  let rankStart = 0;

  for (let i = 0; i < ranks.length; i++) {
    const rank = ranks[i];
    const rankEnd = rankStart + rank.levels * rank.xp_per_level;

    if (totalXp < rankEnd || i === ranks.length - 1) {
      const xpIntoRank = totalXp - rankStart;
      const level = Math.min(Math.floor(xpIntoRank / rank.xp_per_level) + 1, rank.levels);
      const xpIntoLevel = xpIntoRank % rank.xp_per_level;
      return { rankName: rank.name, level, xpIntoLevel, xpForLevel: rank.xp_per_level, totalXp };
    }

    rankStart += rank.levels * rank.xp_per_level;
  }

  // Unreachable — loop always returns inside.
  const last = ranks[ranks.length - 1];
  return { rankName: last.name, level: last.levels, xpIntoLevel: 0, xpForLevel: last.xp_per_level, totalXp };
}
