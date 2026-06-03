import type { SupabaseClient } from "@supabase/supabase-js";

// Idempotent: safe to call multiple times on the same day for the same user.
// Advances current_streak, updates longest_streak, sets last_active_date.
// Should be called on game completion — not for hint purchases.
export async function updateStreak(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.rpc("update_streak", { p_user_id: userId });
  if (error) throw error;
}
