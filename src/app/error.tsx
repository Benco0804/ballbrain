"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-6">💀</p>
      <p className="text-white font-semibold text-lg max-w-sm leading-relaxed mb-8">
        Something broke. Probably not your fault. Maybe yours. Refresh and try again?
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-yellow-400 text-zinc-950 font-extrabold px-6 py-3 text-sm hover:bg-yellow-300 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
