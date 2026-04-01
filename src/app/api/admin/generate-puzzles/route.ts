// POST /api/admin/generate-puzzles
//
// Manually triggers the generate-daily-puzzles Edge Function.
// Protected by the ADMIN_SECRET environment variable.
//
// Required env vars:
//   ADMIN_SECRET               — passed as x-admin-secret header by the caller
//   NEXT_PUBLIC_SUPABASE_URL   — used to construct the edge function URL
//   CRON_SECRET                — forwarded as x-cron-secret to the edge function
//
// Optional body: { "date": "YYYY-MM-DD" } — defaults to tomorrow UTC if omitted.
//
// Example:
//   curl -X POST https://your-app.com/api/admin/generate-puzzles \
//     -H "x-admin-secret: <your-secret>" \
//     -H "Content-Type: application/json" \
//     -d '{"date":"2026-04-15"}'

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    // Fail closed: if the secret is not configured, refuse all requests.
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured on this server" },
      { status: 503 },
    );
  }

  const incoming = request.headers.get("x-admin-secret");
  if (incoming !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Optional body (date override) ─────────────────────────────────────────
  let body: { date?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Call the Edge Function ─────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const edgeFnUrl = "https://wdkzsnkrdqadoiqbjlqr.supabase.co/functions/v1/generate-daily-puzzles";

  let edgeResponse: Response;
  try {
    edgeResponse = await fetch(edgeFnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach Edge Function", detail: String(err) },
      { status: 502 },
    );
  }

  const data = await edgeResponse.json().catch(() => null);
  return NextResponse.json(data, { status: edgeResponse.status });
}
