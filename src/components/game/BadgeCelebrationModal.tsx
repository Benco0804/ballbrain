"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { BadgeDefinition } from "@/lib/badges/constants";

const TIER_STYLES: Record<string, string> = {
  bronze:   "border-amber-600/60  bg-amber-600/10  text-amber-400",
  silver:   "border-zinc-400/60   bg-zinc-400/10   text-zinc-300",
  gold:     "border-yellow-400/60 bg-yellow-400/10 text-yellow-300",
  platinum: "border-purple-400/60 bg-purple-400/10 text-purple-300",
};

interface BadgeCelebrationModalProps {
  badges: BadgeDefinition[];
  onDismiss: () => void;
}

export default function BadgeCelebrationModal({ badges, onDismiss }: BadgeCelebrationModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || badges.length === 0) return null;

  const title = badges.length === 1 ? "Achievement Unlocked!" : "Achievements Unlocked!";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center border-b border-yellow-400/20 bg-yellow-400/10">
          <p className="text-2xl font-bold text-yellow-300">🏅 {title}</p>
        </div>

        <div className="px-6 py-5 space-y-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${TIER_STYLES[badge.tier] ?? ""}`}
            >
              <span className="text-3xl shrink-0">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{badge.name}</p>
                <p className="text-xs text-zinc-400 truncate">{badge.description}</p>
              </div>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider opacity-60">
                {badge.tier}
              </span>
            </div>
          ))}

          <button
            onClick={onDismiss}
            className="w-full rounded-xl bg-yellow-400 text-zinc-950 font-extrabold py-3 text-sm hover:bg-yellow-300 transition-colors mt-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
