"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UsernameEditProps {
  userId: string;
  initialUsername: string;
}

export default function UsernameEdit({ userId, initialUsername }: UsernameEditProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUsername);
  const [saved, setSaved] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === saved) {
      setEditing(false);
      setValue(saved);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({ username: trimmed })
      .eq("id", userId);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "That username is already taken."
          : "Could not save. Please try again."
      );
      setLoading(false);
      return;
    }

    setSaved(trimmed);
    setValue(trimmed);
    setEditing(false);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(saved);
      setEditing(false);
      setError(null);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            maxLength={30}
            className="rounded-lg bg-zinc-800 border border-zinc-600 focus:border-yellow-400 outline-none px-3 py-1.5 text-white text-xl font-extrabold tracking-tight w-48 transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={loading || !value.trim()}
            className="rounded-lg bg-yellow-400 text-zinc-950 text-xs font-bold px-3 py-1.5 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setValue(saved); setEditing(false); setError(null); }}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 text-left"
      title="Edit username"
    >
      <h1 className="text-2xl font-extrabold tracking-tight">{saved}</h1>
      <svg
        className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.172-8.172z"
        />
      </svg>
    </button>
  );
}
