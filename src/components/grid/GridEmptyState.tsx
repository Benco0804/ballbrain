"use client";

import { useMemo } from "react";
import Link from "next/link";

const MESSAGES = [
  "😴 Looks like today's puzzle is still loading... or Ben forgot. Either way, check back soon!",
  "🦥 Ben was supposed to set this up. Classic Ben. Check back in a bit!",
];

export default function GridEmptyState() {
  const message = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <p className="text-white font-semibold text-lg max-w-sm leading-relaxed mb-8">
        {message}
      </p>
      <Link
        href="/sports-grid"
        className="rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-6 py-3 text-sm transition-colors"
      >
        ← Go Back
      </Link>
    </div>
  );
}
