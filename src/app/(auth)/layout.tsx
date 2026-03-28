import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <svg
          width="28" height="28" viewBox="0 0 48 48" fill="none"
          className="text-yellow-400"
          aria-hidden="true"
        >
          <path d="M14 6h20v18a10 10 0 0 1-20 0V6Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M14 10H8a4 4 0 0 0 0 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M34 10h6a4 4 0 0 1 0 8h-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 34v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 40h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 14l1.5 4h4l-3.2 2.4 1.2 3.9L24 22l-3.5 2.3 1.2-3.9L18.5 18h4z" fill="currentColor" opacity="0.8" />
        </svg>
        <span className="text-xl font-black tracking-tight text-white group-hover:text-yellow-400 transition-colors">
          BallBrain
        </span>
      </Link>
      {children}
    </div>
  );
}
