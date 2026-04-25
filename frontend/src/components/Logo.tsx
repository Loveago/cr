export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#f7c521" />
            <stop offset="100%" stopColor="#ff8c2b" />
          </linearGradient>
        </defs>
        <path d="M6 6l8 10L6 26h6l5-6 5 6h6L20 16 28 6h-6l-5 6-5-6H6z" fill="url(#lg)" />
      </svg>
      <span className="font-extrabold tracking-wider text-white text-lg">CRYPTEX</span>
    </div>
  );
}
