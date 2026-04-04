// =============================================================================
// daily-health-check — Supabase Edge Function
//
// Runs at 3 AM UTC (6 AM Jerusalem summer time) to verify:
//   • Today's grid puzzles exist (NBA + Soccer, easy + medium)
//   • Today's trivia sessions exist (NBA + Soccer, variant 1 + 2)
//   • At least 100 active trivia questions per sport
//   • Supabase DB is reachable
//
// On failure: sends a Telegram alert listing what's broken.
// On success: sends a brief "all clear" Telegram message.
//
// Environment variables required:
//   SUPABASE_URL              — injected automatically by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — injected automatically by Supabase
//   TELEGRAM_BOT_TOKEN        — Telegram bot token
//   TELEGRAM_CHAT_ID          — Telegram chat/channel ID to notify
//   CRON_SECRET               — must match x-cron-secret header
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN        = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID          = Deno.env.get("TELEGRAM_CHAT_ID");
const CRON_SECRET               = Deno.env.get("CRON_SECRET");

const MIN_ACTIVE_QUESTIONS = 100;
const SPORTS = ["NBA", "Soccer"] as const;
const DIFFICULTIES = ["easy", "medium"] as const;
const VARIANTS = [1, 2] as const;

export interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface HealthReport {
  date: string;
  allPassed: boolean;
  checks: CheckResult[];
  durationMs: number;
}

async function runChecks(supabase: ReturnType<typeof createClient>, date: string): Promise<HealthReport> {
  const start = Date.now();
  const checks: CheckResult[] = [];

  // ── 1. DB connectivity ───────────────────────────────────────────────────────
  try {
    const { error } = await supabase.from("daily_puzzles").select("id").limit(1);
    checks.push({
      name: "db_connectivity",
      passed: !error,
      detail: error ? `DB unreachable: ${error.message}` : "Supabase DB reachable",
    });
  } catch (err) {
    checks.push({
      name: "db_connectivity",
      passed: false,
      detail: `DB unreachable: ${String(err)}`,
    });
  }

  // ── 2. Daily puzzles ─────────────────────────────────────────────────────────
  for (const sport of SPORTS) {
    for (const difficulty of DIFFICULTIES) {
      const { data, error } = await supabase
        .from("daily_puzzles")
        .select("id")
        .eq("puzzle_date", date)
        .eq("sport", sport)
        .eq("difficulty", difficulty)
        .limit(1);

      const found = !error && data && data.length > 0;
      checks.push({
        name: `puzzle_${sport.toLowerCase()}_${difficulty}`,
        passed: found,
        detail: found
          ? `${sport} ${difficulty} puzzle exists`
          : error
            ? `Query error: ${error.message}`
            : `Missing ${sport} ${difficulty} puzzle for ${date}`,
      });
    }
  }

  // ── 3. Daily trivia sessions ─────────────────────────────────────────────────
  for (const sport of SPORTS) {
    for (const variant of VARIANTS) {
      const { data, error } = await supabase
        .from("daily_trivia_sessions")
        .select("id")
        .eq("session_date", date)
        .eq("sport", sport)
        .eq("variant", variant)
        .limit(1);

      const found = !error && data && data.length > 0;
      checks.push({
        name: `trivia_${sport.toLowerCase()}_v${variant}`,
        passed: found,
        detail: found
          ? `${sport} trivia variant ${variant} exists`
          : error
            ? `Query error: ${error.message}`
            : `Missing ${sport} trivia variant ${variant} for ${date}`,
      });
    }
  }

  // ── 4. Active question counts ────────────────────────────────────────────────
  for (const sport of SPORTS) {
    const { count, error } = await supabase
      .from("trivia_questions")
      .select("id", { count: "exact", head: true })
      .eq("sport", sport)
      .eq("status", "active");

    const n = count ?? 0;
    const passed = !error && n >= MIN_ACTIVE_QUESTIONS;
    checks.push({
      name: `question_count_${sport.toLowerCase()}`,
      passed,
      detail: error
        ? `Query error: ${error.message}`
        : `${sport}: ${n} active questions (min ${MIN_ACTIVE_QUESTIONS})`,
    });
  }

  return {
    date,
    allPassed: checks.every((c) => c.passed),
    checks,
    durationMs: Date.now() - start,
  };
}

async function sendTelegram(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

function buildTelegramMessage(report: HealthReport): string {
  if (report.allPassed) {
    return `✅ <b>BallBrain daily check passed</b>\n📅 ${report.date} · ${report.durationMs}ms`;
  }

  const failed = report.checks.filter((c) => !c.passed);
  const lines = failed.map((c) => `• ${c.name}: ${c.detail}`).join("\n");
  return `🚨 <b>BallBrain health check FAILED</b>\n📅 ${report.date}\n\n${lines}`;
}

Deno.serve(async (req: Request) => {
  // Validate cron secret (skip if not set — allows manual invocation in dev).
  if (CRON_SECRET) {
    const incomingSecret = req.headers.get("x-cron-secret");
    if (incomingSecret !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const date = new Date().toISOString().split("T")[0];

  const report = await runChecks(supabase, date);
  await sendTelegram(buildTelegramMessage(report));

  return new Response(JSON.stringify(report), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
