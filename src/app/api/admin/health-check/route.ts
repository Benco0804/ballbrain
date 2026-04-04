// POST /api/admin/health-check
//
// Manually triggers the same checks as the daily-health-check Edge Function
// and returns a full JSON report. Optionally sends a Telegram notification.
//
// Protected by the ADMIN_SECRET environment variable.
//
// Required env vars:
//   ADMIN_SECRET               — passed as x-admin-secret header
//   SUPABASE_SERVICE_ROLE_KEY  — used to bypass RLS for count queries
//
// Optional env vars:
//   TELEGRAM_BOT_TOKEN         — if set, sends Telegram notification
//   TELEGRAM_CHAT_ID           — Telegram chat/channel ID
//
// Query params:
//   notify=true  (default false) — also send a Telegram message
//
// Example:
//   curl -X POST https://ballbrain-kappa.vercel.app/api/admin/health-check \
//     -H "x-admin-secret: ballbrain_admin_2026"

import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const MIN_ACTIVE_QUESTIONS = 100;
const SPORTS = ["NBA", "Soccer"] as const;
const DIFFICULTIES = ["easy", "medium"] as const;
const VARIANTS = [1, 2] as const;

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

interface HealthReport {
  date: string;
  allPassed: boolean;
  checks: CheckResult[];
  durationMs: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runChecks(supabase: SupabaseClient<any>, date: string): Promise<HealthReport> {
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

      const found = !error && data != null && data.length > 0;
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

      const found = !error && data != null && data.length > 0;
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

async function sendTelegram(report: HealthReport): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const message = report.allPassed
    ? `✅ <b>BallBrain daily check passed</b>\n📅 ${report.date} · ${report.durationMs}ms`
    : (() => {
        const failed = report.checks.filter((c) => !c.passed);
        const lines = failed.map((c) => `• ${c.name}: ${c.detail}`).join("\n");
        return `🚨 <b>BallBrain health check FAILED</b>\n📅 ${report.date}\n\n${lines}`;
      })();

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  });
}

export async function POST(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || request.headers.get("x-admin-secret") !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  // Use service role key so count queries bypass RLS.
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { searchParams } = new URL(request.url);
  const notify = searchParams.get("notify") === "true";

  const today = new Date().toISOString().split("T")[0];
  const report = await runChecks(supabase, today);

  if (notify) {
    await sendTelegram(report);
  }

  return NextResponse.json(report, { status: report.allPassed ? 200 : 207 });
}
