"use client";

import { useEffect, useState } from "react";

// Israel is UTC+3. Midnight Israel time = 21:00 UTC.
function getMsToMidnightIsrael(): number {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(21, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MidnightCountdown() {
  const [ms, setMs] = useState(getMsToMidnightIsrael());

  useEffect(() => {
    const interval = setInterval(() => setMs(getMsToMidnightIsrael()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        Next puzzle in
      </p>
      <p className="text-2xl font-mono font-bold text-yellow-400">{formatCountdown(ms)}</p>
      <p className="text-xs text-zinc-600 mt-1">Come back tomorrow!</p>
    </div>
  );
}
