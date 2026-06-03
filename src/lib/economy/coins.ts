import type { SupabaseClient } from "@supabase/supabase-js";

type ReferenceType =
  | "game_result"
  | "trivia_battle"
  | "purchase"
  | "bonus"
  | "solo_trivia";

interface AwardCoinsParams {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string | null;
  referenceType?: ReferenceType | null;
}

// Atomically updates users.coins and appends an economy_transactions row via
// the award_coins DB function. Positive amount = earn, negative = spend.
// Returns the new coin balance. Throws on DB error.
export async function awardCoins(
  supabase: SupabaseClient,
  { userId, amount, reason, referenceId = null, referenceType = null }: AwardCoinsParams
): Promise<number> {
  const { data, error } = await supabase.rpc("award_coins", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_reference_id: referenceId,
    p_reference_type: referenceType,
  });
  if (error) throw error;
  return data as number;
}
