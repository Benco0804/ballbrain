import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ECONOMY } from "@/lib/economy/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { puzzleId, cellKey } = body;
  if (typeof puzzleId !== "string" || typeof cellKey !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [rowStr, colStr] = cellKey.split("-");
  const row = parseInt(rowStr, 10);
  const col = parseInt(colStr, 10);
  if (isNaN(row) || isNaN(col)) {
    return NextResponse.json({ error: "Invalid cell key" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Return cached hint if this cell was already revealed — no charge.
  const { data: existing } = await supabase
    .from("puzzle_hints")
    .select("revealed_player")
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId)
    .eq("cell_key", cellKey)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ player: existing.revealed_player });
  }

  // Enforce per-puzzle hint limit.
  const { count } = await supabase
    .from("puzzle_hints")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("puzzle_id", puzzleId);

  if ((count ?? 0) >= ECONOMY.SPORTS_GRID.MAX_HINTS_PER_PUZZLE) {
    return NextResponse.json({ error: "hint_limit_reached" }, { status: 400 });
  }

  // Fetch valid players for this cell from the database.
  const { data: cell } = await supabase
    .from("puzzle_cells")
    .select("valid_players")
    .eq("puzzle_id", puzzleId)
    .eq("row_index", row)
    .eq("col_index", col)
    .single();

  if (!cell?.valid_players?.length) {
    return NextResponse.json({ error: "no_valid_players" }, { status: 404 });
  }

  const revealedPlayer = cell.valid_players[0];

  // Check balance.
  const { data: userData } = await supabase
    .from("users")
    .select("coins")
    .eq("id", user.id)
    .single();

  const currentCoins = userData?.coins ?? 0;
  if (currentCoins < ECONOMY.SPORTS_GRID.HINT_COST) {
    return NextResponse.json({ error: "insufficient_coins" }, { status: 400 });
  }

  // Deduct coins then record hint (order matters: charge before granting).
  const { error: coinError } = await supabase
    .from("users")
    .update({ coins: currentCoins - ECONOMY.SPORTS_GRID.HINT_COST })
    .eq("id", user.id);

  if (coinError) return NextResponse.json({ error: coinError.message }, { status: 500 });

  await supabase.from("puzzle_hints").insert({
    user_id: user.id,
    puzzle_id: puzzleId,
    cell_key: cellKey,
    revealed_player: revealedPlayer,
    coins_spent: ECONOMY.SPORTS_GRID.HINT_COST,
  });

  return NextResponse.json({ player: revealedPlayer });
}
